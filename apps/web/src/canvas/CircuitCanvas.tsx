import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { GRID_SIZE, COMPONENT_DEFAULTS, type ComponentType, type LEDColor } from '@circuit-crafter/shared';
import { GridLayer } from './GridLayer';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { WirePreview, ConnectionValidity } from './WirePreview';
import { useCircuitStore } from '../stores/circuitStore';
import { useCanvasStore } from '../stores/canvasStore';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { getAbsoluteTerminalPosition } from './utils/terminalPosition';
// Sound effects available for future features
// import { useSoundEffects } from '../hooks/useSoundEffects';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { ProblemsPanel } from '../components/ProblemsPanel';

interface ContextMenuState {
  x: number;
  y: number;
  componentId: string | null;
  wireId: string | null;
}

export function CircuitCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const lastPinchScaleRef = useRef(1);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showConnectionTip, setShowConnectionTip] = useState(true);

  const {
    components,
    wires,
    selectedComponentId,
    isDrawingWire,
    wireStartTerminal,
    wirePreviewEnd,
    hoveredTerminalId,
    showGrid,
    canvasScale,
    canvasOffset,
    selectComponent,
    cancelWireDrawing,
    updateWirePreview,
    setCanvasScale,
    runSimulation,
    removeComponent,
    removeWire,
    rotateComponent,
  } = useCircuitStore();

  const setStageRef = useCanvasStore((state) => state.setStageRef);

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

  // Store stage ref for export functionality
  useEffect(() => {
    if (stageRef.current) {
      setStageRef(stageRef.current);
    }
    return () => setStageRef(null);
  }, [setStageRef]);

  // Handle click on empty canvas area - deselect component only
  // Wire cancellation is handled by handleMouseUp to avoid duplicate handling
  const handleStageClick = useCallback(
    (e: { target: { getStage: () => unknown } }) => {
      // Only deselect if clicking on the stage itself
      if (e.target === e.target.getStage()) {
        selectComponent(null);
      }
    },
    [selectComponent]
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

  // Handle mouse up on canvas (cancel wire if released on empty space)
  const handleMouseUp = useCallback(
    (e: { target: { getStage: () => unknown } }) => {
      // If drawing wire and mouse released on empty canvas (not on terminal), cancel
      if (isDrawingWire && e.target === e.target.getStage()) {
        cancelWireDrawing();
      }
    },
    [isDrawingWire, cancelWireDrawing]
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
      (_position: { x: number; y: number }) => {
        // Show context menu on long press (future feature)
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
        // Get component dimensions based on type
        const dimensions = COMPONENT_DEFAULTS[component.type as keyof typeof COMPONENT_DEFAULTS];
        const width = dimensions?.width ?? 60;
        const height = dimensions?.height ?? 40;

        // Return the absolute visual position of the terminal
        return getAbsoluteTerminalPosition(terminal, component, width, height);
      }
    }
    return null;
  };

  // Get terminal by ID
  const getTerminal = (terminalId: string) => {
    for (const component of components) {
      const terminal = component.terminals.find((t) => t.id === terminalId);
      if (terminal) {
        return { terminal, componentId: component.id };
      }
    }
    return null;
  };

  // Check if connection between two terminals would be valid
  const getConnectionValidity = (): ConnectionValidity => {
    if (!isDrawingWire || !wireStartTerminal || !hoveredTerminalId) {
      return 'neutral';
    }

    // Can't connect to same terminal
    if (wireStartTerminal === hoveredTerminalId) {
      return 'invalid';
    }

    const startInfo = getTerminal(wireStartTerminal);
    const endInfo = getTerminal(hoveredTerminalId);

    if (!startInfo || !endInfo) {
      return 'neutral';
    }

    // Can't connect terminals on the same component
    if (startInfo.componentId === endInfo.componentId) {
      return 'invalid';
    }

    // Check if wire already exists
    const wireExists = wires.some(
      (w) =>
        (w.fromTerminal === wireStartTerminal && w.toTerminal === hoveredTerminalId) ||
        (w.fromTerminal === hoveredTerminalId && w.toTerminal === wireStartTerminal)
    );

    if (wireExists) {
      return 'invalid';
    }

    // Valid connection
    return 'valid';
  };

  const wireStartPosition = getStartTerminalPosition();
  const connectionValidity = getConnectionValidity();

  // Check if a point is within a component's bounds (accounting for rotation)
  const findComponentAtPoint = useCallback((canvasX: number, canvasY: number): string | null => {
    // Check each component to see if the point is within its bounds
    for (const component of components) {
      const { x, y } = component.position;
      // Get actual component dimensions based on type
      const dimensions = COMPONENT_DEFAULTS[component.type as keyof typeof COMPONENT_DEFAULTS];
      const width = dimensions?.width ?? 60;
      const height = dimensions?.height ?? 40;
      const padding = 10; // Extra padding for easier click detection

      // Calculate component center
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      // Transform click point to component's local coordinate system
      // by rotating it in the opposite direction around the component center
      const angleRad = -(component.rotation * Math.PI) / 180;
      const dx = canvasX - centerX;
      const dy = canvasY - centerY;
      const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad) + centerX;
      const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad) + centerY;

      // Now check if the transformed point is within the unrotated bounds
      if (localX >= x - padding && localX <= x + width + padding &&
          localY >= y - padding && localY <= y + height + padding) {
        return component.id;
      }
    }
    return null;
  }, [components]);

  // Handle right-click on canvas
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Close any existing context menu first
    setContextMenu(null);

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
    const canvasY = (e.clientY - rect.top - canvasOffset.y) / canvasScale;

    // Check if we right-clicked on a component
    const componentId = findComponentAtPoint(canvasX, canvasY);

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      componentId,
      wireId: null, // TODO: Add wire hit detection
    });
  }, [canvasOffset, canvasScale, findComponentAtPoint]);

  // Use refs to avoid stale closures in document-level event handlers
  const canvasOffsetRef = useRef(canvasOffset);
  const canvasScaleRef = useRef(canvasScale);

  useEffect(() => {
    canvasOffsetRef.current = canvasOffset;
    canvasScaleRef.current = canvasScale;
  }, [canvasOffset, canvasScale]);

  // Use document-level drag events for reliable drop detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragOver = (e: DragEvent) => {
      // Check if we're over the canvas area
      const rect = container.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'copy';
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      const rect = container.getBoundingClientRect();
      // Only handle if drop is within canvas bounds
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        e.preventDefault();
        e.stopPropagation();

        const componentType = e.dataTransfer?.getData('component-type');
        const variantData = e.dataTransfer?.getData('component-variant');

        if (componentType) {
          // Use refs to get current values
          const offset = canvasOffsetRef.current;
          const scale = canvasScaleRef.current;

          const x = (e.clientX - rect.left - offset.x) / scale;
          const y = (e.clientY - rect.top - offset.y) / scale;

          // Parse variant data if present
          let variant: { color?: LEDColor; voltage?: number } | undefined;
          if (variantData) {
            try {
              const parsed = JSON.parse(variantData);
              variant = {
                color: parsed.color as LEDColor | undefined,
                voltage: parsed.voltage,
              };
            } catch {
              variant = undefined;
            }
          }

          // Add the component - type is validated in createComponent
          useCircuitStore.getState().addComponent(
            componentType as ComponentType,
            { x, y },
            variant
          );
        }
      }
    };

    // Use capture phase to ensure we get events before other handlers
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, []); // Empty dependency array - handlers use refs for current values

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-circuit-canvas dark:bg-circuit-canvas light:bg-circuit-light-canvas cursor-crosshair relative"
      onContextMenu={handleContextMenu}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
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
            <WirePreview
              start={wireStartPosition}
              end={wirePreviewEnd}
              validity={connectionValidity}
            />
          )}
        </Layer>

        {/* Components Layer */}
        <Layer>
          <ComponentRenderer />
        </Layer>
      </Stage>

      {/* Wire Drawing Mode Indicator */}
      {isDrawingWire && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in max-w-[90vw]">
          <div className="bg-blue-600/95 backdrop-blur px-3 md:px-4 py-2 md:py-2 rounded-lg shadow-lg flex items-center gap-2 md:gap-3">
            <span className="text-xl" role="img" aria-label="wire">
              🔌
            </span>
            <span className="text-white font-medium text-mobile-sm md:text-sm">
              Drawing Wire
            </span>
            <span className="text-blue-200 text-mobile-xs md:text-sm hidden sm:inline">
              • Tap a circle to connect
            </span>
            <button
              onClick={cancelWireDrawing}
              className="ml-1 md:ml-2 px-3 py-2 md:px-2 md:py-1 min-h-touch-target md:min-h-0 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-mobile-xs md:text-xs rounded-lg md:rounded transition-colors touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Zoom controls - Touch friendly on mobile, positioned above mobile nav */}
      <div className="absolute bottom-20 right-4 md:bottom-4 md:right-4 flex flex-col gap-2 z-10">
        <button
          className="w-14 h-14 md:w-11 md:h-11 rounded-xl md:rounded-lg bg-gray-800/90 dark:bg-gray-800/90 light:bg-white/90 backdrop-blur text-white dark:text-white light:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center font-bold text-2xl md:text-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg touch-manipulation"
          onClick={() => setCanvasScale(canvasScale * 1.2)}
          title={`Zoom in (${Math.round(canvasScale * 100)}%)`}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className="w-14 h-14 md:w-11 md:h-11 rounded-xl md:rounded-lg bg-gray-800/90 dark:bg-gray-800/90 light:bg-white/90 backdrop-blur text-white dark:text-white light:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center font-bold text-2xl md:text-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg touch-manipulation"
          onClick={() => setCanvasScale(canvasScale / 1.2)}
          title={`Zoom out (${Math.round(canvasScale * 100)}%)`}
          aria-label="Zoom out"
        >
          -
        </button>
        {/* Zoom level indicator */}
        <div
          className="w-14 h-8 md:w-11 md:h-7 rounded-lg bg-gray-900/80 backdrop-blur flex items-center justify-center text-xs font-mono text-gray-300 shadow-lg"
          title={`Current zoom: ${Math.round(canvasScale * 100)}%`}
        >
          {Math.round(canvasScale * 100)}%
        </div>
        <button
          className="w-14 h-14 md:w-11 md:h-11 rounded-xl md:rounded-lg bg-gray-800/90 dark:bg-gray-800/90 light:bg-white/90 backdrop-blur text-white dark:text-white light:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center text-sm md:text-xs font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg touch-manipulation"
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
          <div className="text-center text-gray-400 dark:text-gray-400 light:text-gray-500">
            <div className="mb-4 text-4xl" role="img" aria-label="welcome">
              🚀
            </div>
            <p className="text-mobile-lg md:text-xl mb-3 font-semibold text-gray-300">
              Let's Build Something Awesome!
            </p>
            <p className="text-mobile-base md:text-base mb-2">
              <span className="hidden md:inline">
                <span role="img" aria-label="parts">
                  🧩
                </span>{' '}
                Drag parts from the left side onto this board
              </span>
              <span className="md:hidden">
                <span role="img" aria-label="parts">
                  🧩
                </span>{' '}
                Tap the menu button to add parts
              </span>
            </p>
            <p className="text-mobile-sm md:text-sm text-gray-500">
              <span className="hidden md:inline">
                <span role="img" aria-label="connect">
                  🔌
                </span>{' '}
                Click the circles to connect wires
              </span>
              <span className="md:hidden">
                <span role="img" aria-label="connect">
                  🔌
                </span>{' '}
                Tap circles to connect wires
              </span>
            </p>
            <p className="text-mobile-xs md:text-xs mt-3 text-gray-600 md:hidden">
              <span role="img" aria-label="zoom">
                🔍
              </span>{' '}
              Pinch to zoom • Two fingers to move around
            </p>
          </div>
        </div>
      )}

      {/* Connection tip - shows when there are components but no wires */}
      {components.length > 0 && wires.length === 0 && showConnectionTip && !isDrawingWire && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in max-w-[90vw]">
          <div className="bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔌</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm md:text-base">
                  Click the colored circles to connect wires!
                </p>
                <p className="text-white/70 text-xs md:text-sm mt-0.5">
                  Each component has terminals (dots) - click one, then click another to connect
                </p>
              </div>
              <button
                onClick={() => setShowConnectionTip(false)}
                className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Dismiss tip"
              >
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Problems Panel */}
      <ProblemsPanel />
    </div>
  );

  // Generate context menu items based on what was right-clicked
  function getContextMenuItems(): ContextMenuItem[] {
    if (contextMenu?.componentId) {
      return [
        {
          label: 'Rotate',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          onClick: () => {
            if (contextMenu.componentId) {
              rotateComponent(contextMenu.componentId);
            }
          },
        },
        {
          label: 'Select',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          ),
          onClick: () => {
            if (contextMenu.componentId) {
              selectComponent(contextMenu.componentId);
            }
          },
        },
        { label: '', onClick: () => {}, divider: true },
        {
          label: 'Delete',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          onClick: () => {
            if (contextMenu.componentId) {
              removeComponent(contextMenu.componentId);
            }
          },
          danger: true,
        },
      ];
    }

    if (contextMenu?.wireId) {
      return [
        {
          label: 'Delete Wire',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          onClick: () => {
            if (contextMenu.wireId) {
              removeWire(contextMenu.wireId);
            }
          },
          danger: true,
        },
      ];
    }

    // Canvas context menu (no component/wire selected)
    return [
      {
        label: 'Clear All',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => {
          useCircuitStore.getState().clearCircuit();
        },
        danger: true,
        disabled: components.length === 0,
      },
      {
        label: 'Reset View',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
        onClick: () => {
          setCanvasScale(1);
          useCircuitStore.getState().setCanvasOffset({ x: 0, y: 0 });
        },
      },
    ];
  }
}
