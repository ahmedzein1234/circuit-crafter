import { Line } from 'react-konva';
import type { Position } from '@circuit-crafter/shared';

export type ConnectionValidity = 'neutral' | 'valid' | 'invalid';

interface WirePreviewProps {
  start: Position;
  end: Position;
  validity?: ConnectionValidity;
}

export function WirePreview({ start, end, validity = 'neutral' }: WirePreviewProps) {
  // Create path with right angles
  const midX = (start.x + end.x) / 2;
  const points = [start.x, start.y, midX, start.y, midX, end.y, end.x, end.y];

  // Color based on connection validity
  const getColor = () => {
    switch (validity) {
      case 'valid':
        return '#22c55e'; // Green
      case 'invalid':
        return '#ef4444'; // Red
      default:
        return '#3b82f6'; // Blue (neutral)
    }
  };

  return (
    <Line
      points={points}
      stroke={getColor()}
      strokeWidth={validity === 'neutral' ? 2 : 3}
      lineCap="round"
      lineJoin="round"
      dash={[8, 4]}
      opacity={validity === 'neutral' ? 0.7 : 0.9}
      listening={false}
    />
  );
}
