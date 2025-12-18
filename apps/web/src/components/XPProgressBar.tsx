import { useGamificationStore } from '../stores/gamificationStore';

interface XPProgressBarProps {
  compact?: boolean;
}

export function XPProgressBar({ compact = false }: XPProgressBarProps) {
  const { level, currentLevelXP, xpForNextLevel, totalXP } = useGamificationStore();

  const progressPercent = Math.min((currentLevelXP / xpForNextLevel) * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Level badge */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
          {level}
        </div>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        {/* Level badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
            {level}
          </div>
          <div>
            <div className="text-sm text-gray-400">Level</div>
            <div className="text-lg font-bold text-white">
              {level < 5 ? 'Beginner' : level < 10 ? 'Apprentice' : level < 15 ? 'Expert' : 'Master'}
            </div>
          </div>
        </div>

        {/* XP count */}
        <div className="text-right">
          <div className="text-sm text-gray-400">Total XP</div>
          <div className="text-lg font-bold text-blue-400">{totalXP.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{currentLevelXP} XP</span>
          <span>{xpForNextLevel} XP</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-1">
          {xpForNextLevel - currentLevelXP} XP to Level {level + 1}
        </div>
      </div>
    </div>
  );
}
