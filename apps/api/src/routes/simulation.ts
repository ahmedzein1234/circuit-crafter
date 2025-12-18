import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import type { Env } from '../types/env';

const simulationRouter = new Hono<Env>();

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
  const { components, wires } = c.get('validatedBody');

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

// Validate circuit against challenge
simulationRouter.post('/validate', validateBody(z.object({
  challengeId: z.string(),
  components: z.array(z.any()),
  wires: z.array(z.any()),
})), async (c) => {
  const { challengeId, components, wires } = c.get('validatedBody');

  try {
    // Get challenge
    const challenge = await c.env.DB.prepare(
      'SELECT * FROM challenges WHERE id = ?'
    )
      .bind(challengeId)
      .first();

    if (!challenge) {
      return c.json({ success: false, error: 'Challenge not found' }, 404);
    }

    // Parse challenge data
    const constraints = challenge.constraints_json
      ? JSON.parse(challenge.constraints_json as string)
      : null;
    const target = JSON.parse(challenge.target_json as string);

    // Basic validation
    const feedback: string[] = [];
    let passed = true;

    // Check constraints
    if (constraints) {
      if (constraints.maxComponents && components.length > constraints.maxComponents) {
        feedback.push(`Too many components: ${components.length}/${constraints.maxComponents}`);
        passed = false;
      }

      if (constraints.maxWires && wires.length > constraints.maxWires) {
        feedback.push(`Too many wires: ${wires.length}/${constraints.maxWires}`);
        passed = false;
      }

      if (constraints.allowedComponentTypes) {
        const invalidComponents = components.filter(
          (c: { type: string }) => !constraints.allowedComponentTypes.includes(c.type)
        );
        if (invalidComponents.length > 0) {
          feedback.push(`Invalid component types used`);
          passed = false;
        }
      }

      if (constraints.forbiddenComponentTypes) {
        const forbiddenComponents = components.filter(
          (c: { type: string }) => constraints.forbiddenComponentTypes.includes(c.type)
        );
        if (forbiddenComponents.length > 0) {
          feedback.push(`Forbidden component types used`);
          passed = false;
        }
      }
    }

    // Check target (simplified - actual validation would run simulation)
    if (target.type === 'power_led') {
      const hasLed = components.some((c: { type: string }) => c.type === 'led');
      const hasBattery = components.some((c: { type: string }) => c.type === 'battery');

      if (!hasLed) {
        feedback.push('Circuit needs an LED');
        passed = false;
      }
      if (!hasBattery) {
        feedback.push('Circuit needs a power source');
        passed = false;
      }
    }

    if (passed && feedback.length === 0) {
      feedback.push('All requirements met!');
    }

    return c.json({
      success: true,
      data: {
        passed,
        feedback,
        constraintsPassed: passed,
        targetPassed: passed,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return c.json({ success: false, error: 'Validation failed' }, 500);
  }
});

export { simulationRouter };
