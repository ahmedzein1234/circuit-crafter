import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SandboxState {
  // Sandbox mode flag
  isSandboxMode: boolean;

  // Sandbox stats (for fun)
  totalCircuitsBuilt: number;
  totalComponentsPlaced: number;
  totalWiresConnected: number;

  // Actions
  toggleSandboxMode: () => void;
  enableSandboxMode: () => void;
  disableSandboxMode: () => void;
  incrementCircuitsBuilt: () => void;
  incrementComponentsPlaced: () => void;
  incrementWiresConnected: () => void;
}

export const useSandboxStore = create<SandboxState>()(
  persist(
    (set) => ({
      // Initial state
      isSandboxMode: false,
      totalCircuitsBuilt: 0,
      totalComponentsPlaced: 0,
      totalWiresConnected: 0,

      // Actions
      toggleSandboxMode: () => {
        set((state) => ({ isSandboxMode: !state.isSandboxMode }));
      },

      enableSandboxMode: () => {
        set({ isSandboxMode: true });
      },

      disableSandboxMode: () => {
        set({ isSandboxMode: false });
      },

      incrementCircuitsBuilt: () => {
        set((state) => ({ totalCircuitsBuilt: state.totalCircuitsBuilt + 1 }));
      },

      incrementComponentsPlaced: () => {
        set((state) => ({ totalComponentsPlaced: state.totalComponentsPlaced + 1 }));
      },

      incrementWiresConnected: () => {
        set((state) => ({ totalWiresConnected: state.totalWiresConnected + 1 }));
      },
    }),
    {
      name: 'circuit-crafter-sandbox',
    }
  )
);
