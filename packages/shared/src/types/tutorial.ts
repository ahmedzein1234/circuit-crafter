/**
 * Tutorial Campaign types for Circuit Crafter
 */

import type { CircuitComponent, Wire, ComponentType } from './components';
import type { ChallengeTarget, ChallengeConstraints, ProgressRating } from './user';

// ==================== Chapter & Level Definitions ====================

export type TutorialChapterId =
  | 'basics'
  | 'ohms_law'
  | 'led_circuits'
  | 'series_parallel'
  | 'logic_gates'
  | 'advanced';

export interface TutorialChapter {
  id: TutorialChapterId;
  title: string;
  description: string;
  icon: string;
  color: string;
  prerequisiteChapterId?: TutorialChapterId;
  levels: TutorialLevel[];
  educationalConcepts: string[];
}

export interface TutorialLevel {
  id: string;
  chapterId: TutorialChapterId;
  order: number;
  title: string;
  description: string;

  // Educational content
  educationalConcept: EducationalConcept;

  // Starting state
  starterCircuit?: StarterCircuit;

  // Objectives
  objectives: TutorialObjective[];

  // Hints system
  hints: TutorialHint[];

  // Success criteria
  target: ChallengeTarget;
  constraints?: ChallengeConstraints;

  // Rewards
  xpReward: number;
  bonusXp?: number;
  timeBonusThresholdSeconds?: number;

  // Progression
  prerequisiteLevelId?: string;
  unlocksLevelIds?: string[];
}

// ==================== Educational Content ====================

export interface EducationalConcept {
  title: string;
  explanation: string;
  formula?: string;
  formulaDescription?: string;
  keyTerms: KeyTerm[];
  relatedComponents: ComponentType[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

// ==================== Starter Circuits ====================

export interface StarterCircuit {
  components: CircuitComponent[];
  wires: Wire[];
  lockedComponentIds?: string[];
  lockedWireIds?: string[];
  highlightedTerminalIds?: string[];
}

// ==================== Objectives ====================

export interface TutorialObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  config: ObjectiveConfig;
  required: boolean;
  order: number;
}

export type ObjectiveType =
  | 'add_component'
  | 'connect_terminals'
  | 'achieve_voltage'
  | 'achieve_current'
  | 'power_led'
  | 'power_multiple_leds'
  | 'logic_output'
  | 'component_count'
  | 'wire_count'
  | 'simulation_success'
  | 'no_warnings'
  | 'custom';

export interface AddComponentConfig {
  type: 'add_component';
  componentType: ComponentType;
  count?: number;
}

export interface ConnectTerminalsConfig {
  type: 'connect_terminals';
  fromComponentType?: ComponentType;
  toComponentType?: ComponentType;
  minConnections?: number;
}

export interface AchieveVoltageConfig {
  type: 'achieve_voltage';
  componentId?: string;
  componentType?: ComponentType;
  targetVoltage: number;
  tolerance?: number;
}

export interface AchieveCurrentConfig {
  type: 'achieve_current';
  componentId?: string;
  componentType?: ComponentType;
  targetCurrent: number;
  tolerance?: number;
}

export interface PowerLedConfig {
  type: 'power_led';
  ledId?: string;
  minBrightness?: number;
}

export interface PowerMultipleLedsConfig {
  type: 'power_multiple_leds';
  count: number;
  minBrightness?: number;
}

export interface LogicOutputConfig {
  type: 'logic_output';
  gateId?: string;
  gateType?: ComponentType;
  expectedOutput: boolean;
  inputs?: Record<string, boolean>;
}

export interface ComponentCountConfig {
  type: 'component_count';
  componentType?: ComponentType;
  min?: number;
  max?: number;
}

export interface WireCountConfig {
  type: 'wire_count';
  min?: number;
  max?: number;
}

export interface SimulationSuccessConfig {
  type: 'simulation_success';
}

export interface NoWarningsConfig {
  type: 'no_warnings';
}

export interface CustomConfig {
  type: 'custom';
  validatorId: string;
}

export type ObjectiveConfig =
  | AddComponentConfig
  | ConnectTerminalsConfig
  | AchieveVoltageConfig
  | AchieveCurrentConfig
  | PowerLedConfig
  | PowerMultipleLedsConfig
  | LogicOutputConfig
  | ComponentCountConfig
  | WireCountConfig
  | SimulationSuccessConfig
  | NoWarningsConfig
  | CustomConfig;

// ==================== Hints System ====================

export interface TutorialHint {
  id: string;
  order: number;
  content: string;
  triggerCondition: HintTrigger;
  targetElement?: string;
  highlightComponentIds?: string[];
  highlightTerminalIds?: string[];
}

export interface TimeElapsedTrigger {
  type: 'time_elapsed';
  seconds: number;
}

export interface AttemptsTrigger {
  type: 'attempts';
  count: number;
}

export interface UserRequestTrigger {
  type: 'user_request';
}

export interface ObjectiveStuckTrigger {
  type: 'objective_stuck';
  objectiveId: string;
  stuckSeconds: number;
}

export interface SimulationFailedTrigger {
  type: 'simulation_failed';
  failCount: number;
}

export type HintTrigger =
  | TimeElapsedTrigger
  | AttemptsTrigger
  | UserRequestTrigger
  | ObjectiveStuckTrigger
  | SimulationFailedTrigger;

// ==================== Progress Tracking ====================

export interface TutorialProgress {
  levelId: string;
  completed: boolean;
  rating?: ProgressRating;
  bestTimeSeconds?: number;
  attempts: number;
  hintsUsed: number;
  completedAt?: string;
  xpEarned: number;
}

export interface ChapterProgress {
  chapterId: TutorialChapterId;
  levelsCompleted: number;
  totalLevels: number;
  totalXpEarned: number;
  unlocked: boolean;
  completedAt?: string;
}

// ==================== Level Completion ====================

export interface LevelCompletionResult {
  levelId: string;
  passed: boolean;
  rating: ProgressRating;
  timeSeconds: number;
  xpEarned: number;
  bonusXpEarned: number;
  hintsUsed: number;
  isNewBestTime: boolean;
  unlockedLevelIds: string[];
  unlockedChapterId?: TutorialChapterId;
}

// ==================== Objective Validation Result ====================

export interface ObjectiveValidationResult {
  objectiveId: string;
  completed: boolean;
  progress?: number;
  message?: string;
}
