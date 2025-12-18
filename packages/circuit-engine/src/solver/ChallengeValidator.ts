/**
 * Validates circuit solutions against challenge requirements
 */

import type {
  CircuitComponent,
  Wire,
  SimulationResult,
  Challenge,
  ChallengeConstraints,
  ChallengeTarget,
  ProgressRating,
} from '@circuit-crafter/shared';
import { RATING_THRESHOLDS } from '@circuit-crafter/shared';
import { CircuitSolver } from './CircuitSolver';

export interface ValidationResult {
  passed: boolean;
  rating?: ProgressRating;
  feedback: string[];
  constraintsPassed: boolean;
  targetPassed: boolean;
  timeBonusApplied: boolean;
}

export class ChallengeValidator {
  private solver: CircuitSolver;

  constructor() {
    this.solver = new CircuitSolver();
  }

  validate(
    components: CircuitComponent[],
    wires: Wire[],
    challenge: Challenge,
    solveTimeSeconds: number
  ): ValidationResult {
    const feedback: string[] = [];

    // Validate constraints
    const constraintsPassed = this.validateConstraints(
      components,
      wires,
      challenge.constraints,
      feedback
    );

    // Simulate circuit
    const simulation = this.solver.solve(components, wires);

    // Validate target
    const targetPassed = this.validateTarget(
      simulation,
      components,
      challenge.target,
      feedback
    );

    // Determine if passed
    const passed = constraintsPassed && targetPassed && simulation.success;

    // Calculate rating based on time
    let rating: ProgressRating | undefined;
    let timeBonusApplied = false;

    if (passed && challenge.timeLimitSeconds) {
      const timeRatio = solveTimeSeconds / challenge.timeLimitSeconds;

      if (timeRatio <= RATING_THRESHOLDS.gold) {
        rating = 'gold';
        feedback.push('Excellent! Gold rating achieved!');
        timeBonusApplied = true;
      } else if (timeRatio <= RATING_THRESHOLDS.silver) {
        rating = 'silver';
        feedback.push('Great job! Silver rating achieved!');
        timeBonusApplied = true;
      } else if (timeRatio <= RATING_THRESHOLDS.bronze) {
        rating = 'bronze';
        feedback.push('Good work! Bronze rating achieved!');
      }
    } else if (passed) {
      rating = 'bronze';
      feedback.push('Challenge completed!');
    }

    // Add simulation warnings to feedback
    for (const warning of simulation.warnings) {
      if (warning.severity === 'error') {
        feedback.push(`Error: ${warning.message}`);
      } else if (warning.severity === 'warning') {
        feedback.push(`Warning: ${warning.message}`);
      }
    }

    return {
      passed,
      rating,
      feedback,
      constraintsPassed,
      targetPassed,
      timeBonusApplied,
    };
  }

  private validateConstraints(
    components: CircuitComponent[],
    wires: Wire[],
    constraints: ChallengeConstraints | undefined,
    feedback: string[]
  ): boolean {
    if (!constraints) return true;

    let allPassed = true;

    // Check max components
    if (constraints.maxComponents !== undefined) {
      const componentCount = components.filter((c) => c.type !== 'wire').length;
      if (componentCount > constraints.maxComponents) {
        feedback.push(
          `Too many components: ${componentCount}/${constraints.maxComponents}`
        );
        allPassed = false;
      }
    }

    // Check max wires
    if (constraints.maxWires !== undefined) {
      if (wires.length > constraints.maxWires) {
        feedback.push(`Too many wires: ${wires.length}/${constraints.maxWires}`);
        allPassed = false;
      }
    }

    // Check allowed component types
    if (constraints.allowedComponentTypes) {
      for (const component of components) {
        if (!constraints.allowedComponentTypes.includes(component.type)) {
          feedback.push(`Component type "${component.type}" is not allowed`);
          allPassed = false;
        }
      }
    }

    // Check forbidden component types
    if (constraints.forbiddenComponentTypes) {
      for (const component of components) {
        if (constraints.forbiddenComponentTypes.includes(component.type)) {
          feedback.push(`Component type "${component.type}" is forbidden`);
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  private validateTarget(
    simulation: SimulationResult,
    components: CircuitComponent[],
    target: ChallengeTarget,
    feedback: string[]
  ): boolean {
    switch (target.type) {
      case 'power_led':
        return this.validatePowerLED(simulation, components, target, feedback);
      case 'logic_output':
        return this.validateLogicOutput(simulation, target, feedback);
      case 'voltage_match':
        return this.validateVoltageMatch(simulation, target, feedback);
      case 'custom':
        return this.validateCustomTarget(simulation, target, feedback);
      default:
        feedback.push('Unknown target type');
        return false;
    }
  }

  private validatePowerLED(
    simulation: SimulationResult,
    components: CircuitComponent[],
    target: ChallengeTarget,
    feedback: string[]
  ): boolean {
    const leds = components.filter((c) => c.type === 'led');
    const targetLeds = target.targetComponents
      ? leds.filter((led) => target.targetComponents!.includes(led.id))
      : leds;

    if (targetLeds.length === 0) {
      feedback.push('No target LEDs found');
      return false;
    }

    let allPowered = true;
    for (const led of targetLeds) {
      const ledResult = simulation.components.find((r) => r.componentId === led.id);
      if (!ledResult) {
        feedback.push(`LED ${led.id} not found in simulation`);
        allPowered = false;
        continue;
      }

      if (ledResult.state !== 'powered' || (ledResult.brightness ?? 0) < 0.1) {
        feedback.push(`LED is not properly powered`);
        allPowered = false;
      } else if (ledResult.isOverloaded) {
        feedback.push(`LED is overloaded! Reduce current.`);
        allPowered = false;
      }
    }

    if (allPowered) {
      feedback.push('All target LEDs are properly powered!');
    }

    return allPowered;
  }

  private validateLogicOutput(
    simulation: SimulationResult,
    target: ChallengeTarget,
    feedback: string[]
  ): boolean {
    if (!target.expectedOutputs) {
      feedback.push('No expected outputs defined');
      return false;
    }

    let allMatch = true;
    for (const [componentId, expectedValue] of Object.entries(target.expectedOutputs)) {
      const result = simulation.components.find((r) => r.componentId === componentId);
      if (!result) {
        feedback.push(`Component ${componentId} not found`);
        allMatch = false;
        continue;
      }

      if (typeof expectedValue === 'boolean') {
        if (result.logicState !== expectedValue) {
          feedback.push(`Logic gate output mismatch`);
          allMatch = false;
        }
      }
    }

    if (allMatch) {
      feedback.push('All logic outputs match expected values!');
    }

    return allMatch;
  }

  private validateVoltageMatch(
    simulation: SimulationResult,
    target: ChallengeTarget,
    feedback: string[]
  ): boolean {
    if (!target.expectedOutputs) {
      feedback.push('No expected voltages defined');
      return false;
    }

    const tolerance = target.tolerancePercent ?? 5;

    let allMatch = true;
    for (const [componentId, expectedVoltage] of Object.entries(target.expectedOutputs)) {
      const result = simulation.components.find((r) => r.componentId === componentId);
      if (!result) {
        feedback.push(`Component ${componentId} not found`);
        allMatch = false;
        continue;
      }

      if (typeof expectedVoltage === 'number') {
        const percentDiff = Math.abs((result.voltage - expectedVoltage) / expectedVoltage) * 100;
        if (percentDiff > tolerance) {
          feedback.push(
            `Voltage mismatch: expected ${expectedVoltage}V, got ${result.voltage.toFixed(2)}V`
          );
          allMatch = false;
        }
      }
    }

    if (allMatch) {
      feedback.push('All voltage targets met!');
    }

    return allMatch;
  }

  private validateCustomTarget(
    _simulation: SimulationResult,
    _target: ChallengeTarget,
    feedback: string[]
  ): boolean {
    // Custom validation logic can be extended here
    feedback.push('Custom target validation not implemented');
    return true;
  }
}
