import { useEffect } from 'react';
import { useSocialStore } from '../../stores/socialStore';

const TIMEFRAME_OPTIONS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'allTime', label: 'All Time' },
] as const;

// Medal colors for top 3
const getMedalColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-amber-500';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-400';
    case 3:
      return 'bg-gradient-to-br from-orange-400 to-orange-600';
    default:
      return 'bg-gray-600';
  }
};

export function LeaderboardPanel() {
  const {
    isLeaderboardOpen,
    closeLeaderboard,
    leaderboard,
    leaderboardTimeframe,
    setLeaderboardTimeframe,
    refreshLeaderboard,
  } = useSocialStore();

  useEffect(() => {
    if (isLeaderboardOpen) {
      refreshLeaderboard();
    }
  }, [isLeaderboardOpen, refreshLeaderboard]);

  if (!isLeaderboardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              <p className="text-sm text-gray-400">Top Circuit Crafters</p>
            </div>
          </div>
          <button
            onClick={closeLeaderboard}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timeframe filters */}
        <div className="flex gap-2 p-4 border-b border-gray-700">
          {TIMEFRAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setLeaderboardTimeframe(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                leaderboardTimeframe === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-gray-700/50 ${
                  index < 3 ? 'bg-gray-700/30' : ''
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getMedalColor(
                    entry.rank
                  )}`}
                >
                  {entry.rank}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {entry.username.charAt(0).toUpperCase()}
                </div>

                {/* User info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{entry.username}</span>
                    <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded-full">
                      Lvl {entry.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span>{entry.totalXP.toLocaleString()} XP</span>
                    <span>{entry.circuitsCompleted} completed</span>
                    {entry.currentStreak > 0 && (
                      <span className="flex items-center gap-1 text-orange-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.72 2.27-6.92 5.5-8.27A7.999 7.999 0 0012 1c0 3.31 2.69 6 6 6 0 2.21-1.79 4-4 4 0 1.66 1.34 3 3 3 1.66 0 3 1.34 3 3 0 3.31-2.69 6-6 6h-2v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1h-2z" />
                        </svg>
                        {entry.currentStreak}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges preview */}
                <div className="flex -space-x-1">
                  {entry.badges.slice(0, 3).map((badge) => (
                    <div
                      key={badge}
                      className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center"
                      title={badge}
                    >
                      <span className="text-xs">
                        {badge === 'master' && '👑'}
                        {badge === 'streak_legend' && '🔥'}
                        {badge === 'creator' && '🎨'}
                        {badge === 'wizard' && '🧙'}
                        {badge === 'completionist' && '✓'}
                        {badge === 'innovator' && '💡'}
                        {badge === 'learner' && '📚'}
                        {badge === 'beginner' && '🌟'}
                      </span>
                    </div>
                  ))}
                  {entry.badges.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-400">
                      +{entry.badges.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p>No leaderboard data available</p>
            </div>
          )}
        </div>

        {/* Footer with your rank */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                ?
              </div>
              <div>
                <div className="text-sm text-gray-400">Your Rank</div>
                <div className="text-white font-semibold">Sign in to see your rank</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
