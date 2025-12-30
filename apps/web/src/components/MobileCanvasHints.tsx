import { useEffect, useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';

export function MobileCanvasHints() {
  const { isDrawingWire, selectedComponentId, selectedWireId, components } = useCircuitStore();
  const [showGestureHint, setShowGestureHint] = useState(false);
  const [hasShownGestureHint, setHasShownGestureHint] = useState(false);

  // Show gesture hint on first component add (once per session)
  useEffect(() => {
    if (components.length === 1 && !hasShownGestureHint) {
      setShowGestureHint(true);
      setHasShownGestureHint(true);
      const timer = setTimeout(() => setShowGestureHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [components.length, hasShownGestureHint]);

  // Determine current mode
  const getMode = () => {
    if (isDrawingWire) {
      return { label: 'Connecting', color: 'bg-green-600', icon: '🔌' };
    }
    if (selectedComponentId) {
      return { label: 'Selected', color: 'bg-blue-600', icon: '✓' };
    }
    if (selectedWireId) {
      return { label: 'Wire Selected', color: 'bg-purple-600', icon: '〰️' };
    }
    return null;
  };

  const mode = getMode();

  return (
    <>
      {/* Mode indicator - shows current interaction mode */}
      {mode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 md:hidden animate-fade-in">
          <div className={`${mode.color} px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}>
            <span className="text-sm">{mode.icon}</span>
            <span className="text-white text-sm font-medium">{mode.label}</span>
            {isDrawingWire && (
              <span className="text-white/80 text-xs ml-1">Tap terminal to connect</span>
            )}
          </div>
        </div>
      )}

      {/* Gesture hints overlay */}
      {showGestureHint && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center md:hidden animate-fade-in"
          onClick={() => setShowGestureHint(false)}
        >
          <div className="bg-gray-900 rounded-2xl p-6 mx-4 max-w-sm shadow-xl border border-gray-700">
            <h3 className="text-white text-lg font-bold mb-4 text-center">Touch Gestures</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👆</span>
                </div>
                <div>
                  <p className="text-white font-medium">Tap</p>
                  <p className="text-gray-400 text-sm">Select component or terminal</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👆👆</span>
                </div>
                <div>
                  <p className="text-white font-medium">Double Tap</p>
                  <p className="text-gray-400 text-sm">Delete wire or toggle switch</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤏</span>
                </div>
                <div>
                  <p className="text-white font-medium">Pinch</p>
                  <p className="text-gray-400 text-sm">Zoom in and out</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✌️</span>
                </div>
                <div>
                  <p className="text-white font-medium">Two Finger Drag</p>
                  <p className="text-gray-400 text-sm">Pan around the canvas</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGestureHint(false)}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Quick gesture reminder button - shows after hint is dismissed */}
      {!showGestureHint && hasShownGestureHint && components.length > 0 && (
        <button
          onClick={() => setShowGestureHint(true)}
          className="fixed bottom-20 left-4 z-30 w-10 h-10 bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all md:hidden shadow-lg"
          title="Show gesture hints"
          aria-label="Show gesture hints"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </>
  );
}
