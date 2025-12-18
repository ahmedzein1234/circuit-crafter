import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  CircuitComponent,
  Wire,
  Position,
  ComponentType,
  SimulationResult,
  OscilloscopeData,
  LEDColor,
} from '@circuit-crafter/shared';
import { generateId, snapToGrid, GRID_SIZE } from '@circuit-crafter/shared';
import { CircuitSolver, createComponent, createLED, createBattery } from '@circuit-crafter/circuit-engine';

// Variant properties for component customization
interface ComponentVariant {
  color?: LEDColor;
  voltage?: number;
}

// History entry for undo/redo
interface HistoryEntry {
  components: CircuitComponent[];
  wires: Wire[];
}

interface CircuitState {
  // Circuit data
  components: CircuitComponent[];
  wires: Wire[];

  // History state
  history: HistoryEntry[];
  historyIndex: number;

  // Selection state
  selectedComponentId: string | null;
  selectedWireId: string | null;
  hoveredTerminalId: string | null;

  // Wire drawing state
  isDrawingWire: boolean;
  wireStartTerminal: string | null;
  wirePreviewEnd: Position | null;

  // Simulation
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  oscilloscopeData: OscilloscopeData | null;

  // UI state
  canvasOffset: Position;
  canvasScale: number;
  showGrid: boolean;
  showCurrentFlow: boolean;

  // Actions
  addComponent: (type: ComponentType, position: Position, variant?: ComponentVariant) => void;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, position: Position) => void;
  rotateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;

  addWire: (fromTerminal: string, toTerminal: string) => void;
  removeWire: (id: string) => void;
  selectWire: (id: string | null) => void;

  startWireDrawing: (terminalId: string) => void;
  updateWirePreview: (position: Position) => void;
  finishWireDrawing: (terminalId: string) => void;
  cancelWireDrawing: () => void;

  setHoveredTerminal: (terminalId: string | null) => void;

  toggleSwitch: (componentId: string) => void;
  updateComponentProperty: (componentId: string, property: string, value: unknown) => void;

  runSimulation: () => void;
  runTransientSimulation: (duration: number, timeStep: number) => void;

  clearCircuit: () => void;
  loadCircuit: (components: CircuitComponent[], wires: Wire[]) => void;

  setCanvasOffset: (offset: Position) => void;
  setCanvasScale: (scale: number) => void;
  toggleGrid: () => void;
  toggleCurrentFlow: () => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const solver = new CircuitSolver();

// Maximum number of history entries to keep
const MAX_HISTORY_SIZE = 50;

// Helper function to create a deep copy of circuit state
const cloneCircuitState = (
  components: CircuitComponent[],
  wires: Wire[]
): HistoryEntry => {
  return {
    components: JSON.parse(JSON.stringify(components)),
    wires: JSON.parse(JSON.stringify(wires)),
  };
};

export const useCircuitStore = create<CircuitState>()(
  subscribeWithSelector((set, get) => {
    // Helper to push current state to history
    const pushHistory = () => {
      const { components, wires, history, historyIndex } = get();

      // Create a snapshot of the current state
      const snapshot = cloneCircuitState(components, wires);

      // Remove any history after the current index (for when we undo then make a new action)
      const newHistory = history.slice(0, historyIndex + 1);

      // Add the new snapshot
      newHistory.push(snapshot);

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    };

    return {
      // Initial state
      components: [],
      wires: [],
      history: [{ components: [], wires: [] }],
      historyIndex: 0,
      selectedComponentId: null,
      selectedWireId: null,
      hoveredTerminalId: null,
      isDrawingWire: false,
      wireStartTerminal: null,
      wirePreviewEnd: null,
      simulationResult: null,
      isSimulating: false,
      oscilloscopeData: null,
      canvasOffset: { x: 0, y: 0 },
      canvasScale: 1,
      showGrid: true,
      showCurrentFlow: true,

      // Component actions
      addComponent: (type, position, variant) => {
        console.log('=== Store: addComponent called ===');
        console.log('Type:', type);
        console.log('Position:', position);
        console.log('Variant:', variant);
        console.log('Current component count:', get().components.length);

        const snappedPosition = {
          x: snapToGrid(position.x, GRID_SIZE),
          y: snapToGrid(position.y, GRID_SIZE),
        };

        let component: CircuitComponent;

        // Handle variants for specific component types
        if (type === 'led' && variant?.color) {
          component = createLED(snappedPosition, 2, 0.02, variant.color);
        } else if (type === 'battery' && variant?.voltage) {
          component = createBattery(snappedPosition, variant.voltage);
        } else {
          component = createComponent(type, snappedPosition);
        }

        console.log('Created component:', component.id, component.type);

        set((state) => {
          console.log('State before update:', state.components.length);
          const newComponents = [...state.components, component];
          console.log('State after update:', newComponents.length);
          return {
            components: newComponents,
            selectedComponentId: component.id,
          };
        });

        console.log('After set, component count:', get().components.length);
        pushHistory();
      },

      removeComponent: (id) => {
        set((state) => {
          // Also remove wires connected to this component
          const component = state.components.find((c) => c.id === id);
          const terminalIds = component?.terminals.map((t) => t.id) ?? [];

          return {
            components: state.components.filter((c) => c.id !== id),
            wires: state.wires.filter(
              (w) =>
                !terminalIds.includes(w.fromTerminal) && !terminalIds.includes(w.toTerminal)
            ),
            selectedComponentId:
              state.selectedComponentId === id ? null : state.selectedComponentId,
          };
        });

        pushHistory();
      },

      updateComponentPosition: (id, position) => {
        const snappedPosition = {
          x: snapToGrid(position.x, GRID_SIZE),
          y: snapToGrid(position.y, GRID_SIZE),
        };

        set((state) => ({
          components: state.components.map((c) => {
            if (c.id !== id) return c;

            // Calculate position delta
            const dx = snappedPosition.x - c.position.x;
            const dy = snappedPosition.y - c.position.y;

            // Update terminal positions
            const updatedTerminals = c.terminals.map((t) => ({
              ...t,
              position: {
                x: t.position.x + dx,
                y: t.position.y + dy,
              },
            }));

            return {
              ...c,
              position: snappedPosition,
              terminals: updatedTerminals,
            };
          }),
        }));

        pushHistory();
      },

      rotateComponent: (id) => {
        set((state) => ({
          components: state.components.map((c) => {
            if (c.id !== id) return c;

            const newRotation = (c.rotation + 90) % 360;

            // Rotate terminal positions around component center
            const centerX = c.position.x + 30; // Approximate center
            const centerY = c.position.y + 20;

            const updatedTerminals = c.terminals.map((t) => {
              const dx = t.position.x - centerX;
              const dy = t.position.y - centerY;

              // 90 degree rotation: (x, y) -> (-y, x)
              return {
                ...t,
                position: {
                  x: centerX - dy,
                  y: centerY + dx,
                },
              };
            });

            return {
              ...c,
              rotation: newRotation,
              terminals: updatedTerminals,
            };
          }),
        }));

        pushHistory();
      },

      selectComponent: (id) => {
        set({ selectedComponentId: id, selectedWireId: null });
      },

      // Wire actions
      addWire: (fromTerminal, toTerminal) => {
        // Check if wire already exists
        const { wires } = get();
        const exists = wires.some(
          (w) =>
            (w.fromTerminal === fromTerminal && w.toTerminal === toTerminal) ||
            (w.fromTerminal === toTerminal && w.toTerminal === fromTerminal)
        );

        if (exists) return;

        const wire: Wire = {
          id: generateId(),
          fromTerminal,
          toTerminal,
          path: [],
        };

        set((state) => ({
          wires: [...state.wires, wire],
        }));

        pushHistory();
      },

      removeWire: (id) => {
        set((state) => ({
          wires: state.wires.filter((w) => w.id !== id),
          selectedWireId: state.selectedWireId === id ? null : state.selectedWireId,
        }));

        pushHistory();
      },

      selectWire: (id) => {
        set({ selectedWireId: id, selectedComponentId: null });
      },

      // Wire drawing
      startWireDrawing: (terminalId) => {
        console.log('=== Store: startWireDrawing ===');
        console.log('Terminal ID:', terminalId);
        set({
          isDrawingWire: true,
          wireStartTerminal: terminalId,
          wirePreviewEnd: null,
        });
        console.log('After set, isDrawingWire:', get().isDrawingWire);
      },

      updateWirePreview: (position) => {
        set({ wirePreviewEnd: position });
      },

      finishWireDrawing: (terminalId) => {
        console.log('=== Store: finishWireDrawing ===');
        console.log('Terminal ID:', terminalId);
        const { wireStartTerminal, addWire } = get();
        console.log('Wire start terminal:', wireStartTerminal);

        if (wireStartTerminal && wireStartTerminal !== terminalId) {
          console.log('Creating wire from', wireStartTerminal, 'to', terminalId);
          addWire(wireStartTerminal, terminalId);
        }

        set({
          isDrawingWire: false,
          wireStartTerminal: null,
          wirePreviewEnd: null,
        });
        console.log('Wires after:', get().wires.length);
      },

      cancelWireDrawing: () => {
        set({
          isDrawingWire: false,
          wireStartTerminal: null,
          wirePreviewEnd: null,
        });
      },

      setHoveredTerminal: (terminalId) => {
        set({ hoveredTerminalId: terminalId });
      },

      toggleSwitch: (componentId) => {
        set((state) => ({
          components: state.components.map((c) => {
            if (c.id !== componentId || c.type !== 'switch') return c;
            return {
              ...c,
              properties: {
                ...c.properties,
                isOpen: !c.properties.isOpen,
              },
            };
          }),
        }));

        pushHistory();
      },

      updateComponentProperty: (componentId, property, value) => {
        set((state) => ({
          components: state.components.map((c) => {
            if (c.id !== componentId) return c;
            return {
              ...c,
              properties: {
                ...c.properties,
                [property]: value,
              },
            } as typeof c;
          }),
        }));

        pushHistory();
      },

      // Simulation
      runSimulation: () => {
        const { components, wires } = get();

        set({ isSimulating: true });

        try {
          const result = solver.solve(components, wires);
          set({ simulationResult: result, isSimulating: false });
        } catch (error) {
          console.error('Simulation error:', error);
          set({ isSimulating: false });
        }
      },

      runTransientSimulation: (duration: number, timeStep: number) => {
        const { components, wires } = get();

        set({ isSimulating: true });

        try {
          // Run transient simulation
          const oscilloscopeData = solver.solveTransient(components, wires, duration, timeStep);

          // Also run a regular simulation to get latest steady-state
          const result = solver.solve(components, wires);

          set({
            oscilloscopeData,
            simulationResult: result,
            isSimulating: false,
          });
        } catch (error) {
          console.error('Transient simulation error:', error);
          set({ isSimulating: false });
        }
      },

      // Circuit management
      clearCircuit: () => {
        set({
          components: [],
          wires: [],
          selectedComponentId: null,
          selectedWireId: null,
          simulationResult: null,
          history: [{ components: [], wires: [] }],
          historyIndex: 0,
        });
      },

      loadCircuit: (components, wires) => {
        set({
          components,
          wires,
          selectedComponentId: null,
          selectedWireId: null,
          history: [cloneCircuitState(components, wires)],
          historyIndex: 0,
        });
      },

      // Canvas controls
      setCanvasOffset: (offset) => {
        set({ canvasOffset: offset });
      },

      setCanvasScale: (scale) => {
        set({ canvasScale: Math.max(0.25, Math.min(2, scale)) });
      },

      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }));
      },

      toggleCurrentFlow: () => {
        set((state) => ({ showCurrentFlow: !state.showCurrentFlow }));
      },

      // History actions
      undo: () => {
        const { history, historyIndex } = get();

        if (historyIndex <= 0) return; // Can't undo past beginning

        const newIndex = historyIndex - 1;
        const previousState = history[newIndex];

        set({
          components: cloneCircuitState(previousState.components, previousState.wires)
            .components,
          wires: cloneCircuitState(previousState.components, previousState.wires).wires,
          historyIndex: newIndex,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();

        if (historyIndex >= history.length - 1) return; // Can't redo past end

        const newIndex = historyIndex + 1;
        const nextState = history[newIndex];

        set({
          components: cloneCircuitState(nextState.components, nextState.wires).components,
          wires: cloneCircuitState(nextState.components, nextState.wires).wires,
          historyIndex: newIndex,
        });
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },
    };
  })
);
