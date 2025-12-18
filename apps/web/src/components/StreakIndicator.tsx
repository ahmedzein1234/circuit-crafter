import { useGamificationStore } from '../stores/gamificationStore';
import { useEffect } from 'react';

export function StreakIndicator() {
  const { currentStreak, updateStreak } = useGamificationStore();

  // Update streak on mount
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  if (currentStreak === 0) return null;

  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (currentStreak >= 30) return 'text-purple-500'; // Purple fire for 30+ days
    if (currentStreak >= 14) return 'text-blue-500'; // Blue fire for 14+ days
    if (currentStreak >= 7) return 'text-orange-500'; // Orange fire for 7+ days
    return 'text-red-500'; // Red fire for less than 7 days
  };

  const getFlameSize = () => {
    if (currentStreak >= 30) return 'w-6 h-6';
    if (currentStreak >= 14) return 'w-5 h-5';
    if (currentStreak >= 7) return 'w-5 h-5';
    return 'w-4 h-4';
  };

  const getGlowColor = () => {
    if (currentStreak >= 30) return 'shadow-purple-500/50';
    if (currentStreak >= 14) return 'shadow-blue-500/50';
    if (currentStreak >= 7) return 'shadow-orange-500/50';
    return 'shadow-red-500/50';
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 backdrop-blur shadow-lg ${getGlowColor()} hover:scale-105 transition-transform cursor-default`}
      title={`${currentStreak} day streak! Keep it up!`}
    >
      {/* Animated flame icon */}
      <div className={`${getFlameColor()} ${getFlameSize()} animate-pulse`}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.72 2.27-6.92 5.5-8.27A7.999 7.999 0 0012 1c0 3.31 2.69 6 6 6 0 2.21-1.79 4-4 4 0 1.66 1.34 3 3 3 1.66 0 3 1.34 3 3 0 3.31-2.69 6-6 6h-2v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1h-2z" />
        </svg>
      </div>

      {/* Streak count */}
      <span className="text-sm font-bold text-white">
        {currentStreak}
      </span>

      {/* Day text */}
      <span className="text-xs text-gray-400 hidden sm:inline">
        day{currentStreak !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

// Compact version for mobile
export function StreakBadge() {
  const { currentStreak } = useGamificationStore();

  if (currentStreak === 0) return null;

  const getColor = () => {
    if (currentStreak >= 30) return 'bg-purple-500';
    if (currentStreak >= 14) return 'bg-blue-500';
    if (currentStreak >= 7) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={`${getColor()} text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse`}
      title={`${currentStreak} day streak`}
    >
      {currentStreak}
    </div>
  );
}
