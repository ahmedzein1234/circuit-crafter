import { Circle, Group } from 'react-konva';
import { useCircuitStore } from '../stores/circuitStore';
import type { Terminal } from '@circuit-crafter/shared';

interface TerminalDotProps {
  terminal: Terminal;
  componentId: string;
}

export function TerminalDot({ terminal, componentId: _componentId }: TerminalDotProps) {
  const {
    isDrawingWire,
    wireStartTerminal,
    hoveredTerminalId,
    startWireDrawing,
    finishWireDrawing,
    setHoveredTerminal,
    wires,
  } = useCircuitStore();

  const isStart = wireStartTerminal === terminal.id;
  const isHovered = hoveredTerminalId === terminal.id;
  const isConnected = wires.some(
    (w) => w.fromTerminal === terminal.id || w.toTerminal === terminal.id
  );

  // Get color based on terminal type
  const getColor = () => {
    if (isStart) return '#3b82f6';
    if (isHovered && isDrawingWire) return '#22c55e';

    switch (terminal.type) {
      case 'positive':
        return '#ef4444';
      case 'negative':
        return '#374151';
      case 'input':
      case 'input_a':
      case 'input_b':
        return '#3b82f6';
      case 'output':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const handleClick = (e: { cancelBubble: boolean; evt?: Event }) => {
    e.cancelBubble = true;
    // Stop the native event from triggering parent drag
    if (e.evt) {
      e.evt.stopPropagation();
    }

    if (isDrawingWire && wireStartTerminal !== terminal.id) {
      finishWireDrawing(terminal.id);
    } else if (!isDrawingWire) {
      startWireDrawing(terminal.id);
    }
  };

  // Prevent drag on mousedown/touchstart to allow clicking
  const handleMouseDown = (e: { cancelBubble: boolean; evt?: Event }) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
  };

  // Increased terminal sizes: base 5px -> 7px (40% increase)
  const baseRadius = 7;
  const radius = isHovered ? baseRadius * 1.5 : isConnected ? baseRadius * 1.2 : baseRadius;

  // Format terminal type for display (for future use in tooltips)
  // const getTerminalLabel = () => {
  //   switch (terminal.type) {
  //     case 'positive':
  //       return 'Positive (+)';
  //     case 'negative':
  //       return 'Negative (-)';
  //     case 'input':
  //       return 'Input';
  //     case 'input_a':
  //       return 'Input A';
  //     case 'input_b':
  //       return 'Input B';
  //     case 'output':
  //       return 'Output';
  //     default:
  //       return terminal.type;
  //   }
  // };

  return (
    <Group
      x={terminal.position.x}
      y={terminal.position.y}
      onClick={handleClick}
      onTap={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseEnter={() => setHoveredTerminal(terminal.id)}
      onMouseLeave={() => setHoveredTerminal(null)}
    >
      {/* Invisible hit area for easier clicking - larger touch target */}
      <Circle
        radius={baseRadius * 2.5}
        fill="transparent"
        stroke="transparent"
      />

      {/* Outer ring for hover effect - enhanced glow */}
      {(isHovered || isStart) && (
        <>
          <Circle
            radius={radius + 6}
            fill="transparent"
            stroke={getColor()}
            strokeWidth={2}
            opacity={0.3}
          />
          <Circle
            radius={radius + 3}
            fill="transparent"
            stroke={getColor()}
            strokeWidth={2}
            opacity={0.6}
          />
        </>
      )}

      {/* Main terminal dot - larger and more prominent */}
      <Circle
        radius={radius}
        fill={getColor()}
        stroke="#ffffff"
        strokeWidth={2.5}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.4}
      />

      {/* Connection indicator */}
      {isConnected && (
        <Circle radius={2.5} fill="#ffffff" />
      )}
    </Group>
  );
}
