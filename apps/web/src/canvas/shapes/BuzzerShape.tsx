import { Group, Rect, Circle, Arc, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface BuzzerShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function BuzzerShape({ component, isSelected, simulation }: BuzzerShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.buzzer;
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

      {/* Buzzer body */}
      <Circle
        x={width / 2}
        y={height / 2}
        radius={width / 2 - 2}
        fill={isActive ? '#fef3c7' : '#f8fafc'}
        stroke={isActive ? '#f59e0b' : '#374151'}
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />

      {/* Inner circle */}
      <Circle
        x={width / 2}
        y={height / 2}
        radius={width / 4}
        fill={isActive ? '#f59e0b' : '#6b7280'}
        stroke={isActive ? '#d97706' : '#374151'}
        strokeWidth={1}
      />

      {/* Sound waves when active */}
      {isActive && (
        <>
          <Arc
            x={width + 4}
            y={height / 2}
            innerRadius={6}
            outerRadius={8}
            angle={60}
            rotation={-30}
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <Arc
            x={width + 8}
            y={height / 2}
            innerRadius={10}
            outerRadius={12}
            angle={60}
            rotation={-30}
            stroke="#f59e0b"
            strokeWidth={2}
            opacity={0.7}
          />
        </>
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
            position: getLocalTerminalPosition(terminal, component, width, height),
          }}
          componentId={component.id}
        />
      ))}
    </Group>
  );
}
