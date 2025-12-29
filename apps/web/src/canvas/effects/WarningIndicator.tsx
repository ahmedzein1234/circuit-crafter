import { Group, Circle, Line } from 'react-konva';
import { useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { SimulationWarning } from '@circuit-crafter/shared';

interface WarningIndicatorProps {
  x: number; // Position relative to component
  y: number;
  warnings: SimulationWarning[];
}

export function WarningIndicator({ x, y, warnings }: WarningIndicatorProps) {
  const circleRef = useRef<Konva.Circle>(null);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  // Determine highest severity
  const hasError = warnings.some((w) => w.severity === 'error');
  const hasWarning = warnings.some((w) => w.severity === 'warning');

  let color = '#3b82f6'; // blue for info
  if (hasWarning) color = '#eab308'; // yellow for warning
  if (hasError) color = '#ef4444'; // red for error

  // Pulsing animation
  useEffect(() => {
    if (!circleRef.current) return;

    const node = circleRef.current;
    const anim = new (window as any).Konva.Animation((frame: any) => {
      const period = 1500; // 1.5 second period
      const scale = 1 + Math.sin((frame.time * 2 * Math.PI) / period) * 0.2;
      node.scaleX(scale);
      node.scaleY(scale);
    }, node.getLayer());

    anim.start();

    return () => {
      anim.stop();
    };
  }, []);

  return (
    <Group x={x} y={y}>
      {/* Glow effect */}
      <Circle
        ref={circleRef}
        radius={8}
        fill={color}
        opacity={0.3}
        shadowColor={color}
        shadowBlur={15}
        listening={false}
      />

      {/* Warning icon circle */}
      <Circle
        radius={6}
        fill={color}
        stroke="#1f2937"
        strokeWidth={1.5}
        listening={false}
      />

      {/* Exclamation mark */}
      <Line
        points={[0, -2, 0, 1]}
        stroke="#1f2937"
        strokeWidth={1.5}
        lineCap="round"
        listening={false}
      />
      <Circle
        y={3}
        radius={0.5}
        fill="#1f2937"
        listening={false}
      />
    </Group>
  );
}
