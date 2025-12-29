import { useEffect, useState, useRef } from 'react';

interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

interface Firework {
  id: number;
  x: number;
  y: number;
  targetY: number;
  color: string;
  exploded: boolean;
  particles: FireworkParticle[];
}

interface FireworksEffectProps {
  active: boolean;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#eab308', // yellow
];

export function FireworksEffect({
  active,
  duration = 5000,
  colors = DEFAULT_COLORS,
  onComplete,
}: FireworksEffectProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const fireworkIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const createFirework = () => {
    const x = Math.random() * dimensions.width;
    const targetY = Math.random() * (dimensions.height * 0.4) + dimensions.height * 0.1;
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id: fireworkIdRef.current++,
      x,
      y: dimensions.height,
      targetY,
      color,
      exploded: false,
      particles: [],
    };
  };

  const explodeFirework = (firework: Firework): FireworkParticle[] => {
    const particles: FireworkParticle[] = [];
    const particleCount = 50 + Math.floor(Math.random() * 50);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      const size = 2 + Math.random() * 3;
      const maxLife = 60 + Math.random() * 40;

      particles.push({
        id: particleIdRef.current++,
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: firework.color,
        size,
        opacity: 1,
        life: maxLife,
        maxLife,
        trail: [],
      });
    }

    return particles;
  };

  useEffect(() => {
    if (!active) {
      setFireworks([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();

    // Launch fireworks at intervals
    const launchInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > duration) {
        clearInterval(launchInterval);
        if (onComplete) {
          setTimeout(onComplete, 2000); // Wait for particles to fade
        }
        return;
      }

      setFireworks((prev) => [...prev, createFirework()]);
    }, 400);

    // Animation loop
    const animate = () => {
      setFireworks((prev) => {
        return prev
          .map((firework) => {
            if (!firework.exploded) {
              // Move firework up
              const newY = firework.y - 6;

              if (newY <= firework.targetY) {
                // Explode
                return {
                  ...firework,
                  y: newY,
                  exploded: true,
                  particles: explodeFirework({ ...firework, y: newY }),
                };
              }

              return {
                ...firework,
                y: newY,
              };
            } else {
              // Update particles
              const updatedParticles = firework.particles
                .map((particle) => {
                  const trail = [...particle.trail, { x: particle.x, y: particle.y }];
                  if (trail.length > 5) trail.shift();

                  return {
                    ...particle,
                    x: particle.x + particle.vx,
                    y: particle.y + particle.vy,
                    vx: particle.vx * 0.98, // air resistance
                    vy: particle.vy + 0.15, // gravity
                    life: particle.life - 1,
                    opacity: particle.life / particle.maxLife,
                    trail,
                  };
                })
                .filter((particle) => particle.life > 0);

              if (updatedParticles.length === 0) {
                return null;
              }

              return {
                ...firework,
                particles: updatedParticles,
              };
            }
          })
          .filter((f): f is Firework => f !== null);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(launchInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, duration, dimensions, colors, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        {fireworks.map((firework) => (
          <g key={firework.id}>
            {!firework.exploded && (
              <>
                {/* Rocket trail */}
                <line
                  x1={firework.x}
                  y1={firework.y}
                  x2={firework.x}
                  y2={firework.y + 20}
                  stroke={firework.color}
                  strokeWidth="2"
                  opacity="0.6"
                  strokeLinecap="round"
                />
                {/* Rocket head */}
                <circle cx={firework.x} cy={firework.y} r="3" fill={firework.color} />
              </>
            )}

            {firework.exploded &&
              firework.particles.map((particle) => (
                <g key={particle.id}>
                  {/* Particle trail */}
                  {particle.trail.length > 1 && (
                    <polyline
                      points={particle.trail.map((p) => `${p.x},${p.y}`).join(' ')}
                      stroke={particle.color}
                      strokeWidth="1"
                      opacity={particle.opacity * 0.5}
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Particle */}
                  <circle
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size}
                    fill={particle.color}
                    opacity={particle.opacity}
                  />

                  {/* Glow */}
                  <circle
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size * 2}
                    fill={particle.color}
                    opacity={particle.opacity * 0.3}
                    filter="blur(2px)"
                  />
                </g>
              ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

// Star shower effect - simpler celebration
export function StarShowerEffect({ active, duration = 3000, onComplete }: {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}) {
  const [stars, setStars] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    speed: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!active) {
      setStars([]);
      return;
    }

    const colors = ['#fde047', '#facc15', '#f59e0b'];
    const starCount = 30;
    const newStars = [];

    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        size: 20 + Math.random() * 30,
        rotation: Math.random() * 360,
        speed: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setStars(newStars);

    const interval = setInterval(() => {
      setStars((prev) =>
        prev
          .map((star) => ({
            ...star,
            y: star.y + star.speed,
            rotation: star.rotation + star.speed * 2,
          }))
          .filter((star) => star.y < 110)
      );
    }, 16);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setStars([]);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active, duration, onComplete]);

  if (!active || stars.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `rotate(${star.rotation}deg)`,
            transition: 'all 0.016s linear',
          }}
        >
          <svg
            width={star.size}
            height={star.size}
            viewBox="0 0 24 24"
            fill={star.color}
            style={{
              filter: `drop-shadow(0 0 4px ${star.color})`,
            }}
          >
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
