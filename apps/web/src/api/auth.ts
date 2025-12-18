// Authentication API calls

import { apiClient, type ApiResponse } from './client';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

interface UserProfile extends User {
  avatar_url?: string;
  reputation_score: number;
  subscription_tier: string;
  created_at: string;
  settings: Record<string, unknown>;
  stats: {
    circuits_count: number;
    challenges_completed: number;
    achievements_count: number;
  };
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (
    email: string,
    username: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>(
      '/auth/register',
      { email, username, password },
      { skipAuth: true }
    );
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    );
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>('/auth/logout');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get<UserProfile>('/users/me');
  },

  /**
   * Get public user profile by username
   */
  getUser: async (username: string): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get<UserProfile>(`/users/${username}`, { skipAuth: true });
  },
};

export type { User, AuthResponse, UserProfile };
