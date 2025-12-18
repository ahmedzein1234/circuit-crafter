import { Group, Rect, Circle, Line, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { useEffect, useRef, useState } from 'react';
import type Konva from 'konva';

interface MotorShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function MotorShape({ component, isSelected, simulation }: MotorShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.motor;
  const shaftGroupRef = useRef<Konva.Group>(null);
  const [rotation, setRotation] = useState(0);

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    updateComponentPosition(component.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const isActive = simulation?.isActive ?? false;
  const speed = simulation?.brightness ?? 0; // Use brightness as speed indicator

  // Rotation animation
  useEffect(() => {
    if (!isActive || speed < 0.1) {
      return;
    }

    const rotationSpeed = 2 + speed * 8; // Degrees per frame (faster with more speed)
    let animationFrameId: number;

    const animate = () => {
      setRotation((prev) => (prev + rotationSpeed) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, speed]);

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

      {/* Motor body (circle) */}
      <Circle
        x={width / 2}
        y={height / 2}
        radius={width / 2 - 2}
        fill={isActive ? '#dbeafe' : '#f8fafc'}
        stroke={isActive ? '#3b82f6' : '#374151'}
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />

      {/* M label */}
      <Text
        x={width / 2 - 8}
        y={height / 2 - 8}
        text="M"
        fontSize={16}
        fontStyle="bold"
        fill={isActive ? '#3b82f6' : '#374151'}
      />

      {/* Rotating shaft indicator */}
      {isActive && (
        <Group
          ref={shaftGroupRef}
          x={width / 2}
          y={height / 2}
          rotation={rotation}
        >
          <Line
            points={[0, 0, 12, -12]}
            stroke="#3b82f6"
            strokeWidth={2}
            lineCap="round"
          />
          <Line
            points={[0, 0, -12, 12]}
            stroke="#3b82f6"
            strokeWidth={2}
            lineCap="round"
          />
          {/* Additional shaft line for visual effect */}
          <Line
            points={[0, 0, 12, 12]}
            stroke="#60a5fa"
            strokeWidth={1.5}
            lineCap="round"
            opacity={0.6}
          />
          <Line
            points={[0, 0, -12, -12]}
            stroke="#60a5fa"
            strokeWidth={1.5}
            lineCap="round"
            opacity={0.6}
          />
        </Group>
      )}

      {/* Center dot for shaft */}
      {isActive && (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={3}
          fill="#3b82f6"
          shadowColor="#3b82f6"
          shadowBlur={6}
        />
      )}

      {/* Speed indicator */}
      {isActive && speed > 0 && (
        <Text
          x={0}
          y={height + 4}
          width={width}
          text={`${Math.round(speed * 100)}%`}
          fontSize={9}
          fill="#3b82f6"
          align="center"
        />
      )}

      {/* + symbol */}
      <Text
        x={width / 2 - 4}
        y={-12}
        text="+"
        fontSize={12}
        fontStyle="bold"
        fill="#ef4444"
      />

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
