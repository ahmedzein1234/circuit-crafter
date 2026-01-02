// Progress & Gamification API calls

import { apiClient, type ApiResponse } from './client';

interface UserProgress {
  xp: number;
  level: number;
  totalCircuitsCreated: number;
  totalChallengesCompleted: number;
  totalWiresConnected: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  totalDaysActive: number;
  updatedAt?: string;
}

interface Achievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
  metadata?: Record<string, unknown>;
}

interface DailyRewardStatus {
  canClaim: boolean;
  dayNumber: number;
  currentStreak: number;
  lastActivityDate?: string;
  reward: {
    baseXp: number;
    bonusXp: number;
    totalXp: number;
  };
}

interface DailyRewardClaim {
  dayNumber: number;
  xpEarned: number;
  bonusEarned: number;
  totalXp: number;
  newStreak: number;
}

interface AddXpResponse {
  xp: number;
  level: number;
  xpGained: number;
  leveledUp: boolean;
}

export const progressApi = {
  /**
   * Get user's current progress
   */
  getProgress: async (): Promise<ApiResponse<UserProgress>> => {
    return apiClient.get<UserProgress>('/progress');
  },

  /**
   * Sync progress from client to server
   */
  updateProgress: async (data: {
    xp: number;
    level: number;
    totalCircuitsCreated?: number;
    totalChallengesCompleted?: number;
    totalWiresConnected?: number;
  }): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.put<{ message: string }>('/progress', data);
  },

  /**
   * Add XP to user (incremental)
   */
  addXp: async (amount: number, reason?: string): Promise<ApiResponse<AddXpResponse>> => {
    return apiClient.post<AddXpResponse>('/progress/add-xp', { amount, reason });
  },

  /**
   * Get user's achievements
   */
  getAchievements: async (): Promise<ApiResponse<Achievement[]>> => {
    return apiClient.get<Achievement[]>('/progress/achievements');
  },

  /**
   * Unlock an achievement
   */
  unlockAchievement: async (
    achievementId: string,
    progress?: number,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<{ achievementId: string; unlockedAt: string; alreadyUnlocked: boolean }>> => {
    return apiClient.post<{ achievementId: string; unlockedAt: string; alreadyUnlocked: boolean }>(
      `/progress/achievements/${achievementId}`,
      { achievementId, progress, metadata }
    );
  },

  /**
   * Get daily reward status
   */
  getDailyRewards: async (): Promise<ApiResponse<DailyRewardStatus>> => {
    return apiClient.get<DailyRewardStatus>('/progress/daily-rewards');
  },

  /**
   * Claim daily reward
   */
  claimDailyReward: async (): Promise<ApiResponse<DailyRewardClaim>> => {
    return apiClient.post<DailyRewardClaim>('/progress/daily-rewards/claim');
  },
};

export type { UserProgress, Achievement, DailyRewardStatus, DailyRewardClaim, AddXpResponse };
