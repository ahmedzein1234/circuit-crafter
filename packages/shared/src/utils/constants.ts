/**
 * Constants for Circuit Crafter
 */

// Grid and canvas
export const GRID_SIZE = 20;
export const CANVAS_DEFAULT_WIDTH = 800;
export const CANVAS_DEFAULT_HEIGHT = 600;

// Component defaults
export const COMPONENT_DEFAULTS = {
  battery: {
    voltage: 9,
    width: 60,
    height: 40,
  },
  resistor: {
    resistance: 1000,
    width: 60,
    height: 20,
  },
  led: {
    forwardVoltage: 2,
    maxCurrent: 0.02,
    width: 30,
    height: 40,
  },
  switch: {
    isOpen: true,
    width: 40,
    height: 30,
  },
  wire: {
    width: 0,
    height: 0,
  },
  and_gate: {
    width: 60,
    height: 50,
  },
  or_gate: {
    width: 60,
    height: 50,
  },
  not_gate: {
    width: 50,
    height: 40,
  },
  ground: {
    width: 30,
    height: 30,
  },
  capacitor: {
    capacitance: 0.000001, // 1μF
    width: 40,
    height: 30,
  },
  diode: {
    forwardVoltage: 0.7,
    reverseVoltage: 50,
    width: 50,
    height: 25,
  },
  transistor: {
    gain: 100, // hFE
    width: 50,
    height: 50,
  },
  buzzer: {
    frequency: 2000, // Hz
    forwardVoltage: 3,
    width: 40,
    height: 40,
  },
  motor: {
    ratedVoltage: 6,
    ratedCurrent: 0.5,
    width: 50,
    height: 50,
  },
  potentiometer: {
    maxResistance: 10000,
    position: 50, // 50%
    width: 50,
    height: 40,
  },
  fuse: {
    rating: 1, // 1A
    isBlown: false,
    width: 40,
    height: 20,
  },
} as const;

// Simulation constants
export const SIMULATION = {
  MAX_CURRENT: 10,
  MIN_RESISTANCE: 0.001,
  LOGIC_HIGH_VOLTAGE: 5,
  LOGIC_LOW_VOLTAGE: 0,
  LOGIC_THRESHOLD_VOLTAGE: 2.5,
  OVERLOAD_FACTOR: 1.5,
} as const;

// Colors
export const COLORS = {
  wire: {
    default: '#374151',
    carrying: '#3b82f6',
    overloaded: '#ef4444',
  },
  led: {
    off: '#6b7280',
    red: '#ef4444',
    green: '#22c55e',
    blue: '#3b82f6',
    yellow: '#eab308',
  },
  component: {
    default: '#f3f4f6',
    selected: '#dbeafe',
    overloaded: '#fee2e2',
  },
  terminal: {
    positive: '#ef4444',
    negative: '#1f2937',
    input: '#3b82f6',
    output: '#22c55e',
  },
} as const;

// Challenge ratings
export const RATING_THRESHOLDS = {
  gold: 0.5,
  silver: 0.75,
  bronze: 1.0,
} as const;

// Achievement requirements
export const ACHIEVEMENT_REQUIREMENTS = {
  first_circuit: { circuits: 1 },
  first_challenge: { challengesSolved: 1 },
  ten_challenges: { challengesSolved: 10 },
  hundred_challenges: { challengesSolved: 100 },
  parallel_master: { parallelCircuits: 5 },
  logic_master: { logicChallenges: 10 },
  efficiency_expert: { goldRatings: 10 },
  speed_demon: { speedrunBest: true },
  creator: { circuitsCreated: 1 },
  popular_creator: { totalLikes: 100 },
  streak_7: { streakDays: 7 },
  streak_30: { streakDays: 30 },
} as const;
