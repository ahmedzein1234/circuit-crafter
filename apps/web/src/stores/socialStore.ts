import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Shared circuit representation
export interface SharedCircuit {
  id: string;
  name: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  circuitData: string; // JSON stringified circuit
  thumbnail?: string; // Base64 or URL
  likes: number;
  forks: number;
  views: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  createdAt: string;
  updatedAt: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  totalXP: number;
  circuitsCreated: number;
  circuitsCompleted: number;
  currentStreak: number;
  badges: string[];
}

// User profile data
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  circuitsCreated: number;
  circuitsCompleted: number;
  totalLikes: number;
  joinedAt: string;
  badges: Badge[];
  recentCircuits: SharedCircuit[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Mock data for demonstration
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user1',
    username: 'CircuitMaster',
    level: 42,
    totalXP: 125000,
    circuitsCreated: 156,
    circuitsCompleted: 234,
    currentStreak: 45,
    badges: ['master', 'streak_legend', 'creator'],
  },
  {
    rank: 2,
    userId: 'user2',
    username: 'ElectronWizard',
    level: 38,
    totalXP: 98000,
    circuitsCreated: 89,
    circuitsCompleted: 312,
    currentStreak: 30,
    badges: ['wizard', 'completionist'],
  },
  {
    rank: 3,
    userId: 'user3',
    username: 'VoltageKing',
    level: 35,
    totalXP: 82000,
    circuitsCreated: 234,
    circuitsCompleted: 156,
    currentStreak: 21,
    badges: ['creator', 'innovator'],
  },
  {
    rank: 4,
    userId: 'user4',
    username: 'OhmNomNom',
    level: 32,
    totalXP: 71000,
    circuitsCreated: 67,
    circuitsCompleted: 189,
    currentStreak: 14,
    badges: ['learner'],
  },
  {
    rank: 5,
    userId: 'user5',
    username: 'SparkySparks',
    level: 29,
    totalXP: 58000,
    circuitsCreated: 45,
    circuitsCompleted: 143,
    currentStreak: 7,
    badges: ['beginner'],
  },
];

const MOCK_SHARED_CIRCUITS: SharedCircuit[] = [
  {
    id: 'circuit1',
    name: 'Simple LED Circuit',
    description: 'A basic circuit demonstrating how to power an LED with a battery and resistor.',
    authorId: 'user1',
    authorName: 'CircuitMaster',
    likes: 234,
    forks: 56,
    views: 1250,
    tags: ['beginner', 'led', 'basic'],
    difficulty: 'beginner',
    circuitData: '{}',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'circuit2',
    name: 'Traffic Light Controller',
    description: 'A sequential logic circuit that mimics traffic light timing using logic gates.',
    authorId: 'user2',
    authorName: 'ElectronWizard',
    likes: 189,
    forks: 42,
    views: 890,
    tags: ['intermediate', 'logic', 'sequential'],
    difficulty: 'intermediate',
    circuitData: '{}',
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-14T14:30:00Z',
  },
  {
    id: 'circuit3',
    name: 'Arduino Motor Control',
    description: 'Control a DC motor speed using PWM and transistor switching.',
    authorId: 'user3',
    authorName: 'VoltageKing',
    likes: 156,
    forks: 38,
    views: 720,
    tags: ['advanced', 'motor', 'transistor'],
    difficulty: 'advanced',
    circuitData: '{}',
    createdAt: '2025-01-13T09:15:00Z',
    updatedAt: '2025-01-13T09:15:00Z',
  },
];

interface SocialState {
  // Sharing
  isShareModalOpen: boolean;
  shareCircuitName: string;
  shareCircuitDescription: string;
  shareCircuitTags: string[];
  shareCircuitDifficulty: SharedCircuit['difficulty'];

  // Browsing
  sharedCircuits: SharedCircuit[];
  selectedCircuit: SharedCircuit | null;
  isCircuitBrowserOpen: boolean;
  browserFilter: 'newest' | 'popular' | 'trending';
  browserSearch: string;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  isLeaderboardOpen: boolean;
  leaderboardTimeframe: 'daily' | 'weekly' | 'monthly' | 'allTime';

  // User profiles
  currentUserProfile: UserProfile | null;
  viewedProfile: UserProfile | null;
  isProfileModalOpen: boolean;

  // My circuits
  myCircuits: SharedCircuit[];
  likedCircuits: string[]; // IDs of liked circuits

  // Actions
  openShareModal: () => void;
  closeShareModal: () => void;
  setShareCircuitName: (name: string) => void;
  setShareCircuitDescription: (description: string) => void;
  setShareCircuitTags: (tags: string[]) => void;
  setShareCircuitDifficulty: (difficulty: SharedCircuit['difficulty']) => void;
  shareCircuit: (circuitData: string) => void;

  openCircuitBrowser: () => void;
  closeCircuitBrowser: () => void;
  setBrowserFilter: (filter: SocialState['browserFilter']) => void;
  setBrowserSearch: (search: string) => void;
  selectCircuit: (circuit: SharedCircuit | null) => void;
  loadCircuit: (circuitId: string) => string | null;
  likeCircuit: (circuitId: string) => void;
  forkCircuit: (circuitId: string) => void;

  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  setLeaderboardTimeframe: (timeframe: SocialState['leaderboardTimeframe']) => void;
  refreshLeaderboard: () => void;

  openProfileModal: (userId?: string) => void;
  closeProfileModal: () => void;

  // Initialize mock data
  initializeMockData: () => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // Initial state
      isShareModalOpen: false,
      shareCircuitName: '',
      shareCircuitDescription: '',
      shareCircuitTags: [],
      shareCircuitDifficulty: 'beginner',

      sharedCircuits: [],
      selectedCircuit: null,
      isCircuitBrowserOpen: false,
      browserFilter: 'newest',
      browserSearch: '',

      leaderboard: [],
      isLeaderboardOpen: false,
      leaderboardTimeframe: 'weekly',

      currentUserProfile: null,
      viewedProfile: null,
      isProfileModalOpen: false,

      myCircuits: [],
      likedCircuits: [],

      // Share modal actions
      openShareModal: () => set({ isShareModalOpen: true }),
      closeShareModal: () =>
        set({
          isShareModalOpen: false,
          shareCircuitName: '',
          shareCircuitDescription: '',
          shareCircuitTags: [],
          shareCircuitDifficulty: 'beginner',
        }),
      setShareCircuitName: (name) => set({ shareCircuitName: name }),
      setShareCircuitDescription: (description) => set({ shareCircuitDescription: description }),
      setShareCircuitTags: (tags) => set({ shareCircuitTags: tags }),
      setShareCircuitDifficulty: (difficulty) => set({ shareCircuitDifficulty: difficulty }),

      shareCircuit: (circuitData) => {
        const state = get();
        const newCircuit: SharedCircuit = {
          id: `circuit_${Date.now()}`,
          name: state.shareCircuitName || 'Untitled Circuit',
          description: state.shareCircuitDescription,
          authorId: 'current_user',
          authorName: 'You',
          circuitData,
          likes: 0,
          forks: 0,
          views: 0,
          tags: state.shareCircuitTags,
          difficulty: state.shareCircuitDifficulty,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((s) => ({
          myCircuits: [newCircuit, ...s.myCircuits],
          sharedCircuits: [newCircuit, ...s.sharedCircuits],
          isShareModalOpen: false,
          shareCircuitName: '',
          shareCircuitDescription: '',
          shareCircuitTags: [],
          shareCircuitDifficulty: 'beginner',
        }));
      },

      // Circuit browser actions
      openCircuitBrowser: () => set({ isCircuitBrowserOpen: true }),
      closeCircuitBrowser: () => set({ isCircuitBrowserOpen: false, selectedCircuit: null }),
      setBrowserFilter: (filter) => set({ browserFilter: filter }),
      setBrowserSearch: (search) => set({ browserSearch: search }),
      selectCircuit: (circuit) => set({ selectedCircuit: circuit }),

      loadCircuit: (circuitId) => {
        const circuit = get().sharedCircuits.find((c) => c.id === circuitId);
        if (circuit) {
          // Increment views
          set((s) => ({
            sharedCircuits: s.sharedCircuits.map((c) =>
              c.id === circuitId ? { ...c, views: c.views + 1 } : c
            ),
          }));
          return circuit.circuitData;
        }
        return null;
      },

      likeCircuit: (circuitId) => {
        const state = get();
        const isLiked = state.likedCircuits.includes(circuitId);

        set((s) => ({
          likedCircuits: isLiked
            ? s.likedCircuits.filter((id) => id !== circuitId)
            : [...s.likedCircuits, circuitId],
          sharedCircuits: s.sharedCircuits.map((c) =>
            c.id === circuitId ? { ...c, likes: c.likes + (isLiked ? -1 : 1) } : c
          ),
        }));
      },

      forkCircuit: (circuitId) => {
        const circuit = get().sharedCircuits.find((c) => c.id === circuitId);
        if (circuit) {
          const forkedCircuit: SharedCircuit = {
            ...circuit,
            id: `circuit_${Date.now()}`,
            name: `${circuit.name} (Fork)`,
            authorId: 'current_user',
            authorName: 'You',
            likes: 0,
            forks: 0,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((s) => ({
            myCircuits: [forkedCircuit, ...s.myCircuits],
            sharedCircuits: s.sharedCircuits.map((c) =>
              c.id === circuitId ? { ...c, forks: c.forks + 1 } : c
            ),
          }));

          return forkedCircuit.circuitData;
        }
      },

      // Leaderboard actions
      openLeaderboard: () => set({ isLeaderboardOpen: true }),
      closeLeaderboard: () => set({ isLeaderboardOpen: false }),
      setLeaderboardTimeframe: (timeframe) => set({ leaderboardTimeframe: timeframe }),
      refreshLeaderboard: () => {
        // In a real app, this would fetch from API
        set({ leaderboard: MOCK_LEADERBOARD });
      },

      // Profile actions
      openProfileModal: (userId) => {
        // In a real app, fetch profile from API
        const mockProfile: UserProfile = {
          id: userId || 'current_user',
          username: userId ? 'OtherUser' : 'You',
          displayName: userId ? 'Other User' : 'Your Name',
          bio: 'Passionate about electronics and circuit design!',
          level: 15,
          totalXP: 24500,
          currentStreak: 7,
          longestStreak: 21,
          circuitsCreated: 23,
          circuitsCompleted: 67,
          totalLikes: 156,
          joinedAt: '2024-06-15T00:00:00Z',
          badges: [
            {
              id: 'first_circuit',
              name: 'First Circuit',
              description: 'Created your first circuit',
              icon: 'zap',
              earnedAt: '2024-06-15T00:00:00Z',
              rarity: 'common',
            },
            {
              id: 'streak_week',
              name: 'Week Warrior',
              description: 'Maintained a 7-day streak',
              icon: 'flame',
              earnedAt: '2024-07-01T00:00:00Z',
              rarity: 'uncommon',
            },
          ],
          recentCircuits: [],
        };

        set({
          isProfileModalOpen: true,
          viewedProfile: mockProfile,
        });
      },
      closeProfileModal: () => set({ isProfileModalOpen: false, viewedProfile: null }),

      // Initialize mock data
      initializeMockData: () => {
        set({
          sharedCircuits: MOCK_SHARED_CIRCUITS,
          leaderboard: MOCK_LEADERBOARD,
        });
      },
    }),
    {
      name: 'circuit-crafter-social',
      partialize: (state) => ({
        myCircuits: state.myCircuits,
        likedCircuits: state.likedCircuits,
      }),
    }
  )
);

// Initialize mock data on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useSocialStore.getState().initializeMockData();
  }, 0);
}
