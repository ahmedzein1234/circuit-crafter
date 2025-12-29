import { useState } from 'react';
import { useGamificationStore, ACHIEVEMENTS, Achievement } from '../stores/gamificationStore';

// Achievement rarity tiers
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  glow: string;
}> = {
  common: {
    label: 'Common',
    color: 'text-gray-400',
    bgGradient: 'from-gray-700 to-gray-800',
    borderColor: 'border-gray-600',
    glow: '',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-green-400',
    bgGradient: 'from-green-900/50 to-green-950/50',
    borderColor: 'border-green-700',
    glow: 'shadow-green-500/20',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/50 to-blue-950/50',
    borderColor: 'border-blue-600',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-400',
    bgGradient: 'from-purple-900/50 to-purple-950/50',
    borderColor: 'border-purple-500',
    glow: 'shadow-purple-500/40',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-900/30 via-orange-900/30 to-red-900/30',
    borderColor: 'border-yellow-500',
    glow: 'shadow-yellow-500/50',
  },
};

// Determine rarity based on XP reward
export function getAchievementRarity(achievement: Achievement): AchievementRarity {
  if (achievement.xpReward >= 200) return 'legendary';
  if (achievement.xpReward >= 100) return 'epic';
  if (achievement.xpReward >= 75) return 'rare';
  if (achievement.xpReward >= 50) return 'uncommon';
  return 'common';
}

// Achievement icon mapping
const ICON_MAP: Record<string, string> = {
  zap: '⚡',
  cable: '🔌',
  cpu: '🧠',
  bolt: '🔋',
  shield: '🛡️',
  lightbulb: '💡',
  trophy: '🏆',
  book: '📚',
  palette: '🎨',
  star: '⭐',
  award: '🥇',
  flame: '🔥',
};

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  onClick: () => void;
}

function AchievementCard({ achievement, isUnlocked, onClick }: AchievementCardProps) {
  const rarity = getAchievementRarity(achievement);
  const config = RARITY_CONFIG[rarity];
  const icon = ICON_MAP[achievement.icon] || '🎯';

  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isUnlocked
          ? `bg-gradient-to-br ${config.bgGradient} ${config.borderColor} shadow-lg ${config.glow}`
          : 'bg-gray-900/50 border-gray-800 opacity-60'
        }
        ${isUnlocked ? 'hover:scale-105 hover:shadow-xl' : 'hover:opacity-80'}
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
    >
      {/* Rarity indicator */}
      {isUnlocked && (
        <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${config.color} bg-gray-900 border ${config.borderColor}`}>
          {config.label}
        </div>
      )}

      {/* Icon */}
      <div className={`
        w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl
        ${isUnlocked
          ? `bg-gradient-to-br ${config.bgGradient}`
          : 'bg-gray-800'
        }
      `}>
        {isUnlocked ? icon : '🔒'}
      </div>

      {/* Name */}
      <div className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
        {achievement.name}
      </div>

      {/* XP reward */}
      <div className={`text-xs ${isUnlocked ? config.color : 'text-gray-600'}`}>
        +{achievement.xpReward} XP
      </div>

      {/* Locked overlay effect */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
      )}

      {/* Legendary shimmer effect */}
      {isUnlocked && rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-xl overflow-hidden" />
      )}
    </button>
  );
}

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  isUnlocked: boolean;
  onClose: () => void;
}

function AchievementDetailModal({ achievement, isUnlocked, onClose }: AchievementDetailModalProps) {
  if (!achievement) return null;

  const rarity = getAchievementRarity(achievement);
  const config = RARITY_CONFIG[rarity];
  const icon = ICON_MAP[achievement.icon] || '🎯';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`
          bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl
          border-2 ${config.borderColor} max-w-sm w-full overflow-hidden
          animate-modal-slide-in
        `}>
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${config.bgGradient} p-6 text-center relative`}>
            {/* Sparkle effects for legendary */}
            {rarity === 'legendary' && (
              <>
                <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute top-4 right-6 w-3 h-3 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                <div className="absolute bottom-4 left-8 w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
              </>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className={`
              w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl
              ${isUnlocked ? 'bg-gray-800/50' : 'bg-gray-800'}
              ${isUnlocked && rarity === 'legendary' ? 'animate-pulse' : ''}
            `}>
              {isUnlocked ? icon : '🔒'}
            </div>

            {/* Rarity badge */}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${config.color} bg-gray-900/50 mb-2`}>
              {config.label}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-white">{achievement.name}</h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Description */}
            <p className="text-gray-300 text-center">{achievement.description}</p>

            {/* Reward */}
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Reward</div>
              <div className={`text-2xl font-bold ${config.color}`}>
                +{achievement.xpReward} XP
              </div>
            </div>

            {/* Status */}
            <div className={`
              py-3 px-4 rounded-lg text-center font-semibold
              ${isUnlocked
                ? 'bg-green-900/30 text-green-400 border border-green-800'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700'
              }
            `}>
              {isUnlocked ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Unlocked!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Locked
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface AchievementGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementGallery({ isOpen, onClose }: AchievementGalleryProps) {
  const { unlockedAchievements } = useGamificationStore();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    const isUnlocked = unlockedAchievements.includes(a.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  // Sort by rarity (legendary first) then by unlock status
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = unlockedAchievements.includes(a.id);
    const bUnlocked = unlockedAchievements.includes(b.id);

    // Unlocked first
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;

    // Then by XP reward (higher = rarer = first)
    return b.xpReward - a.xpReward;
  });

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Gallery panel */}
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-gray-900 shadow-2xl border-l border-gray-800 animate-slide-in-bottom overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏆</span>
              Achievements
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-semibold">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={unlockedAchievements.includes(achievement.id)}
                onClick={() => setSelectedAchievement(achievement)}
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No achievements found for this filter.
            </div>
          )}
        </div>

        {/* Rarity legend */}
        <div className="p-4 bg-gray-800/50 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Rarity Tiers</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(RARITY_CONFIG).map(([rarity, config]) => (
              <span
                key={rarity}
                className={`px-2 py-1 rounded text-xs font-semibold ${config.color} bg-gray-800`}
              >
                {config.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          isUnlocked={unlockedAchievements.includes(selectedAchievement.id)}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </>
  );
}
