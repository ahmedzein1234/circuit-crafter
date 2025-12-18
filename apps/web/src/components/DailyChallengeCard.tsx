import { useEffect, useState } from 'react';
import { useDailyChallengeStore, getTimeUntilReset } from '../stores/dailyChallengeStore';

const DIFFICULTY_CONFIG = {
  easy: {
    color: 'bg-green-500',
    textColor: 'text-green-400',
    borderColor: 'border-green-500',
    bgGradient: 'from-green-900/30 to-green-800/10',
  },
  medium: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    bgGradient: 'from-yellow-900/30 to-yellow-800/10',
  },
  hard: {
    color: 'bg-red-500',
    textColor: 'text-red-400',
    borderColor: 'border-red-500',
    bgGradient: 'from-red-900/30 to-red-800/10',
  },
};

export function DailyChallengeCard() {
  const {
    currentChallenge,
    progress,
    communityStats,
    startChallenge,
    getStreakBonus,
  } = useDailyChallengeStore();

  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilReset());

  // Update countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilReset());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!currentChallenge) {
    return null;
  }

  const difficultyConfig = DIFFICULTY_CONFIG[currentChallenge.difficulty];
  const streakBonus = getStreakBonus();
  const completionPercentage = communityStats.totalUsers > 0
    ? Math.round((communityStats.completedToday / communityStats.totalUsers) * 100)
    : 0;

  const completedObjectives = currentChallenge.objectives.filter(obj => obj.completed).length;
  const totalObjectives = currentChallenge.objectives.length;
  const objectiveProgress = (completedObjectives / totalObjectives) * 100;

  const handleStartChallenge = () => {
    startChallenge();
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${difficultyConfig.bgGradient} border-b ${difficultyConfig.borderColor} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Challenge</h3>
              <p className="text-xs text-gray-400">Complete for bonus XP</p>
            </div>
          </div>
          <div className={`px-2 py-1 ${difficultyConfig.color} rounded text-xs font-bold text-white uppercase`}>
            {currentChallenge.difficulty}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Resets in {String(timeUntilReset.hours).padStart(2, '0')}:{String(timeUntilReset.minutes).padStart(2, '0')}:{String(timeUntilReset.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Challenge Details */}
      <div className="p-4 space-y-4">
        {/* Title and Description */}
        <div>
          <h4 className="text-base font-bold text-white mb-1">{currentChallenge.title}</h4>
          <p className="text-sm text-gray-400">{currentChallenge.description}</p>
        </div>

        {/* Objectives Progress */}
        {progress.challengeStarted && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedObjectives} / {totalObjectives} objectives</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${objectiveProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Objectives List */}
        {progress.challengeStarted && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase">Objectives</p>
            {currentChallenge.objectives.map((objective) => (
              <div key={objective.id} className="flex items-start gap-2">
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                  objective.completed ? 'bg-green-500' : 'bg-gray-700'
                }`}>
                  {objective.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${objective.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                  {objective.description}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bonus Objectives */}
        {progress.challengeStarted && currentChallenge.bonusObjectives.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-yellow-400 uppercase">Bonus Objectives</p>
            {currentChallenge.bonusObjectives.map((bonus) => (
              <div key={bonus.id} className="flex items-start gap-2">
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                  bonus.completed ? 'bg-yellow-500' : 'bg-gray-700'
                }`}>
                  {bonus.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${bonus.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                    {bonus.description}
                  </span>
                  <span className="ml-2 text-xs text-yellow-400">+{bonus.xpBonus} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reward Preview */}
        <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Base Reward</span>
            <span className="text-sm font-semibold text-yellow-400">{currentChallenge.baseXP} XP</span>
          </div>
          {streakBonus > 1.0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                Streak Bonus
                <span className="text-orange-400">{streakBonus.toFixed(2)}x</span>
              </span>
              <span className="text-sm font-semibold text-orange-400">
                +{Math.floor(currentChallenge.baseXP * (streakBonus - 1))} XP
              </span>
            </div>
          )}
          {currentChallenge.bonusObjectives.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Available Bonuses</span>
              <span className="text-sm font-semibold text-yellow-400">
                +{currentChallenge.bonusObjectives.reduce((sum, b) => sum + b.xpBonus, 0)} XP
              </span>
            </div>
          )}
        </div>

        {/* Community Stats */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-semibold text-blue-400">Community Stats</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Completed Today</span>
              <span className="text-blue-400 font-semibold">
                {communityStats.completedToday} ({completionPercentage}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Time</span>
              <span className="text-blue-400 font-semibold">
                {Math.floor(communityStats.averageTime / 60)}m {communityStats.averageTime % 60}s
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!progress.challengeStarted ? (
          <button
            onClick={handleStartChallenge}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Challenge
          </button>
        ) : progress.challengeCompleted ? (
          <div className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Challenge Completed!
            </div>
          </div>
        ) : (
          <div className="w-full py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg text-center">
            In Progress...
          </div>
        )}
      </div>
    </div>
  );
}
