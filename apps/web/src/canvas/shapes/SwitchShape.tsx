import { Group, Rect, Line, Circle } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';
import { useEffect, useRef, useState } from 'react';
import type Konva from 'konva';

interface SwitchShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function SwitchShape({ component, isSelected, simulation }: SwitchShapeProps) {
  const { selectComponent, updateComponentPosition, toggleSwitch } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.switch;
  const groupProps = getRotatableGroupProps(component, width, height);
  const leverRef = useRef<Konva.Line>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const isOpen = (component.properties as { isOpen?: boolean }).isOpen ?? true;
  const prevIsOpenRef = useRef(isOpen);

  // Smooth toggle animation
  useEffect(() => {
    if (prevIsOpenRef.current !== isOpen) {
      setIsAnimating(true);
      setAnimationProgress(0);

      const duration = 300; // ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setAnimationProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevIsOpenRef.current = isOpen;
        }
      };

      animate();
    }
  }, [isOpen]);

  const handleDoubleClick = (e: { cancelBubble: boolean }) => {
    e.cancelBubble = true;
    toggleSwitch(component.id);
  };

  const isPowered = simulation?.state === 'closed' || (!isOpen && simulation?.current !== undefined && simulation.current > 0);

  // Calculate lever position with animation
  const targetYOffset = isOpen ? -12 : 0;
  const currentYOffset = isAnimating
    ? prevIsOpenRef.current
      ? -12 + (12 * animationProgress)
      : 0 - (12 * animationProgress)
    : targetYOffset;

  // Add bounce effect during animation
  const bounceScale = isAnimating ? 1 + Math.sin(animationProgress * Math.PI) * 0.1 : 1;

  return (
    <Group
      {...groupProps}
      draggable
      onDragEnd={(e) => {
        const pos = adjustDragEndPosition(e.target.x(), e.target.y(), width, height);
        updateComponentPosition(component.id, pos);
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        selectComponent(component.id);
      }}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
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

      {/* Switch base line */}
      <Line
        points={[0, height / 2, width, height / 2]}
        stroke="#4b5563"
        strokeWidth={3}
        lineCap="round"
      />

      {/* Contact points with glow when powered */}
      <Circle
        x={8}
        y={height / 2}
        radius={4}
        fill={isPowered ? '#22c55e' : '#6b7280'}
        stroke="#374151"
        strokeWidth={2}
        shadowColor={isPowered ? '#22c55e' : undefined}
        shadowBlur={isPowered ? 8 : 0}
      />
      <Circle
        x={width - 8}
        y={height / 2}
        radius={4}
        fill={isPowered ? '#22c55e' : '#6b7280'}
        stroke="#374151"
        strokeWidth={2}
        shadowColor={isPowered ? '#22c55e' : undefined}
        shadowBlur={isPowered ? 8 : 0}
      />

      {/* Switch lever with smooth animation */}
      <Line
        ref={leverRef}
        points={[8, height / 2, width - 8, height / 2 + currentYOffset]}
        stroke={isPowered ? '#22c55e' : '#9ca3af'}
        strokeWidth={4}
        lineCap="round"
        shadowColor={isPowered ? '#22c55e' : undefined}
        shadowBlur={isPowered ? 6 : 0}
      />

      {/* Lever handle with animation */}
      <Circle
        x={width - 8}
        y={height / 2 + currentYOffset}
        radius={5 * bounceScale}
        fill="#f8fafc"
        stroke="#374151"
        strokeWidth={2}
        shadowColor={isAnimating ? '#3b82f6' : undefined}
        shadowBlur={isAnimating ? 10 : 0}
      />

      {/* State label */}
      <Rect
        x={width / 2 - 15}
        y={height + 4}
        width={30}
        height={14}
        fill={isOpen ? '#374151' : '#22c55e'}
        cornerRadius={3}
      />
      <Line
        x={0}
        y={0}
        points={[]}
      />

      {/* Hint text */}
      <Rect
        x={0}
        y={height + 4}
        width={width}
        height={12}
        listening={false}
      />

      {/* Terminals */}
      {component.terminals.map((terminal) => (
        <TerminalDot
          key={terminal.id}
          terminal={{
            ...terminal,
            position: getLocalTerminalPosition(terminal, component, width, height),
          }}
          componentId={component.id}
        />
      ))}
    </Group>
  );
}
