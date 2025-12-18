import { Line } from 'react-konva';
import type { Position } from '@circuit-crafter/shared';

interface WirePreviewProps {
  start: Position;
  end: Position;
}

export function WirePreview({ start, end }: WirePreviewProps) {
  // Create path with right angles
  const midX = (start.x + end.x) / 2;
  const points = [start.x, start.y, midX, start.y, midX, end.y, end.x, end.y];

  return (
    <Line
      points={points}
      stroke="#3b82f6"
      strokeWidth={2}
      lineCap="round"
      lineJoin="round"
      dash={[8, 4]}
      opacity={0.7}
      listening={false}
    />
  );
}
