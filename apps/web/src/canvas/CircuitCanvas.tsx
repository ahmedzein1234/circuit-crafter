import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { GRID_SIZE } from '@circuit-crafter/shared';
import { GridLayer } from './GridLayer';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { WirePreview } from './WirePreview';
import { useCircuitStore } from '../stores/circuitStore';
import { useTouchGestures } from '../hooks/useTouchGestures';

export function CircuitCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const lastPinchScaleRef = useRef(1);

  const {
    components,
    selectedComponentId,
    isDrawingWire,
    wireStartTerminal,
    wirePreviewEnd,
    showGrid,
    canvasScale,
    canvasOffset,
    selectComponent,
    cancelWireDrawing,
    updateWirePreview,
    setCanvasScale,
    runSimulation,
  } = useCircuitStore();

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle click on empty canvas area
  const handleStageClick = useCallback(
    (e: { target: { getStage: () => unknown } }) => {
      // Only deselect if clicking on the stage itself
      if (e.target === e.target.getStage()) {
        selectComponent(null);

        if (isDrawingWire) {
          cancelWireDrawing();
        }
      }
    },
    [selectComponent, isDrawingWire, cancelWireDrawing]
  );

  // Handle mouse move for wire preview
  const handleMouseMove = useCallback(
    (e: unknown) => {
      if (!isDrawingWire) return;

      const evt = e as { target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } };
      const stage = evt.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (point) {
        updateWirePreview({
          x: (point.x - canvasOffset.x) / canvasScale,
          y: (point.y - canvasOffset.y) / canvasScale,
        });
      }
    },
    [isDrawingWire, updateWirePreview, canvasOffset, canvasScale]
  );

  // Handle wheel for zoom
  const handleWheel = useCallback(
    (e: { evt: WheelEvent }) => {
      e.evt.preventDefault();
      const scaleBy = 1.1;
      const newScale = e.evt.deltaY < 0 ? canvasScale * scaleBy : canvasScale / scaleBy;
      setCanvasScale(newScale);
    },
    [canvasScale, setCanvasScale]
  );

  // Touch gesture handlers
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onPinch: useCallback(
      (scale: number, _center: { x: number; y: number }) => {
        const scaleDelta = scale / lastPinchScaleRef.current;
        const newScale = Math.max(0.1, Math.min(5, canvasScale * scaleDelta));
        setCanvasScale(newScale);
        lastPinchScaleRef.current = scale;
      },
      [canvasScale, setCanvasScale]
    ),
    onPan: useCallback(
      (delta: { x: number; y: number }) => {
        useCircuitStore.getState().setCanvasOffset({
          x: canvasOffset.x + delta.x,
          y: canvasOffset.y + delta.y,
        });
      },
      [canvasOffset]
    ),
    onLongPress: useCallback(
      (position: { x: number; y: number }) => {
        // Show context menu on long press (future feature)
        console.log('Long press at', position);
      },
      []
    ),
  });

  // Attach touch handlers to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart as any, { passive: false });
    container.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    container.addEventListener('touchend', handleTouchEnd as any, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart as any);
      container.removeEventListener('touchmove', handleTouchMove as any);
      container.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelWireDrawing();
        selectComponent(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId) {
          useCircuitStore.getState().removeComponent(selectedComponentId);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedComponentId) {
          useCircuitStore.getState().rotateComponent(selectedComponentId);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        runSimulation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, cancelWireDrawing, selectComponent, runSimulation]);

  // Find the start terminal position for wire preview
  const getStartTerminalPosition = () => {
    if (!wireStartTerminal) return null;

    for (const component of components) {
      const terminal = component.terminals.find((t) => t.id === wireStartTerminal);
      if (terminal) {
        return terminal.position;
      }
    }
    return null;
  };

  const wireStartPosition = getStartTerminalPosition();

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-circuit-canvas dark:bg-circuit-canvas light:bg-circuit-light-canvas cursor-crosshair"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('component-type');
        if (componentType && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
          const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;

          useCircuitStore.getState().addComponent(componentType as never, { x, y });
        }
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        scaleX={canvasScale}
        scaleY={canvasScale}
        x={canvasOffset.x}
        y={canvasOffset.y}
        draggable={!isDrawingWire}
        onDragEnd={(e) => {
          useCircuitStore.getState().setCanvasOffset({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        {/* Grid Layer */}
        {showGrid && (
          <Layer>
            <GridLayer
              width={dimensions.width / canvasScale}
              height={dimensions.height / canvasScale}
              gridSize={GRID_SIZE}
              offset={canvasOffset}
              scale={canvasScale}
            />
          </Layer>
        )}

        {/* Wires Layer */}
        <Layer>
          <WireRenderer />

          {/* Wire Preview while drawing */}
          {isDrawingWire && wireStartPosition && wirePreviewEnd && (
            <WirePreview start={wireStartPosition} end={wirePreviewEnd} />
          )}
        </Layer>

        {/* Components Layer */}
        <Layer>
          <ComponentRenderer />
        </Layer>
      </Stage>

      {/* Zoom controls - Touch friendly on mobile */}
      <div className="absolute bottom-4 right-4 md:bottom-4 md:right-4 bottom-20 flex flex-col gap-2">
        <button
          className="w-12 h-12 md:w-11 md:h-11 min-w-touch-target md:min-w-0 rounded-lg bg-gray-800/90 dark:bg-gray-800/90 light:bg-white/90 backdrop-blur text-white dark:text-white light:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center font-bold text-xl md:text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
          onClick={() => setCanvasScale(canvasScale * 1.2)}
          title={`Zoom in (${Math.round(canvasScale * 100)}%)`}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className="w-12 h-12 md:w-11 md:h-11 min-w-touch-target md:min-w-0 rounded-lg bg-gray-800/90 dark:bg-gray-800/90 light:bg-white/90 backdrop-blur text-white dark:text-white light:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center font-bold text-xl md:text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
          onClick={() => setCanvasScale(canvasScale / 1.2)}
          title={`Zoom out (${Math.round(canvasScale * 100)}%)`}
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          className="w-12 h-12 md:w-11 md:h-11 min-w-touch-target md:min-w-0 rounded-lg bg-gray-800/90 dark:bg-gray-800/90 light:bg-white/90 backdrop-blur text-white dark:text-white light:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center text-mobile-xs md:text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
          onClick={() => {
            setCanvasScale(1);
            useCircuitStore.getState().setCanvasOffset({ x: 0, y: 0 });
          }}
          title={`Reset zoom (${Math.round(canvasScale * 100)}%)`}
          aria-label="Reset zoom to 100%"
        >
          1:1
        </button>
      </div>

      {/* Instructions overlay */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <div className="text-center text-gray-500 dark:text-gray-500 light:text-gray-400">
            <p className="text-mobile-lg md:text-lg mb-2">
              <span className="hidden md:inline">Drag components from the palette to start building</span>
              <span className="md:hidden">Tap menu to add components</span>
            </p>
            <p className="text-mobile-sm md:text-sm">
              <span className="hidden md:inline">Click terminals to connect wires</span>
              <span className="md:hidden">Tap terminals to connect wires</span>
            </p>
            <p className="text-mobile-xs md:text-xs mt-2 md:hidden">Pinch to zoom, two fingers to pan</p>
          </div>
        </div>
      )}
    </div>
  );
}
