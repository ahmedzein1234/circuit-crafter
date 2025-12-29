import { Group, Rect, Line } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface DiodeShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function DiodeShape({ component, isSelected, simulation }: DiodeShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.diode;
  const groupProps = getRotatableGroupProps(component, width, height);

  const isActive = simulation?.isActive ?? false;

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

      {/* Left wire (anode side) */}
      <Line
        points={[0, height / 2, 10, height / 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
      />

      {/* Triangle (pointing right - direction of current flow) */}
      <Line
        points={[
          10, 2,
          10, height - 2,
          width - 12, height / 2,
          10, 2,
        ]}
        fill={isActive ? '#22c55e' : '#6b7280'}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        closed
      />

      {/* Cathode bar */}
      <Line
        points={[width - 12, 2, width - 12, height - 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
      />

      {/* Right wire (cathode side) */}
      <Line
        points={[width - 12, height / 2, width, height / 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
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
