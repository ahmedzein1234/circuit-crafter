import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const progressRouter = new Hono<Env>();

// All routes require authentication
progressRouter.use('*', authMiddleware);

const updateProgressSchema = z.object({
  xp: z.number().int().min(0),
  level: z.number().int().min(1),
  totalCircuitsCreated: z.number().int().min(0).optional(),
  totalChallengesCompleted: z.number().int().min(0).optional(),
  totalWiresConnected: z.number().int().min(0).optional(),
});

const unlockAchievementSchema = z.object({
  achievementId: z.string(),
  progress: z.number().int().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Get user progress
progressRouter.get('/', async (c) => {
  const user = c.get('user');

  try {
    const progress = await c.env.DB.prepare(
      `SELECT xp, level, total_circuits_created, total_challenges_completed,
              total_wires_connected, updated_at
       FROM user_progress WHERE user_id = ?`
    )
      .bind(user.id)
      .first();

    const streaks = await c.env.DB.prepare(
      `SELECT current_streak, longest_streak, last_activity_date,
              streak_start_date, total_days_active
       FROM user_streaks WHERE user_id = ?`
    )
      .bind(user.id)
      .first();

    return c.json({
      success: true,
      data: {
        xp: progress?.xp || 0,
        level: progress?.level || 1,
        totalCircuitsCreated: progress?.total_circuits_created || 0,
        totalChallengesCompleted: progress?.total_challenges_completed || 0,
        totalWiresConnected: progress?.total_wires_connected || 0,
        currentStreak: streaks?.current_streak || 0,
        longestStreak: streaks?.longest_streak || 0,
        lastActivityDate: streaks?.last_activity_date,
        totalDaysActive: streaks?.total_days_active || 0,
        updatedAt: progress?.updated_at,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return c.json({ success: false, error: 'Failed to fetch progress' }, 500);
  }
});

// Update user progress (sync from client)
progressRouter.put('/', validateBody(updateProgressSchema), async (c) => {
  const user = c.get('user');
  const body = c.get('validatedBody') as z.infer<typeof updateProgressSchema>;
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_progress (user_id, xp, level, total_circuits_created,
                                  total_challenges_completed, total_wires_connected, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         xp = MAX(xp, excluded.xp),
         level = MAX(level, excluded.level),
         total_circuits_created = COALESCE(excluded.total_circuits_created, total_circuits_created),
         total_challenges_completed = COALESCE(excluded.total_challenges_completed, total_challenges_completed),
         total_wires_connected = COALESCE(excluded.total_wires_connected, total_wires_connected),
         updated_at = excluded.updated_at`
    )
      .bind(
        user.id,
        body.xp,
        body.level,
        body.totalCircuitsCreated || 0,
        body.totalChallengesCompleted || 0,
        body.totalWiresConnected || 0,
        now
      )
      .run();

    // Update streak
    const today = now.split('T')[0];
    await updateStreak(c.env.DB, user.id, today);

    // Invalidate leaderboard cache
    await c.env.CACHE.delete('leaderboard:global');
    await c.env.CACHE.delete('leaderboard:weekly');

    return c.json({
      success: true,
      message: 'Progress updated',
    });
  } catch (error) {
    console.error('Update progress error:', error);
    return c.json({ success: false, error: 'Failed to update progress' }, 500);
  }
});

// Add XP (incremental)
progressRouter.post('/add-xp', async (c) => {
  const user = c.get('user');
  const { amount, reason } = await c.req.json();

  if (typeof amount !== 'number' || amount <= 0) {
    return c.json({ success: false, error: 'Invalid XP amount' }, 400);
  }

  try {
    const now = new Date().toISOString();

    // Get current progress
    const current = await c.env.DB.prepare(
      'SELECT xp, level FROM user_progress WHERE user_id = ?'
    )
      .bind(user.id)
      .first<{ xp: number; level: number }>();

    const currentXp = current?.xp || 0;
    const currentLevel = current?.level || 1;
    const newXp = currentXp + amount;

    // Calculate new level (XP required doubles each level)
    let newLevel = currentLevel;
    let xpForNextLevel = 100 * Math.pow(2, newLevel - 1);
    while (newXp >= xpForNextLevel) {
      newLevel++;
      xpForNextLevel = 100 * Math.pow(2, newLevel - 1);
    }

    await c.env.DB.prepare(
      `INSERT INTO user_progress (user_id, xp, level, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         xp = ?,
         level = ?,
         updated_at = ?`
    )
      .bind(user.id, newXp, newLevel, now, newXp, newLevel, now)
      .run();

    // Log activity for feed if level up
    if (newLevel > currentLevel) {
      await c.env.DB.prepare(
        `INSERT INTO activity_feed (id, user_id, activity_type, metadata_json, created_at)
         VALUES (?, ?, 'level_up', ?, ?)`
      )
        .bind(
          generateId(),
          user.id,
          JSON.stringify({ oldLevel: currentLevel, newLevel, reason }),
          now
        )
        .run();
    }

    return c.json({
      success: true,
      data: {
        xp: newXp,
        level: newLevel,
        xpGained: amount,
        leveledUp: newLevel > currentLevel,
      },
    });
  } catch (error) {
    console.error('Add XP error:', error);
    return c.json({ success: false, error: 'Failed to add XP' }, 500);
  }
});

// Get user achievements
progressRouter.get('/achievements', async (c) => {
  const user = c.get('user');

  try {
    const achievements = await c.env.DB.prepare(
      `SELECT achievement_id, unlocked_at, progress, metadata_json
       FROM user_achievements WHERE user_id = ?
       ORDER BY unlocked_at DESC`
    )
      .bind(user.id)
      .all();

    return c.json({
      success: true,
      data: achievements.results?.map((a: any) => ({
        achievementId: a.achievement_id,
        unlockedAt: a.unlocked_at,
        progress: a.progress,
        metadata: a.metadata_json ? JSON.parse(a.metadata_json) : null,
      })) || [],
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return c.json({ success: false, error: 'Failed to fetch achievements' }, 500);
  }
});

// Unlock achievement
progressRouter.post('/achievements/:id', validateBody(unlockAchievementSchema), async (c) => {
  const user = c.get('user');
  const achievementId = c.req.param('id');
  const body = c.get('validatedBody') as z.infer<typeof unlockAchievementSchema>;
  const now = new Date().toISOString();

  try {
    // Check if already unlocked
    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    )
      .bind(user.id, achievementId)
      .first();

    if (existing) {
      return c.json({
        success: true,
        data: { alreadyUnlocked: true },
      });
    }

    // Unlock achievement
    await c.env.DB.prepare(
      `INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, progress, metadata_json)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(
        user.id,
        achievementId,
        now,
        body.progress || 100,
        body.metadata ? JSON.stringify(body.metadata) : null
      )
      .run();

    // Add to activity feed
    await c.env.DB.prepare(
      `INSERT INTO activity_feed (id, user_id, activity_type, target_id, target_type, created_at)
       VALUES (?, ?, 'achievement_unlocked', ?, 'achievement', ?)`
    )
      .bind(generateId(), user.id, achievementId, now)
      .run();

    return c.json({
      success: true,
      data: {
        achievementId,
        unlockedAt: now,
        alreadyUnlocked: false,
      },
    });
  } catch (error) {
    console.error('Unlock achievement error:', error);
    return c.json({ success: false, error: 'Failed to unlock achievement' }, 500);
  }
});

// Get daily reward status
progressRouter.get('/daily-rewards', async (c) => {
  const user = c.get('user');
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get streak info
    const streaks = await c.env.DB.prepare(
      'SELECT current_streak, last_activity_date FROM user_streaks WHERE user_id = ?'
    )
      .bind(user.id)
      .first<{ current_streak: number; last_activity_date: string }>();

    // Check if already claimed today
    const claimed = await c.env.DB.prepare(
      'SELECT 1 FROM daily_rewards WHERE user_id = ? AND reward_date = ?'
    )
      .bind(user.id, today)
      .first();

    // Calculate day number in streak (1-7, then resets)
    const dayNumber = ((streaks?.current_streak || 0) % 7) + 1;

    // Base XP rewards by day
    const baseRewards = [50, 75, 100, 150, 200, 300, 500];
    const baseXp = baseRewards[dayNumber - 1];

    return c.json({
      success: true,
      data: {
        canClaim: !claimed,
        dayNumber,
        currentStreak: streaks?.current_streak || 0,
        lastActivityDate: streaks?.last_activity_date,
        reward: {
          baseXp,
          bonusXp: dayNumber === 7 ? 200 : 0, // Week completion bonus
          totalXp: baseXp + (dayNumber === 7 ? 200 : 0),
        },
      },
    });
  } catch (error) {
    console.error('Get daily rewards error:', error);
    return c.json({ success: false, error: 'Failed to fetch daily rewards' }, 500);
  }
});

// Claim daily reward
progressRouter.post('/daily-rewards/claim', async (c) => {
  const user = c.get('user');
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  try {
    // Check if already claimed
    const claimed = await c.env.DB.prepare(
      'SELECT 1 FROM daily_rewards WHERE user_id = ? AND reward_date = ?'
    )
      .bind(user.id, today)
      .first();

    if (claimed) {
      return c.json({ success: false, error: 'Already claimed today' }, 400);
    }

    // Update streak first
    await updateStreak(c.env.DB, user.id, today);

    // Get updated streak
    const streaks = await c.env.DB.prepare(
      'SELECT current_streak FROM user_streaks WHERE user_id = ?'
    )
      .bind(user.id)
      .first<{ current_streak: number }>();

    const dayNumber = ((streaks?.current_streak || 1) % 7) || 7;
    const baseRewards = [50, 75, 100, 150, 200, 300, 500];
    const baseXp = baseRewards[dayNumber - 1];
    const bonusXp = dayNumber === 7 ? 200 : 0;
    const totalXp = baseXp + bonusXp;

    // Record the claim
    await c.env.DB.prepare(
      `INSERT INTO daily_rewards (user_id, reward_date, day_number, xp_earned, bonus_earned, claimed_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(user.id, today, dayNumber, baseXp, bonusXp, now)
      .run();

    // Add XP to user
    await c.env.DB.prepare(
      `UPDATE user_progress SET xp = xp + ?, updated_at = ? WHERE user_id = ?`
    )
      .bind(totalXp, now, user.id)
      .run();

    return c.json({
      success: true,
      data: {
        dayNumber,
        xpEarned: baseXp,
        bonusEarned: bonusXp,
        totalXp,
        newStreak: streaks?.current_streak || 1,
      },
    });
  } catch (error) {
    console.error('Claim daily reward error:', error);
    return c.json({ success: false, error: 'Failed to claim reward' }, 500);
  }
});

// Helper function to update streak
async function updateStreak(db: D1Database, userId: string, today: string) {
  const streaks = await db.prepare(
    'SELECT current_streak, longest_streak, last_activity_date, total_days_active FROM user_streaks WHERE user_id = ?'
  )
    .bind(userId)
    .first<{
      current_streak: number;
      longest_streak: number;
      last_activity_date: string;
      total_days_active: number;
    }>();

  if (!streaks) {
    // First activity ever
    await db.prepare(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date, total_days_active)
       VALUES (?, 1, 1, ?, ?, 1)`
    )
      .bind(userId, today, today)
      .run();
    return;
  }

  const lastDate = new Date(streaks.last_activity_date);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, no update needed
    return;
  }

  let newStreak: number;
  let newLongest = streaks.longest_streak;

  if (diffDays === 1) {
    // Consecutive day
    newStreak = streaks.current_streak + 1;
    if (newStreak > newLongest) {
      newLongest = newStreak;
    }
  } else {
    // Streak broken
    newStreak = 1;
  }

  await db.prepare(
    `UPDATE user_streaks
     SET current_streak = ?, longest_streak = ?, last_activity_date = ?,
         total_days_active = total_days_active + 1
     WHERE user_id = ?`
  )
    .bind(newStreak, newLongest, today, userId)
    .run();
}

export { progressRouter };
