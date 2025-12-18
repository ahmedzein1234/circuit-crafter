import { useEffect, useState } from 'react';
import { CircuitCanvas } from './canvas/CircuitCanvas';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulationPanel } from './components/SimulationPanel';
import { Toolbar } from './components/Toolbar';
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
import { OnboardingFlow, useOnboardingKeyboard } from './components/OnboardingFlow';
import { MobileNavigation, type MobileTab } from './components/MobileNavigation';
import { MobileDrawer } from './components/MobileDrawer';
import { DailyRewardModalContainer } from './components/DailyRewardModal';
import {
  TutorialLevelSelector,
  TutorialModeOverlay,
  TutorialConceptModal,
  TutorialCompletionModal,
} from './components/tutorial';
import { ShareCircuitModal, LeaderboardPanel, UserProfileCard } from './components/social';
import { useCircuitStore } from './stores/circuitStore';
import { useThemeStore } from './stores/themeStore';
import { useOnboardingStore } from './stores/onboardingStore';
import { initializeDailyChallenge } from './stores/dailyChallengeStore';
import { useTutorialStore } from './stores/tutorialStore';
import { AchievementNotification } from './components/AchievementNotification';
import { StreakIndicator } from './components/StreakIndicator';
import { XPProgressBar } from './components/XPProgressBar';

function App() {
  const { runSimulation, undo, redo } = useCircuitStore();
  const theme = useThemeStore((state) => state.theme);
  const { isOnboardingComplete, isOnboardingActive, startOnboarding } = useOnboardingStore();
  const { isInTutorialMode } = useTutorialStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('canvas');
  const [showComponentDrawer, setShowComponentDrawer] = useState(false);
  const [showSimulationDrawer, setShowSimulationDrawer] = useState(false);

  // Initialize onboarding keyboard shortcuts
  useOnboardingKeyboard();

  // Initialize daily challenge system
  useEffect(() => {
    initializeDailyChallenge();
  }, []);

  // Start onboarding for first-time users (temporarily disabled for debugging)
  // useEffect(() => {
  //   if (!isOnboardingComplete && !isOnboardingActive) {
  //     const timer = setTimeout(() => {
  //       startOnboarding();
  //     }, 500); // Small delay to let the UI render first
  //     return () => clearTimeout(timer);
  //   }
  // }, [isOnboardingComplete, isOnboardingActive, startOnboarding]);

  // Handler for help button to show keyboard shortcuts
  const handleHelpClick = () => {
    setShowShortcuts(true);
  };

  // Handle mobile tab changes
  useEffect(() => {
    if (activeTab === 'components') {
      setShowComponentDrawer(true);
      setShowSimulationDrawer(false);
    } else if (activeTab === 'simulation') {
      setShowSimulationDrawer(true);
      setShowComponentDrawer(false);
    } else {
      setShowComponentDrawer(false);
      setShowSimulationDrawer(false);
    }
  }, [activeTab]);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Run simulation whenever circuit changes
  useEffect(() => {
    const unsubscribe = useCircuitStore.subscribe(
      (state) => [state.components, state.wires],
      () => {
        runSimulation();
      }
    );

    return unsubscribe;
  }, [runSimulation]);

  // Add keyboard shortcuts for undo/redo and help panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Z (undo) or Cmd+Z on Mac
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Check for Ctrl+Shift+Z (redo) or Cmd+Shift+Z on Mac
      // Also support Ctrl+Y (redo) on Windows
      else if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        (event.ctrlKey && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
      // Check for ? key to show keyboard shortcuts
      else if (
        event.key === '?' &&
        (event.ctrlKey || event.metaKey || (!event.ctrlKey && !event.metaKey))
      ) {
        event.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-circuit-bg dark:bg-circuit-bg light:bg-circuit-light-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-gray-800 dark:border-gray-800 light:border-circuit-light-border">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile hamburger menu for components */}
          <button
            onClick={() => setShowComponentDrawer(true)}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-white dark:text-white light:text-circuit-light-text">
              Circuit Crafter
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 hidden md:block">
              Learn Electronics Through Play
            </p>
          </div>

          {/* Streak indicator */}
          <div className="hidden sm:block ml-4">
            <StreakIndicator />
          </div>
        </div>

        {/* XP Progress (compact) - Desktop only */}
        <div className="hidden lg:block w-48 mr-4">
          <XPProgressBar compact />
        </div>

        <Toolbar onHelpClick={handleHelpClick} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        {/* Left Sidebar - Component Palette (Desktop) */}
        <aside className="hidden md:flex component-palette w-64 lg:w-72 border-r border-gray-800 dark:border-gray-800 light:border-circuit-light-border bg-gray-900/50 dark:bg-gray-900/50 light:bg-gray-50 flex-col">
          <ComponentPalette />
        </aside>

        {/* Canvas Area */}
        <section className="canvas-area flex-1 relative">
          <CircuitCanvas />
        </section>

        {/* Right Sidebar - Simulation Panel (Desktop) */}
        <aside className="hidden md:flex simulation-panel w-72 lg:w-80 border-l border-gray-800 dark:border-gray-800 light:border-circuit-light-border bg-gray-900/50 dark:bg-gray-900/50 light:bg-gray-50 flex-col">
          <SimulationPanel />
        </aside>
      </main>

      {/* Mobile Drawers */}
      <MobileDrawer
        isOpen={showComponentDrawer}
        onClose={() => {
          setShowComponentDrawer(false);
          setActiveTab('canvas');
        }}
        position="left"
        title="Components"
      >
        <ComponentPalette />
      </MobileDrawer>

      <MobileDrawer
        isOpen={showSimulationDrawer}
        onClose={() => {
          setShowSimulationDrawer(false);
          setActiveTab('canvas');
        }}
        position="bottom"
        title="Simulation"
      >
        <SimulationPanel />
      </MobileDrawer>

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Note: Other overlays temporarily disabled for debugging */}
      {/* <OnboardingFlow /> */}
      {/* <DailyRewardModalContainer /> */}
      {/* <TutorialLevelSelector /> */}
      {/* <TutorialConceptModal /> */}
      {/* <TutorialCompletionModal /> */}
      {/* {isInTutorialMode && <TutorialModeOverlay />} */}
      {/* <AchievementNotification /> */}
      {/* <ShareCircuitModal /> */}
      {/* <LeaderboardPanel /> */}
      {/* <UserProfileCard /> */}
    </div>
  );
}

export default App;
