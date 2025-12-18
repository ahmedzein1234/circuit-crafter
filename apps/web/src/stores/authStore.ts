// Authentication state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type User, type UserProfile } from '../api';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  profile: UserProfile | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      profile: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        const response = await authApi.login(email, password);

        if (response.success && response.data) {
          const { user, token } = response.data;

          // Store token in localStorage for API client
          localStorage.setItem('auth_token', token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Load full profile
          get().loadProfile();

          return true;
        } else {
          set({
            isLoading: false,
            error: response.message || response.error || 'Login failed',
          });
          return false;
        }
      },

      // Register action
      register: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });

        const response = await authApi.register(email, username, password);

        if (response.success && response.data) {
          const { user, token } = response.data;

          // Store token in localStorage for API client
          localStorage.setItem('auth_token', token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } else {
          set({
            isLoading: false,
            error: response.message || response.error || 'Registration failed',
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        await authApi.logout();

        // Clear token from localStorage
        localStorage.removeItem('auth_token');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          profile: null,
          error: null,
        });
      },

      // Load user profile
      loadProfile: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        const response = await authApi.getProfile();

        if (response.success && response.data) {
          set({ profile: response.data });
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'circuit-crafter-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Sync token to localStorage on store changes
useAuthStore.subscribe((state) => {
  if (state.token) {
    localStorage.setItem('auth_token', state.token);
  } else {
    localStorage.removeItem('auth_token');
  }
});
