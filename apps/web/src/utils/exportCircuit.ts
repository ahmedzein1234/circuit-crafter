// Export circuit as image utility

import type Konva from 'konva';
import type { CircuitComponent } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';

interface ExportOptions {
  filename?: string;
  backgroundColor?: string;
  padding?: number;
  includeGrid?: boolean;
  quality?: number;
  format?: 'png' | 'jpeg';
}

/**
 * Calculate the bounding box of all components
 */
function getCircuitBounds(components: CircuitComponent[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (components.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const component of components) {
    const defaults = COMPONENT_DEFAULTS[component.type as keyof typeof COMPONENT_DEFAULTS];
    const width = defaults?.width ?? 60;
    const height = defaults?.height ?? 40;

    minX = Math.min(minX, component.position.x);
    minY = Math.min(minY, component.position.y);
    maxX = Math.max(maxX, component.position.x + width);
    maxY = Math.max(maxY, component.position.y + height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Export the circuit canvas as an image
 */
export async function exportCircuitAsImage(
  stage: Konva.Stage,
  components: CircuitComponent[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'circuit',
    backgroundColor = '#1a1a2e',
    padding = 40,
    quality = 1,
    format = 'png',
  } = options;

  if (components.length === 0) {
    throw new Error('No components to export');
  }

  // Get bounds of all components
  const bounds = getCircuitBounds(components);

  // Calculate export dimensions
  const exportWidth = bounds.width + padding * 2;
  const exportHeight = bounds.height + padding * 2;

  // Store original stage properties
  const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
  const originalPosition = { x: stage.x(), y: stage.y() };

  try {
    // Reset stage to fit the circuit
    stage.scale({ x: 1, y: 1 });
    stage.position({
      x: -bounds.minX + padding,
      y: -bounds.minY + padding,
    });

    // Create the data URL
    const dataURL = stage.toDataURL({
      x: 0,
      y: 0,
      width: exportWidth,
      height: exportHeight,
      pixelRatio: quality * 2, // Higher quality
      mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
      quality: format === 'jpeg' ? 0.9 : 1,
    });

    // Create a canvas to add background
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth * quality * 2;
    canvas.height = exportHeight * quality * 2;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw the stage image
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });

    ctx.drawImage(img, 0, 0);

    // Add watermark/branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = `${12 * quality * 2}px system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('Made with Circuit Crafter', canvas.width - 10, canvas.height - 10);

    // Convert to blob and download
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? 0.9 : 1
    );
  } finally {
    // Restore original stage properties
    stage.scale(originalScale);
    stage.position(originalPosition);
    stage.batchDraw();
  }
}

/**
 * Copy circuit image to clipboard
 */
export async function copyCircuitToClipboard(
  stage: Konva.Stage,
  components: CircuitComponent[]
): Promise<void> {
  if (components.length === 0) {
    throw new Error('No components to copy');
  }

  const bounds = getCircuitBounds(components);
  const padding = 40;
  const exportWidth = bounds.width + padding * 2;
  const exportHeight = bounds.height + padding * 2;

  const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
  const originalPosition = { x: stage.x(), y: stage.y() };

  try {
    stage.scale({ x: 1, y: 1 });
    stage.position({
      x: -bounds.minX + padding,
      y: -bounds.minY + padding,
    });

    const dataURL = stage.toDataURL({
      x: 0,
      y: 0,
      width: exportWidth,
      height: exportHeight,
      pixelRatio: 2,
      mimeType: 'image/png',
    });

    // Create canvas with background
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth * 2;
    canvas.height = exportHeight * 2;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });

    ctx.drawImage(img, 0, 0);

    // Copy to clipboard
    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      } catch (err) {
        throw new Error('Failed to copy to clipboard. Your browser may not support this feature.');
      }
    }, 'image/png');
  } finally {
    stage.scale(originalScale);
    stage.position(originalPosition);
    stage.batchDraw();
  }
}
