import { useEffect } from 'react';
import { useGamificationStore, type Achievement } from '../stores/gamificationStore';

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

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementPopup({ achievement, onDismiss }: AchievementPopupProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icon = ICON_MAP[achievement.icon] || '🎖️';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg shadow-2xl border border-purple-500 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="text-xs text-purple-300 uppercase tracking-wider mb-1">
              Achievement Unlocked!
            </div>
            <div className="text-lg font-bold text-white mb-1">
              {achievement.name}
            </div>
            <div className="text-sm text-purple-200 mb-2">
              {achievement.description}
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <span className="text-lg">+{achievement.xpReward}</span>
              <span className="text-sm">XP</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="text-purple-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AchievementNotifier() {
  const { recentAchievement, dismissRecentAchievement } = useGamificationStore();

  if (!recentAchievement) return null;

  return (
    <AchievementPopup
      achievement={recentAchievement}
      onDismiss={dismissRecentAchievement}
    />
  );
}
