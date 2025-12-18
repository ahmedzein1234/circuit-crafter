import type { TutorialLevel, TutorialProgress, ProgressRating } from '@circuit-crafter/shared';

interface TutorialLevelCardProps {
  level: TutorialLevel;
  progress?: TutorialProgress;
  isUnlocked: boolean;
  onSelect: (levelId: string) => void;
}

const RATING_STARS: Record<ProgressRating, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
};

export function TutorialLevelCard({
  level,
  progress,
  isUnlocked,
  onSelect,
}: TutorialLevelCardProps) {
  const isCompleted = progress?.completed ?? false;
  const rating = progress?.rating;

  return (
    <button
      onClick={() => isUnlocked && onSelect(level.id)}
      disabled={!isUnlocked}
      className={`
        relative w-full p-3 rounded-lg border text-left transition-all duration-200
        ${
          isUnlocked
            ? isCompleted
              ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30'
              : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-blue-500'
            : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Level number badge */}
            <span
              className={`
                flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                ${isCompleted ? 'bg-green-500 text-white' : isUnlocked ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'}
              `}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                level.order
              )}
            </span>
            <h4 className={`font-medium truncate ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
              {level.title}
            </h4>
          </div>
          <p className={`text-xs mt-1 line-clamp-2 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
            {level.description}
          </p>
        </div>

        {/* Lock icon or stars */}
        <div className="flex-shrink-0">
          {!isUnlocked ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ) : isCompleted && rating ? (
            <div className="flex gap-0.5">
              {[1, 2, 3].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= RATING_STARS[rating] ? 'text-yellow-400' : 'text-gray-600'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* XP and time info */}
      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className={`flex items-center gap-1 ${isUnlocked ? 'text-yellow-400' : 'text-gray-600'}`}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          {level.xpReward} XP
        </span>
        {level.timeBonusThresholdSeconds && (
          <span className={`flex items-center gap-1 ${isUnlocked ? 'text-blue-400' : 'text-gray-600'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {Math.floor(level.timeBonusThresholdSeconds / 60)}:{String(level.timeBonusThresholdSeconds % 60).padStart(2, '0')}
          </span>
        )}
        {progress?.bestTimeSeconds && (
          <span className="flex items-center gap-1 text-green-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {Math.floor(progress.bestTimeSeconds / 60)}:{String(Math.floor(progress.bestTimeSeconds % 60)).padStart(2, '0')}
          </span>
        )}
      </div>
    </button>
  );
}
