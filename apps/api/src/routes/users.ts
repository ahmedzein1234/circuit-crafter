import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const usersRouter = new Hono<{ Bindings: Env }>();

// Get current user profile
usersRouter.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const profile = await c.env.DB.prepare(
      `SELECT id, email, username, avatar_url, reputation_score,
              subscription_tier, created_at, settings_json
       FROM users WHERE id = ?`
    )
      .bind(user.id)
      .first();

    if (!profile) {
      return c.json(
        {
          success: false,
          error: 'User not found',
        },
        404
      );
    }

    // Get user stats
    const stats = await c.env.DB.prepare(
      `SELECT
         (SELECT COUNT(*) FROM circuits WHERE user_id = ?) as circuits_count,
         (SELECT COUNT(*) FROM progress WHERE user_id = ? AND completed = 1) as challenges_completed,
         (SELECT COUNT(*) FROM achievements WHERE user_id = ?) as achievements_count`
    )
      .bind(user.id, user.id, user.id)
      .first<{
        circuits_count: number;
        challenges_completed: number;
        achievements_count: number;
      }>();

    return c.json({
      success: true,
      data: {
        ...profile,
        settings: profile.settings_json ? JSON.parse(profile.settings_json as string) : {},
        stats: stats || {
          circuits_count: 0,
          challenges_completed: 0,
          achievements_count: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to get profile',
      },
      500
    );
  }
});

// Get user by username (public profile)
usersRouter.get('/:username', async (c) => {
  const username = c.req.param('username');

  try {
    const profile = await c.env.DB.prepare(
      `SELECT id, username, avatar_url, reputation_score, created_at
       FROM users WHERE username = ?`
    )
      .bind(username)
      .first();

    if (!profile) {
      return c.json(
        {
          success: false,
          error: 'User not found',
        },
        404
      );
    }

    // Get public stats
    const stats = await c.env.DB.prepare(
      `SELECT
         (SELECT COUNT(*) FROM circuits WHERE user_id = ? AND is_public = 1) as public_circuits,
         (SELECT COUNT(*) FROM challenges WHERE creator_id = ?) as challenges_created,
         (SELECT SUM(likes) FROM circuits WHERE user_id = ?) as total_likes`
    )
      .bind(profile.id, profile.id, profile.id)
      .first<{
        public_circuits: number;
        challenges_created: number;
        total_likes: number;
      }>();

    return c.json({
      success: true,
      data: {
        ...profile,
        stats: {
          publicCircuits: stats?.public_circuits || 0,
          challengesCreated: stats?.challenges_created || 0,
          totalLikes: stats?.total_likes || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to get user',
      },
      500
    );
  }
});

// Get user achievements
usersRouter.get('/:username/achievements', async (c) => {
  const username = c.req.param('username');

  try {
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?')
      .bind(username)
      .first<{ id: string }>();

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const achievements = await c.env.DB.prepare(
      `SELECT achievement_type, earned_at, metadata_json
       FROM achievements WHERE user_id = ?
       ORDER BY earned_at DESC`
    )
      .bind(user.id)
      .all();

    return c.json({
      success: true,
      data: achievements.results.map((a: { achievement_type: string; earned_at: string; metadata_json: string | null }) => ({
        type: a.achievement_type,
        earnedAt: a.earned_at,
        metadata: a.metadata_json ? JSON.parse(a.metadata_json) : null,
      })),
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to get achievements',
      },
      500
    );
  }
});

export { usersRouter };
