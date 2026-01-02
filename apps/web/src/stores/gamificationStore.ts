import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComponentType } from '@circuit-crafter/shared';
import { progressApi } from '../api';

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: AchievementRequirement;
}

type AchievementRequirement =
  | { type: 'circuits_completed'; count: number }
  | { type: 'wires_placed'; count: number }
  | { type: 'components_used'; componentType: ComponentType; count: number }
  | { type: 'all_logic_gates' }
  | { type: 'challenge_completed'; challengeId?: string }
  | { type: 'challenges_completed'; count: number }
  | { type: 'high_current'; threshold: number }
  | { type: 'use_fuse' }
  | { type: 'leds_lit'; count: number }
  | { type: 'resistor_variety'; count: number }
  | { type: 'level_reached'; level: number }
  | { type: 'streak_days'; count: number };

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_spark',
    name: 'First Spark',
    description: 'Build your first complete circuit',
    icon: 'zap',
    xpReward: 50,
    requirement: { type: 'circuits_completed', count: 1 },
  },
  {
    id: 'wire_wizard',
    name: 'Wire Wizard',
    description: 'Make 50 wire connections',
    icon: 'cable',
    xpReward: 100,
    requirement: { type: 'wires_placed', count: 50 },
  },
  {
    id: 'logic_master',
    name: 'Logic Master',
    description: 'Use all 3 logic gate types in circuits',
    icon: 'cpu',
    xpReward: 75,
    requirement: { type: 'all_logic_gates' },
  },
  {
    id: 'power_hungry',
    name: 'Power Hungry',
    description: 'Build a circuit drawing more than 1 Amp',
    icon: 'bolt',
    xpReward: 50,
    requirement: { type: 'high_current', threshold: 1 },
  },
  {
    id: 'safety_first',
    name: 'Safety First',
    description: 'Use a fuse in your circuit',
    icon: 'shield',
    xpReward: 30,
    requirement: { type: 'use_fuse' },
  },
  {
    id: 'led_artist',
    name: 'LED Artist',
    description: 'Light up 5 LEDs in one circuit',
    icon: 'lightbulb',
    xpReward: 60,
    requirement: { type: 'leds_lit', count: 5 },
  },
  {
    id: 'challenge_champion',
    name: 'Challenge Champion',
    description: 'Complete all tutorial challenges',
    icon: 'trophy',
    xpReward: 200,
    requirement: { type: 'challenges_completed', count: 10 },
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Complete 3 challenges',
    icon: 'book',
    xpReward: 50,
    requirement: { type: 'challenges_completed', count: 3 },
  },
  {
    id: 'resistor_rainbow',
    name: 'Resistor Rainbow',
    description: 'Use 5 different resistance values',
    icon: 'palette',
    xpReward: 40,
    requirement: { type: 'resistor_variety', count: 5 },
  },
  {
    id: 'level_5',
    name: 'Apprentice Engineer',
    description: 'Reach level 5',
    icon: 'star',
    xpReward: 100,
    requirement: { type: 'level_reached', level: 5 },
  },
  {
    id: 'level_10',
    name: 'Circuit Expert',
    description: 'Reach level 10',
    icon: 'award',
    xpReward: 200,
    requirement: { type: 'level_reached', level: 10 },
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    xpReward: 75,
    requirement: { type: 'streak_days', count: 7 },
  },
];

// XP required for each level
const XP_PER_LEVEL = 100;
const LEVEL_MULTIPLIER = 1.5;

function getXPForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
}

function getLevelFromXP(totalXP: number): { level: number; currentXP: number; xpForNextLevel: number } {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= getXPForLevel(level)) {
    xpRemaining -= getXPForLevel(level);
    level++;
  }

  return {
    level,
    currentXP: xpRemaining,
    xpForNextLevel: getXPForLevel(level),
  };
}

interface GamificationStats {
  circuitsCompleted: number;
  wiresPlaced: number;
  challengesCompleted: number;
  componentTypesUsed: Set<ComponentType>;
  logicGatesUsed: Set<ComponentType>;
  resistanceValuesUsed: Set<number>;
  maxCurrentAchieved: number;
  ledsLitInOneCircuit: number;
  usedFuse: boolean;
}

interface GamificationState {
  // XP & Level
  totalXP: number;
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;

  // Achievements
  unlockedAchievements: string[];
  recentAchievement: Achievement | null;

  // Stats
  stats: GamificationStats;

  // Streak
  currentStreak: number;
  lastActiveDate: string | null;

  // Level up tracking
  pendingLevelUp: number | null;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: string | null;

  // Actions
  addXP: (amount: number, reason: string) => void;
  clearPendingLevelUp: () => void;
  checkAchievements: () => void;
  recordCircuitCompleted: () => void;
  recordWirePlaced: () => void;
  recordChallengeCompleted: () => void;
  recordComponentUsed: (type: ComponentType) => void;
  recordCurrentMeasured: (current: number) => void;
  recordLedsLit: (count: number) => void;
  recordResistanceUsed: (value: number) => void;
  updateStreak: () => void;
  dismissRecentAchievement: () => void;

  // Sync actions
  syncToBackend: () => Promise<void>;
  loadFromBackend: () => Promise<void>;
  syncAchievementToBackend: (achievementId: string) => Promise<void>;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXP: 0,
      level: 1,
      currentLevelXP: 0,
      xpForNextLevel: XP_PER_LEVEL,

      unlockedAchievements: [],
      recentAchievement: null,

      stats: {
        circuitsCompleted: 0,
        wiresPlaced: 0,
        challengesCompleted: 0,
        componentTypesUsed: new Set(),
        logicGatesUsed: new Set(),
        resistanceValuesUsed: new Set(),
        maxCurrentAchieved: 0,
        ledsLitInOneCircuit: 0,
        usedFuse: false,
      },

      currentStreak: 0,
      lastActiveDate: null,

      // Level up tracking
      pendingLevelUp: null as number | null,

      // Sync state
      isSyncing: false,
      lastSyncedAt: null,

      // Actions
      addXP: (amount, reason) => {
        const prevLevel = get().level;
        const newTotal = get().totalXP + amount;
        const levelInfo = getLevelFromXP(newTotal);

        // Check for level up
        const leveledUp = levelInfo.level > prevLevel;

        set({
          totalXP: newTotal,
          level: levelInfo.level,
          currentLevelXP: levelInfo.currentXP,
          xpForNextLevel: levelInfo.xpForNextLevel,
          pendingLevelUp: leveledUp ? levelInfo.level : null,
        });

        // Dispatch custom event for XP gain (used by FloatingXPGain component)
        window.dispatchEvent(new CustomEvent('xp-gained', {
          detail: { amount, reason }
        }));

        // Dispatch level up event if applicable
        if (leveledUp) {
          window.dispatchEvent(new CustomEvent('level-up', {
            detail: { level: levelInfo.level }
          }));
        }

        // Check level achievements
        get().checkAchievements();
      },

      clearPendingLevelUp: () => {
        set({ pendingLevelUp: null });
      },

      checkAchievements: () => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (state.unlockedAchievements.includes(achievement.id)) continue;

          let unlocked = false;

          switch (achievement.requirement.type) {
            case 'circuits_completed':
              unlocked = state.stats.circuitsCompleted >= achievement.requirement.count;
              break;
            case 'wires_placed':
              unlocked = state.stats.wiresPlaced >= achievement.requirement.count;
              break;
            case 'challenges_completed':
              unlocked = state.stats.challengesCompleted >= achievement.requirement.count;
              break;
            case 'all_logic_gates':
              unlocked = state.stats.logicGatesUsed.size >= 3;
              break;
            case 'high_current':
              unlocked = state.stats.maxCurrentAchieved >= achievement.requirement.threshold;
              break;
            case 'use_fuse':
              unlocked = state.stats.usedFuse;
              break;
            case 'leds_lit':
              unlocked = state.stats.ledsLitInOneCircuit >= achievement.requirement.count;
              break;
            case 'resistor_variety':
              unlocked = state.stats.resistanceValuesUsed.size >= achievement.requirement.count;
              break;
            case 'level_reached':
              unlocked = state.level >= achievement.requirement.level;
              break;
            case 'streak_days':
              unlocked = state.currentStreak >= achievement.requirement.count;
              break;
          }

          if (unlocked) {
            newlyUnlocked.push(achievement);
          }
        }

        if (newlyUnlocked.length > 0) {
          const newAchievementIds = newlyUnlocked.map((a) => a.id);
          const totalXPGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);

          set((s) => ({
            unlockedAchievements: [...s.unlockedAchievements, ...newAchievementIds],
            recentAchievement: newlyUnlocked[0], // Show first one
          }));

          // Add XP from achievements
          if (totalXPGained > 0) {
            get().addXP(totalXPGained, 'Achievement unlocked');
          }

          // Sync new achievements to backend
          for (const achievement of newlyUnlocked) {
            get().syncAchievementToBackend(achievement.id);
          }
        }
      },

      recordCircuitCompleted: () => {
        set((s) => ({
          stats: {
            ...s.stats,
            circuitsCompleted: s.stats.circuitsCompleted + 1,
          },
        }));
        get().addXP(10, 'Circuit completed');
        get().checkAchievements();
      },

      recordWirePlaced: () => {
        set((s) => ({
          stats: {
            ...s.stats,
            wiresPlaced: s.stats.wiresPlaced + 1,
          },
        }));
        get().checkAchievements();
      },

      recordChallengeCompleted: () => {
        set((s) => ({
          stats: {
            ...s.stats,
            challengesCompleted: s.stats.challengesCompleted + 1,
          },
        }));
        get().addXP(25, 'Challenge completed');
        get().checkAchievements();
      },

      recordComponentUsed: (type) => {
        const isLogicGate = ['and_gate', 'or_gate', 'not_gate'].includes(type);
        const isFuse = type === 'fuse';

        set((s) => {
          const newComponentTypes = new Set(s.stats.componentTypesUsed);
          newComponentTypes.add(type);

          const newLogicGates = new Set(s.stats.logicGatesUsed);
          if (isLogicGate) {
            newLogicGates.add(type);
          }

          return {
            stats: {
              ...s.stats,
              componentTypesUsed: newComponentTypes,
              logicGatesUsed: newLogicGates,
              usedFuse: s.stats.usedFuse || isFuse,
            },
          };
        });

        // First time using a component type
        const state = get();
        if (!state.stats.componentTypesUsed.has(type)) {
          get().addXP(5, `First time using ${type}`);
        }

        get().checkAchievements();
      },

      recordCurrentMeasured: (current) => {
        set((s) => ({
          stats: {
            ...s.stats,
            maxCurrentAchieved: Math.max(s.stats.maxCurrentAchieved, current),
          },
        }));
        get().checkAchievements();
      },

      recordLedsLit: (count) => {
        set((s) => ({
          stats: {
            ...s.stats,
            ledsLitInOneCircuit: Math.max(s.stats.ledsLitInOneCircuit, count),
          },
        }));
        get().checkAchievements();
      },

      recordResistanceUsed: (value) => {
        set((s) => {
          const newValues = new Set(s.stats.resistanceValuesUsed);
          newValues.add(value);
          return {
            stats: {
              ...s.stats,
              resistanceValuesUsed: newValues,
            },
          };
        });
        get().checkAchievements();
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();

        if (state.lastActiveDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.lastActiveDate === yesterdayStr) {
          // Continue streak
          set({
            currentStreak: state.currentStreak + 1,
            lastActiveDate: today,
          });
        } else if (state.lastActiveDate !== today) {
          // Reset streak
          set({
            currentStreak: 1,
            lastActiveDate: today,
          });
        }

        get().checkAchievements();
      },

      dismissRecentAchievement: () => {
        set({ recentAchievement: null });
      },

      // Sync to backend
      syncToBackend: async () => {
        const state = get();
        if (state.isSyncing) return;

        // Check if user is authenticated
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        set({ isSyncing: true });

        try {
          await progressApi.updateProgress({
            xp: state.totalXP,
            level: state.level,
            totalCircuitsCreated: state.stats.circuitsCompleted,
            totalChallengesCompleted: state.stats.challengesCompleted,
            totalWiresConnected: state.stats.wiresPlaced,
          });

          set({ lastSyncedAt: new Date().toISOString() });
        } catch (error) {
          console.error('Failed to sync progress to backend:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Load from backend
      loadFromBackend: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        set({ isSyncing: true });

        try {
          // Load progress
          const progressResponse = await progressApi.getProgress();
          if (progressResponse.success && progressResponse.data) {
            const data = progressResponse.data;

            // Merge with local state (take higher values)
            const currentState = get();
            const mergedXP = Math.max(currentState.totalXP, data.xp);
            const mergedLevelInfo = getLevelFromXP(mergedXP);

            set({
              totalXP: mergedXP,
              level: mergedLevelInfo.level,
              currentLevelXP: mergedLevelInfo.currentXP,
              xpForNextLevel: mergedLevelInfo.xpForNextLevel,
              currentStreak: Math.max(currentState.currentStreak, data.currentStreak),
              stats: {
                ...currentState.stats,
                circuitsCompleted: Math.max(currentState.stats.circuitsCompleted, data.totalCircuitsCreated),
                challengesCompleted: Math.max(currentState.stats.challengesCompleted, data.totalChallengesCompleted),
                wiresPlaced: Math.max(currentState.stats.wiresPlaced, data.totalWiresConnected),
              },
            });
          }

          // Load achievements
          const achievementsResponse = await progressApi.getAchievements();
          if (achievementsResponse.success && achievementsResponse.data) {
            const backendAchievements = achievementsResponse.data.map(a => a.achievementId);
            const currentAchievements = get().unlockedAchievements;
            const merged = [...new Set([...currentAchievements, ...backendAchievements])];
            set({ unlockedAchievements: merged });
          }

          set({ lastSyncedAt: new Date().toISOString() });
        } catch (error) {
          console.error('Failed to load progress from backend:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Sync achievement to backend
      syncAchievementToBackend: async (achievementId: string) => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
          await progressApi.unlockAchievement(achievementId, 100);
        } catch (error) {
          console.error('Failed to sync achievement to backend:', error);
        }
      },
    }),
    {
      name: 'circuit-crafter-gamification',
      partialize: (state) => ({
        totalXP: state.totalXP,
        level: state.level,
        currentLevelXP: state.currentLevelXP,
        xpForNextLevel: state.xpForNextLevel,
        unlockedAchievements: state.unlockedAchievements,
        stats: {
          ...state.stats,
          componentTypesUsed: Array.from(state.stats.componentTypesUsed),
          logicGatesUsed: Array.from(state.stats.logicGatesUsed),
          resistanceValuesUsed: Array.from(state.stats.resistanceValuesUsed),
        },
        currentStreak: state.currentStreak,
        lastActiveDate: state.lastActiveDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Sets
          state.stats.componentTypesUsed = new Set(state.stats.componentTypesUsed as unknown as ComponentType[]);
          state.stats.logicGatesUsed = new Set(state.stats.logicGatesUsed as unknown as ComponentType[]);
          state.stats.resistanceValuesUsed = new Set(state.stats.resistanceValuesUsed as unknown as number[]);
        }
      },
    }
  )
);

// Debounced sync to backend on XP changes
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

useGamificationStore.subscribe((state, prevState) => {
  // Only sync if XP changed and user is authenticated
  if (state.totalXP !== prevState.totalXP && localStorage.getItem('auth_token')) {
    // Debounce: wait 5 seconds after last XP change before syncing
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      useGamificationStore.getState().syncToBackend();
    }, 5000);
  }
});

// Export helper to sync on login
export const syncGamificationOnLogin = async () => {
  await useGamificationStore.getState().loadFromBackend();
};
