import { useTutorialStore } from '../../stores/tutorialStore';
import { useCircuitStore } from '../../stores/circuitStore';
import { getLevelById, getChapterById } from '@circuit-crafter/shared';

export function TutorialCompletionModal() {
  const {
    showCompletionModal,
    dismissCompletionModal,
    lastCompletionResult,
    openLevelSelector,
    startLevel,
  } = useTutorialStore();

  const { clearCircuit, loadCircuit } = useCircuitStore();

  if (!showCompletionModal || !lastCompletionResult) return null;

  const level = getLevelById(lastCompletionResult.levelId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleNextLevel = () => {
    dismissCompletionModal();
    if (lastCompletionResult.unlockedLevelIds.length > 0) {
      const nextLevelId = lastCompletionResult.unlockedLevelIds[0];
      const starterCircuit = startLevel(nextLevelId);
      if (starterCircuit) {
        loadCircuit(starterCircuit.components, starterCircuit.wires);
      } else {
        clearCircuit();
      }
    } else {
      openLevelSelector();
    }
  };

  const handleBackToMenu = () => {
    dismissCompletionModal();
    clearCircuit();
    openLevelSelector();
  };

  const ratingConfig = {
    gold: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500',
      glow: 'shadow-yellow-500/50',
      label: 'Gold',
      message: 'Perfect! Outstanding performance!',
    },
    silver: {
      color: 'text-gray-300',
      bg: 'bg-gray-400',
      glow: 'shadow-gray-400/50',
      label: 'Silver',
      message: 'Great job! Well done!',
    },
    bronze: {
      color: 'text-amber-600',
      bg: 'bg-amber-600',
      glow: 'shadow-amber-600/50',
      label: 'Bronze',
      message: 'Level complete! Keep practicing!',
    },
  };

  const rating = ratingConfig[lastCompletionResult.rating];
  const totalXp = lastCompletionResult.xpEarned + lastCompletionResult.bonusXpEarned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti for gold rating */}
      {lastCompletionResult.rating === 'gold' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with celebration */}
        <div className="p-6 text-center bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700">
          <div className="relative inline-block">
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((star) => {
                const earned =
                  (lastCompletionResult.rating === 'gold' && star <= 3) ||
                  (lastCompletionResult.rating === 'silver' && star <= 2) ||
                  (lastCompletionResult.rating === 'bronze' && star <= 1);
                return (
                  <svg
                    key={star}
                    className={`w-12 h-12 transition-all duration-500 ${
                      earned
                        ? `${rating.color} drop-shadow-lg`
                        : 'text-gray-700'
                    }`}
                    style={{
                      animationDelay: `${star * 0.2}s`,
                    }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                );
              })}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Level Complete!</h2>
          <p className={`text-lg ${rating.color}`}>{rating.message}</p>
          {level && (
            <p className="text-sm text-gray-400 mt-2">{level.title}</p>
          )}
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          {/* XP Earned */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/10 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-yellow-400 font-semibold">XP Earned</span>
              </div>
              <span className="text-2xl font-bold text-yellow-400">+{totalXp}</span>
            </div>
            {lastCompletionResult.bonusXpEarned > 0 && (
              <div className="mt-2 text-sm text-yellow-600">
                Includes +{lastCompletionResult.bonusXpEarned} time bonus!
              </div>
            )}
            {lastCompletionResult.hintsUsed > 0 && (
              <div className="mt-1 text-sm text-yellow-700">
                -{lastCompletionResult.hintsUsed * 10}% from hints used
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Time */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-400">Time</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatTime(lastCompletionResult.timeSeconds)}
              </div>
              {lastCompletionResult.isNewBestTime && (
                <span className="text-xs text-green-400">New best!</span>
              )}
            </div>

            {/* Hints */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-xs text-gray-400">Hints Used</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {lastCompletionResult.hintsUsed}
              </div>
            </div>
          </div>

          {/* Unlocks */}
          {(lastCompletionResult.unlockedChapterId || lastCompletionResult.unlockedLevelIds.length > 0) && (
            <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span className="text-purple-400 font-semibold">Unlocked!</span>
              </div>
              {lastCompletionResult.unlockedChapterId && (
                <div className="text-sm text-purple-300">
                  New Chapter: {getChapterById(lastCompletionResult.unlockedChapterId)?.title}
                </div>
              )}
              {lastCompletionResult.unlockedLevelIds.length > 0 && (
                <div className="text-sm text-purple-300">
                  Next Level: {getLevelById(lastCompletionResult.unlockedLevelIds[0])?.title}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleBackToMenu}
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Back to Menu
          </button>
          {lastCompletionResult.unlockedLevelIds.length > 0 ? (
            <button
              onClick={handleNextLevel}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Next Level
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleBackToMenu}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
