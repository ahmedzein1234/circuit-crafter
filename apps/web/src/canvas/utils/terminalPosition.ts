import type { CircuitComponent, Terminal, Position } from '@circuit-crafter/shared';

/**
 * Calculates the local (unrotated) position of a terminal for rendering.
 *
 * Terminal positions in the store are absolute and already rotated.
 * When rendering inside a rotated Group, we need to reverse the rotation
 * to get the original relative position, since the Group will apply rotation visually.
 *
 * @param terminal - The terminal with absolute rotated position
 * @param component - The component containing the terminal
 * @param componentWidth - Width of the component
 * @param componentHeight - Height of the component
 * @returns The local position relative to component origin (0,0)
 */
export function getLocalTerminalPosition(
  terminal: Terminal,
  component: CircuitComponent,
  componentWidth: number,
  componentHeight: number
): Position {
  const centerX = componentWidth / 2;
  const centerY = componentHeight / 2;

  // Component center in absolute coordinates
  const cx = component.position.x + centerX;
  const cy = component.position.y + centerY;

  // Get offset from center (this is the rotated offset)
  const rotatedDx = terminal.position.x - cx;
  const rotatedDy = terminal.position.y - cy;

  // Reverse rotate to get original offset
  const angleRad = -(component.rotation * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const originalDx = rotatedDx * cos - rotatedDy * sin;
  const originalDy = rotatedDx * sin + rotatedDy * cos;

  // Convert to position relative to component origin (0,0 in local coords)
  return {
    x: centerX + originalDx,
    y: centerY + originalDy,
  };
}

/**
 * Props needed for a rotatable component Group in Konva
 */
export interface RotatableGroupProps {
  x: number;
  y: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Calculates the Group positioning props for proper rotation around center.
 *
 * @param component - The component
 * @param componentWidth - Width of the component
 * @param componentHeight - Height of the component
 * @returns Props to spread onto the Konva Group
 */
export function getRotatableGroupProps(
  component: CircuitComponent,
  componentWidth: number,
  componentHeight: number
): RotatableGroupProps {
  const centerX = componentWidth / 2;
  const centerY = componentHeight / 2;

  return {
    x: component.position.x + centerX,
    y: component.position.y + centerY,
    rotation: component.rotation,
    offsetX: centerX,
    offsetY: centerY,
  };
}

/**
 * Adjusts drag end position to account for center-based rotation offset.
 *
 * @param targetX - The x position from drag event target
 * @param targetY - The y position from drag event target
 * @param componentWidth - Width of the component
 * @param componentHeight - Height of the component
 * @returns The adjusted position for the component origin
 */
export function adjustDragEndPosition(
  targetX: number,
  targetY: number,
  componentWidth: number,
  componentHeight: number
): Position {
  return {
    x: targetX - componentWidth / 2,
    y: targetY - componentHeight / 2,
  };
}

/**
 * Calculates the absolute (world space) position of a terminal for wire drawing.
 * This accounts for the component's rotation and position.
 *
 * The terminal is rendered at a local position inside a rotated Group,
 * so we need to transform that local position to absolute coordinates.
 *
 * @param terminal - The terminal with absolute rotated position stored
 * @param component - The component containing the terminal
 * @param componentWidth - Width of the component
 * @param componentHeight - Height of the component
 * @returns The absolute position in canvas space where the terminal is visually rendered
 */
export function getAbsoluteTerminalPosition(
  terminal: Terminal,
  component: CircuitComponent,
  componentWidth: number,
  componentHeight: number
): Position {
  // First get the local position (where it's rendered inside the rotated Group)
  const localPos = getLocalTerminalPosition(terminal, component, componentWidth, componentHeight);

  // The Group is positioned at the component center with offsetX/offsetY
  const centerX = componentWidth / 2;
  const centerY = componentHeight / 2;
  const groupX = component.position.x + centerX;
  const groupY = component.position.y + centerY;

  // Convert local position to offset from Group center (accounting for offset)
  const offsetX = localPos.x - centerX;
  const offsetY = localPos.y - centerY;

  // Apply rotation to this offset
  const angleRad = (component.rotation * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const rotatedOffsetX = offsetX * cos - offsetY * sin;
  const rotatedOffsetY = offsetX * sin + offsetY * cos;

  // Add to Group position to get absolute coordinates
  return {
    x: groupX + rotatedOffsetX,
    y: groupY + rotatedOffsetY,
  };
}
