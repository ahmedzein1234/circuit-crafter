import { Group, Rect, Line, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS, formatSI } from '@circuit-crafter/shared';
import { useEffect, useRef } from 'react';
import type Konva from 'konva';

interface ResistorShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function ResistorShape({ component, isSelected, simulation }: ResistorShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.resistor;
  const heatGlowRef = useRef<Konva.Line>(null);

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    updateComponentPosition(component.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const isPowered = simulation?.current !== undefined && simulation.current > 0.0001;
  const isOverloaded = simulation?.isOverloaded ?? false;
  const power = simulation?.power ?? 0;

  // Zigzag pattern for resistor
  const zigzagPoints = [
    0, height / 2,
    10, height / 2,
    15, 0,
    25, height,
    35, 0,
    45, height,
    50, height / 2,
    width, height / 2,
  ];

  // Heat glow animation based on power dissipation
  useEffect(() => {
    if (!heatGlowRef.current || !isPowered || power < 0.001) return;

    const node = heatGlowRef.current;
    const baseOpacity = Math.min(power * 0.3, 0.5);
    const pulseRange = 0.1;

    const anim = new (window as any).Konva.Animation((frame: any) => {
      const period = 2000; // 2 second period for slower heat pulse
      const pulse = Math.sin((frame.time * 2 * Math.PI) / period) * pulseRange;
      node.opacity(baseOpacity + pulse);
    }, node.getLayer());

    anim.start();

    return () => {
      anim.stop();
    };
  }, [isPowered, power]);

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
          y={-10}
          width={width + 10}
          height={height + 20}
          stroke="#3b82f6"
          strokeWidth={2}
          cornerRadius={4}
          dash={[5, 3]}
        />
      )}

      {/* Heat glow effect when dissipating power */}
      {isPowered && power > 0.001 && !isOverloaded && (
        <Line
          ref={heatGlowRef}
          points={zigzagPoints}
          stroke="#ff6b35"
          strokeWidth={8}
          opacity={Math.min(power * 0.3, 0.5)}
          shadowColor="#ff6b35"
          shadowBlur={15}
          listening={false}
        />
      )}

      {/* Overload glow effect */}
      {isOverloaded && (
        <Line
          points={zigzagPoints}
          stroke="#ef4444"
          strokeWidth={8}
          opacity={0.5}
          shadowColor="#ef4444"
          shadowBlur={10}
          listening={false}
        />
      )}

      {/* Resistor zigzag shape */}
      <Line
        points={zigzagPoints}
        stroke={isOverloaded ? '#ef4444' : isPowered ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
      />

      {/* Resistance label */}
      <Text
        x={0}
        y={height + 6}
        width={width}
        text={formatSI((component.properties as { resistance?: number }).resistance ?? 1000, 'Ω', 0)}
        fontSize={10}
        fill="#9ca3af"
        align="center"
      />

      {/* Simulation values */}
      {isPowered && simulation && (
        <Text
          x={0}
          y={-16}
          width={width}
          text={`${simulation.current.toFixed(3)}A`}
          fontSize={9}
          fill="#22c55e"
          align="center"
        />
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
