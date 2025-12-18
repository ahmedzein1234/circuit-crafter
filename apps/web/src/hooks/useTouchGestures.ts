import { useRef, useCallback, useEffect } from 'react';

interface TouchGesturesOptions {
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPan?: (delta: { x: number; y: number }) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  longPressDuration?: number;
}

interface TouchPoint {
  x: number;
  y: number;
}

export function useTouchGestures(options: TouchGesturesOptions) {
  const {
    onPinch,
    onPan,
    onLongPress,
    longPressDuration = 500,
  } = options;

  const touchStateRef = useRef<{
    touches: TouchPoint[];
    initialDistance: number | null;
    lastScale: number;
    lastCenter: TouchPoint | null;
    isPinching: boolean;
    isPanning: boolean;
    longPressTimer: NodeJS.Timeout | null;
    longPressPosition: TouchPoint | null;
  }>({
    touches: [],
    initialDistance: null,
    lastScale: 1,
    lastCenter: null,
    isPinching: false,
    isPanning: false,
    longPressTimer: null,
    longPressPosition: null,
  });

  const getDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: TouchPoint, touch2: TouchPoint): TouchPoint => {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
  };

  const clearLongPressTimer = useCallback(() => {
    if (touchStateRef.current.longPressTimer) {
      clearTimeout(touchStateRef.current.longPressTimer);
      touchStateRef.current.longPressTimer = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touches = Array.from(e.touches).map((t) => ({
        x: t.clientX,
        y: t.clientY,
      }));

      touchStateRef.current.touches = touches;

      if (touches.length === 2) {
        // Two-finger gesture: pinch or pan
        touchStateRef.current.initialDistance = getDistance(touches[0], touches[1]);
        touchStateRef.current.lastCenter = getCenter(touches[0], touches[1]);
        touchStateRef.current.isPinching = true;
        clearLongPressTimer();
      } else if (touches.length === 1) {
        // Single finger: possible long press
        touchStateRef.current.isPanning = false;
        touchStateRef.current.longPressPosition = touches[0];

        if (onLongPress) {
          touchStateRef.current.longPressTimer = setTimeout(() => {
            if (touchStateRef.current.longPressPosition) {
              onLongPress(touchStateRef.current.longPressPosition);
              touchStateRef.current.longPressPosition = null;
            }
          }, longPressDuration);
        }
      }
    },
    [onLongPress, longPressDuration, clearLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const touches = Array.from(e.touches).map((t) => ({
        x: t.clientX,
        y: t.clientY,
      }));

      // Cancel long press on move
      if (touchStateRef.current.longPressTimer) {
        const movement = Math.abs(touches[0].x - touchStateRef.current.longPressPosition!.x) +
                        Math.abs(touches[0].y - touchStateRef.current.longPressPosition!.y);
        if (movement > 10) {
          clearLongPressTimer();
        }
      }

      if (touches.length === 2 && touchStateRef.current.isPinching) {
        // Pinch zoom
        const currentDistance = getDistance(touches[0], touches[1]);
        const currentCenter = getCenter(touches[0], touches[1]);

        if (touchStateRef.current.initialDistance && onPinch) {
          const scale = currentDistance / touchStateRef.current.initialDistance;
          onPinch(scale, currentCenter);
          touchStateRef.current.lastScale = scale;
        }

        // Two-finger pan
        if (touchStateRef.current.lastCenter && onPan) {
          const delta = {
            x: currentCenter.x - touchStateRef.current.lastCenter.x,
            y: currentCenter.y - touchStateRef.current.lastCenter.y,
          };
          onPan(delta);
        }

        touchStateRef.current.lastCenter = currentCenter;
      } else if (touches.length === 1 && !touchStateRef.current.isPinching) {
        // Single finger pan
        if (touchStateRef.current.touches.length > 0 && onPan) {
          const delta = {
            x: touches[0].x - touchStateRef.current.touches[0].x,
            y: touches[0].y - touchStateRef.current.touches[0].y,
          };

          // Only trigger pan if movement is significant
          if (Math.abs(delta.x) > 2 || Math.abs(delta.y) > 2) {
            touchStateRef.current.isPanning = true;
            onPan(delta);
          }
        }
      }

      touchStateRef.current.touches = touches;
    },
    [onPinch, onPan, clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      clearLongPressTimer();

      if (e.touches.length === 0) {
        touchStateRef.current.touches = [];
        touchStateRef.current.initialDistance = null;
        touchStateRef.current.lastCenter = null;
        touchStateRef.current.isPinching = false;
        touchStateRef.current.isPanning = false;
        touchStateRef.current.longPressPosition = null;
      } else if (e.touches.length === 1 && touchStateRef.current.isPinching) {
        // Transition from pinch to single-finger pan
        touchStateRef.current.isPinching = false;
        touchStateRef.current.initialDistance = null;
        touchStateRef.current.touches = Array.from(e.touches).map((t) => ({
          x: t.clientX,
          y: t.clientY,
        }));
      }
    },
    [clearLongPressTimer]
  );

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isPanning: touchStateRef.current.isPanning,
    isPinching: touchStateRef.current.isPinching,
  };
}
