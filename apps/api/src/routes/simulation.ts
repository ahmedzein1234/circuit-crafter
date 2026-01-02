import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { generateId } from '@circuit-crafter/shared';
import type { Env } from '../types/env';

const simulationRouter = new Hono<Env>();

// Rating thresholds (time ratio: solve time / time limit)
const RATING_THRESHOLDS = {
  gold: 0.5,    // Complete in 50% of time limit
  silver: 0.75, // Complete in 75% of time limit
  bronze: 1.0,  // Complete within time limit
};

const simulateSchema = z.object({
  components: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({ x: z.number(), y: z.number() }),
      rotation: z.number(),
      terminals: z.array(z.any()),
      properties: z.record(z.any()),
    })
  ),
  wires: z.array(
    z.object({
      id: z.string(),
      fromTerminal: z.string(),
      toTerminal: z.string(),
      path: z.array(z.object({ x: z.number(), y: z.number() })),
    })
  ),
});

// Run simulation
simulationRouter.post('/', validateBody(simulateSchema), async (c) => {
  const { components, wires } = c.get('validatedBody') as z.infer<typeof simulateSchema>;

  try {
    // Note: In production, we would import the CircuitSolver from circuit-engine
    // For now, return a mock simulation result
    // The actual simulation runs client-side for real-time feedback

    const componentResults = components.map((comp: { id: string; type: string }) => ({
      componentId: comp.id,
      state: 'normal' as const,
      voltage: 0,
      current: 0,
      power: 0,
      isOverloaded: false,
      ...(comp.type === 'led' ? { brightness: 0 } : {}),
      ...(comp.type.includes('gate') ? { logicState: false } : {}),
    }));

    const wireResults = wires.map((wire: { id: string }) => ({
      wireId: wire.id,
      current: 0,
      voltage: 0,
      isCarryingCurrent: false,
    }));

    return c.json({
      success: true,
      data: {
        success: true,
        components: componentResults,
        wires: wireResults,
        warnings: [],
        totalPower: 0,
        hasShortCircuit: false,
        hasOpenCircuit: components.length === 0,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return c.json(
      {
        success: false,
        error: 'Simulation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Schema for validate endpoint
const validateSchema = z.object({
  challengeId: z.string(),
  components: z.array(z.any()),
  wires: z.array(z.any()),
  solveTimeSeconds: z.number().optional(),
  simulationResult: z.object({
    success: z.boolean(),
    components: z.array(z.object({
      componentId: z.string(),
      state: z.string(),
      voltage: z.number().optional(),
      current: z.number().optional(),
      brightness: z.number().optional(),
      logicState: z.boolean().optional(),
      isOverloaded: z.boolean().optional(),
    })).optional(),
  }).optional(),
});

// Validate circuit against challenge (optionally authenticated for recording progress)
simulationRouter.post('/validate', optionalAuthMiddleware, validateBody(validateSchema), async (c) => {
  const { challengeId, components, wires, solveTimeSeconds, simulationResult } =
    c.get('validatedBody') as z.infer<typeof validateSchema>;
  const user = c.get('user');

  try {
    // Get challenge
    const challenge = await c.env.DB.prepare(
      'SELECT * FROM challenges WHERE id = ?'
    )
      .bind(challengeId)
      .first<{
        id: string;
        title: string;
        difficulty: string;
        xp_reward: number;
        time_limit_seconds: number | null;
        constraints_json: string | null;
        target_json: string;
      }>();

    if (!challenge) {
      return c.json({ success: false, error: 'Challenge not found' }, 404);
    }

    // Parse challenge data
    const constraints = challenge.constraints_json
      ? JSON.parse(challenge.constraints_json)
      : null;
    const target = JSON.parse(challenge.target_json);

    // Validation results
    const feedback: string[] = [];
    let constraintsPassed = true;
    let targetPassed = true;

    // ==================== CONSTRAINT VALIDATION ====================
    if (constraints) {
      if (constraints.maxComponents && components.length > constraints.maxComponents) {
        feedback.push(`Too many components: ${components.length}/${constraints.maxComponents}`);
        constraintsPassed = false;
      }

      if (constraints.maxWires && wires.length > constraints.maxWires) {
        feedback.push(`Too many wires: ${wires.length}/${constraints.maxWires}`);
        constraintsPassed = false;
      }

      if (constraints.allowedComponentTypes) {
        const invalidComponents = components.filter(
          (comp: { type: string }) => !constraints.allowedComponentTypes.includes(comp.type)
        );
        if (invalidComponents.length > 0) {
          const types = [...new Set(invalidComponents.map((c: { type: string }) => c.type))];
          feedback.push(`Component types not allowed: ${types.join(', ')}`);
          constraintsPassed = false;
        }
      }

      if (constraints.forbiddenComponentTypes) {
        const forbiddenComponents = components.filter(
          (comp: { type: string }) => constraints.forbiddenComponentTypes.includes(comp.type)
        );
        if (forbiddenComponents.length > 0) {
          const types = [...new Set(forbiddenComponents.map((c: { type: string }) => c.type))];
          feedback.push(`Forbidden component types used: ${types.join(', ')}`);
          constraintsPassed = false;
        }
      }

      if (constraints.requiredComponentTypes) {
        for (const required of constraints.requiredComponentTypes) {
          const hasComponent = components.some((c: { type: string }) => c.type === required);
          if (!hasComponent) {
            feedback.push(`Required component missing: ${required}`);
            constraintsPassed = false;
          }
        }
      }
    }

    // ==================== TARGET VALIDATION ====================
    if (target.type === 'power_led') {
      const leds = components.filter((c: { type: string }) => c.type === 'led');
      const hasBattery = components.some((c: { type: string }) => c.type === 'battery');

      if (!hasBattery) {
        feedback.push('Circuit needs a power source');
        targetPassed = false;
      } else if (leds.length === 0) {
        feedback.push('Circuit needs an LED');
        targetPassed = false;
      } else if (simulationResult?.components) {
        // Check simulation results for LED state
        for (const led of leds) {
          const ledResult = simulationResult.components.find(r => r.componentId === led.id);
          if (ledResult) {
            if (ledResult.state !== 'powered' && (ledResult.brightness ?? 0) < 0.1) {
              feedback.push('LED is not properly powered');
              targetPassed = false;
            } else if (ledResult.isOverloaded) {
              feedback.push('LED is overloaded! Add a resistor.');
              targetPassed = false;
            }
          }
        }
      }
    } else if (target.type === 'logic_output' && target.expectedOutputs) {
      if (simulationResult?.components) {
        for (const [componentId, expectedValue] of Object.entries(target.expectedOutputs)) {
          const result = simulationResult.components.find(r => r.componentId === componentId);
          if (!result) {
            feedback.push(`Output component not found`);
            targetPassed = false;
          } else if (typeof expectedValue === 'boolean' && result.logicState !== expectedValue) {
            feedback.push(`Logic output mismatch: expected ${expectedValue ? 'HIGH' : 'LOW'}`);
            targetPassed = false;
          }
        }
      } else {
        // Fallback check without simulation result
        const hasAllGates = Object.keys(target.expectedOutputs).every(compId =>
          components.some((c: { id: string }) => c.id === compId)
        );
        if (!hasAllGates) {
          feedback.push('Required logic gates not found');
          targetPassed = false;
        }
      }
    } else if (target.type === 'voltage_match' && target.expectedOutputs) {
      const tolerance = target.tolerancePercent ?? 5;
      if (simulationResult?.components) {
        for (const [componentId, expectedVoltage] of Object.entries(target.expectedOutputs)) {
          const result = simulationResult.components.find(r => r.componentId === componentId);
          if (result && typeof expectedVoltage === 'number' && result.voltage !== undefined) {
            const percentDiff = Math.abs((result.voltage - expectedVoltage) / expectedVoltage) * 100;
            if (percentDiff > tolerance) {
              feedback.push(
                `Voltage mismatch: expected ${expectedVoltage}V, got ${result.voltage.toFixed(2)}V`
              );
              targetPassed = false;
            }
          }
        }
      }
    }

    // ==================== DETERMINE RESULT ====================
    const passed = constraintsPassed && targetPassed;

    // Calculate rating based on time
    let rating: 'gold' | 'silver' | 'bronze' | null = null;
    let xpEarned = 0;

    if (passed) {
      const timeLimit = challenge.time_limit_seconds || 300;
      const solveTime = solveTimeSeconds || timeLimit;
      const timeRatio = solveTime / timeLimit;

      if (timeRatio <= RATING_THRESHOLDS.gold) {
        rating = 'gold';
        xpEarned = Math.floor(challenge.xp_reward * 1.5);
        feedback.push('Excellent! Gold rating achieved!');
      } else if (timeRatio <= RATING_THRESHOLDS.silver) {
        rating = 'silver';
        xpEarned = Math.floor(challenge.xp_reward * 1.25);
        feedback.push('Great job! Silver rating achieved!');
      } else {
        rating = 'bronze';
        xpEarned = challenge.xp_reward;
        feedback.push('Challenge completed!');
      }

      // Record completion if user is authenticated
      if (user) {
        const now = new Date().toISOString();

        // Check if already completed
        const existing = await c.env.DB.prepare(
          'SELECT best_rating FROM challenge_completions WHERE user_id = ? AND challenge_id = ?'
        )
          .bind(user.id, challengeId)
          .first<{ best_rating: string }>();

        const ratingOrder = { gold: 3, silver: 2, bronze: 1 };
        const shouldUpdate = !existing ||
          ratingOrder[rating] > ratingOrder[existing.best_rating as keyof typeof ratingOrder];

        if (!existing) {
          // First completion
          await c.env.DB.prepare(
            `INSERT INTO challenge_completions (user_id, challenge_id, best_rating, best_time_seconds, attempts, first_completed_at, last_completed_at)
             VALUES (?, ?, ?, ?, 1, ?, ?)`
          )
            .bind(user.id, challengeId, rating, solveTime || null, now, now)
            .run();

          // Update progress
          await c.env.DB.prepare(
            `UPDATE user_progress
             SET xp = xp + ?, total_challenges_completed = total_challenges_completed + 1, updated_at = ?
             WHERE user_id = ?`
          )
            .bind(xpEarned, now, user.id)
            .run();

          // Add activity
          await c.env.DB.prepare(
            `INSERT INTO activity_feed (id, user_id, activity_type, target_id, target_type, metadata_json, created_at)
             VALUES (?, ?, 'challenge_completed', ?, 'challenge', ?, ?)`
          )
            .bind(
              generateId(),
              user.id,
              challengeId,
              JSON.stringify({ rating, xpEarned, title: challenge.title }),
              now
            )
            .run();
        } else if (shouldUpdate) {
          // Improved rating
          const bonusXp = Math.floor(xpEarned * 0.25); // 25% bonus for improvement
          await c.env.DB.prepare(
            `UPDATE challenge_completions
             SET best_rating = ?, best_time_seconds = COALESCE(?, best_time_seconds),
                 attempts = attempts + 1, last_completed_at = ?
             WHERE user_id = ? AND challenge_id = ?`
          )
            .bind(rating, solveTime || null, now, user.id, challengeId)
            .run();

          await c.env.DB.prepare(
            `UPDATE user_progress SET xp = xp + ?, updated_at = ? WHERE user_id = ?`
          )
            .bind(bonusXp, now, user.id)
            .run();

          xpEarned = bonusXp;
          feedback.push(`Rating improved! Bonus XP: ${bonusXp}`);
        } else {
          // Already completed with same or better rating
          await c.env.DB.prepare(
            `UPDATE challenge_completions SET attempts = attempts + 1, last_completed_at = ?
             WHERE user_id = ? AND challenge_id = ?`
          )
            .bind(now, user.id, challengeId)
            .run();
          xpEarned = 0;
        }

        // Invalidate leaderboard cache
        await c.env.CACHE.delete('leaderboard:challenges');
      }
    } else {
      feedback.push('Challenge not passed. Keep trying!');
    }

    return c.json({
      success: true,
      data: {
        passed,
        rating,
        xpEarned,
        feedback,
        constraintsPassed,
        targetPassed,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return c.json({ success: false, error: 'Validation failed' }, 500);
  }
});

// Submit challenge solution (authenticated endpoint)
simulationRouter.post('/submit', authMiddleware, validateBody(validateSchema), async (c) => {
  // This is an alias for validate with required auth
  // The validate endpoint handles everything
  const body = c.get('validatedBody');
  const request = new Request(c.req.url.replace('/submit', '/validate'), {
    method: 'POST',
    headers: c.req.raw.headers,
    body: JSON.stringify(body),
  });
  return c.env.CIRCUIT_ROOM ? simulationRouter.fetch(request, c.env) : c.json({ success: false, error: 'Internal error' }, 500);
});

export { simulationRouter };
