import { useSocialStore } from '../../stores/socialStore';

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-amber-500',
};

export function UserProfileCard() {
  const { isProfileModalOpen, closeProfileModal, viewedProfile } = useSocialStore();

  if (!isProfileModalOpen || !viewedProfile) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header with gradient background */}
        <div className="relative h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <button
            onClick={closeProfileModal}
            className="absolute top-3 right-3 p-1.5 bg-black/30 text-white hover:bg-black/50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Avatar - positioned to overlap header */}
        <div className="relative px-6">
          <div className="absolute -top-10 left-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-800 shadow-lg">
              {viewedProfile.displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="pt-12 px-6 pb-6">
          {/* Name and level */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-white">{viewedProfile.displayName}</h2>
              <p className="text-sm text-gray-400">@{viewedProfile.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-medium">
                Level {viewedProfile.level}
              </div>
            </div>
          </div>

          {/* Bio */}
          {viewedProfile.bio && (
            <p className="text-gray-300 text-sm mb-4">{viewedProfile.bio}</p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-700/50 rounded-lg">
              <div className="text-xl font-bold text-white">{viewedProfile.totalXP.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total XP</div>
            </div>
            <div className="text-center p-3 bg-gray-700/50 rounded-lg">
              <div className="text-xl font-bold text-white">{viewedProfile.circuitsCreated}</div>
              <div className="text-xs text-gray-400">Created</div>
            </div>
            <div className="text-center p-3 bg-gray-700/50 rounded-lg">
              <div className="text-xl font-bold text-white">{viewedProfile.circuitsCompleted}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
          </div>

          {/* Streak stats */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-gray-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.72 2.27-6.92 5.5-8.27A7.999 7.999 0 0012 1c0 3.31 2.69 6 6 6 0 2.21-1.79 4-4 4 0 1.66 1.34 3 3 3 1.66 0 3 1.34 3 3 0 3.31-2.69 6-6 6h-2v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1h-2z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">{viewedProfile.currentStreak} days</div>
                <div className="text-xs text-gray-400">Current streak</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-600" />
            <div>
              <div className="text-white font-semibold">{viewedProfile.longestStreak} days</div>
              <div className="text-xs text-gray-400">Best streak</div>
            </div>
            <div className="h-8 w-px bg-gray-600" />
            <div>
              <div className="text-white font-semibold">{viewedProfile.totalLikes}</div>
              <div className="text-xs text-gray-400">Total likes</div>
            </div>
          </div>

          {/* Badges */}
          {viewedProfile.badges.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {viewedProfile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${RARITY_COLORS[badge.rarity]} rounded-full text-white text-sm`}
                    title={badge.description}
                  >
                    <span className="text-base">
                      {badge.icon === 'zap' && '⚡'}
                      {badge.icon === 'flame' && '🔥'}
                      {badge.icon === 'trophy' && '🏆'}
                      {badge.icon === 'star' && '⭐'}
                    </span>
                    <span className="font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Join date */}
          <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-700">
            Joined {formatDate(viewedProfile.joinedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
