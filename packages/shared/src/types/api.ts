/**
 * API types for Circuit Crafter
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CreateCircuitRequest {
  name: string;
  description?: string;
  blueprint: CircuitBlueprint;
  isPublic?: boolean;
  isTemplate?: boolean;
}

export interface CircuitBlueprint {
  components: unknown[];
  wires: unknown[];
  metadata?: Record<string, unknown>;
}

export interface UpdateCircuitRequest {
  name?: string;
  description?: string;
  blueprint?: CircuitBlueprint;
  isPublic?: boolean;
  isTemplate?: boolean;
}

export interface CreateChallengeRequest {
  circuitId?: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  constraints?: Record<string, unknown>;
  target: Record<string, unknown>;
  hints?: string[];
  timeLimitSeconds?: number;
}

export interface SubmitSolutionRequest {
  challengeId: string;
  circuitBlueprint: CircuitBlueprint;
  solveTimeSeconds: number;
}

export interface SubmitSolutionResponse {
  success: boolean;
  passed: boolean;
  rating?: 'bronze' | 'silver' | 'gold';
  feedback?: string[];
  newBestTime?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  timeSeconds?: number;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
  };
  token: string;
  expiresAt: string;
}
