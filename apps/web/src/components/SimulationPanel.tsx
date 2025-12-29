import { useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { formatSI } from '@circuit-crafter/shared';
import { Oscilloscope } from './Oscilloscope';
import { DailyChallengeCard } from './DailyChallengeCard';

export function SimulationPanel() {
  const { simulationResult, components, isSimulating, runSimulation, showCurrentFlow, toggleCurrentFlow } = useCircuitStore();
  const [showOscilloscope, setShowOscilloscope] = useState(false);

  const getComponentName = (componentId: string) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return 'Unknown';

    const typeNames: Record<string, string> = {
      battery: 'Battery',
      resistor: 'Resistor',
      led: 'LED',
      switch: 'Switch',
      and_gate: 'AND Gate',
      or_gate: 'OR Gate',
      not_gate: 'NOT Gate',
      ground: 'Ground',
    };

    return typeNames[component.type] || component.type;
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'powered':
        return 'text-green-400';
      case 'overloaded':
        return 'text-red-400';
      case 'off':
        return 'text-gray-500';
      case 'open':
        return 'text-yellow-400';
      case 'closed':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-mobile-sm md:text-sm font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
            Simulation
          </h2>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-3 md:px-3 py-2 min-h-touch-target md:min-h-11 text-mobile-xs md:text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:hover:scale-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isSimulating ? 'Simulation running' : 'Run circuit simulation'}
          >
            {isSimulating ? 'Running...' : 'Run'}
          </button>
        </div>
        <button
          onClick={() => setShowOscilloscope(true)}
          className="w-full px-3 py-2 min-h-touch-target md:min-h-11 text-mobile-xs md:text-xs font-medium bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Open oscilloscope"
        >
          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="hidden md:inline">Oscilloscope</span>
        </button>

        {/* Show Current Flow Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <label
            htmlFor="current-flow-toggle"
            className="text-xs font-medium text-gray-400 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Show Current Flow
          </label>
          <button
            id="current-flow-toggle"
            onClick={toggleCurrentFlow}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              showCurrentFlow ? 'bg-blue-600' : 'bg-gray-700'
            }`}
            role="switch"
            aria-checked={showCurrentFlow}
            aria-label="Toggle current flow animation"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showCurrentFlow ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Daily Challenge Card */}
        <DailyChallengeCard />

        {/* Status */}
        {simulationResult && (
          <div className="p-3 rounded-lg bg-gray-800/50" role="status" aria-live="polite">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  simulationResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}
                aria-label={simulationResult.success ? 'Success' : 'Error'}
              >
                {simulationResult.success ? (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">
                {simulationResult.success ? 'Circuit OK' : 'Issues Detected'}
              </span>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>Total Power: {formatSI(simulationResult.totalPower, 'W', 3)}</p>
              {simulationResult.hasShortCircuit && (
                <div className="flex items-center gap-2 text-red-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Short circuit detected!</span>
                </div>
              )}
              {simulationResult.hasOpenCircuit && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Open circuit detected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warnings */}
        {simulationResult && simulationResult.warnings.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Circuit Problems</h3>
            <div className="space-y-2">
              {simulationResult.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-3 rounded text-xs ${
                    warning.severity === 'error'
                      ? 'bg-red-900/30 text-red-300 border border-red-800'
                      : warning.severity === 'warning'
                      ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                      : 'bg-blue-900/30 text-blue-300 border border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {warning.severity === 'error' && (
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {warning.severity === 'warning' && (
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {warning.severity === 'info' && (
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-semibold">{warning.message}</span>
                  </div>
                  {warning.helpText && (
                    <div className="mt-2 pt-2 border-t border-gray-700/50 text-gray-300">
                      <div className="flex items-start gap-2">
                        <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs leading-relaxed">{warning.helpText}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component States */}
        {simulationResult && simulationResult.components.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Components</h3>
            <div className="space-y-2">
              {simulationResult.components.map((result) => (
                <div
                  key={result.componentId}
                  className="p-3 rounded-lg bg-gray-800/50 text-xs"
                  role="article"
                  aria-label={`${getComponentName(result.componentId)} status`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-300">
                      {getComponentName(result.componentId)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          result.state === 'powered' || result.state === 'closed'
                            ? 'bg-green-500'
                            : result.state === 'overloaded'
                            ? 'bg-red-500'
                            : result.state === 'open'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`}
                        aria-label={result.state}
                      />
                      <span className={`font-medium ${getStateColor(result.state)}`}>
                        {result.state.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-gray-400">
                    <div>
                      <span className="text-gray-500">V:</span>{' '}
                      {result.voltage.toFixed(2)}V
                    </div>
                    <div>
                      <span className="text-gray-500">I:</span>{' '}
                      {formatSI(result.current, 'A', 2)}
                    </div>
                    <div>
                      <span className="text-gray-500">P:</span>{' '}
                      {formatSI(result.power, 'W', 2)}
                    </div>
                    {result.brightness !== undefined && (
                      <div>
                        <span className="text-gray-500">Brightness:</span>{' '}
                        {Math.round(result.brightness * 100)}%
                      </div>
                    )}
                    {result.logicState !== undefined && (
                      <div>
                        <span className="text-gray-500">Output:</span>{' '}
                        <span
                          className={
                            result.logicState ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {result.logicState ? 'HIGH' : 'LOW'}
                        </span>
                      </div>
                    )}
                  </div>

                  {result.isOverloaded && (
                    <div className="mt-2 text-red-400 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Overloaded!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wire States */}
        {simulationResult && simulationResult.wires.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Wires</h3>
            <div className="text-xs text-gray-400">
              <p>
                Active wires:{' '}
                {simulationResult.wires.filter((w) => w.isCarryingCurrent).length} /{' '}
                {simulationResult.wires.length}
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!simulationResult || simulationResult.components.length === 0) && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No circuit to simulate</p>
            <p className="text-xs mt-1">Add components and connect them</p>
          </div>
        )}
      </div>

      {/* Quick reference */}
      <div className="p-3 border-t border-gray-800">
        <h3 className="text-xs font-medium text-gray-500 mb-2">Quick Reference</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p>V = I × R (Ohm's Law)</p>
          <p>P = V × I (Power)</p>
        </div>
      </div>

      {/* Oscilloscope Modal */}
      {showOscilloscope && <Oscilloscope onClose={() => setShowOscilloscope(false)} />}
    </div>
  );
}
