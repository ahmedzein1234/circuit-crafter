import { useEffect, useState } from 'react';
import { useDailyChallengeStore } from '../stores/dailyChallengeStore';
import { useGamificationStore } from '../stores/gamificationStore';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyRewardModal({ isOpen, onClose }: DailyRewardModalProps) {
  const {
    weeklyRewards,
    progress,
    currentChallenge,
    claimDailyReward,
    getTotalXP,
    getStreakBonus,
  } = useDailyChallengeStore();

  const { addXP } = useGamificationStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const canClaim = progress.lastClaimDate !== today;
  const currentDay = Math.min(progress.streak > 0 ? progress.streak : 1, 7);
  const todayReward = weeklyRewards.find(r => r.day === currentDay);
  const streakBonus = getStreakBonus();

  useEffect(() => {
    if (isOpen && !hasClaimedToday) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasClaimedToday]);

  const handleClaim = () => {
    if (!canClaim) return;

    // Claim the daily reward
    claimDailyReward();

    // If challenge is completed, award the XP
    if (progress.challengeCompleted) {
      const totalXP = getTotalXP();
      addXP(totalXP, 'Daily Challenge Completed');
    }

    // Award daily login reward
    if (todayReward) {
      addXP(todayReward.xp, 'Daily Login Reward');
    }

    setHasClaimedToday(true);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
      setTimeout(() => {
        onClose();
      }, 500);
    }, 2000);
  };

  if (!isOpen) return null;

  const nextDayReward = weeklyRewards.find(r => r.day === Math.min(currentDay + 1, 7));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rewards-title"
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-t-xl relative overflow-hidden">
            {showCelebration && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-yellow-400/20 to-orange-400/20" aria-hidden="true" />
            )}
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-0 right-0 min-w-11 min-h-11 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close daily rewards dialog"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <h2 id="rewards-title" className="text-2xl font-bold text-white">Daily Rewards</h2>
                  <p className="text-purple-200">Log in daily to claim escalating rewards!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Streak Info */}
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🔥</div>
                  <div>
                    <p className="text-sm text-gray-400">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-400">{progress.streak} {progress.streak === 1 ? 'Day' : 'Days'}</p>
                  </div>
                </div>
                {streakBonus > 1.0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Challenge Bonus</p>
                    <p className="text-2xl font-bold text-yellow-400">{streakBonus.toFixed(2)}x</p>
                  </div>
                )}
              </div>
            </div>

            {/* 7-Day Calendar */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Weekly Rewards
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyRewards.map((reward) => {
                  const isToday = reward.day === currentDay;
                  const isClaimed = reward.claimed;
                  const isPast = reward.day < currentDay && !isClaimed;
                  const isFuture = reward.day > currentDay;

                  return (
                    <div
                      key={reward.day}
                      className={`
                        relative aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                        transition-all duration-300
                        ${isToday && !isClaimed ? 'bg-gradient-to-br from-blue-600 to-purple-600 ring-4 ring-blue-400 animate-pulse' : ''}
                        ${isToday && isClaimed ? 'bg-gradient-to-br from-green-600 to-emerald-600' : ''}
                        ${isClaimed && !isToday ? 'bg-green-900/30 border border-green-700' : ''}
                        ${isPast ? 'bg-gray-800/50 border border-gray-700 opacity-50' : ''}
                        ${isFuture ? 'bg-gray-800/30 border border-gray-700' : ''}
                      `}
                    >
                      {/* Day number */}
                      <div className={`text-xs font-semibold mb-1 ${
                        isToday ? 'text-white' :
                        isClaimed ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        Day {reward.day}
                      </div>

                      {/* XP amount */}
                      <div className={`text-sm font-bold ${
                        isToday ? 'text-yellow-300' :
                        isClaimed ? 'text-green-300' :
                        'text-gray-500'
                      }`}>
                        {reward.xp}
                      </div>
                      <div className={`text-xs ${
                        isToday ? 'text-yellow-200' :
                        isClaimed ? 'text-green-200' :
                        'text-gray-600'
                      }`}>
                        XP
                      </div>

                      {/* Checkmark for claimed */}
                      {isClaimed && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      {/* Today indicator */}
                      {isToday && !isClaimed && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <span className="text-xs">!</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Challenge Summary */}
            {currentChallenge && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Today's Challenge</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{currentChallenge.title}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      currentChallenge.difficulty === 'easy' ? 'bg-green-500 text-white' :
                      currentChallenge.difficulty === 'medium' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {currentChallenge.difficulty}
                    </span>
                  </div>
                  {progress.challengeCompleted ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">Completed!</span>
                      <span className="text-yellow-400 ml-auto">+{getTotalXP()} XP</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{currentChallenge.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Claim Button */}
            <div className="space-y-3">
              {canClaim ? (
                <button
                  onClick={handleClaim}
                  disabled={hasClaimedToday}
                  className={`
                    w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${hasClaimedToday
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 active:scale-95 shadow-lg'
                    }
                  `}
                  aria-label={hasClaimedToday ? 'Reward claimed' : `Claim ${todayReward?.xp || 0} XP reward`}
                >
                  {hasClaimedToday ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reward Claimed!
                    </div>
                  ) : (
                    `Claim ${todayReward?.xp || 0} XP`
                  )}
                </button>
              ) : (
                <div className="w-full py-4 bg-gray-700 text-gray-400 rounded-lg font-bold text-lg text-center" role="status">
                  Already Claimed Today
                </div>
              )}

              {/* Next day teaser */}
              {nextDayReward && canClaim && !hasClaimedToday && (
                <div className="text-center text-sm text-gray-400">
                  Come back tomorrow for {nextDayReward.xp} XP!
                </div>
              )}

              {/* Streak warning */}
              {progress.streak > 2 && canClaim && !hasClaimedToday && (
                <div className="bg-orange-900/20 border border-orange-800/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-orange-400">
                    Don't break your {progress.streak}-day streak! Come back tomorrow.
                  </p>
                </div>
              )}
            </div>

            {/* Completion celebration */}
            {showCelebration && hasClaimedToday && (
              <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className="animate-scale-in">
                  <div className="text-8xl animate-bounce">🎉</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Wrapper component to handle modal state from store
export function DailyRewardModalContainer() {
  const { showRewardModal, dismissRewardModal } = useDailyChallengeStore();

  return (
    <DailyRewardModal
      isOpen={showRewardModal}
      onClose={dismissRewardModal}
    />
  );
}
