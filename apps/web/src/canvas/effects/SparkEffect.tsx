import { useEffect, useState, useRef } from 'react';
import { Group, Line, Circle } from 'react-konva';

interface Spark {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  opacity: number;
  color: string;
}

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface SparkEffectProps {
  x: number;
  y: number;
  active: boolean;
  intensity?: number; // 0-1 for how intense the sparks should be
}

export function SparkEffect({ x, y, active, intensity = 0.5 }: SparkEffectProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [particles, setParticles] = useState<SparkParticle[]>([]);
  const sparkIdRef = useRef(0);
  const animationRef = useRef<number>();

  // Spark colors (yellow to red gradient for electrical sparks)
  const sparkColors = ['#fde047', '#facc15', '#fb923c', '#f97316', '#ef4444'];

  useEffect(() => {
    if (!active) {
      setSparks([]);
      setParticles([]);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const generateSpark = () => {
      const numSparks = Math.floor(3 + intensity * 6); // More sparks
      const numParticles = Math.floor(5 + intensity * 10); // More particles

      // Generate lightning-like sparks with branching
      const newSparks: Spark[] = [];
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 12 + Math.random() * 20 * intensity; // Longer sparks
        newSparks.push({
          id: sparkIdRef.current++,
          startX: 0,
          startY: 0,
          endX: Math.cos(angle) * length,
          endY: Math.sin(angle) * length,
          opacity: 0.8 + Math.random() * 0.2,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        });

        // Add branching sparks for more visual impact
        if (Math.random() < 0.4 * intensity) {
          const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
          const branchLength = length * 0.6;
          newSparks.push({
            id: sparkIdRef.current++,
            startX: Math.cos(angle) * length * 0.5,
            startY: Math.sin(angle) * length * 0.5,
            endX: Math.cos(angle) * length * 0.5 + Math.cos(branchAngle) * branchLength,
            endY: Math.sin(angle) * length * 0.5 + Math.sin(branchAngle) * branchLength,
            opacity: 0.6 + Math.random() * 0.2,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          });
        }
      }

      // Generate particle sparks with varied sizes
      const newParticles: SparkParticle[] = [];
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4 * intensity; // Faster particles
        newParticles.push({
          id: sparkIdRef.current++,
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5, // stronger upward bias
          radius: 1 + Math.random() * 3, // Larger particles
          opacity: 1,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        });
      }

      setSparks(newSparks);
      setParticles((prev) => [...prev, ...newParticles]);
    };

    // Generate sparks at intervals based on intensity (more frequent)
    const sparkInterval = setInterval(generateSpark, 150 - intensity * 80);

    // Animate particles
    const animate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.98, // air resistance
            vy: p.vy + 0.3, // stronger gravity
            opacity: p.opacity - 0.04, // slower fade
          }))
          .filter((p) => p.opacity > 0)
      );

      // Fade out spark lines
      setSparks((prev) =>
        prev
          .map((s) => ({ ...s, opacity: s.opacity - 0.12 })) // slower fade for more visibility
          .filter((s) => s.opacity > 0)
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(sparkInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <Group x={x} y={y}>
      {/* Lightning-like spark lines */}
      {sparks.map((spark) => (
        <Line
          key={spark.id}
          points={[spark.startX, spark.startY, spark.endX, spark.endY]}
          stroke={spark.color}
          strokeWidth={2}
          opacity={spark.opacity}
          shadowColor={spark.color}
          shadowBlur={5}
          shadowOpacity={0.8}
        />
      ))}

      {/* Particle sparks */}
      {particles.map((particle) => (
        <Circle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          radius={particle.radius}
          fill={particle.color}
          opacity={particle.opacity}
          shadowColor={particle.color}
          shadowBlur={4}
          shadowOpacity={0.6}
        />
      ))}

      {/* Central glow for overloaded component - enhanced with pulsing layers */}
      <Circle
        x={0}
        y={0}
        radius={12 + intensity * 6}
        fill="#ef4444"
        opacity={0.15 + Math.sin(Date.now() / 100) * 0.1}
        shadowColor="#ef4444"
        shadowBlur={20}
        shadowOpacity={0.8}
      />
      <Circle
        x={0}
        y={0}
        radius={8 + intensity * 4}
        fill="transparent"
        stroke="#ef4444"
        strokeWidth={3}
        opacity={0.4 + Math.sin(Date.now() / 100) * 0.3}
        shadowColor="#ef4444"
        shadowBlur={15}
        shadowOpacity={0.6}
      />
      <Circle
        x={0}
        y={0}
        radius={5 + intensity * 2}
        fill="#fde047"
        opacity={0.5 + Math.sin(Date.now() / 80) * 0.3}
        shadowColor="#fde047"
        shadowBlur={10}
        shadowOpacity={0.8}
      />
    </Group>
  );
}
