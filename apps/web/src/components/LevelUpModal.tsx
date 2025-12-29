import { useEffect, useState, useCallback } from 'react';
import { CelebrationEffects } from './effects/CelebrationEffects';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

// Level titles and their descriptions
const LEVEL_TITLES: Record<number, { title: string; description: string; color: string }> = {
  1: { title: 'Beginner', description: 'Welcome to Circuit Crafter!', color: 'from-gray-400 to-gray-600' },
  2: { title: 'Tinkerer', description: 'You\'re getting the hang of it!', color: 'from-green-400 to-emerald-600' },
  3: { title: 'Builder', description: 'Your circuits are taking shape!', color: 'from-blue-400 to-blue-600' },
  4: { title: 'Technician', description: 'Skilled hands at work!', color: 'from-cyan-400 to-cyan-600' },
  5: { title: 'Apprentice Engineer', description: 'A promising engineer emerges!', color: 'from-purple-400 to-purple-600' },
  6: { title: 'Circuit Designer', description: 'Creating complex designs!', color: 'from-pink-400 to-pink-600' },
  7: { title: 'Electronics Expert', description: 'Mastering the fundamentals!', color: 'from-orange-400 to-orange-600' },
  8: { title: 'Innovator', description: 'Pushing the boundaries!', color: 'from-red-400 to-red-600' },
  9: { title: 'Master Builder', description: 'True expertise achieved!', color: 'from-yellow-400 to-amber-600' },
  10: { title: 'Circuit Master', description: 'A legend in the making!', color: 'from-indigo-400 to-violet-600' },
};

function getLevelInfo(level: number) {
  if (level >= 15) return { title: 'Grandmaster', description: 'The pinnacle of circuit mastery!', color: 'from-yellow-300 via-orange-500 to-red-600' };
  if (level >= 10) return LEVEL_TITLES[10];
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
}

// Confetti particle for the modal
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
}

export function LevelUpModal({ isOpen, level, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'idle'>('enter');
  const prefersReducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap(isOpen);

  const levelInfo = getLevelInfo(level);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const createConfetti = useCallback(() => {
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6,
        velocity: {
          x: (Math.random() - 0.5) * 15,
          y: -Math.random() * 15 - 5,
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
      });
    }

    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setAnimationPhase('enter');
      setParticles([]);
      return;
    }

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      setAnimationPhase('idle');
      return;
    }

    // Animation sequence
    setShowConfetti(true);
    setAnimationPhase('enter');

    const celebrateTimer = setTimeout(() => {
      setAnimationPhase('celebrate');
      createConfetti();
    }, 300);

    const idleTimer = setTimeout(() => {
      setAnimationPhase('idle');
    }, 1500);

    return () => {
      clearTimeout(celebrateTimer);
      clearTimeout(idleTimer);
    };
  }, [isOpen, createConfetti, prefersReducedMotion]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.velocity.x * 0.3,
          y: p.y + p.velocity.y * 0.3,
          velocity: {
            x: p.velocity.x * 0.98,
            y: p.velocity.y + 0.5,
          },
          rotation: p.rotation + p.rotationSpeed,
        })).filter(p => p.y < 120);

        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length > 0]);

  if (!isOpen) return null;

  return (
    <>
      {/* Global confetti effect */}
      <CelebrationEffects trigger={showConfetti} type="confetti" />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Confetti particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '2px' : '50%',
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={focusTrapRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
          className={`
            pointer-events-auto relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
            rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full overflow-hidden
            transform transition-all duration-500
            ${animationPhase === 'enter' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}
          `}
        >
          {/* Animated background glow */}
          <div className={`absolute inset-0 bg-gradient-to-r ${levelInfo.color} opacity-20 animate-pulse`} />

          {/* Sparkle decorations */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-12 left-8 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          <div className="absolute bottom-20 right-4 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close level up dialog"
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Trophy icon */}
            <div className={`
              w-24 h-24 mx-auto mb-4 rounded-full
              bg-gradient-to-br ${levelInfo.color}
              flex items-center justify-center
              shadow-lg shadow-yellow-500/30
              ${animationPhase === 'celebrate' ? 'animate-bounce' : ''}
            `}>
              <span className="text-5xl">🏆</span>
            </div>

            {/* Level up text */}
            <h2
              id="level-up-title"
              className={`
                text-3xl font-black mb-2
                bg-gradient-to-r ${levelInfo.color} bg-clip-text text-transparent
                ${animationPhase === 'celebrate' ? 'animate-pulse' : ''}
              `}
            >
              LEVEL UP!
            </h2>

            {/* Level number */}
            <div className="relative mb-4">
              <div className={`
                text-8xl font-black
                bg-gradient-to-b ${levelInfo.color} bg-clip-text text-transparent
                drop-shadow-lg
              `}>
                {level}
              </div>
              {/* Glow effect behind number */}
              <div className={`
                absolute inset-0 text-8xl font-black blur-xl opacity-50
                bg-gradient-to-b ${levelInfo.color} bg-clip-text text-transparent
              `}>
                {level}
              </div>
            </div>

            {/* Title */}
            <div className="text-2xl font-bold text-white mb-2">
              {levelInfo.title}
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-6">
              {levelInfo.description}
            </p>

            {/* Stats unlocked */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2">Unlocked at this level:</div>
              <div className="flex justify-center gap-4">
                {level >= 3 && (
                  <div className="flex items-center gap-2 text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">New Components</span>
                  </div>
                )}
                {level >= 5 && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Advanced Challenges</span>
                  </div>
                )}
                {level < 3 && (
                  <div className="text-gray-500 text-sm">Keep leveling up to unlock rewards!</div>
                )}
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={onClose}
              className={`
                w-full py-4 rounded-xl font-bold text-lg
                bg-gradient-to-r ${levelInfo.color}
                text-white shadow-lg
                transform transition-all duration-200
                hover:scale-105 hover:shadow-xl
                active:scale-95
              `}
            >
              Continue Building!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Container that connects to gamification store
import { useGamificationStore } from '../stores/gamificationStore';

export function LevelUpModalContainer() {
  const [showModal, setShowModal] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(1);
  const { level } = useGamificationStore();
  const prevLevelRef = useState(level)[0];

  useEffect(() => {
    // Detect level up
    if (level > prevLevelRef) {
      setDisplayLevel(level);
      setShowModal(true);
    }
  }, [level, prevLevelRef]);

  return (
    <LevelUpModal
      isOpen={showModal}
      level={displayLevel}
      onClose={() => setShowModal(false)}
    />
  );
}
