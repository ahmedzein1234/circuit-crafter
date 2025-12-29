// Save Circuit Modal - allows users to save their circuit with a name and description

import { useState, useEffect, useRef } from 'react';
import { useCircuitsManagerStore } from '../stores/circuitsManagerStore';
import { useCircuitStore } from '../stores/circuitStore';
import { useAuthStore } from '../stores/authStore';

export function SaveCircuitModal() {
  const {
    isSaveModalOpen,
    closeSaveModal,
    saveCircuit,
    updateCircuit,
    currentCircuitId,
    currentCircuitName,
    isSaving,
    error,
    clearError,
  } = useCircuitsManagerStore();

  const { components, wires } = useCircuitStore();
  const { isAuthenticated } = useAuthStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saveMode, setSaveMode] = useState<'new' | 'update'>('new');

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isSaveModalOpen) {
      setName(currentCircuitName || '');
      setDescription('');
      setIsPublic(false);
      setSaveMode(currentCircuitId ? 'update' : 'new');
      clearError();

      // Focus input after modal animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSaveModalOpen, currentCircuitId, currentCircuitName, clearError]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSaveModalOpen) {
        closeSaveModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSaveModalOpen, closeSaveModal]);

  if (!isSaveModalOpen) return null;

  const handleSave = async () => {
    if (saveMode === 'update' && currentCircuitId) {
      await updateCircuit(components, wires);
    } else {
      if (!name.trim()) return;
      await saveCircuit(name.trim(), description.trim(), components, wires, isPublic, isAuthenticated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeSaveModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Save Circuit</h2>
          <button
            onClick={closeSaveModal}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Save mode toggle (if updating is possible) */}
          {currentCircuitId && (
            <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => setSaveMode('update')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  saveMode === 'update'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Update "{currentCircuitName}"
              </button>
              <button
                type="button"
                onClick={() => setSaveMode('new')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  saveMode === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Save as New
              </button>
            </div>
          )}

          {/* Name input (only for new saves) */}
          {saveMode === 'new' && (
            <div>
              <label htmlFor="circuit-name" className="block text-sm font-medium text-gray-300 mb-1">
                Circuit Name *
              </label>
              <input
                ref={inputRef}
                id="circuit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Circuit"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={100}
                required
              />
            </div>
          )}

          {/* Description (only for new saves) */}
          {saveMode === 'new' && (
            <div>
              <label htmlFor="circuit-description" className="block text-sm font-medium text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="circuit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this circuit does..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                maxLength={500}
              />
            </div>
          )}

          {/* Public toggle (only if authenticated) */}
          {isAuthenticated && saveMode === 'new' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-white">Make Public</span>
                <p className="text-xs text-gray-400">Others can view and fork your circuit</p>
              </div>
            </label>
          )}

          {/* Guest notice */}
          {!isAuthenticated && saveMode === 'new' && (
            <div className="p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm text-amber-200">Saving locally</p>
                  <p className="text-xs text-amber-300/70 mt-0.5">
                    Sign in to save to the cloud and share with others
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Circuit stats */}
          <div className="flex gap-4 text-sm text-gray-400">
            <span>{components.length} components</span>
            <span>{wires.length} wires</span>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeSaveModal}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (saveMode === 'new' && !name.trim())}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : saveMode === 'update' ? (
                'Update'
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
