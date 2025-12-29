import { useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

interface CelebrationEffectsProps {
  trigger: boolean;
  type?: 'confetti' | 'sparkles' | 'xp';
  onComplete?: () => void;
}

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899'];

export function CelebrationEffects({ trigger, type = 'confetti', onComplete }: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const count = type === 'confetti' ? 50 : type === 'sparkles' ? 20 : 10;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: type === 'xp' ? 50 : Math.random() * 100,
        y: type === 'xp' ? 50 : -10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: type === 'sparkles' ? Math.random() * 8 + 4 : Math.random() * 10 + 5,
        velocity: {
          x: (Math.random() - 0.5) * (type === 'xp' ? 4 : 6),
          y: type === 'xp' ? -Math.random() * 3 - 2 : Math.random() * 3 + 2,
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
      });
    }

    setParticles(newParticles);
  }, [type]);

  useEffect(() => {
    if (!trigger) return;

    // Skip particle animations if user prefers reduced motion
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    createParticles();

    const interval = setInterval(() => {
      setParticles((prev) => {
        const updated = prev.map((p) => ({
          ...p,
          x: p.x + p.velocity.x * 0.5,
          y: p.y + p.velocity.y * 0.5,
          velocity: {
            x: p.velocity.x * 0.98,
            y: p.velocity.y + 0.15, // gravity
          },
          rotation: p.rotation + p.rotationSpeed,
          opacity: p.opacity - 0.015,
        })).filter((p) => p.opacity > 0 && p.y < 120);

        if (updated.length === 0 && onComplete) {
          onComplete();
        }

        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [trigger, createParticles, onComplete, prefersReducedMotion]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: type === 'sparkles' ? 'transparent' : particle.color,
            borderRadius: type === 'confetti' ? '2px' : '50%',
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            boxShadow: type === 'sparkles'
              ? `0 0 ${particle.size}px ${particle.color}, 0 0 ${particle.size * 2}px ${particle.color}`
              : 'none',
          }}
        >
          {type === 'sparkles' && (
            <svg
              viewBox="0 0 24 24"
              fill={particle.color}
              className="w-full h-full"
            >
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// XP gain floating text effect
interface XPGainEffectProps {
  amount: number;
  onComplete?: () => void;
}

export function XPGainEffect({ amount, onComplete }: XPGainEffectProps) {
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({ y: 0, opacity: 1 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion, show briefly then hide
    if (prefersReducedMotion) {
      const timeout = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setPosition((prev) => ({
        y: prev.y - 2,
        opacity: prev.opacity - 0.02,
      }));
    }, 16);

    const timeout = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete, prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-50 text-2xl font-bold text-yellow-400"
      style={{
        transform: prefersReducedMotion ? 'translate(-50%, 0)' : `translate(-50%, ${position.y}px)`,
        opacity: prefersReducedMotion ? 1 : position.opacity,
        textShadow: '0 0 10px rgba(234, 179, 8, 0.5)',
      }}
    >
      +{amount} XP
    </div>
  );
}

// Level up effect
interface LevelUpEffectProps {
  level: number;
  onComplete?: () => void;
}

export function LevelUpEffect({ level, onComplete }: LevelUpEffectProps) {
  const [visible, setVisible] = useState(true);
  const [scale, setScale] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip scaling animation if reduced motion is preferred
    if (prefersReducedMotion) {
      setScale(1);
      const hide = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(hide);
    }

    // Animate in
    const scaleIn = setTimeout(() => setScale(1), 50);

    // Animate out
    const scaleOut = setTimeout(() => {
      setScale(0);
    }, 2500);

    const hide = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(scaleIn);
      clearTimeout(scaleOut);
      clearTimeout(hide);
    };
  }, [onComplete, prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`text-center ${prefersReducedMotion ? '' : 'transition-all duration-500 ease-out'}`}
        style={{
          transform: prefersReducedMotion ? 'scale(1)' : `scale(${scale})`,
          opacity: prefersReducedMotion ? 1 : scale,
        }}
      >
        <div className={`text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent ${prefersReducedMotion ? '' : 'animate-pulse'}`}>
          LEVEL UP!
        </div>
        <div className="text-4xl font-bold text-white mt-2">
          Level {level}
        </div>
      </div>
    </div>
  );
}
