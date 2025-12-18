import { memo } from 'react';
import { Line, Group } from 'react-konva';
import type { Position } from '@circuit-crafter/shared';
import { useThemeStore } from '../stores/themeStore';

interface GridLayerProps {
  width: number;
  height: number;
  gridSize: number;
  offset: Position;
  scale: number;
}

export const GridLayer = memo(function GridLayer({
  width,
  height,
  gridSize,
}: GridLayerProps) {
  const theme = useThemeStore((state) => state.theme);
  const gridColor = theme === 'dark' ? '#1e3a5f' : '#e0e0e0';
  const lines: JSX.Element[] = [];

  // Calculate grid bounds with some padding
  const startX = -width;
  const endX = width * 2;
  const startY = -height;
  const endY = height * 2;

  // Vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={gridColor}
        strokeWidth={x % (gridSize * 5) === 0 ? 0.8 : 0.3}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={gridColor}
        strokeWidth={y % (gridSize * 5) === 0 ? 0.8 : 0.3}
        listening={false}
      />
    );
  }

  return <Group listening={false}>{lines}</Group>;
});
