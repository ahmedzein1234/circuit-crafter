import { Group, Rect, Line, Circle } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';

interface SwitchShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function SwitchShape({ component, isSelected, simulation }: SwitchShapeProps) {
  const { selectComponent, updateComponentPosition, toggleSwitch } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.switch;

  const isOpen = (component.properties as { isOpen?: boolean }).isOpen ?? true;

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    updateComponentPosition(component.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleDoubleClick = (e: { cancelBubble: boolean }) => {
    e.cancelBubble = true;
    toggleSwitch(component.id);
  };

  const isPowered = simulation?.state === 'closed' || (!isOpen && simulation?.current !== undefined && simulation.current > 0);

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

      {/* Contact points */}
      <Circle
        x={8}
        y={height / 2}
        radius={4}
        fill={isPowered ? '#22c55e' : '#6b7280'}
        stroke="#374151"
        strokeWidth={2}
      />
      <Circle
        x={width - 8}
        y={height / 2}
        radius={4}
        fill={isPowered ? '#22c55e' : '#6b7280'}
        stroke="#374151"
        strokeWidth={2}
      />

      {/* Switch lever */}
      <Line
        points={
          isOpen
            ? [8, height / 2, width - 8, height / 2 - 12]
            : [8, height / 2, width - 8, height / 2]
        }
        stroke={isPowered ? '#22c55e' : '#9ca3af'}
        strokeWidth={4}
        lineCap="round"
      />

      {/* Lever handle */}
      <Circle
        x={isOpen ? width - 8 : width - 8}
        y={isOpen ? height / 2 - 12 : height / 2}
        radius={5}
        fill="#f8fafc"
        stroke="#374151"
        strokeWidth={2}
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
