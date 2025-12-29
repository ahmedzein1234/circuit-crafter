import { useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { COMPONENT_EDUCATION } from '@circuit-crafter/shared';
import type { ComponentType } from '@circuit-crafter/shared';
import { FormulaCalculator } from './FormulaCalculator';
import type { FormulaType } from '../types/formulas';

interface ComponentInfoPanelProps {
  componentType?: ComponentType;
  onClose?: () => void;
}

export function ComponentInfoPanel({ componentType, onClose }: ComponentInfoPanelProps) {
  const { components, selectedComponentId } = useCircuitStore();
  const [activeTab, setActiveTab] = useState<'info' | 'calculator'>('info');
  const [calculatorTab, setCalculatorTab] = useState<FormulaType>('ohms_law');

  // Get component type from selection if not provided
  const selectedComponent = components.find((c) => c.id === selectedComponentId);
  const type = componentType || selectedComponent?.type;

  if (!type) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 text-slate-400 text-center">
        <span className="text-2xl mb-2 block" role="img" aria-label="info">
          ℹ️
        </span>
        <p>Click on a part to learn about it!</p>
      </div>
    );
  }

  const education = COMPONENT_EDUCATION[type];

  if (!education) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 text-slate-400">
        <p>Oops! We don't have info for this part yet.</p>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    power: 'bg-red-500',
    passive: 'bg-blue-500',
    active: 'bg-purple-500',
    logic: 'bg-green-500',
    output: 'bg-yellow-500',
    protection: 'bg-orange-500',
  };

  const categoryEmojis: Record<string, string> = {
    power: '⚡',
    passive: '🔧',
    active: '🎛️',
    logic: '🧠',
    output: '💡',
    protection: '🛡️',
  };

  // Determine default calculator tab based on component type
  const getDefaultCalculatorTab = (): FormulaType => {
    switch (type) {
      case 'resistor':
        return 'ohms_law';
      case 'battery':
        return 'power';
      case 'led':
        return 'led_resistor';
      case 'capacitor':
        return 'capacitor_charge';
      default:
        return 'ohms_law';
    }
  };

  // Get initial values for calculator from selected component
  const getInitialCalculatorValues = () => {
    if (!selectedComponent) return {};

    switch (type) {
      case 'resistor':
        return { resistance: 'resistance' in selectedComponent.properties ? selectedComponent.properties.resistance : undefined };
      case 'battery':
        return { voltage: 'voltage' in selectedComponent.properties ? selectedComponent.properties.voltage : undefined };
      case 'led':
        return {
          forwardVoltage: 'forwardVoltage' in selectedComponent.properties ? selectedComponent.properties.forwardVoltage : undefined,
          current: 'maxCurrent' in selectedComponent.properties ? selectedComponent.properties.maxCurrent : undefined,
        };
      case 'capacitor':
        return { capacitance: 'capacitance' in selectedComponent.properties ? selectedComponent.properties.capacitance : undefined };
      default:
        return {};
    }
  };

  const handleOpenCalculator = () => {
    setCalculatorTab(getDefaultCalculatorTab());
    setActiveTab('calculator');
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={education.category}>
            {categoryEmojis[education.category]}
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">{education.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded ${categoryColors[education.category]} text-white flex items-center gap-1 inline-flex`}
            >
              {education.category.charAt(0).toUpperCase() + education.category.slice(1)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-750 px-4 py-2 flex gap-2 border-b border-slate-600">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'info'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <span role="img" aria-label="info">
            📚
          </span>
          Learn
        </button>
        <button
          onClick={handleOpenCalculator}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <span role="img" aria-label="calculator">
            🔢
          </span>
          Calculator
        </button>
      </div>

      {/* Content */}
      {activeTab === 'info' && (
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
            <span role="img" aria-label="what">
              🤔
            </span>
            What is it?
          </h4>
          <p className="text-slate-200 text-base">{education.description}</p>
        </div>

        {/* How it works */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
            <span role="img" aria-label="how">
              ⚙️
            </span>
            How it works
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">{education.howItWorks}</p>
        </div>

        {/* Formula */}
        {education.formula && (
          <div className="bg-slate-700 rounded p-3">
            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <span role="img" aria-label="formula">
                📐
              </span>
              Math Formula
            </h4>
            <p className="font-mono text-lg text-white mb-1">{education.formula}</p>
            {education.formulaDescription && (
              <p className="text-xs text-slate-400">{education.formulaDescription}</p>
            )}
          </div>
        )}

        {/* Real world examples */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
            <span role="img" aria-label="real world">
              🌍
            </span>
            Where you'll find it
          </h4>
          <ul className="space-y-1">
            {education.realWorldExamples.map((example, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-green-400 mt-1" role="img" aria-label="item">
                  ✓
                </span>
                {example}
              </li>
            ))}
          </ul>
        </div>

        {/* Safety tips */}
        {education.safetyTips && education.safetyTips.length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="safety">
                ⚠️
              </span>
              Stay Safe!
            </h4>
            <ul className="space-y-1">
              {education.safetyTips.map((tip, i) => (
                <li key={i} className="text-sm text-yellow-200 flex items-start gap-2">
                  <span role="img" aria-label="tip">
                    👉
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fun fact */}
        {education.funFact && (
          <div className="bg-purple-900/30 border border-purple-700 rounded p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="fun">
                🎉
              </span>
              Cool Fact!
            </h4>
            <p className="text-sm text-purple-200">{education.funFact}</p>
          </div>
        )}
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="p-4">
          <FormulaCalculator
            initialTab={calculatorTab}
            initialValues={getInitialCalculatorValues()}
          />
        </div>
      )}
    </div>
  );
}
