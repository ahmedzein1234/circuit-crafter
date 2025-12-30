import { useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { COMPONENT_EDUCATION } from '@circuit-crafter/shared';
import type { ComponentType } from '@circuit-crafter/shared';
import { FormulaCalculator } from './FormulaCalculator';
import type { FormulaType } from '../types/formulas';

// Property editor for different component types
function PropertyEditor({ componentId, componentType, properties }: {
  componentId: string;
  componentType: ComponentType;
  properties: Record<string, unknown>;
}) {
  const { updateComponentProperty, toggleSwitch } = useCircuitStore();

  const renderPropertyInput = (label: string, property: string, value: unknown, unit: string, min?: number, max?: number, step?: number) => {
    const numValue = typeof value === 'number' ? value : 0;

    return (
      <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-700 last:border-0">
        <label className="text-sm text-slate-300 flex-shrink-0">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={numValue}
            min={min}
            max={max}
            step={step || 1}
            onChange={(e) => updateComponentProperty(componentId, property, parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-400 w-8">{unit}</span>
        </div>
      </div>
    );
  };

  const renderSelectInput = (label: string, property: string, value: unknown, options: { value: string; label: string }[]) => {
    return (
      <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-700 last:border-0">
        <label className="text-sm text-slate-300 flex-shrink-0">{label}</label>
        <select
          value={String(value || options[0]?.value)}
          onChange={(e) => updateComponentProperty(componentId, property, e.target.value)}
          className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderToggle = (label: string, isOn: boolean) => {
    return (
      <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-700 last:border-0">
        <label className="text-sm text-slate-300 flex-shrink-0">{label}</label>
        <button
          onClick={() => toggleSwitch(componentId)}
          className={`w-14 h-7 rounded-full transition-colors relative ${isOn ? 'bg-green-600' : 'bg-slate-600'}`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${isOn ? 'left-8' : 'left-1'}`} />
        </button>
      </div>
    );
  };

  switch (componentType) {
    case 'battery':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Voltage', 'voltage', properties.voltage, 'V', 0.1, 24, 0.1)}
        </div>
      );

    case 'resistor':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Resistance', 'resistance', properties.resistance, 'Ω', 1, 10000000, 1)}
        </div>
      );

    case 'led':
      return (
        <div className="space-y-1">
          {renderSelectInput('Color', 'color', properties.color, [
            { value: 'red', label: 'Red' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' },
            { value: 'yellow', label: 'Yellow' },
            { value: 'white', label: 'White' },
          ])}
          {renderPropertyInput('Forward Voltage', 'forwardVoltage', properties.forwardVoltage, 'V', 1.5, 4, 0.1)}
          {renderPropertyInput('Max Current', 'maxCurrent', properties.maxCurrent, 'A', 0.001, 0.1, 0.001)}
        </div>
      );

    case 'capacitor':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Capacitance', 'capacitance', properties.capacitance, 'µF', 0.001, 10000, 0.001)}
          {renderPropertyInput('Max Voltage', 'maxVoltage', properties.maxVoltage, 'V', 1, 100, 1)}
        </div>
      );

    case 'switch':
      return (
        <div className="space-y-1">
          {renderToggle('Switch State', properties.isOpen === false)}
        </div>
      );

    case 'potentiometer':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Max Resistance', 'maxResistance', properties.maxResistance, 'Ω', 100, 1000000, 100)}
          <div className="flex items-center justify-between gap-3 py-2">
            <label className="text-sm text-slate-300 flex-shrink-0">Position</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={typeof properties.position === 'number' ? properties.position : 0.5}
                onChange={(e) => updateComponentProperty(componentId, 'position', parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-slate-400 w-10">{Math.round((typeof properties.position === 'number' ? properties.position : 0.5) * 100)}%</span>
            </div>
          </div>
        </div>
      );

    case 'fuse':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Rating', 'rating', properties.rating, 'A', 0.1, 30, 0.1)}
        </div>
      );

    case 'motor':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Voltage', 'voltage', properties.voltage, 'V', 1, 24, 1)}
          {renderPropertyInput('Current', 'current', properties.current, 'A', 0.1, 5, 0.1)}
        </div>
      );

    case 'buzzer':
      return (
        <div className="space-y-1">
          {renderPropertyInput('Voltage', 'voltage', properties.voltage, 'V', 1, 24, 1)}
          {renderPropertyInput('Frequency', 'frequency', properties.frequency, 'Hz', 100, 10000, 100)}
        </div>
      );

    default:
      return (
        <div className="text-slate-400 text-sm text-center py-4">
          No editable properties for this component
        </div>
      );
  }
}

interface ComponentInfoPanelProps {
  componentType?: ComponentType;
  onClose?: () => void;
}

export function ComponentInfoPanel({ componentType, onClose }: ComponentInfoPanelProps) {
  const { components, selectedComponentId } = useCircuitStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'info' | 'calculator'>('properties');
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
        {selectedComponent && (
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span role="img" aria-label="properties">
              🔧
            </span>
            Properties
          </button>
        )}
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
      {/* Properties Tab */}
      {activeTab === 'properties' && selectedComponent && (
        <div className="p-4">
          <div className="mb-3 pb-3 border-b border-slate-700">
            <h4 className="text-sm font-semibold text-slate-400 uppercase flex items-center gap-2">
              <span role="img" aria-label="settings">⚙️</span>
              Edit Properties
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Change the values below and the simulation will update automatically
            </p>
          </div>
          <PropertyEditor
            componentId={selectedComponent.id}
            componentType={selectedComponent.type}
            properties={selectedComponent.properties as Record<string, unknown>}
          />
        </div>
      )}

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
