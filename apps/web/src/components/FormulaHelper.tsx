import { useState } from 'react';
import type { ComponentType } from '@circuit-crafter/shared';
import { COMPONENT_EDUCATION } from '@circuit-crafter/shared';
import type { FormulaType } from '../types/formulas';

interface FormulaHelperProps {
  componentType: ComponentType;
  position?: { x: number; y: number };
  onCalculate?: (formulaType: FormulaType, initialValues?: Record<string, number>) => void;
}

export function FormulaHelper({
  componentType,
  position = { x: 0, y: 0 },
  onCalculate,
}: FormulaHelperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const education = COMPONENT_EDUCATION[componentType];

  if (!education || !education.formula) {
    return null;
  }

  // Determine which formula calculator to open based on component type
  const getFormulaContext = (): { type: FormulaType; values?: Record<string, number> } | null => {
    switch (componentType) {
      case 'resistor':
        return { type: 'ohms_law' };
      case 'battery':
        return { type: 'power' };
      case 'led':
        return { type: 'led_resistor' };
      case 'capacitor':
        return { type: 'capacitor_charge' };
      default:
        return { type: 'ohms_law' };
    }
  };

  const handleCalculateClick = () => {
    const context = getFormulaContext();
    if (context && onCalculate) {
      onCalculate(context.type, context.values);
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Trigger Icon */}
      <button
        className="p-1 rounded hover:bg-slate-600 transition-colors"
        title="Formula helper"
      >
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div
          className="absolute z-50 bg-slate-700 border border-slate-600 rounded-lg shadow-xl p-3 min-w-[250px]"
          style={{
            top: position.y + 30,
            left: position.x,
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h4 className="text-sm font-semibold text-white">Related Formula</h4>
            </div>

            <div className="bg-slate-800 rounded p-2">
              <p className="font-mono text-white text-sm">{education.formula}</p>
              {education.formulaDescription && (
                <p className="text-xs text-slate-400 mt-1">{education.formulaDescription}</p>
              )}
            </div>

            {onCalculate && (
              <button
                onClick={handleCalculateClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Open Calculator
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface PropertyFormulaHintProps {
  componentType: ComponentType;
  propertyName: string;
  onCalculate?: (formulaType: FormulaType, initialValues?: Record<string, number>) => void;
}

/**
 * Inline formula hint that can be placed next to input fields
 */
export function PropertyFormulaHint({
  componentType,
  propertyName,
  onCalculate,
}: PropertyFormulaHintProps) {
  const education = COMPONENT_EDUCATION[componentType];

  if (!education || !education.formula) {
    return null;
  }

  // Map property names to relevant formulas
  const getRelevantFormula = (): string => {
    if (componentType === 'resistor') {
      if (propertyName === 'resistance') return 'V = I × R';
    }
    if (componentType === 'battery') {
      if (propertyName === 'voltage') return 'P = V × I';
    }
    if (componentType === 'led') {
      if (propertyName === 'forwardVoltage' || propertyName === 'maxCurrent') {
        return 'R = (Vs - Vf) / I';
      }
    }
    if (componentType === 'capacitor') {
      if (propertyName === 'capacitance') return 'Q = C × V';
    }
    return education?.formula || '';
  };

  const formula = getRelevantFormula();

  const getFormulaContext = (): { type: FormulaType; values?: Record<string, number> } | null => {
    switch (componentType) {
      case 'resistor':
        return { type: 'ohms_law' };
      case 'battery':
        return { type: 'power' };
      case 'led':
        return { type: 'led_resistor' };
      case 'capacitor':
        return { type: 'capacitor_charge' };
      default:
        return { type: 'ohms_law' };
    }
  };

  const handleCalculateClick = () => {
    const context = getFormulaContext();
    if (context && onCalculate) {
      onCalculate(context.type, context.values);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono">{formula}</span>
      </div>
      {onCalculate && (
        <button
          onClick={handleCalculateClick}
          className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
        >
          Calculate
        </button>
      )}
    </div>
  );
}
