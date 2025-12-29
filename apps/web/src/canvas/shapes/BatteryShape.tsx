import { Group, Rect, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface BatteryShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function BatteryShape({ component, isSelected, simulation }: BatteryShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.battery;

  const isPowered = simulation?.state === 'powered' || simulation?.current !== undefined && simulation.current > 0;
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

      {/* Battery body */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#f8fafc"
        stroke={isPowered ? '#22c55e' : '#374151'}
        strokeWidth={2}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />

      {/* Battery cells */}
      <Rect
        x={8}
        y={8}
        width={12}
        height={height - 16}
        fill="#ef4444"
        cornerRadius={2}
      />
      <Rect
        x={24}
        y={8}
        width={12}
        height={height - 16}
        fill="#ef4444"
        cornerRadius={2}
      />
      <Rect
        x={40}
        y={12}
        width={8}
        height={height - 24}
        fill="#ef4444"
        cornerRadius={2}
      />

      {/* + and - symbols */}
      <Text
        x={width - 12}
        y={4}
        text="+"
        fontSize={14}
        fontStyle="bold"
        fill="#ef4444"
      />
      <Text
        x={-6}
        y={4}
        text="-"
        fontSize={14}
        fontStyle="bold"
        fill="#374151"
      />

      {/* Voltage label */}
      <Text
        x={0}
        y={height + 4}
        width={width}
        text={`${(component.properties as { voltage?: number }).voltage || 9}V`}
        fontSize={10}
        fill="#9ca3af"
        align="center"
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
