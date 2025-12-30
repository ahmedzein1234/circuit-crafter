import { useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import type { SimulationWarning } from '@circuit-crafter/shared';

export function ProblemsPanel() {
  const { simulationResult, selectComponent } = useCircuitStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!simulationResult) {
    return null;
  }

  const { warnings, hasShortCircuit } = simulationResult;

  // Only show errors (serious problems like short circuits, overloads)
  // Don't show for info/warning tips - those appear in the SimulationPanel
  const errorWarnings = warnings.filter(w => w.severity === 'error');

  // Only show this panel for actual errors, not building tips
  if (errorWarnings.length === 0 && !hasShortCircuit) {
    return null;
  }

  const getSeverityIcon = (severity: SimulationWarning['severity']) => {
    switch (severity) {
      case 'error':
        return (
          <span className="text-2xl" role="img" aria-label="error">
            💥
          </span>
        );
      case 'warning':
        return (
          <span className="text-2xl" role="img" aria-label="warning">
            ⚠️
          </span>
        );
      case 'info':
        return (
          <span className="text-2xl" role="img" aria-label="info">
            💡
          </span>
        );
    }
  };

  const getSeverityColor = (severity: SimulationWarning['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-900/30 border-red-800 text-red-300';
      case 'warning':
        return 'bg-yellow-900/30 border-yellow-800 text-yellow-300';
      case 'info':
        return 'bg-blue-900/30 border-blue-800 text-blue-300';
    }
  };

  const handleWarningClick = (warning: SimulationWarning) => {
    // Highlight the first problematic component if available
    if (warning.componentIds.length > 0) {
      selectComponent(warning.componentIds[0]);
    }
  };

  return (
    <>
      {/* Desktop: Fixed top panel */}
      <div className="hidden md:block fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
        <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl animate-pulse" role="img" aria-label="alert">
              ⚡
            </span>
            <h3 className="text-white font-bold text-lg">Circuit Alert!</h3>
            <span className="ml-auto bg-white text-orange-600 px-2 py-1 rounded-full text-sm font-bold">
              {errorWarnings.length}
            </span>
          </div>

          {/* Problems list */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {errorWarnings.map((warning, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] ${getSeverityColor(
                warning.severity
              )}`}
              onClick={() => handleWarningClick(warning)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleWarningClick(warning);
                }
              }}
              aria-label={`${warning.severity} level problem: ${warning.message}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(warning.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm uppercase tracking-wide">
                      {warning.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-800/50 rounded">
                      {warning.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-base font-medium mb-2">{warning.message}</p>
                  {warning.helpText && (
                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0" role="img" aria-label="tip">
                          💡
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-green-400 mb-1">How to fix it:</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{warning.helpText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {warning.componentIds.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                      <span role="img" aria-label="click">
                        👆
                      </span>
                      Click to see which part has the problem
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

          {/* Footer tip */}
          <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
              <span role="img" aria-label="sparkles">
                ✨
              </span>
              Fix these to make your circuit work!
              <span role="img" aria-label="sparkles">
                ✨
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: Collapsible bottom sheet */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 transition-transform duration-300"
        style={{ transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 56px))' }}
      >
        <div className="bg-gray-900 border-t-2 border-yellow-500 shadow-2xl">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-3 flex items-center gap-3 touch-manipulation active:opacity-80"
          >
            <span className="text-xl animate-pulse" role="img" aria-label="alert">
              ⚡
            </span>
            <h3 className="text-white font-bold text-mobile-base flex-1 text-left">
              {isExpanded ? 'Circuit Alert!' : `${errorWarnings.length} Alert${errorWarnings.length !== 1 ? 's' : ''}`}
            </h3>
            <span className="bg-white text-orange-600 px-2 py-1 rounded-full text-mobile-xs font-bold">
              {errorWarnings.length}
            </span>
            <svg
              className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Problems list - collapsible */}
          {isExpanded && (
            <div className="max-h-[40vh] overflow-y-auto p-3 space-y-2 no-scrollbar">
              {errorWarnings.map((warning, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 active:scale-[0.98] transition-all touch-manipulation ${getSeverityColor(
                    warning.severity
                  )}`}
                  onClick={() => handleWarningClick(warning)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleWarningClick(warning);
                    }
                  }}
                  aria-label={`${warning.severity} level problem: ${warning.message}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5 text-lg">{getSeverityIcon(warning.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-mobile-xs uppercase tracking-wide">
                          {warning.severity}
                        </span>
                        <span className="text-mobile-xs px-1.5 py-0.5 bg-gray-800/50 rounded">
                          {warning.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-mobile-sm font-medium mb-1">{warning.message}</p>
                      {warning.helpText && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                          <div className="flex items-start gap-1">
                            <span className="text-base flex-shrink-0" role="img" aria-label="tip">
                              💡
                            </span>
                            <div>
                              <p className="text-mobile-xs font-semibold text-green-400 mb-0.5">How to fix:</p>
                              <p className="text-mobile-xs text-gray-300 leading-relaxed">{warning.helpText}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {warning.componentIds.length > 0 && (
                        <div className="mt-1.5 text-mobile-xs text-gray-400 flex items-center gap-1">
                          <span role="img" aria-label="tap">
                            👆
                          </span>
                          Tap to see which part
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
