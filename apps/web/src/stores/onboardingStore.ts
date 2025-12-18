import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'drag-battery' | 'drag-resistor' | 'drag-led' | 'connect-wire' | 'run-simulation';
  validation?: () => boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Circuit Crafter!',
    description: 'Learn electronics through interactive circuit building. This tutorial will guide you through creating your first circuit.',
    position: 'bottom',
  },
  {
    id: 'component-palette',
    title: 'Component Palette',
    description: 'Here you\'ll find all the electronic components. You can drag them onto the canvas to build your circuit.',
    targetElement: '.component-palette',
    position: 'right',
  },
  {
    id: 'drag-battery',
    title: 'Add a Battery',
    description: 'Every circuit needs power! Drag a battery from the Power section onto the canvas.',
    targetElement: '.component-palette',
    position: 'right',
    action: 'drag-battery',
  },
  {
    id: 'add-resistor',
    title: 'Add a Resistor',
    description: 'Resistors control current flow. Drag a resistor from the Passive section onto the canvas.',
    targetElement: '.component-palette',
    position: 'right',
    action: 'drag-resistor',
  },
  {
    id: 'add-led',
    title: 'Add an LED',
    description: 'LEDs show when current is flowing. Drag an LED from the Output section onto the canvas.',
    targetElement: '.component-palette',
    position: 'right',
    action: 'drag-led',
  },
  {
    id: 'connect-wires',
    title: 'Connect with Wires',
    description: 'Click on a terminal (the small dots on components) to start drawing a wire, then click another terminal to connect them. Create a complete circuit!',
    position: 'bottom',
    action: 'connect-wire',
  },
  {
    id: 'run-simulation',
    title: 'Run the Simulation',
    description: 'Great! Now click the "Run" button in the Simulation panel to see your circuit come to life.',
    targetElement: '.simulation-panel',
    position: 'left',
    action: 'run-simulation',
  },
];

interface OnboardingState {
  // State
  isOnboardingComplete: boolean;
  isOnboardingActive: boolean;
  currentStepIndex: number;
  skipped: boolean;

  // Actions
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setStepIndex: (index: number) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnboardingComplete: false,
      isOnboardingActive: false,
      currentStepIndex: 0,
      skipped: false,

      // Actions
      startOnboarding: () => {
        set({
          isOnboardingActive: true,
          currentStepIndex: 0,
          skipped: false,
        });
      },

      nextStep: () => {
        const { currentStepIndex } = get();
        const nextIndex = currentStepIndex + 1;

        if (nextIndex >= ONBOARDING_STEPS.length) {
          get().completeOnboarding();
        } else {
          set({ currentStepIndex: nextIndex });
        }
      },

      previousStep: () => {
        set((state) => ({
          currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        }));
      },

      skipOnboarding: () => {
        set({
          isOnboardingComplete: true,
          isOnboardingActive: false,
          skipped: true,
        });
      },

      completeOnboarding: () => {
        set({
          isOnboardingComplete: true,
          isOnboardingActive: false,
        });
      },

      resetOnboarding: () => {
        set({
          isOnboardingComplete: false,
          isOnboardingActive: false,
          currentStepIndex: 0,
          skipped: false,
        });
      },

      setStepIndex: (index: number) => {
        set({
          currentStepIndex: Math.max(0, Math.min(index, ONBOARDING_STEPS.length - 1)),
        });
      },
    }),
    {
      name: 'circuit-crafter-onboarding',
      partialize: (state) => ({
        isOnboardingComplete: state.isOnboardingComplete,
        skipped: state.skipped,
      }),
    }
  )
);
