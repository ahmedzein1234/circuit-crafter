import { Circle, Group, Text, Rect } from 'react-konva';
import { useCircuitStore } from '../stores/circuitStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
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
  const { play } = useSoundEffects();

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

  // Handle click - main interaction for wiring
  const handleClick = (e: { cancelBubble: boolean; evt?: Event }) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }

    if (isDrawingWire) {
      // If drawing wire and this is a different terminal, complete the connection
      if (wireStartTerminal !== terminal.id) {
        finishWireDrawing(terminal.id);
        play('connect');
      }
      // If same terminal, do nothing (user can click elsewhere to cancel)
    } else {
      // Start drawing a new wire from this terminal
      startWireDrawing(terminal.id);
      play('click');
    }
  };

  // Handle mousedown - prevent parent drag when clicking terminals
  const handleMouseDown = (e: { cancelBubble: boolean; evt?: Event }) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
  };

  // When mouse enters terminal while drawing wire
  const handleMouseEnter = () => {
    setHoveredTerminal(terminal.id);
  };

  // Handle mouseup - no special handling needed, click handles it
  const handleMouseUp = (e: { cancelBubble: boolean; evt?: Event }) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
  };

  // Increased terminal sizes: base 5px -> 7px (40% increase)
  const baseRadius = 7;
  const radius = isHovered ? baseRadius * 1.5 : isConnected ? baseRadius * 1.2 : baseRadius;

  // Format terminal type for display in tooltips
  const getTerminalLabel = () => {
    switch (terminal.type) {
      case 'positive':
        return 'Positive (+)';
      case 'negative':
        return 'Negative (-)';
      case 'input':
        return 'Input';
      case 'input_a':
        return 'Input A';
      case 'input_b':
        return 'Input B';
      case 'output':
        return 'Output';
      default:
        return terminal.type;
    }
  };

  // Get hint text for what user can do
  const getActionHint = () => {
    if (isDrawingWire) {
      if (wireStartTerminal === terminal.id) {
        return 'Click elsewhere to cancel';
      }
      return 'Click to connect wire';
    }
    return 'Click to start wire';
  };

  const tooltipText = `${getTerminalLabel()}\n${getActionHint()}`;
  const tooltipWidth = 110;
  const tooltipHeight = 36;

  return (
    <Group
      x={terminal.position.x}
      y={terminal.position.y}
      onClick={handleClick}
      onTap={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseEnter={handleMouseEnter}
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

      {/* Tooltip on hover */}
      {isHovered && (
        <Group x={15} y={-tooltipHeight / 2}>
          {/* Tooltip background */}
          <Rect
            width={tooltipWidth}
            height={tooltipHeight}
            fill="#1f2937"
            cornerRadius={4}
            shadowColor="black"
            shadowBlur={8}
            shadowOpacity={0.3}
          />
          {/* Tooltip text */}
          <Text
            x={8}
            y={6}
            text={tooltipText}
            fontSize={10}
            fontFamily="system-ui, sans-serif"
            fill="#ffffff"
            lineHeight={1.3}
          />
        </Group>
      )}
    </Group>
  );
}
