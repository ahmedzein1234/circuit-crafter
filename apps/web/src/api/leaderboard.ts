// Leaderboard API calls

import { apiClient, type ApiResponse } from './client';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  challengesCompleted?: number;
  circuitsCreated?: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  userRank?: number;
  userEntry?: LeaderboardEntry;
  lastUpdated: string;
}

export const leaderboardApi = {
  /**
   * Get global XP leaderboard
   */
  getGlobal: async (options?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<LeaderboardResponse>> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    const query = params.toString();
    return apiClient.get<LeaderboardResponse>(
      `/leaderboard${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Get weekly leaderboard
   */
  getWeekly: async (options?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<LeaderboardResponse>> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    const query = params.toString();
    return apiClient.get<LeaderboardResponse>(
      `/leaderboard/weekly${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Get challenge completions leaderboard
   */
  getChallenges: async (options?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<LeaderboardResponse>> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    const query = params.toString();
    return apiClient.get<LeaderboardResponse>(
      `/leaderboard/challenges${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Get current user's rank
   */
  getMyRank: async (): Promise<ApiResponse<{
    globalRank: number;
    weeklyRank: number;
    challengeRank: number;
  }>> => {
    return apiClient.get<{
      globalRank: number;
      weeklyRank: number;
      challengeRank: number;
    }>('/leaderboard/me');
  },
};

export type { LeaderboardEntry, LeaderboardResponse };
