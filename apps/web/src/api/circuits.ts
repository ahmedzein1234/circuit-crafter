// Circuits API calls

import { apiClient, type ApiResponse } from './client';
import type { CircuitComponent, Wire } from '@circuit-crafter/shared';

interface CircuitBlueprint {
  components: CircuitComponent[];
  wires: Wire[];
  metadata?: Record<string, unknown>;
}

interface Circuit {
  id: string;
  name: string;
  description?: string;
  blueprint: CircuitBlueprint;
  is_public: boolean;
  is_template: boolean;
  thumbnail_url?: string;
  plays: number;
  likes: number;
  forks: number;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_avatar?: string;
  isOwner?: boolean;
  fork_of?: string;
}

interface CircuitListResponse {
  items: Circuit[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CreateCircuitRequest {
  name: string;
  description?: string;
  blueprint: CircuitBlueprint;
  isPublic?: boolean;
  isTemplate?: boolean;
}

interface UpdateCircuitRequest {
  name?: string;
  description?: string;
  blueprint?: CircuitBlueprint;
  isPublic?: boolean;
  isTemplate?: boolean;
}

export const circuitsApi = {
  /**
   * List public circuits
   */
  list: async (options?: {
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'updated_at' | 'likes' | 'plays';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CircuitListResponse>> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.sortBy) params.set('sortBy', options.sortBy);
    if (options?.sortOrder) params.set('sortOrder', options.sortOrder);

    const query = params.toString();
    return apiClient.get<CircuitListResponse>(
      `/circuits${query ? `?${query}` : ''}`,
      { skipAuth: true }
    );
  },

  /**
   * Get user's own circuits
   */
  getMyCircuits: async (): Promise<ApiResponse<Circuit[]>> => {
    return apiClient.get<Circuit[]>('/circuits/my');
  },

  /**
   * Get a single circuit by ID
   */
  get: async (id: string): Promise<ApiResponse<Circuit>> => {
    return apiClient.get<Circuit>(`/circuits/${id}`);
  },

  /**
   * Create a new circuit
   */
  create: async (data: CreateCircuitRequest): Promise<ApiResponse<{ id: string; name: string; createdAt: string }>> => {
    return apiClient.post<{ id: string; name: string; createdAt: string }>('/circuits', data);
  },

  /**
   * Update an existing circuit
   */
  update: async (
    id: string,
    data: UpdateCircuitRequest
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.put<{ message: string }>(`/circuits/${id}`, data);
  },

  /**
   * Delete a circuit
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/circuits/${id}`);
  },

  /**
   * Fork a circuit
   */
  fork: async (id: string): Promise<ApiResponse<{ id: string; forkedFrom: string }>> => {
    return apiClient.post<{ id: string; forkedFrom: string }>(`/circuits/${id}/fork`);
  },

  /**
   * Like a circuit
   */
  like: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/circuits/${id}/like`);
  },

  /**
   * Unlike a circuit
   */
  unlike: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/circuits/${id}/like`);
  },
};

export type { Circuit, CircuitBlueprint, CircuitListResponse, CreateCircuitRequest, UpdateCircuitRequest };
