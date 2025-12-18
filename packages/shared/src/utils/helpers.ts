/**
 * Utility functions for Circuit Crafter
 */

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Snap a value to a grid
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Format time in seconds to mm:ss format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a number with appropriate SI prefix
 */
export function formatSI(value: number, unit: string, decimals: number = 2): string {
  const prefixes = [
    { threshold: 1e12, prefix: 'T' },
    { threshold: 1e9, prefix: 'G' },
    { threshold: 1e6, prefix: 'M' },
    { threshold: 1e3, prefix: 'k' },
    { threshold: 1, prefix: '' },
    { threshold: 1e-3, prefix: 'm' },
    { threshold: 1e-6, prefix: 'μ' },
    { threshold: 1e-9, prefix: 'n' },
    { threshold: 1e-12, prefix: 'p' },
  ];

  const absValue = Math.abs(value);

  for (const { threshold, prefix } of prefixes) {
    if (absValue >= threshold) {
      return `${(value / threshold).toFixed(decimals)} ${prefix}${unit}`;
    }
  }

  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
