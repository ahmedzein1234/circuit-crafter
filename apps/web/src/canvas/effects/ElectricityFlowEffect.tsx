import { useEffect, useState, useRef } from 'react';
import { Group, Circle, Line } from 'react-konva';

interface ElectricBolt {
  id: number;
  points: number[];
  opacity: number;
  color: string;
}

interface ElectricityFlowEffectProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  active: boolean;
  intensity?: number; // 0-1 for current intensity
  color?: string;
}

export function ElectricityFlowEffect({
  fromX,
  fromY,
  toX,
  toY,
  active,
  intensity = 0.5,
  color = '#00ff88',
}: ElectricityFlowEffectProps) {
  const [bolts, setBolts] = useState<ElectricBolt[]>([]);
  const [pulseScale, setPulseScale] = useState(1);
  const boltIdRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Generate lightning bolts along the wire
  const generateBolt = () => {
    const segments = 5 + Math.floor(Math.random() * 3);
    const points: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;

      // Add some randomness for lightning effect
      const offset = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 8 * intensity;
      const perpX = -(toY - fromY);
      const perpY = toX - fromX;
      const len = Math.sqrt(perpX * perpX + perpY * perpY);

      points.push(x + (perpX / len) * offset);
      points.push(y + (perpY / len) * offset);
    }

    return {
      id: boltIdRef.current++,
      points,
      opacity: 0.6 + Math.random() * 0.4,
      color: color,
    };
  };

  useEffect(() => {
    if (!active) {
      setBolts([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Pulse animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const pulse = Math.sin(elapsed / 200) * 0.15 + 1;
      setPulseScale(pulse);

      // Fade out bolts
      setBolts((prev) =>
        prev
          .map((b) => ({ ...b, opacity: b.opacity - 0.05 }))
          .filter((b) => b.opacity > 0)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Generate new bolts periodically
    const boltInterval = setInterval(() => {
      if (Math.random() < 0.3 + intensity * 0.5) {
        setBolts((prev) => {
          const newBolts = [...prev, generateBolt()];
          return newBolts.slice(-3); // Keep only last 3 bolts
        });
      }
    }, 100 - intensity * 50);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(boltInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, intensity, fromX, fromY, toX, toY, color]);

  if (!active) return null;

  return (
    <Group>
      {/* Main glow at endpoints */}
      <Circle
        x={fromX}
        y={fromY}
        radius={4 * intensity * pulseScale}
        fill={color}
        opacity={0.4}
        shadowColor={color}
        shadowBlur={12}
        listening={false}
      />
      <Circle
        x={toX}
        y={toY}
        radius={4 * intensity * pulseScale}
        fill={color}
        opacity={0.4}
        shadowColor={color}
        shadowBlur={12}
        listening={false}
      />

      {/* Lightning bolts */}
      {bolts.map((bolt) => (
        <Line
          key={bolt.id}
          points={bolt.points}
          stroke={bolt.color}
          strokeWidth={1.5 + intensity}
          opacity={bolt.opacity * intensity}
          lineCap="round"
          lineJoin="round"
          shadowColor={bolt.color}
          shadowBlur={8}
          listening={false}
        />
      ))}
    </Group>
  );
}

// Pulsing energy orb that travels along a path
interface EnergyOrbProps {
  path: number[]; // Array of x,y coordinates
  active: boolean;
  speed?: number;
  color?: string;
  size?: number;
}

export function EnergyOrb({ path, active, speed = 1, color = '#00ff88', size = 6 }: EnergyOrbProps) {
  const [position, setPosition] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!active || path.length < 4) {
      return;
    }

    const animate = () => {
      setPosition((prev) => {
        const newPos = prev + speed * 0.01;
        return newPos > 1 ? 0 : newPos;
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, speed, path]);

  if (!active || path.length < 4) return null;

  // Calculate position along path
  const getPointAlongPath = (t: number) => {
    const segments = (path.length - 2) / 2;
    const segment = Math.floor(t * segments);
    const segmentT = (t * segments) - segment;

    const idx = segment * 2;
    if (idx + 3 >= path.length) {
      return { x: path[path.length - 2], y: path[path.length - 1] };
    }

    const x = path[idx] + (path[idx + 2] - path[idx]) * segmentT;
    const y = path[idx + 1] + (path[idx + 3] - path[idx + 1]) * segmentT;

    return { x, y };
  };

  const point = getPointAlongPath(position);
  const pulse = Math.sin(position * Math.PI * 8) * 0.3 + 1;

  return (
    <Group>
      <Circle
        x={point.x}
        y={point.y}
        radius={size * pulse}
        fill={color}
        opacity={0.8}
        shadowColor={color}
        shadowBlur={15}
        listening={false}
      />
      <Circle
        x={point.x}
        y={point.y}
        radius={size * pulse * 0.5}
        fill="#ffffff"
        opacity={0.6}
        listening={false}
      />
    </Group>
  );
}
