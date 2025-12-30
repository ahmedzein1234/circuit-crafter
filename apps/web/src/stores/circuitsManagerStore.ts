// Circuits Manager Store - handles saving, loading, and listing circuits

import { create } from 'zustand';
import { circuitsApi, type Circuit, type CircuitBlueprint } from '../api';
import type { CircuitComponent, Wire } from '@circuit-crafter/shared';
import { toast } from '../components/Toast';

// Local storage key for guest circuits
const LOCAL_STORAGE_KEY = 'circuit-crafter-local-circuits';

interface LocalCircuit {
  id: string;
  name: string;
  description?: string;
  blueprint: CircuitBlueprint;
  createdAt: string;
  updatedAt: string;
}

interface CircuitsManagerState {
  // Current circuit metadata
  currentCircuitId: string | null;
  currentCircuitName: string | null;
  hasUnsavedChanges: boolean;

  // Saved circuits list
  myCircuits: Circuit[];
  localCircuits: LocalCircuit[];
  isLoadingCircuits: boolean;

  // Modal states
  isSaveModalOpen: boolean;
  isLoadModalOpen: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  openSaveModal: () => void;
  closeSaveModal: () => void;
  openLoadModal: () => void;
  closeLoadModal: () => void;

  saveCircuit: (
    name: string,
    description: string,
    components: CircuitComponent[],
    wires: Wire[],
    isPublic: boolean,
    isAuthenticated: boolean
  ) => Promise<boolean>;

  updateCircuit: (
    components: CircuitComponent[],
    wires: Wire[]
  ) => Promise<boolean>;

  loadCircuit: (id: string, isLocal: boolean) => Promise<CircuitBlueprint | null>;
  deleteCircuit: (id: string, isLocal: boolean) => Promise<boolean>;

  fetchMyCircuits: (isAuthenticated: boolean) => Promise<void>;

  setHasUnsavedChanges: (value: boolean) => void;
  clearCurrentCircuit: () => void;
  clearError: () => void;
}

// Helper to generate local IDs
const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get local circuits from storage
const getLocalCircuits = (): LocalCircuit[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save local circuits to storage
const saveLocalCircuits = (circuits: LocalCircuit[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(circuits));
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
};

export const useCircuitsManagerStore = create<CircuitsManagerState>((set, get) => ({
  // Initial state
  currentCircuitId: null,
  currentCircuitName: null,
  hasUnsavedChanges: false,

  myCircuits: [],
  localCircuits: getLocalCircuits(),
  isLoadingCircuits: false,

  isSaveModalOpen: false,
  isLoadModalOpen: false,
  isSaving: false,
  isLoading: false,
  error: null,

  // Modal actions
  openSaveModal: () => set({ isSaveModalOpen: true, error: null }),
  closeSaveModal: () => set({ isSaveModalOpen: false, error: null }),
  openLoadModal: () => set({ isLoadModalOpen: true, error: null }),
  closeLoadModal: () => set({ isLoadModalOpen: false, error: null }),

  // Save circuit
  saveCircuit: async (name, description, components, wires, isPublic, isAuthenticated) => {
    set({ isSaving: true, error: null });

    const blueprint: CircuitBlueprint = {
      components,
      wires,
      metadata: {
        savedAt: new Date().toISOString(),
      },
    };

    // If authenticated, save to server
    if (isAuthenticated) {
      const response = await circuitsApi.create({
        name,
        description,
        blueprint,
        isPublic,
      });

      if (response.success && response.data) {
        set({
          isSaving: false,
          isSaveModalOpen: false,
          currentCircuitId: response.data.id,
          currentCircuitName: name,
          hasUnsavedChanges: false,
        });

        toast.success(`Circuit "${name}" saved successfully!`);

        // Refresh circuits list
        get().fetchMyCircuits(true);
        return true;
      } else {
        set({
          isSaving: false,
          error: response.error || 'Failed to save circuit',
        });
        return false;
      }
    }

    // For guests, save to local storage
    const localCircuit: LocalCircuit = {
      id: generateLocalId(),
      name,
      description,
      blueprint,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const localCircuits = [...get().localCircuits, localCircuit];
    saveLocalCircuits(localCircuits);

    set({
      isSaving: false,
      isSaveModalOpen: false,
      localCircuits,
      currentCircuitId: localCircuit.id,
      currentCircuitName: name,
      hasUnsavedChanges: false,
    });

    toast.success(`Circuit "${name}" saved locally!`);

    return true;
  },

  // Update existing circuit
  updateCircuit: async (components, wires) => {
    const { currentCircuitId, currentCircuitName, localCircuits } = get();

    if (!currentCircuitId) {
      set({ error: 'No circuit to update' });
      return false;
    }

    set({ isSaving: true, error: null });

    const blueprint: CircuitBlueprint = {
      components,
      wires,
      metadata: {
        savedAt: new Date().toISOString(),
      },
    };

    // Check if it's a local circuit
    if (currentCircuitId.startsWith('local_')) {
      const updatedCircuits = localCircuits.map((c) =>
        c.id === currentCircuitId
          ? { ...c, blueprint, updatedAt: new Date().toISOString() }
          : c
      );
      saveLocalCircuits(updatedCircuits);

      set({
        isSaving: false,
        localCircuits: updatedCircuits,
        hasUnsavedChanges: false,
      });
      return true;
    }

    // Update on server
    const response = await circuitsApi.update(currentCircuitId, {
      name: currentCircuitName || undefined,
      blueprint,
    });

    if (response.success) {
      set({
        isSaving: false,
        hasUnsavedChanges: false,
      });
      return true;
    } else {
      set({
        isSaving: false,
        error: response.error || 'Failed to update circuit',
      });
      return false;
    }
  },

  // Load circuit
  loadCircuit: async (id, isLocal) => {
    set({ isLoading: true, error: null });

    if (isLocal) {
      const circuit = get().localCircuits.find((c) => c.id === id);
      if (circuit) {
        set({
          isLoading: false,
          isLoadModalOpen: false,
          currentCircuitId: circuit.id,
          currentCircuitName: circuit.name,
          hasUnsavedChanges: false,
        });
        return circuit.blueprint;
      } else {
        set({ isLoading: false, error: 'Circuit not found' });
        return null;
      }
    }

    // Load from server
    const response = await circuitsApi.get(id);

    if (response.success && response.data) {
      set({
        isLoading: false,
        isLoadModalOpen: false,
        currentCircuitId: response.data.id,
        currentCircuitName: response.data.name,
        hasUnsavedChanges: false,
      });
      return response.data.blueprint;
    } else {
      set({
        isLoading: false,
        error: response.error || 'Failed to load circuit',
      });
      return null;
    }
  },

  // Delete circuit
  deleteCircuit: async (id, isLocal) => {
    if (isLocal) {
      const localCircuits = get().localCircuits.filter((c) => c.id !== id);
      saveLocalCircuits(localCircuits);
      set({ localCircuits });

      // Clear current if we deleted it
      if (get().currentCircuitId === id) {
        set({
          currentCircuitId: null,
          currentCircuitName: null,
          hasUnsavedChanges: false,
        });
      }
      return true;
    }

    const response = await circuitsApi.delete(id);
    if (response.success) {
      // Refresh list
      const isAuthenticated = get().myCircuits.length > 0;
      get().fetchMyCircuits(isAuthenticated);

      // Clear current if we deleted it
      if (get().currentCircuitId === id) {
        set({
          currentCircuitId: null,
          currentCircuitName: null,
          hasUnsavedChanges: false,
        });
      }
      return true;
    }
    return false;
  },

  // Fetch user's circuits
  fetchMyCircuits: async (isAuthenticated) => {
    if (!isAuthenticated) {
      set({ localCircuits: getLocalCircuits() });
      return;
    }

    set({ isLoadingCircuits: true });

    const response = await circuitsApi.getMyCircuits();

    if (response.success && response.data) {
      set({
        myCircuits: response.data,
        isLoadingCircuits: false,
      });
    } else {
      set({ isLoadingCircuits: false });
    }

    // Also refresh local circuits
    set({ localCircuits: getLocalCircuits() });
  },

  // Utility actions
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

  clearCurrentCircuit: () =>
    set({
      currentCircuitId: null,
      currentCircuitName: null,
      hasUnsavedChanges: false,
    }),

  clearError: () => set({ error: null }),
}));
