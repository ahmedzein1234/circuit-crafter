import { useTutorialStore } from '../../stores/tutorialStore';

export function TutorialStartButton() {
  const { openLevelSelector, getTotalProgress, getNextLevel } = useTutorialStore();
  const progress = getTotalProgress();
  const nextLevel = getNextLevel();

  return (
    <button
      onClick={openLevelSelector}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <span>Tutorial</span>
      {progress.total > 0 && (
        <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
          {progress.completed}/{progress.total}
        </span>
      )}
      {nextLevel && progress.completed < progress.total && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
      )}
    </button>
  );
}
