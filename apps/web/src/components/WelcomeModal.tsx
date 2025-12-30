import { useEffect, useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { useCircuitsManagerStore } from '../stores/circuitsManagerStore';

interface WelcomeModalProps {
  onTemplatesClick: () => void;
}

export function WelcomeModal({ onTemplatesClick }: WelcomeModalProps) {
  const components = useCircuitStore((state) => state.components);
  const { openLoadModal } = useCircuitsManagerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show modal when canvas is empty and user hasn't interacted yet
  useEffect(() => {
    if (components.length === 0 && !hasInteracted) {
      // Small delay to let the app render first
      const timer = setTimeout(() => setIsOpen(true), 300);
      return () => clearTimeout(timer);
    } else if (components.length > 0) {
      setIsOpen(false);
      setHasInteracted(true);
    }
  }, [components.length, hasInteracted]);

  const handleTemplates = () => {
    setIsOpen(false);
    setHasInteracted(true);
    onTemplatesClick();
  };

  const handleLoad = () => {
    setIsOpen(false);
    setHasInteracted(true);
    openLoadModal();
  };

  const handleStartBlank = () => {
    setIsOpen(false);
    setHasInteracted(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleStartBlank}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 id="welcome-title" className="text-2xl font-bold text-white mb-2">
              Welcome to Circuit Crafter!
            </h2>
            <p className="text-blue-100 text-sm">
              Learn electronics by building interactive circuits
            </p>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            <p className="text-gray-400 text-sm text-center mb-4">
              How would you like to start?
            </p>

            {/* Use Template */}
            <button
              onClick={handleTemplates}
              className="w-full p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold">Use a Template</h3>
                <p className="text-gray-400 text-sm">Start with a pre-built circuit to learn from</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Load Previous */}
            <button
              onClick={handleLoad}
              className="w-full p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold">Load Previous Project</h3>
                <p className="text-gray-400 text-sm">Continue working on a saved circuit</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Start Blank */}
            <button
              onClick={handleStartBlank}
              className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold">Start Blank</h3>
                <p className="text-gray-400 text-sm">Build your circuit from scratch</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <p className="text-gray-500 text-xs text-center">
              Drag components from the left panel to start building
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
