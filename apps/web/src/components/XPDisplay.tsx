import { useGamificationStore } from '../stores/gamificationStore';

export function XPDisplay() {
  const { level, currentLevelXP, xpForNextLevel, totalXP, currentStreak } = useGamificationStore();

  const progressPercent = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="bg-slate-800 rounded-lg p-3 space-y-2">
      {/* Level and XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{level}</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Level</div>
            <div className="text-sm font-semibold text-white">Engineer</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Total XP</div>
          <div className="text-sm font-semibold text-yellow-400">{totalXP}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress to Level {level + 1}</span>
          <span>{currentLevelXP} / {xpForNextLevel} XP</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-orange-400">🔥</span>
          <span className="text-sm text-slate-300">
            {currentStreak} day streak!
          </span>
        </div>
      )}
    </div>
  );
}
