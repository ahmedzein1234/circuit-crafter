import { Group, Rect, Line, Circle, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface TransistorShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function TransistorShape({ component, isSelected, simulation }: TransistorShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.transistor;
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

      {/* Transistor circle outline */}
      <Circle
        x={width / 2}
        y={height / 2}
        radius={18}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        fill="#f8fafc"
      />

      {/* Base line (vertical bar) */}
      <Line
        points={[width / 2 - 4, height / 2 - 10, width / 2 - 4, height / 2 + 10]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
      />

      {/* Base connection */}
      <Line
        points={[0, height / 2, width / 2 - 4, height / 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        lineCap="round"
      />

      {/* Collector line (diagonal up) */}
      <Line
        points={[width / 2 - 4, height / 2 - 6, width / 2 + 8, height / 2 - 14]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        lineCap="round"
      />

      {/* Collector connection */}
      <Line
        points={[width / 2, 0, width / 2, height / 2 - 14]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        lineCap="round"
      />

      {/* Emitter line (diagonal down with arrow) */}
      <Line
        points={[width / 2 - 4, height / 2 + 6, width / 2 + 8, height / 2 + 14]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        lineCap="round"
      />

      {/* Emitter arrow */}
      <Line
        points={[
          width / 2 + 4, height / 2 + 16,
          width / 2 + 8, height / 2 + 14,
          width / 2 + 2, height / 2 + 10,
        ]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        lineCap="round"
        lineJoin="round"
      />

      {/* Emitter connection */}
      <Line
        points={[width / 2, height, width / 2, height / 2 + 14]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={2}
        lineCap="round"
      />

      {/* Labels */}
      <Text x={-8} y={height / 2 - 6} text="B" fontSize={9} fill="#6b7280" />
      <Text x={width / 2 + 4} y={-8} text="C" fontSize={9} fill="#6b7280" />
      <Text x={width / 2 + 4} y={height - 4} text="E" fontSize={9} fill="#6b7280" />

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
