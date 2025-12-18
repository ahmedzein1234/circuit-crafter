import { Group, Rect, Line, Circle, RegularPolygon } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult, LEDColor } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { useEffect, useRef } from 'react';
import type Konva from 'konva';

// LED color map
const LED_COLORS: Record<LEDColor, { base: string; glow: string }> = {
  red: { base: '#ef4444', glow: '#ff8888' },
  green: { base: '#22c55e', glow: '#86efac' },
  blue: { base: '#3b82f6', glow: '#93c5fd' },
  yellow: { base: '#eab308', glow: '#fde047' },
  white: { base: '#f8fafc', glow: '#ffffff' },
};

interface LEDShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function LEDShape({ component, isSelected, simulation }: LEDShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.led;
  const glowRef = useRef<Konva.Circle>(null);

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    updateComponentPosition(component.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const brightness = simulation?.brightness ?? 0;
  const isOverloaded = simulation?.isOverloaded ?? false;
  const isLit = brightness > 0.1;

  // Get LED color from properties (default red)
  const colorKey = ('color' in component.properties && component.properties.color as LEDColor) || 'red';
  const colors = LED_COLORS[colorKey];
  const ledColor = isOverloaded ? '#ef4444' : colors.base;
  const glowColor = isOverloaded ? '#ff6b6b' : colors.glow;

  // Pulsing glow animation
  useEffect(() => {
    if (!glowRef.current || !isLit) return;

    const node = glowRef.current;
    const baseOpacity = brightness * 0.4;
    const pulseRange = 0.2;

    const anim = new (window as any).Konva.Animation((frame: any) => {
      const period = 1000; // 1 second period
      const pulse = Math.sin((frame.time * 2 * Math.PI) / period) * pulseRange;
      node.opacity(baseOpacity + pulse);
    }, node.getLayer());

    anim.start();

    return () => {
      anim.stop();
    };
  }, [isLit, brightness]);

  return (
    <Group
      x={component.position.x}
      y={component.position.y}
      rotation={component.rotation}
      draggable
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.cancelBubble = true;
        selectComponent(component.id);
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={width + 10}
          height={height + 10}
          stroke="#3b82f6"
          strokeWidth={2}
          cornerRadius={4}
          dash={[5, 3]}
        />
      )}

      {/* Glow effect when lit */}
      {isLit && (
        <Circle
          ref={glowRef}
          x={width / 2}
          y={height / 2}
          radius={20 + brightness * 10}
          fill={glowColor}
          opacity={brightness * 0.4}
          shadowColor={glowColor}
          shadowBlur={30}
          listening={false}
        />
      )}

      {/* LED body - triangle/arrow shape pointing down */}
      <RegularPolygon
        x={width / 2}
        y={height / 2 - 5}
        sides={3}
        radius={12}
        rotation={180}
        fill={isLit ? ledColor : '#6b7280'}
        stroke="#374151"
        strokeWidth={2}
        opacity={isLit ? 0.7 + brightness * 0.3 : 1}
        shadowColor={isLit ? ledColor : undefined}
        shadowBlur={isLit ? 10 * brightness : 0}
      />

      {/* LED bar (cathode indicator) */}
      <Line
        points={[width / 2 - 10, height / 2 + 8, width / 2 + 10, height / 2 + 8]}
        stroke="#374151"
        strokeWidth={3}
        lineCap="round"
      />

      {/* Arrows indicating light emission */}
      {isLit && (
        <>
          <Line
            points={[width / 2 + 12, height / 2 - 8, width / 2 + 18, height / 2 - 14]}
            stroke={glowColor}
            strokeWidth={2}
            opacity={brightness}
            lineCap="round"
          />
          <Line
            points={[width / 2 + 14, height / 2 - 2, width / 2 + 22, height / 2 - 2]}
            stroke={glowColor}
            strokeWidth={2}
            opacity={brightness}
            lineCap="round"
          />
        </>
      )}

      {/* Overload indicator - sparks */}
      {isOverloaded && (
        <>
          <Line
            points={[width / 2 - 8, height / 2 - 15, width / 2 - 15, height / 2 - 25]}
            stroke="#fbbf24"
            strokeWidth={2}
          />
          <Line
            points={[width / 2 + 8, height / 2 - 15, width / 2 + 15, height / 2 - 25]}
            stroke="#fbbf24"
            strokeWidth={2}
          />
          <Circle
            x={width / 2}
            y={height / 2 - 20}
            radius={4}
            fill="#fbbf24"
          />
        </>
      )}

      {/* Terminals */}
      {component.terminals.map((terminal) => (
        <TerminalDot
          key={terminal.id}
          terminal={{
            ...terminal,
            position: {
              x: terminal.position.x - component.position.x,
              y: terminal.position.y - component.position.y,
            },
          }}
          componentId={component.id}
        />
      ))}
    </Group>
  );
}
