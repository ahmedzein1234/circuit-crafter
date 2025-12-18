import { useEffect, useState } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import { CelebrationEffects } from './effects/CelebrationEffects';
import { useSoundEffects } from '../hooks/useSoundEffects';

// Achievement icons mapping
const ACHIEVEMENT_ICONS: Record<string, JSX.Element> = {
  zap: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  cable: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16m-7 5h7" />
    </svg>
  ),
  cpu: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  bolt: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
    </svg>
  ),
  shield: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  trophy: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  book: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  palette: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  star: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  award: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  flame: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.72 2.27-6.92 5.5-8.27A7.999 7.999 0 0012 1c0 3.31 2.69 6 6 6 0 2.21-1.79 4-4 4 0 1.66 1.34 3 3 3 1.66 0 3 1.34 3 3 0 3.31-2.69 6-6 6h-2v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1h-2z" />
    </svg>
  ),
};

export function AchievementNotification() {
  const { recentAchievement, dismissRecentAchievement } = useGamificationStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { play } = useSoundEffects();

  useEffect(() => {
    if (recentAchievement) {
      setIsVisible(true);
      setShowConfetti(true);
      play('achievement');

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(dismissRecentAchievement, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [recentAchievement, dismissRecentAchievement, play]);

  if (!recentAchievement) return null;

  const icon = ACHIEVEMENT_ICONS[recentAchievement.icon] || ACHIEVEMENT_ICONS.star;

  return (
    <>
      {showConfetti && (
        <CelebrationEffects
          trigger={showConfetti}
          type="confetti"
          onComplete={() => setShowConfetti(false)}
        />
      )}

      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-500/95 via-amber-500/95 to-orange-500/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-sm border border-yellow-400/50">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-xl opacity-50 -z-10" />

          <div className="flex items-center gap-4">
            {/* Icon with animation */}
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white animate-bounce">
              {icon}
            </div>

            <div className="flex-1">
              <div className="text-xs font-medium text-yellow-100 uppercase tracking-wider">
                Achievement Unlocked!
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {recentAchievement.name}
              </div>
              <div className="text-sm text-yellow-100 mt-1">
                {recentAchievement.description}
              </div>
            </div>
          </div>

          {/* XP reward badge */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <span className="text-yellow-200 text-sm">+{recentAchievement.xpReward} XP</span>
            </div>

            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(dismissRecentAchievement, 300);
              }}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
