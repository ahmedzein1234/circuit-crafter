import { Group, Rect, Line } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface GroundShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function GroundShape({ component, isSelected }: GroundShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.ground;
  const groupProps = getRotatableGroupProps(component, width, height);

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

      {/* Vertical line from terminal */}
      <Line
        points={[width / 2, 0, width / 2, 8]}
        stroke="#374151"
        strokeWidth={3}
        lineCap="round"
      />

      {/* Ground symbol - horizontal lines */}
      <Line
        points={[4, 8, width - 4, 8]}
        stroke="#374151"
        strokeWidth={3}
        lineCap="round"
      />
      <Line
        points={[8, 14, width - 8, 14]}
        stroke="#374151"
        strokeWidth={3}
        lineCap="round"
      />
      <Line
        points={[12, 20, width - 12, 20]}
        stroke="#374151"
        strokeWidth={3}
        lineCap="round"
      />
      <Line
        points={[width / 2 - 2, 26, width / 2 + 2, 26]}
        stroke="#374151"
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
