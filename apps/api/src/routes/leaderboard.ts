import { Hono } from 'hono';
import { optionalAuthMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const leaderboardRouter = new Hono<Env>();

const CACHE_TTL = 5 * 60; // 5 minutes in seconds

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  circuitsCreated?: number;
  challengesCompleted?: number;
}

// Get global XP leaderboard
leaderboardRouter.get('/', optionalAuthMiddleware, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 100);
  const currentUser = c.get('user');

  try {
    // Try cache first
    const cacheKey = `leaderboard:global:${limit}`;
    const cached = await c.env.CACHE.get(cacheKey);

    let leaderboard: LeaderboardEntry[];

    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      const results = await c.env.DB.prepare(
        `SELECT u.id, u.username, u.avatar_url, p.xp, p.level,
                p.total_circuits_created, p.total_challenges_completed
         FROM user_progress p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.xp DESC, p.level DESC
         LIMIT ?`
      )
        .bind(limit)
        .all();

      leaderboard = (results.results || []).map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        avatarUrl: row.avatar_url,
        xp: row.xp,
        level: row.level,
        circuitsCreated: row.total_circuits_created,
        challengesCompleted: row.total_challenges_completed,
      }));

      // Cache the results
      await c.env.CACHE.put(cacheKey, JSON.stringify(leaderboard), {
        expirationTtl: CACHE_TTL,
      });
    }

    // Get current user's rank if authenticated
    let userRank: LeaderboardEntry | null = null;
    if (currentUser) {
      const userInLeaderboard = leaderboard.find(e => e.userId === currentUser.id);
      if (userInLeaderboard) {
        userRank = userInLeaderboard;
      } else {
        // User not in top 100, get their actual rank
        const rankResult = await c.env.DB.prepare(
          `SELECT COUNT(*) + 1 as rank
           FROM user_progress
           WHERE xp > (SELECT xp FROM user_progress WHERE user_id = ?)`
        )
          .bind(currentUser.id)
          .first<{ rank: number }>();

        const userProgress = await c.env.DB.prepare(
          `SELECT p.xp, p.level, p.total_circuits_created, p.total_challenges_completed,
                  u.avatar_url
           FROM user_progress p
           JOIN users u ON p.user_id = u.id
           WHERE p.user_id = ?`
        )
          .bind(currentUser.id)
          .first<any>();

        if (rankResult && userProgress) {
          userRank = {
            rank: rankResult.rank,
            userId: currentUser.id,
            username: currentUser.username,
            avatarUrl: userProgress.avatar_url,
            xp: userProgress.xp,
            level: userProgress.level,
            circuitsCreated: userProgress.total_circuits_created,
            challengesCompleted: userProgress.total_challenges_completed,
          };
        }
      }
    }

    return c.json({
      success: true,
      data: {
        leaderboard,
        userRank,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Get weekly leaderboard (XP gained in the last 7 days)
leaderboardRouter.get('/weekly', optionalAuthMiddleware, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

  try {
    const cacheKey = `leaderboard:weekly:${limit}`;
    const cached = await c.env.CACHE.get(cacheKey);

    let leaderboard: any[];

    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      // Calculate weekly XP from daily rewards + activity
      const results = await c.env.DB.prepare(
        `SELECT u.id, u.username, u.avatar_url,
                COALESCE(SUM(dr.xp_earned + dr.bonus_earned), 0) as weekly_xp
         FROM users u
         LEFT JOIN daily_rewards dr ON u.id = dr.user_id
           AND dr.reward_date >= date('now', '-7 days')
         GROUP BY u.id
         HAVING weekly_xp > 0
         ORDER BY weekly_xp DESC
         LIMIT ?`
      )
        .bind(limit)
        .all();

      leaderboard = (results.results || []).map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        avatarUrl: row.avatar_url,
        weeklyXp: row.weekly_xp,
      }));

      await c.env.CACHE.put(cacheKey, JSON.stringify(leaderboard), {
        expirationTtl: CACHE_TTL,
      });
    }

    return c.json({
      success: true,
      data: {
        leaderboard,
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
      },
    });
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch weekly leaderboard' }, 500);
  }
});

// Get challenges leaderboard (most challenges completed)
leaderboardRouter.get('/challenges', optionalAuthMiddleware, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

  try {
    const cacheKey = `leaderboard:challenges:${limit}`;
    const cached = await c.env.CACHE.get(cacheKey);

    let leaderboard: any[];

    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      const results = await c.env.DB.prepare(
        `SELECT u.id, u.username, u.avatar_url,
                COUNT(p.challenge_id) as challenges_completed,
                SUM(CASE WHEN p.rating = 'gold' THEN 1 ELSE 0 END) as gold_count,
                SUM(CASE WHEN p.rating = 'silver' THEN 1 ELSE 0 END) as silver_count,
                SUM(CASE WHEN p.rating = 'bronze' THEN 1 ELSE 0 END) as bronze_count,
                AVG(p.best_time_seconds) as avg_time
         FROM progress p
         JOIN users u ON p.user_id = u.id
         WHERE p.completed = 1
         GROUP BY p.user_id
         ORDER BY challenges_completed DESC, gold_count DESC, avg_time ASC
         LIMIT ?`
      )
        .bind(limit)
        .all();

      leaderboard = (results.results || []).map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        avatarUrl: row.avatar_url,
        challengesCompleted: row.challenges_completed,
        goldCount: row.gold_count,
        silverCount: row.silver_count,
        bronzeCount: row.bronze_count,
        avgTimeSeconds: row.avg_time,
      }));

      await c.env.CACHE.put(cacheKey, JSON.stringify(leaderboard), {
        expirationTtl: CACHE_TTL,
      });
    }

    return c.json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    console.error('Get challenges leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch challenges leaderboard' }, 500);
  }
});

// Get streak leaderboard
leaderboardRouter.get('/streaks', optionalAuthMiddleware, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const type = c.req.query('type') || 'current'; // 'current' or 'longest'

  try {
    const cacheKey = `leaderboard:streaks:${type}:${limit}`;
    const cached = await c.env.CACHE.get(cacheKey);

    let leaderboard: any[];

    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      const orderColumn = type === 'longest' ? 'longest_streak' : 'current_streak';

      const results = await c.env.DB.prepare(
        `SELECT u.id, u.username, u.avatar_url,
                s.current_streak, s.longest_streak, s.last_activity_date
         FROM user_streaks s
         JOIN users u ON s.user_id = u.id
         WHERE s.${orderColumn} > 0
         ORDER BY s.${orderColumn} DESC, s.last_activity_date DESC
         LIMIT ?`
      )
        .bind(limit)
        .all();

      leaderboard = (results.results || []).map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        avatarUrl: row.avatar_url,
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
        lastActive: row.last_activity_date,
      }));

      await c.env.CACHE.put(cacheKey, JSON.stringify(leaderboard), {
        expirationTtl: CACHE_TTL,
      });
    }

    return c.json({
      success: true,
      data: {
        leaderboard,
        type,
      },
    });
  } catch (error) {
    console.error('Get streaks leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch streaks leaderboard' }, 500);
  }
});

// Get leaderboard for a specific challenge
leaderboardRouter.get('/challenges/:challengeId', optionalAuthMiddleware, async (c) => {
  const challengeId = c.req.param('challengeId');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

  try {
    const results = await c.env.DB.prepare(
      `SELECT u.id, u.username, u.avatar_url,
              p.best_time_seconds, p.rating, p.attempts, p.completed_at
       FROM progress p
       JOIN users u ON p.user_id = u.id
       WHERE p.challenge_id = ? AND p.completed = 1
       ORDER BY
         CASE p.rating WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 ELSE 3 END,
         p.best_time_seconds ASC
       LIMIT ?`
    )
      .bind(challengeId, limit)
      .all();

    const leaderboard = (results.results || []).map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.id,
      username: row.username,
      avatarUrl: row.avatar_url,
      bestTimeSeconds: row.best_time_seconds,
      rating: row.rating,
      attempts: row.attempts,
      completedAt: row.completed_at,
    }));

    return c.json({
      success: true,
      data: {
        challengeId,
        leaderboard,
      },
    });
  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch challenge leaderboard' }, 500);
  }
});

// Get circuits leaderboard (most liked/played circuits)
leaderboardRouter.get('/circuits', optionalAuthMiddleware, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const sortBy = c.req.query('sort') || 'likes'; // 'likes', 'plays', 'forks'

  try {
    const cacheKey = `leaderboard:circuits:${sortBy}:${limit}`;
    const cached = await c.env.CACHE.get(cacheKey);

    let leaderboard: any[];

    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      const orderColumn = sortBy === 'plays' ? 'plays' : sortBy === 'forks' ? 'forks' : 'likes';

      const results = await c.env.DB.prepare(
        `SELECT c.id, c.name, c.description, c.thumbnail_url,
                c.likes, c.plays, c.forks, c.created_at,
                u.id as user_id, u.username, u.avatar_url
         FROM circuits c
         JOIN users u ON c.user_id = u.id
         WHERE c.is_public = 1
         ORDER BY c.${orderColumn} DESC
         LIMIT ?`
      )
        .bind(limit)
        .all();

      leaderboard = (results.results || []).map((row: any, index: number) => ({
        rank: index + 1,
        circuitId: row.id,
        name: row.name,
        description: row.description,
        thumbnailUrl: row.thumbnail_url,
        likes: row.likes,
        plays: row.plays,
        forks: row.forks,
        createdAt: row.created_at,
        creator: {
          id: row.user_id,
          username: row.username,
          avatarUrl: row.avatar_url,
        },
      }));

      await c.env.CACHE.put(cacheKey, JSON.stringify(leaderboard), {
        expirationTtl: CACHE_TTL,
      });
    }

    return c.json({
      success: true,
      data: {
        leaderboard,
        sortBy,
      },
    });
  } catch (error) {
    console.error('Get circuits leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch circuits leaderboard' }, 500);
  }
});

export { leaderboardRouter };
