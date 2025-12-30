import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { commentRateLimiter } from '../middleware/rateLimit';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const socialRouter = new Hono<Env>();

const addCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

const reportCommentSchema = z.object({
  reason: z.string().min(10).max(500),
});

// ================== COMMENTS ==================

// Get comments for a circuit (public)
socialRouter.get('/circuits/:circuitId/comments', optionalAuthMiddleware, async (c) => {
  const circuitId = c.req.param('circuitId');
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  try {
    // Get top-level comments with user info
    const comments = await c.env.DB.prepare(
      `SELECT c.id, c.content, c.parent_id, c.created_at, c.updated_at,
              u.id as user_id, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.circuit_id = ? AND c.is_deleted = 0 AND c.parent_id IS NULL
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(circuitId, limit, offset)
      .all();

    // Get reply counts for each comment
    const commentIds = comments.results?.map((c: any) => c.id) || [];
    let replyCounts: Record<string, number> = {};

    if (commentIds.length > 0) {
      const replies = await c.env.DB.prepare(
        `SELECT parent_id, COUNT(*) as count
         FROM comments
         WHERE parent_id IN (${commentIds.map(() => '?').join(',')}) AND is_deleted = 0
         GROUP BY parent_id`
      )
        .bind(...commentIds)
        .all();

      for (const r of replies.results || []) {
        replyCounts[(r as any).parent_id] = (r as any).count;
      }
    }

    // Get total count
    const total = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM comments WHERE circuit_id = ? AND is_deleted = 0 AND parent_id IS NULL'
    )
      .bind(circuitId)
      .first<{ count: number }>();

    return c.json({
      success: true,
      data: {
        comments: comments.results?.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          parentId: comment.parent_id,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          user: {
            id: comment.user_id,
            username: comment.username,
            avatarUrl: comment.avatar_url,
          },
          replyCount: replyCounts[comment.id] || 0,
        })) || [],
        pagination: {
          page,
          limit,
          total: total?.count || 0,
          hasMore: offset + limit < (total?.count || 0),
        },
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return c.json({ success: false, error: 'Failed to fetch comments' }, 500);
  }
});

// Get replies to a comment
socialRouter.get('/comments/:commentId/replies', optionalAuthMiddleware, async (c) => {
  const commentId = c.req.param('commentId');

  try {
    const replies = await c.env.DB.prepare(
      `SELECT c.id, c.content, c.created_at, c.updated_at,
              u.id as user_id, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at ASC`
    )
      .bind(commentId)
      .all();

    return c.json({
      success: true,
      data: replies.results?.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
        user: {
          id: reply.user_id,
          username: reply.username,
          avatarUrl: reply.avatar_url,
        },
      })) || [],
    });
  } catch (error) {
    console.error('Get replies error:', error);
    return c.json({ success: false, error: 'Failed to fetch replies' }, 500);
  }
});

// Add a comment (authenticated)
socialRouter.post('/circuits/:circuitId/comments', authMiddleware, commentRateLimiter, validateBody(addCommentSchema), async (c) => {
  const user = c.get('user');
  const circuitId = c.req.param('circuitId');
  const body = c.get('validatedBody') as z.infer<typeof addCommentSchema>;
  const now = new Date().toISOString();

  try {
    // Verify circuit exists
    const circuit = await c.env.DB.prepare(
      'SELECT user_id FROM circuits WHERE id = ?'
    )
      .bind(circuitId)
      .first<{ user_id: string }>();

    if (!circuit) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    // If replying, verify parent exists
    if (body.parentId) {
      const parent = await c.env.DB.prepare(
        'SELECT id FROM comments WHERE id = ? AND circuit_id = ? AND is_deleted = 0'
      )
        .bind(body.parentId, circuitId)
        .first();

      if (!parent) {
        return c.json({ success: false, error: 'Parent comment not found' }, 404);
      }
    }

    const commentId = generateId();
    await c.env.DB.prepare(
      `INSERT INTO comments (id, circuit_id, user_id, parent_id, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(commentId, circuitId, user.id, body.parentId || null, body.content, now)
      .run();

    // Create notification for circuit owner (if not commenting on own circuit)
    if (circuit.user_id !== user.id) {
      await c.env.DB.prepare(
        `INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          generateId(),
          circuit.user_id,
          body.parentId ? 'comment_reply' : 'comment_received',
          body.parentId ? 'New reply to your comment' : 'New comment on your circuit',
          `${user.username} commented: "${body.content.slice(0, 50)}${body.content.length > 50 ? '...' : ''}"`,
          `/circuits/${circuitId}`,
          now
        )
        .run();
    }

    return c.json({
      success: true,
      data: {
        id: commentId,
        content: body.content,
        parentId: body.parentId,
        createdAt: now,
        user: {
          id: user.id,
          username: user.username,
        },
      },
    }, 201);
  } catch (error) {
    console.error('Add comment error:', error);
    return c.json({ success: false, error: 'Failed to add comment' }, 500);
  }
});

// Delete a comment (owner only)
socialRouter.delete('/comments/:commentId', authMiddleware, async (c) => {
  const user = c.get('user');
  const commentId = c.req.param('commentId');

  try {
    const comment = await c.env.DB.prepare(
      'SELECT user_id FROM comments WHERE id = ?'
    )
      .bind(commentId)
      .first<{ user_id: string }>();

    if (!comment) {
      return c.json({ success: false, error: 'Comment not found' }, 404);
    }

    if (comment.user_id !== user.id) {
      return c.json({ success: false, error: 'Not authorized' }, 403);
    }

    // Soft delete
    await c.env.DB.prepare(
      'UPDATE comments SET is_deleted = 1, updated_at = ? WHERE id = ?'
    )
      .bind(new Date().toISOString(), commentId)
      .run();

    return c.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return c.json({ success: false, error: 'Failed to delete comment' }, 500);
  }
});

// Report a comment
socialRouter.post('/comments/:commentId/report', authMiddleware, validateBody(reportCommentSchema), async (c) => {
  const user = c.get('user');
  const commentId = c.req.param('commentId');
  const body = c.get('validatedBody') as z.infer<typeof reportCommentSchema>;
  const now = new Date().toISOString();

  try {
    // Verify comment exists
    const comment = await c.env.DB.prepare(
      'SELECT id FROM comments WHERE id = ? AND is_deleted = 0'
    )
      .bind(commentId)
      .first();

    if (!comment) {
      return c.json({ success: false, error: 'Comment not found' }, 404);
    }

    // Check for existing report
    const existing = await c.env.DB.prepare(
      'SELECT id FROM comment_reports WHERE comment_id = ? AND reporter_id = ?'
    )
      .bind(commentId, user.id)
      .first();

    if (existing) {
      return c.json({ success: false, error: 'Already reported' }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO comment_reports (id, comment_id, reporter_id, reason, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(generateId(), commentId, user.id, body.reason, now)
      .run();

    return c.json({ success: true, message: 'Comment reported' });
  } catch (error) {
    console.error('Report comment error:', error);
    return c.json({ success: false, error: 'Failed to report comment' }, 500);
  }
});

// ================== FOLLOWS ==================

// Follow a user
socialRouter.post('/users/:username/follow', authMiddleware, async (c) => {
  const user = c.get('user');
  const username = c.req.param('username');
  const now = new Date().toISOString();

  try {
    // Get target user
    const target = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    )
      .bind(username)
      .first<{ id: string }>();

    if (!target) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    if (target.id === user.id) {
      return c.json({ success: false, error: 'Cannot follow yourself' }, 400);
    }

    // Check if already following
    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?'
    )
      .bind(user.id, target.id)
      .first();

    if (existing) {
      return c.json({ success: false, error: 'Already following' }, 400);
    }

    // Create follow
    await c.env.DB.prepare(
      'INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)'
    )
      .bind(user.id, target.id, now)
      .run();

    // Update counts
    await c.env.DB.prepare(
      'UPDATE users SET following_count = following_count + 1 WHERE id = ?'
    )
      .bind(user.id)
      .run();

    await c.env.DB.prepare(
      'UPDATE users SET followers_count = followers_count + 1 WHERE id = ?'
    )
      .bind(target.id)
      .run();

    // Create notification
    await c.env.DB.prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
       VALUES (?, ?, 'new_follower', 'New follower', ?, ?, ?)`
    )
      .bind(generateId(), target.id, `${user.username} started following you`, `/users/${user.username}`, now)
      .run();

    // Add to activity feed
    await c.env.DB.prepare(
      `INSERT INTO activity_feed (id, user_id, activity_type, target_id, target_type, created_at)
       VALUES (?, ?, 'followed_user', ?, 'user', ?)`
    )
      .bind(generateId(), user.id, target.id, now)
      .run();

    return c.json({ success: true, message: 'Now following' });
  } catch (error) {
    console.error('Follow user error:', error);
    return c.json({ success: false, error: 'Failed to follow user' }, 500);
  }
});

// Unfollow a user
socialRouter.delete('/users/:username/follow', authMiddleware, async (c) => {
  const user = c.get('user');
  const username = c.req.param('username');

  try {
    const target = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    )
      .bind(username)
      .first<{ id: string }>();

    if (!target) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Remove follow
    const result = await c.env.DB.prepare(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?'
    )
      .bind(user.id, target.id)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Not following' }, 400);
    }

    // Update counts
    await c.env.DB.prepare(
      'UPDATE users SET following_count = MAX(0, following_count - 1) WHERE id = ?'
    )
      .bind(user.id)
      .run();

    await c.env.DB.prepare(
      'UPDATE users SET followers_count = MAX(0, followers_count - 1) WHERE id = ?'
    )
      .bind(target.id)
      .run();

    return c.json({ success: true, message: 'Unfollowed' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return c.json({ success: false, error: 'Failed to unfollow user' }, 500);
  }
});

// Get followers
socialRouter.get('/users/:username/followers', optionalAuthMiddleware, async (c) => {
  const username = c.req.param('username');
  const currentUser = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  try {
    const target = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    )
      .bind(username)
      .first<{ id: string }>();

    if (!target) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const followers = await c.env.DB.prepare(
      `SELECT u.id, u.username, u.avatar_url, u.reputation_score, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(target.id, limit, offset)
      .all();

    // Check if current user follows any of these
    let followingSet = new Set<string>();
    if (currentUser && followers.results?.length) {
      const ids = followers.results.map((f: any) => f.id);
      const following = await c.env.DB.prepare(
        `SELECT following_id FROM follows WHERE follower_id = ? AND following_id IN (${ids.map(() => '?').join(',')})`
      )
        .bind(currentUser.id, ...ids)
        .all();

      followingSet = new Set(following.results?.map((f: any) => f.following_id) || []);
    }

    return c.json({
      success: true,
      data: followers.results?.map((f: any) => ({
        id: f.id,
        username: f.username,
        avatarUrl: f.avatar_url,
        reputationScore: f.reputation_score,
        followedAt: f.followed_at,
        isFollowing: followingSet.has(f.id),
      })) || [],
    });
  } catch (error) {
    console.error('Get followers error:', error);
    return c.json({ success: false, error: 'Failed to fetch followers' }, 500);
  }
});

// Get following
socialRouter.get('/users/:username/following', optionalAuthMiddleware, async (c) => {
  const username = c.req.param('username');
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  try {
    const target = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    )
      .bind(username)
      .first<{ id: string }>();

    if (!target) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const following = await c.env.DB.prepare(
      `SELECT u.id, u.username, u.avatar_url, u.reputation_score, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(target.id, limit, offset)
      .all();

    return c.json({
      success: true,
      data: following.results?.map((f: any) => ({
        id: f.id,
        username: f.username,
        avatarUrl: f.avatar_url,
        reputationScore: f.reputation_score,
        followedAt: f.followed_at,
      })) || [],
    });
  } catch (error) {
    console.error('Get following error:', error);
    return c.json({ success: false, error: 'Failed to fetch following' }, 500);
  }
});

// ================== ACTIVITY FEED ==================

// Get user's activity feed (from people they follow)
socialRouter.get('/feed', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  try {
    const activities = await c.env.DB.prepare(
      `SELECT a.id, a.user_id, a.activity_type, a.target_id, a.target_type,
              a.metadata_json, a.created_at,
              u.username, u.avatar_url
       FROM activity_feed a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = ?
       )
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(user.id, limit, offset)
      .all();

    return c.json({
      success: true,
      data: activities.results?.map((a: any) => ({
        id: a.id,
        activityType: a.activity_type,
        targetId: a.target_id,
        targetType: a.target_type,
        metadata: a.metadata_json ? JSON.parse(a.metadata_json) : null,
        createdAt: a.created_at,
        user: {
          id: a.user_id,
          username: a.username,
          avatarUrl: a.avatar_url,
        },
      })) || [],
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return c.json({ success: false, error: 'Failed to fetch feed' }, 500);
  }
});

// ================== NOTIFICATIONS ==================

// Get user's notifications
socialRouter.get('/notifications', authMiddleware, async (c) => {
  const user = c.get('user');
  const unreadOnly = c.req.query('unread') === 'true';
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

  try {
    let query = `SELECT id, type, title, message, link, read, created_at
                 FROM notifications WHERE user_id = ?`;
    if (unreadOnly) {
      query += ' AND read = 0';
    }
    query += ' ORDER BY created_at DESC LIMIT ?';

    const notifications = await c.env.DB.prepare(query)
      .bind(user.id, limit)
      .all();

    const unreadCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    )
      .bind(user.id)
      .first<{ count: number }>();

    return c.json({
      success: true,
      data: {
        notifications: notifications.results?.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          read: !!n.read,
          createdAt: n.created_at,
        })) || [],
        unreadCount: unreadCount?.count || 0,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return c.json({ success: false, error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notifications as read
socialRouter.post('/notifications/read', authMiddleware, async (c) => {
  const user = c.get('user');
  const { ids } = await c.req.json();

  try {
    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      await c.env.DB.prepare(
        `UPDATE notifications SET read = 1
         WHERE user_id = ? AND id IN (${ids.map(() => '?').join(',')})`
      )
        .bind(user.id, ...ids)
        .run();
    } else {
      // Mark all as read
      await c.env.DB.prepare(
        'UPDATE notifications SET read = 1 WHERE user_id = ?'
      )
        .bind(user.id)
        .run();
    }

    return c.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return c.json({ success: false, error: 'Failed to update notifications' }, 500);
  }
});

export { socialRouter };
