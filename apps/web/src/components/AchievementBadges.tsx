import { useGamificationStore, ACHIEVEMENTS } from '../stores/gamificationStore';

const ICON_MAP: Record<string, string> = {
  zap: '⚡',
  cable: '🔌',
  cpu: '💻',
  bolt: '🔋',
  shield: '🛡️',
  lightbulb: '💡',
  trophy: '🏆',
  book: '📚',
  palette: '🎨',
  star: '⭐',
  award: '🏅',
  flame: '🔥',
};

export function AchievementBadges() {
  const { unlockedAchievements } = useGamificationStore();

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Achievements</h3>
        <span className="text-sm text-slate-400">
          {unlockedCount} / {totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          const icon = ICON_MAP[achievement.icon] || '🎖️';

          return (
            <div
              key={achievement.id}
              className={`relative group cursor-pointer transition-transform hover:scale-110 ${
                isUnlocked ? '' : 'grayscale opacity-50'
              }`}
              title={achievement.name}
            >
              {/* Badge */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                    : 'bg-slate-700'
                }`}
              >
                {icon}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-slate-900 rounded-lg p-3 shadow-xl border border-slate-700 w-48">
                  <div className="font-semibold text-white text-sm">{achievement.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{achievement.description}</div>
                  {!isUnlocked && (
                    <div className="text-xs text-yellow-400 mt-2">
                      +{achievement.xpReward} XP when unlocked
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="text-xs text-green-400 mt-2">
                      Unlocked! +{achievement.xpReward} XP
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
