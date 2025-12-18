import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const challengesRouter = new Hono<Env>();

const createChallengeSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  circuitId: z.string().optional(),
  constraints: z
    .object({
      maxComponents: z.number().optional(),
      allowedComponentTypes: z.array(z.string()).optional(),
      forbiddenComponentTypes: z.array(z.string()).optional(),
      maxWires: z.number().optional(),
    })
    .optional(),
  target: z.object({
    type: z.enum(['power_led', 'logic_output', 'voltage_match', 'custom']),
    targetComponents: z.array(z.string()).optional(),
    expectedOutputs: z.record(z.union([z.boolean(), z.number()])).optional(),
    tolerancePercent: z.number().optional(),
  }),
  hints: z.array(z.string()).optional(),
  timeLimitSeconds: z.number().min(30).max(3600).optional(),
});

const submitSolutionSchema = z.object({
  circuitBlueprint: z.object({
    components: z.array(z.any()),
    wires: z.array(z.any()),
  }),
  solveTimeSeconds: z.number(),
});

// List challenges
challengesRouter.get('/', async (c) => {
  const difficulty = c.req.query('difficulty');
  const featured = c.req.query('featured');

  try {
    let query = `
      SELECT c.id, c.title, c.description, c.difficulty, c.plays, c.solves,
             c.avg_solve_time_seconds, c.featured, c.created_at,
             u.username as creator_username
      FROM challenges c
      JOIN users u ON c.creator_id = u.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (difficulty) {
      query += ' AND c.difficulty = ?';
      params.push(difficulty);
    }

    if (featured === 'true') {
      query += ' AND c.featured = 1';
    }

    query += ' ORDER BY c.featured DESC, c.plays DESC LIMIT 50';

    const challenges = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: challenges.results,
    });
  } catch (error) {
    console.error('List challenges error:', error);
    return c.json({ success: false, error: 'Failed to list challenges' }, 500);
  }
});

// Get daily challenge
challengesRouter.get('/daily', async (c) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const daily = await c.env.DB.prepare(
      `SELECT c.*, u.username as creator_username
       FROM daily_challenges dc
       JOIN challenges c ON dc.challenge_id = c.id
       JOIN users u ON c.creator_id = u.id
       WHERE dc.date = ?`
    )
      .bind(today)
      .first();

    if (!daily) {
      // Fall back to a random featured challenge
      const random = await c.env.DB.prepare(
        `SELECT c.*, u.username as creator_username
         FROM challenges c
         JOIN users u ON c.creator_id = u.id
         WHERE c.featured = 1
         ORDER BY RANDOM()
         LIMIT 1`
      ).first();

      if (!random) {
        return c.json({ success: false, error: 'No daily challenge available' }, 404);
      }

      return c.json({
        success: true,
        data: {
          ...random,
          constraints: random.constraints_json
            ? JSON.parse(random.constraints_json as string)
            : null,
          target: JSON.parse(random.target_json as string),
          hints: random.hints_json ? JSON.parse(random.hints_json as string) : [],
        },
      });
    }

    return c.json({
      success: true,
      data: {
        ...daily,
        constraints: daily.constraints_json
          ? JSON.parse(daily.constraints_json as string)
          : null,
        target: JSON.parse(daily.target_json as string),
        hints: daily.hints_json ? JSON.parse(daily.hints_json as string) : [],
      },
    });
  } catch (error) {
    console.error('Get daily challenge error:', error);
    return c.json({ success: false, error: 'Failed to get daily challenge' }, 500);
  }
});

// Get single challenge
challengesRouter.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    const challenge = await c.env.DB.prepare(
      `SELECT c.*, u.username as creator_username
       FROM challenges c
       JOIN users u ON c.creator_id = u.id
       WHERE c.id = ?`
    )
      .bind(id)
      .first();

    if (!challenge) {
      return c.json({ success: false, error: 'Challenge not found' }, 404);
    }

    // Get user's progress if authenticated
    let userProgress = null;
    if (user) {
      userProgress = await c.env.DB.prepare(
        `SELECT completed, best_time_seconds, attempts, rating
         FROM progress WHERE user_id = ? AND challenge_id = ?`
      )
        .bind(user.id, id)
        .first();
    }

    // Increment play count
    await c.env.DB.prepare('UPDATE challenges SET plays = plays + 1 WHERE id = ?')
      .bind(id)
      .run();

    return c.json({
      success: true,
      data: {
        ...challenge,
        constraints: challenge.constraints_json
          ? JSON.parse(challenge.constraints_json as string)
          : null,
        target: JSON.parse(challenge.target_json as string),
        hints: challenge.hints_json ? JSON.parse(challenge.hints_json as string) : [],
        userProgress,
      },
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    return c.json({ success: false, error: 'Failed to get challenge' }, 500);
  }
});

// Create challenge
challengesRouter.post('/', authMiddleware, validateBody(createChallengeSchema), async (c) => {
  const user = c.get('user');
  const data = c.get('validatedBody') as z.infer<typeof createChallengeSchema>;

  try {
    const id = generateId();
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO challenges (id, creator_id, circuit_id, title, description, difficulty,
                               constraints_json, target_json, hints_json, time_limit_seconds, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        user.id,
        data.circuitId || null,
        data.title,
        data.description,
        data.difficulty,
        data.constraints ? JSON.stringify(data.constraints) : null,
        JSON.stringify(data.target),
        data.hints ? JSON.stringify(data.hints) : null,
        data.timeLimitSeconds || null,
        now
      )
      .run();

    return c.json(
      {
        success: true,
        data: {
          id,
          title: data.title,
          createdAt: now,
        },
      },
      201
    );
  } catch (error) {
    console.error('Create challenge error:', error);
    return c.json({ success: false, error: 'Failed to create challenge' }, 500);
  }
});

// Submit solution
challengesRouter.post(
  '/:id/submit',
  authMiddleware,
  validateBody(submitSolutionSchema),
  async (c) => {
    const challengeId = c.req.param('id');
    const user = c.get('user');
    const { circuitBlueprint, solveTimeSeconds } = c.get('validatedBody') as z.infer<typeof submitSolutionSchema>;

    try {
      // Get challenge details
      const challenge = await c.env.DB.prepare(
        'SELECT * FROM challenges WHERE id = ?'
      )
        .bind(challengeId)
        .first();

      if (!challenge) {
        return c.json({ success: false, error: 'Challenge not found' }, 404);
      }

      // TODO: Validate solution using ChallengeValidator from circuit-engine
      // For now, we'll assume the solution is valid if it has components
      const passed = circuitBlueprint.components.length > 0;

      // Calculate rating
      let rating: 'bronze' | 'silver' | 'gold' | null = null;
      if (passed && challenge.time_limit_seconds) {
        const timeRatio = solveTimeSeconds / (challenge.time_limit_seconds as number);
        if (timeRatio <= 0.5) rating = 'gold';
        else if (timeRatio <= 0.75) rating = 'silver';
        else rating = 'bronze';
      } else if (passed) {
        rating = 'bronze';
      }

      // Get existing progress
      const existing = await c.env.DB.prepare(
        'SELECT * FROM progress WHERE user_id = ? AND challenge_id = ?'
      )
        .bind(user.id, challengeId)
        .first();

      const now = new Date().toISOString();
      const newBestTime = !existing?.best_time_seconds ||
        (passed && solveTimeSeconds < (existing.best_time_seconds as number));

      if (existing) {
        // Update existing progress
        await c.env.DB.prepare(
          `UPDATE progress SET
           attempts = attempts + 1,
           completed = CASE WHEN ? = 1 THEN 1 ELSE completed END,
           best_time_seconds = CASE WHEN ? = 1 AND (best_time_seconds IS NULL OR ? < best_time_seconds) THEN ? ELSE best_time_seconds END,
           rating = CASE WHEN ? = 1 AND (rating IS NULL OR ? > rating) THEN ? ELSE rating END,
           completed_at = CASE WHEN ? = 1 AND completed = 0 THEN ? ELSE completed_at END
           WHERE user_id = ? AND challenge_id = ?`
        )
          .bind(
            passed ? 1 : 0,
            passed ? 1 : 0,
            solveTimeSeconds,
            solveTimeSeconds,
            passed ? 1 : 0,
            rating,
            rating,
            passed ? 1 : 0,
            now,
            user.id,
            challengeId
          )
          .run();
      } else {
        // Create new progress
        await c.env.DB.prepare(
          `INSERT INTO progress (user_id, challenge_id, completed, best_time_seconds, attempts, rating, completed_at)
           VALUES (?, ?, ?, ?, 1, ?, ?)`
        )
          .bind(
            user.id,
            challengeId,
            passed ? 1 : 0,
            passed ? solveTimeSeconds : null,
            passed ? rating : null,
            passed ? now : null
          )
          .run();
      }

      // Update challenge stats if first time solving
      if (passed && !existing?.completed) {
        await c.env.DB.prepare(
          `UPDATE challenges SET
           solves = solves + 1,
           avg_solve_time_seconds = (COALESCE(avg_solve_time_seconds * (solves - 1), 0) + ?) / solves
           WHERE id = ?`
        )
          .bind(solveTimeSeconds, challengeId)
          .run();
      }

      return c.json({
        success: true,
        data: {
          passed,
          rating,
          newBestTime,
          feedback: passed
            ? ['Challenge completed!']
            : ['Solution did not meet requirements'],
        },
      });
    } catch (error) {
      console.error('Submit solution error:', error);
      return c.json({ success: false, error: 'Failed to submit solution' }, 500);
    }
  }
);

// Get challenge leaderboard
challengesRouter.get('/:id/leaderboard', async (c) => {
  const challengeId = c.req.param('id');

  try {
    const leaderboard = await c.env.DB.prepare(
      `SELECT u.id as user_id, u.username, u.avatar_url, p.best_time_seconds, p.rating
       FROM progress p
       JOIN users u ON p.user_id = u.id
       WHERE p.challenge_id = ? AND p.completed = 1
       ORDER BY p.best_time_seconds ASC
       LIMIT 100`
    )
      .bind(challengeId)
      .all();

    return c.json({
      success: true,
      data: leaderboard.results.map((entry: unknown, index: number) => ({
        rank: index + 1,
        ...(entry as Record<string, unknown>),
      })),
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to get leaderboard' }, 500);
  }
});

export { challengesRouter };
