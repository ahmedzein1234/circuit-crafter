/**
 * @circuit-crafter/circuit-engine
 * Core circuit simulation engine
 */

// Solver
export { CircuitSolver } from './solver/CircuitSolver';
export { CircuitGraph } from './solver/CircuitGraph';
export type { GraphNode, GraphEdge } from './solver/CircuitGraph';
export { ChallengeValidator } from './solver/ChallengeValidator';
export type { ValidationResult } from './solver/ChallengeValidator';

// Component Factory
export {
  createComponent,
  createBattery,
  createResistor,
  createLED,
  createSwitch,
  createWire,
  createANDGate,
  createORGate,
  createNOTGate,
  createGround,
  createCapacitor,
  createDiode,
  createTransistor,
  createBuzzer,
  createMotor,
  createPotentiometer,
  createFuse,
} from './components/ComponentFactory';

// Re-export types from shared for convenience
export type {
  CircuitComponent,
  ComponentType,
  Wire,
  Circuit,
  SimulationResult,
  SimulationOptions,
} from '@circuit-crafter/shared';
