// API exports

export { apiClient } from './client';
export type { ApiResponse } from './client';

export { authApi } from './auth';
export type { User, AuthResponse, UserProfile } from './auth';

export { circuitsApi } from './circuits';
export type {
  Circuit,
  CircuitBlueprint,
  CircuitListResponse,
  CreateCircuitRequest,
  UpdateCircuitRequest,
} from './circuits';

export { progressApi } from './progress';
export type {
  UserProgress,
  Achievement,
  DailyRewardStatus,
  DailyRewardClaim,
  AddXpResponse,
} from './progress';

export { learningApi } from './learning';
export type {
  TutorialProgress,
  LearningPathEnrollment,
  ModuleCompletion,
  Certificate,
} from './learning';

export { socialApi } from './social';
export type {
  Comment,
  CommentListResponse,
  FollowUser,
  FollowListResponse,
  ActivityItem,
  ActivityFeedResponse,
  Notification,
} from './social';

export { leaderboardApi } from './leaderboard';
export type { LeaderboardEntry, LeaderboardResponse } from './leaderboard';

export { roomsApi, connectToRoom, sendMessage } from './rooms';
export type {
  RoomInfo,
  RoomParticipant,
  RoomState,
  ChallengeRoomInfo,
  ChallengeRoomStatus,
  WebSocketMessage,
} from './rooms';
