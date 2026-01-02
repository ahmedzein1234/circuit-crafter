// Learning & Tutorial API calls

import { apiClient, type ApiResponse } from './client';

interface TutorialProgress {
  chapterId: string;
  levelId: string;
  completed: boolean;
  rating?: 'easy' | 'medium' | 'hard';
  completedAt?: string;
}

interface LearningPathEnrollment {
  pathId: string;
  enrolledAt: string;
  completedAt?: string;
  certificateId?: string;
  completedModules: string[];
  totalModules: number;
  progressPercent: number;
}

interface ModuleCompletion {
  pathId: string;
  moduleId: string;
  completedAt: string;
}

interface Certificate {
  id: string;
  pathId: string;
  pathName: string;
  issuedAt: string;
  verificationCode: string;
  nftTokenId?: string;
  metadata?: Record<string, unknown>;
}

export const learningApi = {
  // ==================== TUTORIALS ====================

  /**
   * Get user's tutorial progress
   */
  getTutorialProgress: async (): Promise<ApiResponse<TutorialProgress[]>> => {
    return apiClient.get<TutorialProgress[]>('/learning/tutorials/progress');
  },

  /**
   * Mark a tutorial level as complete
   */
  completeTutorialLevel: async (
    chapterId: string,
    levelId: string,
    rating?: 'easy' | 'medium' | 'hard'
  ): Promise<ApiResponse<{ message: string; xpEarned: number }>> => {
    return apiClient.post<{ message: string; xpEarned: number }>(
      `/learning/tutorials/${chapterId}/${levelId}`,
      { rating }
    );
  },

  // ==================== LEARNING PATHS ====================

  /**
   * Get all learning path enrollments for user
   */
  getEnrollments: async (): Promise<ApiResponse<LearningPathEnrollment[]>> => {
    return apiClient.get<LearningPathEnrollment[]>('/learning/paths');
  },

  /**
   * Get progress for a specific learning path
   */
  getPathProgress: async (pathId: string): Promise<ApiResponse<LearningPathEnrollment>> => {
    return apiClient.get<LearningPathEnrollment>(`/learning/paths/${pathId}/progress`);
  },

  /**
   * Enroll in a learning path
   */
  enrollInPath: async (pathId: string): Promise<ApiResponse<{ enrolledAt: string }>> => {
    return apiClient.post<{ enrolledAt: string }>(`/learning/paths/${pathId}/enroll`);
  },

  /**
   * Complete a module in a learning path
   */
  completeModule: async (
    pathId: string,
    moduleId: string
  ): Promise<ApiResponse<ModuleCompletion & { xpEarned: number; pathCompleted: boolean }>> => {
    return apiClient.post<ModuleCompletion & { xpEarned: number; pathCompleted: boolean }>(
      `/learning/paths/${pathId}/complete-module`,
      { moduleId }
    );
  },

  // ==================== CERTIFICATES ====================

  /**
   * Get all earned certificates
   */
  getCertificates: async (): Promise<ApiResponse<Certificate[]>> => {
    return apiClient.get<Certificate[]>('/learning/certificates');
  },

  /**
   * Generate certificate for completed learning path
   */
  generateCertificate: async (
    pathId: string
  ): Promise<ApiResponse<Certificate>> => {
    return apiClient.post<Certificate>(`/learning/certificates/${pathId}`);
  },

  /**
   * Verify a certificate by code
   */
  verifyCertificate: async (
    code: string
  ): Promise<ApiResponse<{ valid: boolean; certificate?: Certificate }>> => {
    return apiClient.get<{ valid: boolean; certificate?: Certificate }>(
      `/learning/certificates/verify/${code}`,
      { skipAuth: true }
    );
  },
};

export type { TutorialProgress, LearningPathEnrollment, ModuleCompletion, Certificate };
