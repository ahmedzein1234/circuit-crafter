/**
 * Simulation result types for Circuit Crafter
 */

export type ComponentState = 'normal' | 'powered' | 'overloaded' | 'off' | 'open' | 'closed' | 'blown' | 'active';

export interface ComponentSimulationResult {
  componentId: string;
  state: ComponentState;
  voltage: number;
  current: number;
  power: number;
  isOverloaded: boolean;
  brightness?: number;
  logicState?: boolean;
  isActive?: boolean;
  isBlown?: boolean;
  effectiveResistance?: number;
}

export interface WireSimulationResult {
  wireId: string;
  current: number;
  voltage: number;
  isCarryingCurrent: boolean;
}

export interface SimulationWarning {
  type: 'short_circuit' | 'overload' | 'no_ground' | 'open_circuit' | 'component_failure';
  message: string;
  componentIds: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface SimulationResult {
  success: boolean;
  components: ComponentSimulationResult[];
  wires: WireSimulationResult[];
  warnings: SimulationWarning[];
  totalPower: number;
  hasShortCircuit: boolean;
  hasOpenCircuit: boolean;
  timestamp: number;
}

export interface SimulationOptions {
  maxIterations?: number;
  tolerance?: number;
  timeStep?: number;
}

export const DEFAULT_SIMULATION_OPTIONS: SimulationOptions = {
  maxIterations: 1000,
  tolerance: 0.001,
  timeStep: 0.001,
};

/**
 * Time series data point for oscilloscope
 */
export interface TimeSeriesDataPoint {
  time: number; // seconds
  voltage: number; // volts
  current: number; // amperes
}

/**
 * Trace data for a single component
 */
export interface ComponentTrace {
  componentId: string;
  data: TimeSeriesDataPoint[];
}

/**
 * Oscilloscope data containing all traces
 */
export interface OscilloscopeData {
  traces: ComponentTrace[];
  currentTime: number; // Current simulation time in seconds
  duration: number; // Total simulation duration in seconds
  timeStep: number; // Time step between samples
}
