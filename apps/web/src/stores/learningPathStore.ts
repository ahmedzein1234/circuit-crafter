/**
 * Learning Path Progress Store
 *
 * Tracks student progress through curriculum-aligned learning paths
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  LearningPathProgress,
  ModuleProgress,
  SkillProgress,
  GradeLevel,
} from '@circuit-crafter/shared';
import {
  LEARNING_PATHS,
  getLearningPathById,
  getCertificateForPath,
} from '@circuit-crafter/shared';

interface LearningPathState {
  // Current student info
  studentName: string;
  gradeLevel: GradeLevel;

  // Progress tracking
  pathProgress: Record<string, LearningPathProgress>;
  moduleProgress: Record<string, ModuleProgress>;
  skillProgress: Record<string, SkillProgress>;

  // Certificates earned
  earnedCertificates: string[];

  // Time tracking
  totalLearningMinutes: number;
  weeklyMinutes: number;
  lastActivityDate: string;

  // Stats
  totalPathsStarted: number;
  totalPathsCompleted: number;
  totalModulesCompleted: number;
  totalActivitiesCompleted: number;

  // Actions
  setStudentInfo: (name: string, grade: GradeLevel) => void;
  startPath: (pathId: string) => void;
  startModule: (pathId: string, moduleId: string) => void;
  completeActivity: (pathId: string, moduleId: string, activityId: string) => void;
  completeModule: (pathId: string, moduleId: string, score?: number) => void;
  completePath: (pathId: string) => void;
  updateSkillProgress: (skillId: string, masteryIncrease: number) => void;
  addLearningTime: (minutes: number) => void;
  resetProgress: () => void;

  // Getters
  getPathProgress: (pathId: string) => LearningPathProgress | undefined;
  getModuleProgress: (moduleId: string) => ModuleProgress | undefined;
  getCompletedPaths: () => string[];
  getPathCompletionPercent: (pathId: string) => number;
  getTotalXPFromPaths: () => number;
  getRecommendedPaths: () => string[];
}

const initialState = {
  studentName: '',
  gradeLevel: '3-5' as GradeLevel,
  pathProgress: {},
  moduleProgress: {},
  skillProgress: {},
  earnedCertificates: [],
  totalLearningMinutes: 0,
  weeklyMinutes: 0,
  lastActivityDate: '',
  totalPathsStarted: 0,
  totalPathsCompleted: 0,
  totalModulesCompleted: 0,
  totalActivitiesCompleted: 0,
};

export const useLearningPathStore = create<LearningPathState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStudentInfo: (name, grade) => {
        set({ studentName: name, gradeLevel: grade });
      },

      startPath: (pathId) => {
        const now = new Date().toISOString();
        const path = getLearningPathById(pathId);
        if (!path) return;

        const existingProgress = get().pathProgress[pathId];
        if (existingProgress) return; // Already started

        const firstModuleId = path.modules[0]?.id || '';

        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              pathId,
              startedAt: now,
              lastActivityAt: now,
              completedModules: [],
              currentModuleId: firstModuleId,
              totalTimeMinutes: 0,
              assessmentScores: {},
              certificateEarned: false,
            },
          },
          totalPathsStarted: state.totalPathsStarted + 1,
          lastActivityDate: now,
        }));
      },

      startModule: (pathId, moduleId) => {
        const now = new Date().toISOString();
        const existingProgress = get().moduleProgress[moduleId];
        if (existingProgress) return;

        set((state) => ({
          moduleProgress: {
            ...state.moduleProgress,
            [moduleId]: {
              moduleId,
              pathId,
              startedAt: now,
              activitiesCompleted: [],
              timeSpentMinutes: 0,
              attempts: 1,
            },
          },
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              currentModuleId: moduleId,
              lastActivityAt: now,
            },
          },
          lastActivityDate: now,
        }));
      },

      completeActivity: (pathId, moduleId, activityId) => {
        const now = new Date().toISOString();

        set((state) => {
          const moduleState = state.moduleProgress[moduleId];
          if (!moduleState) return state;

          const updatedActivities = moduleState.activitiesCompleted.includes(activityId)
            ? moduleState.activitiesCompleted
            : [...moduleState.activitiesCompleted, activityId];

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...moduleState,
                activitiesCompleted: updatedActivities,
              },
            },
            pathProgress: {
              ...state.pathProgress,
              [pathId]: {
                ...state.pathProgress[pathId],
                lastActivityAt: now,
              },
            },
            totalActivitiesCompleted: state.totalActivitiesCompleted + 1,
            lastActivityDate: now,
          };
        });
      },

      completeModule: (pathId, moduleId, score) => {
        const now = new Date().toISOString();
        const path = getLearningPathById(pathId);
        if (!path) return;

        set((state) => {
          const pathState = state.pathProgress[pathId];
          if (!pathState) return state;

          const updatedCompletedModules = pathState.completedModules.includes(moduleId)
            ? pathState.completedModules
            : [...pathState.completedModules, moduleId];

          // Find next module
          const currentIndex = path.modules.findIndex((m) => m.id === moduleId);
          const nextModule = path.modules[currentIndex + 1];

          const updatedAssessments = score !== undefined
            ? { ...pathState.assessmentScores, [moduleId]: score }
            : pathState.assessmentScores;

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...state.moduleProgress[moduleId],
                completedAt: now,
                assessmentScore: score,
              },
            },
            pathProgress: {
              ...state.pathProgress,
              [pathId]: {
                ...pathState,
                completedModules: updatedCompletedModules,
                currentModuleId: nextModule?.id || moduleId,
                assessmentScores: updatedAssessments,
                lastActivityAt: now,
              },
            },
            totalModulesCompleted: state.totalModulesCompleted + 1,
            lastActivityDate: now,
          };
        });
      },

      completePath: (pathId) => {
        const now = new Date().toISOString();
        const certificate = getCertificateForPath(pathId);

        set((state) => {
          const updatedCertificates = certificate && !state.earnedCertificates.includes(certificate.id)
            ? [...state.earnedCertificates, certificate.id]
            : state.earnedCertificates;

          return {
            pathProgress: {
              ...state.pathProgress,
              [pathId]: {
                ...state.pathProgress[pathId],
                certificateEarned: true,
                certificateEarnedAt: now,
              },
            },
            earnedCertificates: updatedCertificates,
            totalPathsCompleted: state.totalPathsCompleted + 1,
            lastActivityDate: now,
          };
        });

        // Dispatch event for gamification system
        window.dispatchEvent(
          new CustomEvent('xp-gained', {
            detail: { amount: 500, reason: 'Completed learning path!' },
          })
        );

        // Dispatch achievement event
        window.dispatchEvent(
          new CustomEvent('achievement-check', {
            detail: { type: 'path-completed', pathId },
          })
        );
      },

      updateSkillProgress: (skillId, masteryIncrease) => {
        const now = new Date().toISOString();

        set((state) => {
          const existing = state.skillProgress[skillId] || {
            skillId,
            masteryLevel: 0,
            practiceCount: 0,
            lastPracticed: now,
            assessmentsPassed: 0,
          };

          return {
            skillProgress: {
              ...state.skillProgress,
              [skillId]: {
                ...existing,
                masteryLevel: Math.min(100, existing.masteryLevel + masteryIncrease),
                practiceCount: existing.practiceCount + 1,
                lastPracticed: now,
              },
            },
          };
        });
      },

      addLearningTime: (minutes) => {
        set((state) => ({
          totalLearningMinutes: state.totalLearningMinutes + minutes,
          weeklyMinutes: state.weeklyMinutes + minutes,
        }));
      },

      resetProgress: () => {
        set(initialState);
      },

      // Getters
      getPathProgress: (pathId) => {
        return get().pathProgress[pathId];
      },

      getModuleProgress: (moduleId) => {
        return get().moduleProgress[moduleId];
      },

      getCompletedPaths: () => {
        const { pathProgress } = get();
        return Object.entries(pathProgress)
          .filter(([, progress]) => progress.certificateEarned)
          .map(([pathId]) => pathId);
      },

      getPathCompletionPercent: (pathId) => {
        const path = getLearningPathById(pathId);
        const progress = get().pathProgress[pathId];
        if (!path || !progress) return 0;

        const totalModules = path.modules.length;
        const completedModules = progress.completedModules.length;
        return Math.round((completedModules / totalModules) * 100);
      },

      getTotalXPFromPaths: () => {
        const { pathProgress } = get();
        let totalXP = 0;

        // Add XP from completed paths
        Object.keys(pathProgress).forEach((pathId) => {
          const progress = pathProgress[pathId];
          if (progress.certificateEarned) {
            totalXP += 500; // Bonus for completing path
          }
        });

        return totalXP;
      },

      getRecommendedPaths: () => {
        const { gradeLevel, pathProgress, earnedCertificates } = get();

        // Get paths for current grade level
        const gradePaths = LEARNING_PATHS.filter((p) => p.gradeLevel === gradeLevel);

        // Filter out completed paths and sort by prerequisites
        return gradePaths
          .filter((path) => {
            const progress = pathProgress[path.id];
            const isCompleted = progress?.certificateEarned;

            // Check prerequisites
            const hasPrereqs = path.prerequisites?.every((prereqId) => {
              const prereqPath = LEARNING_PATHS.find((p) => p.id === prereqId);
              return prereqPath && earnedCertificates.includes(prereqPath.certificateId || '');
            }) ?? true;

            return !isCompleted && hasPrereqs;
          })
          .map((p) => p.id);
      },
    }),
    {
      name: 'learning-path-progress',
    }
  )
);

// Selectors for optimized re-renders
export const selectStudentName = (state: LearningPathState) => state.studentName;
export const selectGradeLevel = (state: LearningPathState) => state.gradeLevel;
export const selectEarnedCertificates = (state: LearningPathState) => state.earnedCertificates;
export const selectTotalMinutes = (state: LearningPathState) => state.totalLearningMinutes;
export const selectStats = (state: LearningPathState) => ({
  pathsStarted: state.totalPathsStarted,
  pathsCompleted: state.totalPathsCompleted,
  modulesCompleted: state.totalModulesCompleted,
  activitiesCompleted: state.totalActivitiesCompleted,
});
