import { useCircuitStore } from '../stores/circuitStore';
import { useThemeStore } from '../stores/themeStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { useSandboxStore } from '../stores/sandboxStore';
import { useSocialStore } from '../stores/socialStore';
import { useCircuitsManagerStore } from '../stores/circuitsManagerStore';

interface ToolbarProps {
  onHelpClick: () => void;
  onTemplatesClick: () => void;
}

export function Toolbar({ onHelpClick, onTemplatesClick }: ToolbarProps) {
  const {
    clearCircuit,
    components,
    wires,
    showGrid,
    toggleGrid,
    selectedComponentId,
    selectedWireId,
    removeComponent,
    removeWire,
    rotateComponent,
  } = useCircuitStore();

  const { theme, toggleTheme } = useThemeStore();
  const { openLevelSelector, getTotalProgress, isInTutorialMode } = useTutorialStore();
  const { isSandboxMode, toggleSandboxMode } = useSandboxStore();
  const { openShareModal, openLeaderboard, openProfileModal } = useSocialStore();
  const {
    openSaveModal,
    openLoadModal,
    currentCircuitName,
    hasUnsavedChanges,
    isSaving,
  } = useCircuitsManagerStore();
  const tutorialProgress = getTotalProgress();

  const handleDelete = () => {
    if (selectedComponentId) {
      removeComponent(selectedComponentId);
    } else if (selectedWireId) {
      removeWire(selectedWireId);
    }
  };

  const handleRotate = () => {
    if (selectedComponentId) {
      rotateComponent(selectedComponentId);
    }
  };

  const hasSelection = selectedComponentId || selectedWireId;

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {/* Selection actions */}
      {hasSelection && (
        <div className="flex items-center gap-1 mr-1 md:mr-2 pr-1 md:pr-2 border-r border-gray-700 dark:border-gray-700 light:border-gray-300">
          {selectedComponentId && (
            <button
              onClick={handleRotate}
              className="min-w-touch-target md:min-w-11 min-h-touch-target md:min-h-11 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-200 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Rotate (R)"
              aria-label="Rotate selected component (R)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="min-w-touch-target md:min-w-11 min-h-touch-target md:min-h-11 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-200 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-red-400 dark:hover:text-red-400 light:hover:text-red-600 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Delete (Del)"
            aria-label="Delete selected component or wire (Delete)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Grid toggle */}
      <button
        onClick={toggleGrid}
        className={`min-w-11 min-h-11 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          showGrid
            ? 'bg-gray-700 text-white'
            : 'hover:bg-gray-800 text-gray-400 hover:text-white'
        }`}
        title="Toggle grid"
        aria-label={`${showGrid ? 'Hide' : 'Show'} grid`}
        aria-pressed={showGrid}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9h16M4 13h16M4 17h16M9 4v16M13 4v16M17 4v16"
          />
        </svg>
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="min-w-11 min-h-11 px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-200 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          // Sun icon for switching to light mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          // Moon icon for switching to dark mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      {/* Help button */}
      <button
        onClick={onHelpClick}
        className="min-w-11 min-h-11 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Keyboard shortcuts (?)"
        aria-label="View keyboard shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Sandbox Mode toggle */}
      {!isInTutorialMode && (
        <button
          onClick={toggleSandboxMode}
          className={`flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 ${
            isSandboxMode
              ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-500 hover:to-orange-500 text-white ring-amber-400'
              : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white ring-blue-500'
          }`}
          title={isSandboxMode ? 'Exit Sandbox Mode' : 'Enter Sandbox Mode - Free experimentation with all components'}
          aria-label={isSandboxMode ? 'Exit sandbox mode' : 'Enter sandbox mode'}
          aria-pressed={isSandboxMode}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <span className="hidden sm:inline">
            {isSandboxMode ? 'Sandbox ON' : 'Sandbox'}
          </span>
        </button>
      )}

      {/* Templates button */}
      <button
        onClick={onTemplatesClick}
        className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg bg-gradient-to-r from-cyan-600/80 to-teal-600/80 hover:from-cyan-600 hover:to-teal-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        title="Browse circuit templates"
        aria-label="Open circuit templates"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        <span className="hidden sm:inline">Templates</span>
      </button>

      {/* Tutorial button */}
      {!isInTutorialMode && (
        <button
          onClick={openLevelSelector}
          className="relative flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
          title="Open Tutorial"
          aria-label="Open tutorial campaign"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="hidden sm:inline">Tutorial</span>
          {tutorialProgress.total > 0 && (
            <span className="hidden sm:inline px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {tutorialProgress.completed}/{tutorialProgress.total}
            </span>
          )}
        </button>
      )}

      {/* Social features - Share, Leaderboard, Profile */}
      <div className="hidden md:flex items-center gap-1 ml-2 pl-2 border-l border-gray-700">
        {/* Share button */}
        <button
          onClick={openShareModal}
          disabled={components.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg bg-green-600/80 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          title="Share your circuit"
          aria-label="Share circuit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden lg:inline">Share</span>
        </button>

        {/* Leaderboard button */}
        <button
          onClick={openLeaderboard}
          className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg bg-yellow-600/80 hover:bg-yellow-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          title="View leaderboard"
          aria-label="View leaderboard"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="hidden lg:inline">Ranks</span>
        </button>

        {/* Profile button */}
        <button
          onClick={() => openProfileModal()}
          className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500"
          title="View your profile"
          aria-label="View profile"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden lg:inline">Profile</span>
        </button>
      </div>

      {/* Stats - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 light:text-gray-500 ml-2" role="status" aria-live="polite">
        <span>{components.length} components</span>
        <span>{wires.length} wires</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Current circuit indicator */}
      {currentCircuitName && (
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-gray-800/50 rounded-lg text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-gray-300 max-w-24 truncate">{currentCircuitName}</span>
          {hasUnsavedChanges && (
            <span className="w-2 h-2 bg-amber-500 rounded-full" title="Unsaved changes" />
          )}
        </div>
      )}

      {/* Open button */}
      <button
        onClick={openLoadModal}
        className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-touch-target md:min-h-11 text-mobile-xs md:text-sm font-medium bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-gray-300 dark:text-gray-300 light:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Open circuit (Ctrl+O)"
        aria-label="Open saved circuit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden lg:inline">Open</span>
      </button>

      {/* Save button */}
      <button
        onClick={openSaveModal}
        disabled={components.length === 0 || isSaving}
        className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-touch-target md:min-h-11 text-mobile-xs md:text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Save circuit (Ctrl+S)"
        aria-label="Save circuit"
      >
        {isSaving ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        )}
        <span className="hidden lg:inline">{hasUnsavedChanges ? 'Save*' : 'Save'}</span>
      </button>

      {/* Clear - Icon only on mobile */}
      <button
        onClick={clearCircuit}
        disabled={components.length === 0}
        className="px-2 md:px-3 py-2 min-h-touch-target md:min-h-11 text-mobile-xs md:text-sm font-medium bg-red-900/50 dark:bg-red-900/50 light:bg-red-100 hover:bg-red-900 dark:hover:bg-red-900 light:hover:bg-red-200 disabled:bg-gray-800 dark:disabled:bg-gray-800 light:disabled:bg-gray-200 disabled:text-gray-600 disabled:hover:scale-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-red-300 dark:text-red-300 light:text-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Clear circuit"
        aria-label="Clear all components and wires"
      >
        <span className="hidden sm:inline">Clear</span>
        <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
