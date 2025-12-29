/**
 * Optimized Zustand Selectors for Circuit Store
 *
 * These selectors prevent unnecessary re-renders by:
 * 1. Selecting only the specific state needed
 * 2. Using shallow comparison for object references
 * 3. Providing memoized derived data
 *
 * Usage:
 * const components = useCircuitStore(selectComponents);
 * const selectedId = useCircuitStore(selectSelectedComponentId);
 */

import { useShallow } from 'zustand/react/shallow';
import { useCircuitStore } from './circuitStore';

// Type for the store state
type CircuitStoreState = ReturnType<typeof useCircuitStore.getState>;

// ========================================
// Basic State Selectors
// ========================================

/** Select only the components array */
export const selectComponents = (state: CircuitStoreState) => state.components;

/** Select only the wires array */
export const selectWires = (state: CircuitStoreState) => state.wires;

/** Select the currently selected component ID */
export const selectSelectedComponentId = (state: CircuitStoreState) => state.selectedComponentId;

/** Select the currently selected wire ID */
export const selectSelectedWireId = (state: CircuitStoreState) => state.selectedWireId;

/** Select simulation result */
export const selectSimulationResult = (state: CircuitStoreState) => state.simulationResult;

/** Select if simulation is running */
export const selectIsSimulating = (state: CircuitStoreState) => state.isSimulating;

/** Select canvas offset */
export const selectCanvasOffset = (state: CircuitStoreState) => state.canvasOffset;

/** Select canvas scale */
export const selectCanvasScale = (state: CircuitStoreState) => state.canvasScale;

/** Select grid visibility */
export const selectShowGrid = (state: CircuitStoreState) => state.showGrid;

/** Select current flow visibility */
export const selectShowCurrentFlow = (state: CircuitStoreState) => state.showCurrentFlow;

// ========================================
// Wire Drawing Selectors
// ========================================

/** Select wire drawing state */
export const selectIsDrawingWire = (state: CircuitStoreState) => state.isDrawingWire;

/** Select wire start terminal */
export const selectWireStartTerminal = (state: CircuitStoreState) => state.wireStartTerminal;

/** Select wire preview end position */
export const selectWirePreviewEnd = (state: CircuitStoreState) => state.wirePreviewEnd;

/** Select hovered terminal */
export const selectHoveredTerminalId = (state: CircuitStoreState) => state.hoveredTerminalId;

// ========================================
// Derived Selectors
// ========================================

/** Select a specific component by ID */
export const selectComponentById = (id: string) => (state: CircuitStoreState) =>
  state.components.find((c) => c.id === id);

/** Select a specific wire by ID */
export const selectWireById = (id: string) => (state: CircuitStoreState) =>
  state.wires.find((w) => w.id === id);

/** Select the currently selected component */
export const selectSelectedComponent = (state: CircuitStoreState) =>
  state.selectedComponentId
    ? state.components.find((c) => c.id === state.selectedComponentId)
    : null;

/** Select component count */
export const selectComponentCount = (state: CircuitStoreState) => state.components.length;

/** Select wire count */
export const selectWireCount = (state: CircuitStoreState) => state.wires.length;

/** Check if circuit has any components */
export const selectHasComponents = (state: CircuitStoreState) => state.components.length > 0;

/** Check if circuit is empty */
export const selectIsCircuitEmpty = (state: CircuitStoreState) =>
  state.components.length === 0 && state.wires.length === 0;

/** Select simulation result for a specific component */
export const selectComponentSimulationResult = (componentId: string) => (state: CircuitStoreState) =>
  state.simulationResult?.components.find((r) => r.componentId === componentId);

// ========================================
// Action Selectors (for binding)
// ========================================

/** Select remove component action */
export const selectRemoveComponent = (state: CircuitStoreState) => state.removeComponent;

/** Select update component position action */
export const selectUpdateComponentPosition = (state: CircuitStoreState) => state.updateComponentPosition;

/** Select rotate component action */
export const selectRotateComponent = (state: CircuitStoreState) => state.rotateComponent;

/** Select select component action */
export const selectSelectComponent = (state: CircuitStoreState) => state.selectComponent;

/** Select run simulation action */
export const selectRunSimulation = (state: CircuitStoreState) => state.runSimulation;

/** Select undo action */
export const selectUndo = (state: CircuitStoreState) => state.undo;

/** Select redo action */
export const selectRedo = (state: CircuitStoreState) => state.redo;

/** Check if can undo */
export const selectCanUndo = (state: CircuitStoreState) => state.historyIndex > 0;

/** Check if can redo */
export const selectCanRedo = (state: CircuitStoreState) => state.historyIndex < state.history.length - 1;

// ========================================
// Custom Hooks with Shallow Comparison
// ========================================

/**
 * Hook to get canvas view state with shallow comparison
 * Prevents re-renders when other state changes
 */
export function useCanvasViewState() {
  return useCircuitStore(
    useShallow((state) => ({
      offset: state.canvasOffset,
      scale: state.canvasScale,
      showGrid: state.showGrid,
      showCurrentFlow: state.showCurrentFlow,
    }))
  );
}

/**
 * Hook to get wire drawing state with shallow comparison
 */
export function useWireDrawingState() {
  return useCircuitStore(
    useShallow((state) => ({
      isDrawingWire: state.isDrawingWire,
      wireStartTerminal: state.wireStartTerminal,
      wirePreviewEnd: state.wirePreviewEnd,
      hoveredTerminalId: state.hoveredTerminalId,
    }))
  );
}

/**
 * Hook to get selection state with shallow comparison
 */
export function useSelectionState() {
  return useCircuitStore(
    useShallow((state) => ({
      selectedComponentId: state.selectedComponentId,
      selectedWireId: state.selectedWireId,
    }))
  );
}

/**
 * Hook to get circuit data with shallow comparison
 */
export function useCircuitData() {
  return useCircuitStore(
    useShallow((state) => ({
      components: state.components,
      wires: state.wires,
    }))
  );
}

/**
 * Hook to get simulation data with shallow comparison
 */
export function useSimulationData() {
  return useCircuitStore(
    useShallow((state) => ({
      simulationResult: state.simulationResult,
      isSimulating: state.isSimulating,
      oscilloscopeData: state.oscilloscopeData,
    }))
  );
}
