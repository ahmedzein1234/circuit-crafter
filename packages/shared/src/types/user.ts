/**
 * User and progress types for Circuit Crafter
 */

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  walletAddress?: string;
  reputationScore: number;
  subscriptionTier: 'free' | 'pro' | 'premium';
  createdAt: string;
  lastLogin?: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  gridSnap: boolean;
  showHints: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'auto',
  soundEnabled: true,
  animationsEnabled: true,
  gridSnap: true,
  showHints: true,
};

export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Challenge {
  id: string;
  creatorId: string;
  circuitId?: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  constraints?: ChallengeConstraints;
  target: ChallengeTarget;
  hints?: string[];
  timeLimitSeconds?: number;
  plays: number;
  solves: number;
  avgSolveTimeSeconds?: number;
  featured: boolean;
  createdAt: string;
}

export interface ChallengeConstraints {
  maxComponents?: number;
  allowedComponentTypes?: string[];
  forbiddenComponentTypes?: string[];
  maxWires?: number;
  budgetLimit?: number;
}

export interface ChallengeTarget {
  type: 'power_led' | 'logic_output' | 'voltage_match' | 'custom';
  targetComponents?: string[];
  expectedOutputs?: Record<string, boolean | number>;
  tolerancePercent?: number;
}

export type ProgressRating = 'bronze' | 'silver' | 'gold';

export interface Progress {
  userId: string;
  challengeId: string;
  completed: boolean;
  bestTimeSeconds?: number;
  attempts: number;
  solutionCircuitId?: string;
  rating?: ProgressRating;
  completedAt?: string;
}

export type AchievementType =
  | 'first_circuit'
  | 'first_challenge'
  | 'ten_challenges'
  | 'hundred_challenges'
  | 'parallel_master'
  | 'logic_master'
  | 'efficiency_expert'
  | 'speed_demon'
  | 'creator'
  | 'popular_creator'
  | 'streak_7'
  | 'streak_30';

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  metadata?: Record<string, unknown>;
  nftTokenId?: string;
  earnedAt: string;
}
