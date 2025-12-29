import { Group, Rect, Line, Circle, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS, formatSI } from '@circuit-crafter/shared';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface PotentiometerShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function PotentiometerShape({ component, isSelected, simulation }: PotentiometerShapeProps) {
  const { selectComponent, updateComponentPosition, updateComponentProperty } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.potentiometer;
  const groupProps = getRotatableGroupProps(component, width, height);

  const position = (component.properties as { position?: number }).position ?? 50;
  const maxResistance = (component.properties as { maxResistance?: number }).maxResistance ?? 10000;
  const effectiveResistance = simulation?.effectiveResistance ?? (position / 100) * maxResistance;
  const isActive = simulation?.isActive ?? false;

  // Handle double-click to cycle position
  const handleDoubleClick = (e: { cancelBubble: boolean }) => {
    e.cancelBubble = true;
    const newPosition = position >= 100 ? 0 : position + 25;
    updateComponentProperty(component.id, 'position', newPosition);
  };

  // Zigzag pattern for resistor element
  const zigzagPoints = [
    0, height / 2,
    8, height / 2,
    12, height / 4,
    18, (height * 3) / 4,
    24, height / 4,
    30, (height * 3) / 4,
    36, height / 4,
    42, height / 2,
    width, height / 2,
  ];

  // Wiper position on zigzag
  const wiperX = 8 + (position / 100) * 34;

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

      {/* Resistor zigzag */}
      <Line
        points={zigzagPoints}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
      />

      {/* Wiper arrow */}
      <Line
        points={[wiperX, 0, wiperX, height / 4 - 2]}
        stroke={isActive ? '#3b82f6' : '#6b7280'}
        strokeWidth={2}
        lineCap="round"
      />
      <Line
        points={[wiperX - 4, height / 4 - 6, wiperX, height / 4 - 2, wiperX + 4, height / 4 - 6]}
        stroke={isActive ? '#3b82f6' : '#6b7280'}
        strokeWidth={2}
        lineCap="round"
        lineJoin="round"
      />

      {/* Wiper knob */}
      <Circle
        x={wiperX}
        y={-4}
        radius={4}
        fill={isActive ? '#3b82f6' : '#6b7280'}
        stroke="#374151"
        strokeWidth={1}
      />

      {/* Resistance label */}
      <Text
        x={0}
        y={height + 4}
        width={width}
        text={formatSI(effectiveResistance, 'Ω', 0)}
        fontSize={10}
        fill="#9ca3af"
        align="center"
      />

      {/* Position percentage */}
      <Text
        x={0}
        y={-18}
        width={width}
        text={`${position}%`}
        fontSize={9}
        fill="#6b7280"
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
