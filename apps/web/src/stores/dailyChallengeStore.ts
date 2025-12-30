import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Daily Challenge Interfaces
export interface DailyChallenge {
  id: string;
  date: string; // ISO date string
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: ChallengeObjective[];
  baseXP: number;
  bonusObjectives: BonusObjective[];
}

export interface ChallengeObjective {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface BonusObjective {
  id: string;
  description: string;
  xpBonus: number;
  completed: boolean;
}

export interface DailyReward {
  day: number;
  xp: number;
  claimed: boolean;
  date?: string; // Date when claimed
}

export interface DailyProgress {
  currentDay: number;
  streak: number;
  lastClaimDate: string | null;
  challengeStarted: boolean;
  challengeCompleted: boolean;
  completionTime?: number; // Time in seconds
  firstAttempt: boolean;
}

interface CommunityStats {
  totalUsers: number;
  completedToday: number;
  averageTime: number; // in seconds
}

interface DailyChallengeState {
  // Current challenge
  currentChallenge: DailyChallenge | null;

  // Progress tracking
  progress: DailyProgress;

  // Rewards
  weeklyRewards: DailyReward[];

  // Community stats (mock for now)
  communityStats: CommunityStats;

  // UI state
  showRewardModal: boolean;
  hasSeenTodayModal: boolean;

  // Actions
  generateDailyChallenge: () => void;
  startChallenge: () => void;
  completeObjective: (objectiveId: string) => void;
  completeBonusObjective: (bonusId: string) => void;
  checkChallengeCompletion: () => void;
  claimDailyReward: () => void;
  updateStreak: () => void;
  dismissRewardModal: () => void;
  resetDaily: () => void;
  getStreakBonus: () => number;
  getTotalXP: () => number;
}

// Challenge templates for each difficulty
const CHALLENGE_TEMPLATES = {
  easy: [
    {
      title: 'Basic Circuit Builder',
      description: 'Build a simple circuit with a battery and LED',
      objectives: [
        { id: 'battery', description: 'Add a battery to the circuit', required: true },
        { id: 'led', description: 'Add an LED component', required: true },
        { id: 'connect', description: 'Connect the circuit', required: true },
      ],
      bonusObjectives: [
        { id: 'resistor', description: 'Use a resistor for current limiting', xpBonus: 10 },
      ],
      baseXP: 50,
    },
    {
      title: 'Switch Master',
      description: 'Create a circuit with a controllable switch',
      objectives: [
        { id: 'battery', description: 'Add a power source', required: true },
        { id: 'switch', description: 'Add a switch component', required: true },
        { id: 'led', description: 'Add an LED to control', required: true },
      ],
      bonusObjectives: [
        { id: 'test', description: 'Toggle the switch on and off', xpBonus: 15 },
      ],
      baseXP: 60,
    },
  ],
  medium: [
    {
      title: 'Parallel Circuit Challenge',
      description: 'Build a parallel circuit with multiple LEDs',
      objectives: [
        { id: 'battery', description: 'Add a battery', required: true },
        { id: 'leds', description: 'Add 3 LEDs in parallel', required: true },
        { id: 'resistors', description: 'Add resistors for each LED', required: true },
      ],
      bonusObjectives: [
        { id: 'efficiency', description: 'Keep total power under 1W', xpBonus: 25 },
        { id: 'brightness', description: 'All LEDs at 80%+ brightness', xpBonus: 20 },
      ],
      baseXP: 100,
    },
    {
      title: 'Logic Gate Explorer',
      description: 'Create a circuit using logic gates',
      objectives: [
        { id: 'and_gate', description: 'Use an AND gate', required: true },
        { id: 'or_gate', description: 'Use an OR gate', required: true },
        { id: 'output', description: 'Connect to an LED output', required: true },
      ],
      bonusObjectives: [
        { id: 'not_gate', description: 'Also use a NOT gate', xpBonus: 30 },
        { id: 'combination', description: 'Combine multiple logic gates', xpBonus: 25 },
      ],
      baseXP: 120,
    },
  ],
  hard: [
    {
      title: 'Complex Circuit Designer',
      description: 'Design an advanced circuit with multiple components',
      objectives: [
        { id: 'components', description: 'Use at least 8 different components', required: true },
        { id: 'logic', description: 'Include at least 2 logic gates', required: true },
        { id: 'functional', description: 'Create a fully functional circuit', required: true },
      ],
      bonusObjectives: [
        { id: 'efficient', description: 'Optimize for minimum power consumption', xpBonus: 40 },
        { id: 'safe', description: 'Include a fuse for safety', xpBonus: 30 },
        { id: 'fast', description: 'Complete in under 5 minutes', xpBonus: 50 },
      ],
      baseXP: 200,
    },
    {
      title: 'Master Engineer Challenge',
      description: 'Build a circuit that controls multiple outputs',
      objectives: [
        { id: 'leds', description: 'Control 5+ LEDs independently', required: true },
        { id: 'switches', description: 'Use multiple switches', required: true },
        { id: 'logic', description: 'Implement complex logic with gates', required: true },
      ],
      bonusObjectives: [
        { id: 'current', description: 'Measure current in multiple branches', xpBonus: 35 },
        { id: 'variety', description: 'Use 5+ different resistor values', xpBonus: 40 },
        { id: 'clean', description: 'Organize wiring neatly', xpBonus: 45 },
      ],
      baseXP: 250,
    },
  ],
};

// Calculate difficulty based on day of week
function getDifficultyForDay(date: Date): 'easy' | 'medium' | 'hard' {
  const day = date.getDay();
  // Monday, Tuesday: Easy
  if (day === 1 || day === 2) return 'easy';
  // Wednesday, Thursday, Friday: Medium
  if (day === 3 || day === 4 || day === 5) return 'medium';
  // Saturday, Sunday: Hard
  return 'hard';
}

// Generate a daily challenge based on the current date
function generateChallenge(date: Date): DailyChallenge {
  const difficulty = getDifficultyForDay(date);
  const templates = CHALLENGE_TEMPLATES[difficulty];

  // Use date as seed for consistent daily challenge
  const dateStr = date.toISOString().split('T')[0];
  const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const templateIndex = seed % templates.length;
  const template = templates[templateIndex];

  return {
    id: `daily-${dateStr}`,
    date: dateStr,
    title: template.title,
    description: template.description,
    difficulty,
    objectives: template.objectives.map(obj => ({
      ...obj,
      completed: false,
    })),
    baseXP: template.baseXP,
    bonusObjectives: template.bonusObjectives.map(bonus => ({
      ...bonus,
      completed: false,
    })),
  };
}

// Initialize weekly rewards (7 days with escalating rewards)
function initializeWeeklyRewards(): DailyReward[] {
  const baseRewards = [25, 50, 75, 100, 150, 200, 300]; // Escalating rewards
  return baseRewards.map((xp, index) => ({
    day: index + 1,
    xp,
    claimed: false,
  }));
}

// Get today's date string (YYYY-MM-DD)
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get midnight UTC timestamp for today
function getMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return midnight.getTime();
}

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChallenge: null,

      progress: {
        currentDay: 0,
        streak: 0,
        lastClaimDate: null,
        challengeStarted: false,
        challengeCompleted: false,
        firstAttempt: true,
      },

      weeklyRewards: initializeWeeklyRewards(),

      communityStats: {
        totalUsers: 1247,
        completedToday: 342,
        averageTime: 420, // 7 minutes
      },

      showRewardModal: false,
      hasSeenTodayModal: false,

      // Actions
      generateDailyChallenge: () => {
        const today = getTodayString();
        const state = get();

        // Check if we already have today's challenge
        if (state.currentChallenge?.date === today) {
          return;
        }

        // Generate new challenge for today
        const challenge = generateChallenge(new Date());

        set({
          currentChallenge: challenge,
          progress: {
            ...state.progress,
            challengeStarted: false,
            challengeCompleted: false,
            firstAttempt: true,
          },
          hasSeenTodayModal: false,
        });
      },

      startChallenge: () => {
        const state = get();
        if (!state.progress.challengeStarted) {
          set({
            progress: {
              ...state.progress,
              challengeStarted: true,
            },
          });
        }
      },

      completeObjective: (objectiveId: string) => {
        const state = get();
        if (!state.currentChallenge) return;

        const updatedObjectives = state.currentChallenge.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, completed: true } : obj
        );

        set({
          currentChallenge: {
            ...state.currentChallenge,
            objectives: updatedObjectives,
          },
        });

        get().checkChallengeCompletion();
      },

      completeBonusObjective: (bonusId: string) => {
        const state = get();
        if (!state.currentChallenge) return;

        const updatedBonuses = state.currentChallenge.bonusObjectives.map(bonus =>
          bonus.id === bonusId ? { ...bonus, completed: true } : bonus
        );

        set({
          currentChallenge: {
            ...state.currentChallenge,
            bonusObjectives: updatedBonuses,
          },
        });
      },

      checkChallengeCompletion: () => {
        const state = get();
        if (!state.currentChallenge || state.progress.challengeCompleted) return;

        const allRequiredComplete = state.currentChallenge.objectives
          .filter(obj => obj.required)
          .every(obj => obj.completed);

        if (allRequiredComplete) {
          set({
            progress: {
              ...state.progress,
              challengeCompleted: true,
            },
            showRewardModal: true,
          });
        }
      },

      claimDailyReward: () => {
        const state = get();
        const today = getTodayString();

        // Check if already claimed today
        if (state.progress.lastClaimDate === today) {
          return;
        }

        // Update streak
        get().updateStreak();

        const newStreak = get().progress.streak;
        const currentDay = Math.min(newStreak, 7); // Cap at 7 days

        // Mark reward as claimed
        const updatedRewards = state.weeklyRewards.map(reward =>
          reward.day === currentDay
            ? { ...reward, claimed: true, date: today }
            : reward
        );

        // Reset weekly rewards if we completed the cycle
        const finalRewards = currentDay === 7 ? initializeWeeklyRewards() : updatedRewards;

        set({
          progress: {
            ...state.progress,
            currentDay,
            lastClaimDate: today,
          },
          weeklyRewards: finalRewards,
        });
      },

      updateStreak: () => {
        const state = get();
        const today = getTodayString();

        if (state.progress.lastClaimDate === today) {
          return; // Already claimed today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.progress.lastClaimDate === yesterdayStr) {
          // Continue streak
          set({
            progress: {
              ...state.progress,
              streak: state.progress.streak + 1,
            },
          });
        } else if (state.progress.lastClaimDate !== today) {
          // Reset streak
          set({
            progress: {
              ...state.progress,
              streak: 1,
            },
          });
        }
      },

      dismissRewardModal: () => {
        set({
          showRewardModal: false,
          hasSeenTodayModal: true,
        });
      },

      resetDaily: () => {
        // For testing purposes
        set({
          progress: {
            currentDay: 0,
            streak: 0,
            lastClaimDate: null,
            challengeStarted: false,
            challengeCompleted: false,
            firstAttempt: true,
          },
          weeklyRewards: initializeWeeklyRewards(),
          hasSeenTodayModal: false,
        });
      },

      getStreakBonus: () => {
        const state = get();
        const { streak, firstAttempt } = state.progress;

        if (!firstAttempt) return 1.0; // No bonus for subsequent attempts

        // First attempt bonus: 1.25x base
        const baseBonus = 1.25;
        // Additional 0.1x per streak day, max 2x total
        const streakBonus = Math.min(streak * 0.1, 0.75);

        return Math.min(baseBonus + streakBonus, 2.0);
      },

      getTotalXP: () => {
        const state = get();
        if (!state.currentChallenge) return 0;

        const baseXP = state.currentChallenge.baseXP;
        const bonusXP = state.currentChallenge.bonusObjectives
          .filter(bonus => bonus.completed)
          .reduce((sum, bonus) => sum + bonus.xpBonus, 0);

        const totalBeforeBonus = baseXP + bonusXP;
        const streakMultiplier = get().getStreakBonus();

        return Math.floor(totalBeforeBonus * streakMultiplier);
      },
    }),
    {
      name: 'circuit-crafter-daily-challenge',
      partialize: (state) => ({
        currentChallenge: state.currentChallenge,
        progress: state.progress,
        weeklyRewards: state.weeklyRewards,
        hasSeenTodayModal: state.hasSeenTodayModal,
      }),
    }
  )
);

// Initialize daily challenge on app load
export function initializeDailyChallenge() {
  const store = useDailyChallengeStore.getState();
  store.generateDailyChallenge();

  // Note: No longer auto-showing the reward modal on startup
  // Users can access daily rewards via the Achievement Gallery button
  // This reduces popup spam that confuses new users
}

// Export utility to get time until reset
export function getTimeUntilReset(): { hours: number; minutes: number; seconds: number } {
  const now = Date.now();
  const midnight = getMidnightUTC();
  const diff = midnight - now;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
