import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TutorialChapterId,
  TutorialProgress,
  ChapterProgress,
  TutorialLevel,
  TutorialChapter,
  TutorialHint,
  StarterCircuit,
  LevelCompletionResult,
  ObjectiveValidationResult,
} from '@circuit-crafter/shared';
import {
  TUTORIAL_CHAPTERS,
  getChapterById,
  getLevelById,
} from '@circuit-crafter/shared';
import type { ProgressRating } from '@circuit-crafter/shared';
import { useGamificationStore } from './gamificationStore';

// ==================== State Interface ====================

interface TutorialState {
  // Current session state
  activeLevelId: string | null;
  isInTutorialMode: boolean;
  sessionStartTime: number | null;
  currentAttempt: number;

  // Objectives tracking (during active level)
  objectiveProgress: Record<string, boolean>;

  // Hints state
  revealedHintIds: string[];
  hintRequestCount: number;

  // Persistent progress
  levelProgress: Record<string, TutorialProgress>;
  chapterProgress: Record<TutorialChapterId, ChapterProgress>;

  // UI state
  showConceptModal: boolean;
  showLevelSelector: boolean;
  showCompletionModal: boolean;
  lastCompletionResult: LevelCompletionResult | null;

  // Computed getters
  getChapter: (chapterId: TutorialChapterId) => TutorialChapter | undefined;
  getLevel: (levelId: string) => TutorialLevel | undefined;
  getActiveLevel: () => TutorialLevel | undefined;
  isLevelUnlocked: (levelId: string) => boolean;
  isChapterUnlocked: (chapterId: TutorialChapterId) => boolean;
  getNextLevel: () => TutorialLevel | undefined;
  getChapterCompletionPercent: (chapterId: TutorialChapterId) => number;
  getTotalProgress: () => { completed: number; total: number; percent: number };
  getAvailableHints: () => TutorialHint[];
  getNextHint: () => TutorialHint | null;

  // Actions
  startLevel: (levelId: string) => StarterCircuit | null;
  completeObjective: (objectiveId: string) => void;
  setObjectiveProgress: (progress: Record<string, boolean>) => void;
  requestHint: () => TutorialHint | null;
  revealHint: (hintId: string) => void;
  completeLevel: (rating: ProgressRating, timeSeconds: number) => LevelCompletionResult;
  exitTutorialMode: () => void;
  resetLevel: () => StarterCircuit | null;

  // UI Actions
  openLevelSelector: () => void;
  closeLevelSelector: () => void;
  openConceptModal: () => void;
  closeConceptModal: () => void;
  dismissCompletionModal: () => void;

  // Progress management
  resetChapterProgress: (chapterId: TutorialChapterId) => void;
  resetAllProgress: () => void;
}

// ==================== Helper Functions ====================

function initializeChapterProgress(): Record<TutorialChapterId, ChapterProgress> {
  const progress: Record<string, ChapterProgress> = {};
  TUTORIAL_CHAPTERS.forEach((chapter, index) => {
    progress[chapter.id] = {
      chapterId: chapter.id,
      levelsCompleted: 0,
      totalLevels: chapter.levels.length,
      totalXpEarned: 0,
      unlocked: index === 0, // First chapter always unlocked
    };
  });
  return progress as Record<TutorialChapterId, ChapterProgress>;
}

function betterRating(a: ProgressRating, b?: ProgressRating): ProgressRating {
  const order: ProgressRating[] = ['bronze', 'silver', 'gold'];
  if (!b) return a;
  return order.indexOf(a) > order.indexOf(b) ? a : b;
}

// ==================== Store Implementation ====================

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeLevelId: null,
      isInTutorialMode: false,
      sessionStartTime: null,
      currentAttempt: 0,
      objectiveProgress: {},
      revealedHintIds: [],
      hintRequestCount: 0,
      levelProgress: {},
      chapterProgress: initializeChapterProgress(),
      showConceptModal: false,
      showLevelSelector: false,
      showCompletionModal: false,
      lastCompletionResult: null,

      // Getters
      getChapter: (chapterId) => getChapterById(chapterId),

      getLevel: (levelId) => getLevelById(levelId),

      getActiveLevel: () => {
        const { activeLevelId } = get();
        return activeLevelId ? getLevelById(activeLevelId) : undefined;
      },

      isLevelUnlocked: (levelId) => {
        const { levelProgress, chapterProgress } = get();
        const level = getLevelById(levelId);
        if (!level) return false;

        // First level of first chapter is always unlocked
        if (level.chapterId === 'basics' && level.order === 1) return true;

        // Check if chapter is unlocked
        const chapter = chapterProgress[level.chapterId];
        if (!chapter?.unlocked) return false;

        // Check prerequisite level
        if (level.prerequisiteLevelId) {
          const prereqProgress = levelProgress[level.prerequisiteLevelId];
          if (!prereqProgress?.completed) return false;
        }

        // If no prerequisite, check if previous level in chapter is complete
        const chapterData = getChapterById(level.chapterId);
        if (chapterData && level.order > 1) {
          const previousLevel = chapterData.levels.find((l) => l.order === level.order - 1);
          if (previousLevel) {
            const prevProgress = levelProgress[previousLevel.id];
            if (!prevProgress?.completed) return false;
          }
        }

        return true;
      },

      isChapterUnlocked: (chapterId) => {
        const { chapterProgress } = get();
        return chapterProgress[chapterId]?.unlocked ?? chapterId === 'basics';
      },

      getNextLevel: () => {
        const { levelProgress, isLevelUnlocked } = get();
        for (const chapter of TUTORIAL_CHAPTERS) {
          for (const level of chapter.levels) {
            if (!levelProgress[level.id]?.completed && isLevelUnlocked(level.id)) {
              return level;
            }
          }
        }
        return undefined;
      },

      getChapterCompletionPercent: (chapterId) => {
        const chapter = getChapterById(chapterId);
        if (!chapter || chapter.levels.length === 0) return 0;
        const progress = get().chapterProgress[chapterId];
        return ((progress?.levelsCompleted ?? 0) / chapter.levels.length) * 100;
      },

      getTotalProgress: () => {
        const totalLevels = TUTORIAL_CHAPTERS.reduce((sum, c) => sum + c.levels.length, 0);
        const completed = Object.values(get().levelProgress).filter((p) => p.completed).length;
        return {
          completed,
          total: totalLevels,
          percent: totalLevels > 0 ? (completed / totalLevels) * 100 : 0,
        };
      },

      getAvailableHints: () => {
        const level = get().getActiveLevel();
        if (!level) return [];
        const { revealedHintIds } = get();
        return level.hints.filter(
          (h) => revealedHintIds.includes(h.id) || h.triggerCondition.type === 'user_request'
        );
      },

      getNextHint: () => {
        const level = get().getActiveLevel();
        if (!level) return null;
        const { revealedHintIds } = get();
        return (
          level.hints.find(
            (h) =>
              !revealedHintIds.includes(h.id) && h.triggerCondition.type === 'user_request'
          ) ?? null
        );
      },

      // Actions
      startLevel: (levelId) => {
        const level = getLevelById(levelId);
        if (!level || !get().isLevelUnlocked(levelId)) return null;

        const existingProgress = get().levelProgress[levelId];

        set({
          activeLevelId: levelId,
          isInTutorialMode: true,
          sessionStartTime: Date.now(),
          currentAttempt: (existingProgress?.attempts ?? 0) + 1,
          objectiveProgress: {},
          revealedHintIds: [],
          hintRequestCount: 0,
          showConceptModal: true, // Show concept before starting
          showLevelSelector: false,
        });

        return level.starterCircuit ?? null;
      },

      completeObjective: (objectiveId) => {
        set((state) => ({
          objectiveProgress: {
            ...state.objectiveProgress,
            [objectiveId]: true,
          },
        }));
      },

      setObjectiveProgress: (progress) => {
        set({ objectiveProgress: progress });
      },

      requestHint: () => {
        const level = get().getActiveLevel();
        if (!level) return null;

        const { revealedHintIds, hintRequestCount } = get();
        const nextHint = level.hints.find(
          (h) =>
            !revealedHintIds.includes(h.id) && h.triggerCondition.type === 'user_request'
        );

        if (nextHint) {
          set({
            revealedHintIds: [...revealedHintIds, nextHint.id],
            hintRequestCount: hintRequestCount + 1,
          });
          return nextHint;
        }
        return null;
      },

      revealHint: (hintId) => {
        set((state) => ({
          revealedHintIds: state.revealedHintIds.includes(hintId)
            ? state.revealedHintIds
            : [...state.revealedHintIds, hintId],
        }));
      },

      completeLevel: (rating, timeSeconds) => {
        const { activeLevelId, hintRequestCount, levelProgress, currentAttempt, chapterProgress } =
          get();
        if (!activeLevelId) throw new Error('No active level');

        const level = getLevelById(activeLevelId);
        if (!level) throw new Error('Level not found');

        const existingProgress = levelProgress[activeLevelId];

        // Calculate XP
        let xpEarned = level.xpReward;
        let bonusXpEarned = 0;

        // Time bonus
        if (
          level.timeBonusThresholdSeconds &&
          timeSeconds <= level.timeBonusThresholdSeconds
        ) {
          bonusXpEarned = level.bonusXp ?? Math.floor(level.xpReward * 0.5);
        }

        // Reduce XP if hints were used (10% per hint, min 50%)
        if (hintRequestCount > 0) {
          xpEarned = Math.floor(xpEarned * Math.max(0.5, 1 - hintRequestCount * 0.1));
        }

        // Use the rating passed in from the caller
        const finalRating = rating;

        const isNewBestTime =
          !existingProgress?.bestTimeSeconds ||
          timeSeconds < existingProgress.bestTimeSeconds;

        // Only add XP if this is better than before or first completion
        const shouldAddXP =
          !existingProgress?.completed ||
          xpEarned + bonusXpEarned > existingProgress.xpEarned;

        // Update level progress
        const newLevelProgress: TutorialProgress = {
          levelId: activeLevelId,
          completed: true,
          rating: betterRating(finalRating, existingProgress?.rating),
          bestTimeSeconds: isNewBestTime ? timeSeconds : existingProgress?.bestTimeSeconds,
          attempts: currentAttempt,
          hintsUsed: Math.min(hintRequestCount, existingProgress?.hintsUsed ?? Infinity),
          completedAt: new Date().toISOString(),
          xpEarned: Math.max(xpEarned + bonusXpEarned, existingProgress?.xpEarned ?? 0),
        };

        // Check for newly unlocked levels/chapters
        const unlockedLevelIds: string[] = [];
        let unlockedChapterId: TutorialChapterId | undefined;

        // Check unlocked levels from this level
        if (level.unlocksLevelIds) {
          unlockedLevelIds.push(...level.unlocksLevelIds);
        }

        // Update chapter progress
        const chapter = getChapterById(level.chapterId);
        const updatedChapterProgress = { ...chapterProgress };

        if (chapter) {
          const completedInChapter = chapter.levels.filter(
            (l) => levelProgress[l.id]?.completed || l.id === activeLevelId
          ).length;

          updatedChapterProgress[level.chapterId] = {
            ...updatedChapterProgress[level.chapterId],
            levelsCompleted: completedInChapter,
            totalXpEarned:
              (updatedChapterProgress[level.chapterId]?.totalXpEarned ?? 0) +
              (shouldAddXP ? xpEarned + bonusXpEarned : 0),
          };

          // Check if chapter is complete
          if (completedInChapter === chapter.levels.length) {
            updatedChapterProgress[level.chapterId].completedAt = new Date().toISOString();

            // Unlock next chapter
            const chapterIndex = TUTORIAL_CHAPTERS.findIndex((c) => c.id === level.chapterId);
            if (chapterIndex < TUTORIAL_CHAPTERS.length - 1) {
              const nextChapter = TUTORIAL_CHAPTERS[chapterIndex + 1];
              if (!updatedChapterProgress[nextChapter.id].unlocked) {
                updatedChapterProgress[nextChapter.id] = {
                  ...updatedChapterProgress[nextChapter.id],
                  unlocked: true,
                };
                unlockedChapterId = nextChapter.id;
              }
            }
          }
        }

        const result: LevelCompletionResult = {
          levelId: activeLevelId,
          passed: true,
          rating: finalRating,
          timeSeconds,
          xpEarned: shouldAddXP ? xpEarned : 0,
          bonusXpEarned: shouldAddXP ? bonusXpEarned : 0,
          hintsUsed: hintRequestCount,
          isNewBestTime,
          unlockedLevelIds,
          unlockedChapterId,
        };

        // Update store
        set({
          levelProgress: {
            ...levelProgress,
            [activeLevelId]: newLevelProgress,
          },
          chapterProgress: updatedChapterProgress,
          showCompletionModal: true,
          lastCompletionResult: result,
          isInTutorialMode: false,
          activeLevelId: null,
        });

        // Award XP through gamification store
        if (shouldAddXP && xpEarned + bonusXpEarned > 0) {
          useGamificationStore.getState().addXP(
            xpEarned + bonusXpEarned,
            `Tutorial: ${level.title}`
          );
          useGamificationStore.getState().recordChallengeCompleted();
        }

        return result;
      },

      exitTutorialMode: () => {
        set({
          isInTutorialMode: false,
          activeLevelId: null,
          sessionStartTime: null,
          objectiveProgress: {},
          revealedHintIds: [],
          showConceptModal: false,
        });
      },

      resetLevel: () => {
        const { activeLevelId, currentAttempt } = get();
        if (!activeLevelId) return null;

        const level = getLevelById(activeLevelId);

        set({
          sessionStartTime: Date.now(),
          currentAttempt: currentAttempt + 1,
          objectiveProgress: {},
          revealedHintIds: [],
          hintRequestCount: 0,
        });

        return level?.starterCircuit ?? null;
      },

      // UI Actions
      openLevelSelector: () => set({ showLevelSelector: true }),
      closeLevelSelector: () => set({ showLevelSelector: false }),
      openConceptModal: () => set({ showConceptModal: true }),
      closeConceptModal: () => set({ showConceptModal: false }),
      dismissCompletionModal: () =>
        set({ showCompletionModal: false, lastCompletionResult: null }),

      // Progress management
      resetChapterProgress: (chapterId) => {
        const chapter = getChapterById(chapterId);
        if (!chapter) return;

        const newLevelProgress = { ...get().levelProgress };
        chapter.levels.forEach((level) => {
          delete newLevelProgress[level.id];
        });

        set({
          levelProgress: newLevelProgress,
          chapterProgress: {
            ...get().chapterProgress,
            [chapterId]: {
              chapterId,
              levelsCompleted: 0,
              totalLevels: chapter.levels.length,
              totalXpEarned: 0,
              unlocked: chapterId === 'basics',
              completedAt: undefined,
            },
          },
        });
      },

      resetAllProgress: () => {
        set({
          levelProgress: {},
          chapterProgress: initializeChapterProgress(),
          activeLevelId: null,
          isInTutorialMode: false,
        });
      },
    }),
    {
      name: 'circuit-crafter-tutorial',
      partialize: (state) => ({
        levelProgress: state.levelProgress,
        chapterProgress: state.chapterProgress,
      }),
    }
  )
);

// ==================== Objective Validation Helpers ====================

export function validateObjectives(
  level: TutorialLevel,
  components: { type: string; id: string; properties?: Record<string, unknown> }[],
  wires: { id: string }[],
  simulationResult: {
    success: boolean;
    warnings?: { type: string }[];
    componentStates?: Record<string, { brightness?: number; current?: number; voltage?: number }>;
  } | null
): ObjectiveValidationResult[] {
  const results: ObjectiveValidationResult[] = [];

  for (const objective of level.objectives) {
    let completed = false;
    let progress: number | undefined;
    let message: string | undefined;

    const config = objective.config;

    switch (config.type) {
      case 'add_component': {
        const count = components.filter((c) => c.type === config.componentType).length;
        const target = config.count ?? 1;
        completed = count >= target;
        progress = Math.min(count / target, 1);
        message = `${count}/${target} ${config.componentType}(s)`;
        break;
      }

      case 'wire_count': {
        const wireCount = wires.length;
        const minWires = config.min ?? 0;
        completed = wireCount >= minWires;
        progress = minWires > 0 ? Math.min(wireCount / minWires, 1) : 1;
        message = `${wireCount}/${minWires} wires`;
        break;
      }

      case 'component_count': {
        const compCount = config.componentType
          ? components.filter((c) => c.type === config.componentType).length
          : components.length;
        const minCount = config.min ?? 0;
        completed = compCount >= minCount;
        progress = minCount > 0 ? Math.min(compCount / minCount, 1) : 1;
        break;
      }

      case 'simulation_success': {
        completed = simulationResult?.success ?? false;
        progress = completed ? 1 : 0;
        break;
      }

      case 'no_warnings': {
        const hasWarnings = (simulationResult?.warnings?.length ?? 0) > 0;
        completed = simulationResult?.success === true && !hasWarnings;
        progress = completed ? 1 : 0;
        break;
      }

      case 'power_led': {
        const ledId = config.ledId;
        const ledStates = Object.entries(simulationResult?.componentStates ?? {})
          .filter(([id]) => {
            if (ledId) return id === ledId;
            return components.find((c) => c.id === id && c.type === 'led');
          });
        const minBrightness = config.minBrightness ?? 0.1;
        const litLeds = ledStates.filter(([, state]) => (state.brightness ?? 0) >= minBrightness);
        completed = litLeds.length > 0;
        progress = completed ? 1 : 0;
        break;
      }

      case 'power_multiple_leds': {
        const allLedStates = Object.entries(simulationResult?.componentStates ?? {})
          .filter(([id]) => components.find((c) => c.id === id && c.type === 'led'));
        const minBrightness = config.minBrightness ?? 0.1;
        const litCount = allLedStates.filter(
          ([, state]) => (state.brightness ?? 0) >= minBrightness
        ).length;
        completed = litCount >= config.count;
        progress = Math.min(litCount / config.count, 1);
        message = `${litCount}/${config.count} LEDs lit`;
        break;
      }

      case 'achieve_current': {
        if (simulationResult?.componentStates) {
          const compType = config.componentType;
          const targetComponents = compType
            ? Object.entries(simulationResult.componentStates).filter(([id]) =>
                components.find((c) => c.id === id && c.type === compType)
              )
            : Object.entries(simulationResult.componentStates);

          const tolerance = config.tolerance ?? 0.001;
          const target = config.targetCurrent;

          for (const [, state] of targetComponents) {
            if (state.current !== undefined) {
              if (Math.abs(state.current - target) <= tolerance) {
                completed = true;
                break;
              }
            }
          }
        }
        progress = completed ? 1 : 0;
        break;
      }

      case 'connect_terminals': {
        // Simplified: just check if there are connections between the specified component types
        if (config.fromComponentType && config.toComponentType) {
          const hasConnection = wires.length > 0; // Simplified check
          completed = hasConnection;
        } else {
          completed = (config.minConnections ?? 1) <= wires.length;
        }
        progress = completed ? 1 : 0;
        break;
      }

      default:
        // For custom objectives, default to not completed
        completed = false;
        progress = 0;
    }

    results.push({
      objectiveId: objective.id,
      completed,
      progress,
      message,
    });
  }

  return results;
}
