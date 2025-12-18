import { Group, Rect, Text, Circle } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';

interface LogicGateShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function LogicGateShape({ component, isSelected, simulation }: LogicGateShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();

  const gateType = component.type;
  const defaults = COMPONENT_DEFAULTS[gateType as keyof typeof COMPONENT_DEFAULTS] || {
    width: 60,
    height: 50,
  };
  const { width, height } = defaults;

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    updateComponentPosition(component.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const logicState = simulation?.logicState ?? false;

  // Get gate label
  const gateLabel = gateType === 'and_gate' ? 'AND' : gateType === 'or_gate' ? 'OR' : 'NOT';

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

      {/* Gate body */}
      <Rect
        x={5}
        y={0}
        width={width - 10}
        height={height}
        fill="#f8fafc"
        stroke={logicState ? '#22c55e' : '#374151'}
        strokeWidth={2}
        cornerRadius={gateType === 'or_gate' ? 8 : 4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />

      {/* Gate label */}
      <Text
        x={5}
        y={height / 2 - 8}
        width={width - 10}
        text={gateLabel}
        fontSize={14}
        fontStyle="bold"
        fill="#374151"
        align="center"
      />

      {/* NOT gate bubble (inverter) */}
      {gateType === 'not_gate' && (
        <Circle
          x={width - 2}
          y={height / 2}
          radius={5}
          fill="#f8fafc"
          stroke="#374151"
          strokeWidth={2}
        />
      )}

      {/* Output state indicator */}
      <Circle
        x={width - 12}
        y={6}
        radius={4}
        fill={logicState ? '#22c55e' : '#ef4444'}
      />

      {/* Input labels */}
      {gateType !== 'not_gate' && (
        <>
          <Text
            x={8}
            y={height / 4 - 6}
            text="A"
            fontSize={10}
            fill="#6b7280"
          />
          <Text
            x={8}
            y={(height * 3) / 4 - 6}
            text="B"
            fontSize={10}
            fill="#6b7280"
          />
        </>
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
