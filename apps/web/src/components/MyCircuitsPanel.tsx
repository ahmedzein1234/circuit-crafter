// My Circuits Panel - browse and load saved circuits

import { useEffect, useState } from 'react';
import { useCircuitsManagerStore } from '../stores/circuitsManagerStore';
import { useCircuitStore } from '../stores/circuitStore';
import { useAuthStore } from '../stores/authStore';

export function MyCircuitsPanel() {
  const {
    isLoadModalOpen,
    closeLoadModal,
    loadCircuit,
    deleteCircuit,
    fetchMyCircuits,
    myCircuits,
    localCircuits,
    isLoadingCircuits,
    isLoading,
    error,
    currentCircuitId,
    hasUnsavedChanges,
  } = useCircuitsManagerStore();

  const { loadCircuit: loadToCanvas, clearCircuit } = useCircuitStore();
  const { isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>(isAuthenticated ? 'cloud' : 'local');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<{ id: string; isLocal: boolean } | null>(null);

  // Fetch circuits when modal opens
  useEffect(() => {
    if (isLoadModalOpen) {
      fetchMyCircuits(isAuthenticated);
      setActiveTab(isAuthenticated ? 'cloud' : 'local');
      setConfirmDelete(null);
      setShowUnsavedWarning(null);
    }
  }, [isLoadModalOpen, isAuthenticated, fetchMyCircuits]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoadModalOpen) {
        if (confirmDelete) {
          setConfirmDelete(null);
        } else if (showUnsavedWarning) {
          setShowUnsavedWarning(null);
        } else {
          closeLoadModal();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isLoadModalOpen, closeLoadModal, confirmDelete, showUnsavedWarning]);

  if (!isLoadModalOpen) return null;

  const handleLoad = async (id: string, isLocal: boolean) => {
    // Check for unsaved changes
    if (hasUnsavedChanges && currentCircuitId !== id) {
      setShowUnsavedWarning({ id, isLocal });
      return;
    }

    await performLoad(id, isLocal);
  };

  const performLoad = async (id: string, isLocal: boolean) => {
    const blueprint = await loadCircuit(id, isLocal);
    if (blueprint) {
      loadToCanvas(blueprint.components, blueprint.wires);
    }
    setShowUnsavedWarning(null);
  };

  const handleDelete = async (id: string, isLocal: boolean) => {
    await deleteCircuit(id, isLocal);
    setConfirmDelete(null);
  };

  const handleNewCircuit = () => {
    if (hasUnsavedChanges) {
      // Could show a warning here too
    }
    clearCircuit();
    useCircuitsManagerStore.getState().clearCurrentCircuit();
    closeLoadModal();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const circuits = activeTab === 'cloud' ? myCircuits : localCircuits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLoadModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">My Circuits</h2>
          <button
            onClick={closeLoadModal}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'cloud'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Cloud ({myCircuits.length})
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'local'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Local ({localCircuits.length})
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* New Circuit button */}
          <button
            onClick={handleNewCircuit}
            className="w-full mb-4 p-3 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg text-gray-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Circuit
          </button>

          {/* Loading state */}
          {isLoadingCircuits && (
            <div className="flex items-center justify-center py-8">
              <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {/* Empty state */}
          {!isLoadingCircuits && circuits.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400 text-sm">
                {activeTab === 'cloud' ? 'No saved circuits yet' : 'No local circuits'}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Create a circuit and save it to see it here
              </p>
            </div>
          )}

          {/* Circuit list */}
          {!isLoadingCircuits && circuits.length > 0 && (
            <div className="space-y-2">
              {circuits.map((circuit) => {
                const isLocal = 'blueprint' in circuit && circuit.id.startsWith('local_');
                const isCurrent = circuit.id === currentCircuitId;

                return (
                  <div
                    key={circuit.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-blue-900/30 border-blue-600'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white truncate">{circuit.name}</h3>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded">
                              Current
                            </span>
                          )}
                        </div>
                        {'description' in circuit && circuit.description && (
                          <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">
                            {circuit.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{formatDate('updatedAt' in circuit ? circuit.updatedAt : circuit.updated_at)}</span>
                          {'blueprint' in circuit && (
                            <>
                              <span>{circuit.blueprint.components.length} components</span>
                              <span>{circuit.blueprint.wires.length} wires</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {confirmDelete === circuit.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(circuit.id, isLocal)}
                              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleLoad(circuit.id, isLocal)}
                              disabled={isLoading}
                              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-1"
                            >
                              {isLoading ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                              )}
                              Load
                            </button>
                            <button
                              onClick={() => setConfirmDelete(circuit.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                              title="Delete circuit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {!isAuthenticated && activeTab === 'local' && localCircuits.length > 0 && (
          <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Sign in to sync your circuits to the cloud
            </p>
          </div>
        )}
      </div>

      {/* Unsaved changes warning */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowUnsavedWarning(null)} />
          <div className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Unsaved Changes</h3>
            <p className="text-sm text-gray-400 mb-4">
              You have unsaved changes. Loading a new circuit will discard them.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnsavedWarning(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => performLoad(showUnsavedWarning.id, showUnsavedWarning.isLocal)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Discard & Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
