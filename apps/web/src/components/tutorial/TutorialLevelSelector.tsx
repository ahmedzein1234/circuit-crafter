import { useEffect } from 'react';
import { TUTORIAL_CHAPTERS } from '@circuit-crafter/shared';
import { useTutorialStore } from '../../stores/tutorialStore';
import { useCircuitStore } from '../../stores/circuitStore';
import { TutorialChapterCard } from './TutorialChapterCard';

export function TutorialLevelSelector() {
  const {
    showLevelSelector,
    closeLevelSelector,
    chapterProgress,
    levelProgress,
    startLevel,
    getTotalProgress,
    getNextLevel,
  } = useTutorialStore();

  const { clearCircuit, loadCircuit } = useCircuitStore();

  const progress = getTotalProgress();
  const nextLevel = getNextLevel();

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLevelSelector) {
        closeLevelSelector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLevelSelector, closeLevelSelector]);

  const handleSelectLevel = (levelId: string) => {
    const starterCircuit = startLevel(levelId);

    // Clear canvas and load starter circuit if exists
    if (starterCircuit) {
      loadCircuit(starterCircuit.components, starterCircuit.wires);
    } else {
      clearCircuit();
    }
  };

  const handleContinue = () => {
    if (nextLevel) {
      handleSelectLevel(nextLevel.id);
    }
  };

  if (!showLevelSelector) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeLevelSelector}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                Tutorial Campaign
              </h2>
              <p className="text-gray-400 mt-1">
                Learn electronics through interactive challenges
              </p>
            </div>
            <button
              onClick={closeLevelSelector}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overall progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-white font-semibold">
                {progress.completed} / {progress.total} levels
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Continue button if there's a next level */}
        {nextLevel && (
          <div className="p-4 border-b border-gray-700 bg-blue-900/20">
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Continue: {nextLevel.title}
            </button>
          </div>
        )}

        {/* Chapters list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {TUTORIAL_CHAPTERS.map((chapter) => (
            <TutorialChapterCard
              key={chapter.id}
              chapter={chapter}
              chapterProgress={chapterProgress[chapter.id]}
              levelProgress={levelProgress}
              onSelectLevel={handleSelectLevel}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>Complete levels to earn XP and unlock new chapters</span>
            </div>
            <button
              onClick={closeLevelSelector}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
