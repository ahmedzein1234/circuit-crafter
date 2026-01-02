// Social Features API calls

import { apiClient, type ApiResponse } from './client';

// ==================== COMMENTS ====================

interface Comment {
  id: string;
  circuitId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentListResponse {
  items: Comment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== FOLLOWS ====================

interface FollowUser {
  id: string;
  username: string;
  avatarUrl?: string;
  followedAt: string;
}

interface FollowListResponse {
  items: FollowUser[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== ACTIVITY FEED ====================

interface ActivityItem {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  activityType: 'circuit_created' | 'challenge_completed' | 'achievement_unlocked' | 'level_up' | 'circuit_liked' | 'circuit_forked';
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface ActivityFeedResponse {
  items: ActivityItem[];
  hasMore: boolean;
  nextCursor?: string;
}

// ==================== NOTIFICATIONS ====================

interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'fork' | 'achievement' | 'system';
  fromUserId?: string;
  fromUsername?: string;
  message: string;
  targetId?: string;
  targetType?: string;
  read: boolean;
  createdAt: string;
}

export const socialApi = {
  // ==================== COMMENTS ====================

  /**
   * Get comments for a circuit
   */
  getComments: async (
    circuitId: string,
    options?: { page?: number; limit?: number }
  ): Promise<ApiResponse<CommentListResponse>> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const query = params.toString();
    return apiClient.get<CommentListResponse>(
      `/social/circuits/${circuitId}/comments${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Add a comment to a circuit
   */
  addComment: async (
    circuitId: string,
    content: string
  ): Promise<ApiResponse<Comment>> => {
    return apiClient.post<Comment>(`/social/circuits/${circuitId}/comments`, { content });
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/social/comments/${commentId}`);
  },

  /**
   * Report a comment
   */
  reportComment: async (
    commentId: string,
    reason: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/social/comments/${commentId}/report`, { reason });
  },

  // ==================== FOLLOWS ====================

  /**
   * Follow a user
   */
  followUser: async (username: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/social/users/${username}/follow`);
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (username: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/social/users/${username}/follow`);
  },

  /**
   * Get user's followers
   */
  getFollowers: async (
    username: string,
    options?: { page?: number; limit?: number }
  ): Promise<ApiResponse<FollowListResponse>> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const query = params.toString();
    return apiClient.get<FollowListResponse>(
      `/social/users/${username}/followers${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Get users that a user is following
   */
  getFollowing: async (
    username: string,
    options?: { page?: number; limit?: number }
  ): Promise<ApiResponse<FollowListResponse>> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const query = params.toString();
    return apiClient.get<FollowListResponse>(
      `/social/users/${username}/following${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Check if current user follows another user
   */
  checkFollowing: async (username: string): Promise<ApiResponse<{ following: boolean }>> => {
    return apiClient.get<{ following: boolean }>(`/social/users/${username}/following/check`);
  },

  // ==================== ACTIVITY FEED ====================

  /**
   * Get activity feed for current user (from followed users)
   */
  getFeed: async (cursor?: string): Promise<ApiResponse<ActivityFeedResponse>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiClient.get<ActivityFeedResponse>(`/social/feed${params}`);
  },

  /**
   * Get public activity feed
   */
  getPublicFeed: async (cursor?: string): Promise<ApiResponse<ActivityFeedResponse>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiClient.get<ActivityFeedResponse>(`/social/feed/public${params}`, { skipAuth: true });
  },

  /**
   * Get activity for a specific user
   */
  getUserActivity: async (
    username: string,
    cursor?: string
  ): Promise<ApiResponse<ActivityFeedResponse>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiClient.get<ActivityFeedResponse>(
      `/social/users/${username}/activity${params}`,
      { skipAuth: true }
    );
  },

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notifications for current user
   */
  getNotifications: async (options?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<ApiResponse<{ items: Notification[]; unreadCount: number }>> => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    if (options?.limit) params.set('limit', String(options.limit));
    const query = params.toString();
    return apiClient.get<{ items: Notification[]; unreadCount: number }>(
      `/social/notifications${query ? `?${query}` : ''}`
    );
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.put<{ message: string }>(`/social/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.put<{ message: string }>('/social/notifications/read-all');
  },
};

export type {
  Comment,
  CommentListResponse,
  FollowUser,
  FollowListResponse,
  ActivityItem,
  ActivityFeedResponse,
  Notification,
};
