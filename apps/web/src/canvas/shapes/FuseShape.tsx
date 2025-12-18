import { Group, Rect, Line, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';

interface FuseShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function FuseShape({ component, isSelected, simulation }: FuseShapeProps) {
  const { selectComponent, updateComponentPosition, updateComponentProperty } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.fuse;

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    updateComponentPosition(component.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const isBlown = simulation?.isBlown ?? (component.properties as { isBlown?: boolean }).isBlown ?? false;
  const isActive = simulation?.isActive ?? false;
  const isOverloaded = simulation?.isOverloaded ?? false;
  const rating = (component.properties as { rating?: number }).rating ?? 1;

  // Handle double-click to reset fuse
  const handleDoubleClick = (e: { cancelBubble: boolean }) => {
    e.cancelBubble = true;
    if (isBlown) {
      updateComponentProperty(component.id, 'isBlown', false);
    }
  };

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

      {/* Fuse body (glass tube appearance) */}
      <Rect
        x={6}
        y={2}
        width={width - 12}
        height={height - 4}
        fill={isBlown ? '#fef2f2' : '#f8fafc'}
        stroke={isBlown ? '#ef4444' : isOverloaded ? '#f59e0b' : '#374151'}
        strokeWidth={2}
        cornerRadius={3}
      />

      {/* End caps */}
      <Rect
        x={0}
        y={4}
        width={8}
        height={height - 8}
        fill="#9ca3af"
        stroke="#6b7280"
        strokeWidth={1}
        cornerRadius={2}
      />
      <Rect
        x={width - 8}
        y={4}
        width={8}
        height={height - 8}
        fill="#9ca3af"
        stroke="#6b7280"
        strokeWidth={1}
        cornerRadius={2}
      />

      {/* Fuse wire (or broken wire if blown) */}
      {isBlown ? (
        <>
          {/* Broken wire pieces */}
          <Line
            points={[10, height / 2, 16, height / 2]}
            stroke="#1f2937"
            strokeWidth={2}
            lineCap="round"
          />
          <Line
            points={[width - 16, height / 2, width - 10, height / 2]}
            stroke="#1f2937"
            strokeWidth={2}
            lineCap="round"
          />
          {/* X mark */}
          <Line
            points={[width / 2 - 4, height / 2 - 4, width / 2 + 4, height / 2 + 4]}
            stroke="#ef4444"
            strokeWidth={2}
            lineCap="round"
          />
          <Line
            points={[width / 2 + 4, height / 2 - 4, width / 2 - 4, height / 2 + 4]}
            stroke="#ef4444"
            strokeWidth={2}
            lineCap="round"
          />
        </>
      ) : (
        <Line
          points={[10, height / 2, width - 10, height / 2]}
          stroke={isActive ? '#22c55e' : isOverloaded ? '#f59e0b' : '#1f2937'}
          strokeWidth={2}
          lineCap="round"
        />
      )}

      {/* Rating label */}
      <Text
        x={0}
        y={height + 4}
        width={width}
        text={`${rating}A`}
        fontSize={10}
        fill="#9ca3af"
        align="center"
      />

      {/* Status indicator */}
      {isBlown && (
        <Text
          x={0}
          y={-14}
          width={width}
          text="BLOWN"
          fontSize={8}
          fill="#ef4444"
          fontStyle="bold"
          align="center"
        />
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
