import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  speed?: number;
  interactive?: boolean;
}

export function ParticleBackground({
  particleCount = 30,
  colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
  speed = 0.5,
  interactive = true,
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Initialize particles
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const initialParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(initialParticles);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [particleCount, colors, speed]);

  // Mouse interaction
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          // Interactive mouse repulsion
          if (interactive) {
            const dx = mousePositionRef.current.x - particle.x;
            const dy = mousePositionRef.current.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              const force = (100 - distance) / 100;
              newX -= (dx / distance) * force * 2;
              newY -= (dy / distance) * force * 2;
            }
          }

          // Wrap around screen edges
          if (newX < 0) newX = dimensions.width;
          if (newX > dimensions.width) newX = 0;
          if (newY < 0) newY = dimensions.height;
          if (newY > dimensions.height) newY = 0;

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length, dimensions, interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        {/* Connection lines between nearby particles */}
        {particles.map((particle, i) =>
          particles.slice(i + 1).map((other) => {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              const opacity = (1 - distance / 150) * 0.2;
              return (
                <line
                  key={`${particle.id}-${other.id}`}
                  x1={particle.x}
                  y1={particle.y}
                  x2={other.x}
                  y2={other.y}
                  stroke={particle.color}
                  strokeWidth="1"
                  opacity={opacity}
                />
              );
            }
            return null;
          })
        )}

        {/* Particles */}
        {particles.map((particle) => (
          <g key={particle.id}>
            {/* Glow effect */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * 2}
              fill={particle.color}
              opacity={particle.opacity * 0.3}
              filter="blur(2px)"
            />
            {/* Core particle */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={particle.opacity}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Floating grid background animation
export function AnimatedGridBackground() {
  const [offset, setOffset] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setOffset((prev) => (prev + 0.2) % 40);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            x={offset}
            y={offset}
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-400"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// Glowing orbs that float around
export function FloatingOrbs() {
  const orbs = [
    { color: '#3b82f6', delay: 0, duration: 20 },
    { color: '#8b5cf6', delay: 5, duration: 25 },
    { color: '#06b6d4', delay: 10, duration: 22 },
    { color: '#10b981', delay: 15, duration: 18 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb, index) => (
        <div
          key={index}
          className="absolute w-96 h-96 rounded-full opacity-5 animate-float blur-3xl"
          style={{
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 80}%`,
            backgroundColor: orb.color,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
