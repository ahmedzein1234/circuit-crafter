import { useState } from 'react';
import type {
  FormulaType,
  FormulaTab,
  OhmsLawInputs,
  PowerInputs,
  LEDResistorInputs,
  CapacitorChargeInputs,
  FormulaResult,
} from '../types/formulas';
import {
  calculateOhmsLaw,
  calculatePower,
  calculateLEDResistor,
  calculateCapacitorCharge,
  calculateSeriesResistance,
  calculateParallelResistance,
  parseNumericInput,
  validateNumericInput,
  formatWithUnit,
} from '../utils/formulaCalculations';
import { FormulaDiagram } from './FormulaDiagram';

interface FormulaCalculatorProps {
  initialTab?: FormulaType;
  initialValues?: Partial<OhmsLawInputs | PowerInputs | LEDResistorInputs>;
  onClose?: () => void;
}

const FORMULA_TABS: FormulaTab[] = [
  {
    id: 'ohms_law',
    name: "Ohm's Law",
    description: 'Calculate voltage, current, or resistance',
    icon: 'V = I × R',
  },
  {
    id: 'power',
    name: 'Power',
    description: 'Calculate power, voltage, current, or resistance',
    icon: 'P = V × I',
  },
  {
    id: 'led_resistor',
    name: 'LED Resistor',
    description: 'Calculate current limiting resistor for LEDs',
    icon: 'R = (Vs - Vf) / I',
  },
  {
    id: 'capacitor_charge',
    name: 'Capacitor',
    description: 'Calculate charge, capacitance, or voltage',
    icon: 'Q = C × V',
  },
  {
    id: 'series_resistance',
    name: 'Series R',
    description: 'Calculate total series resistance',
    icon: 'R₁ + R₂',
  },
  {
    id: 'parallel_resistance',
    name: 'Parallel R',
    description: 'Calculate total parallel resistance',
    icon: '1/R_total',
  },
];

export function FormulaCalculator({
  initialTab = 'ohms_law',
  initialValues,
  onClose,
}: FormulaCalculatorProps) {
  const [activeTab, setActiveTab] = useState<FormulaType>(initialTab);
  const [result, setResult] = useState<FormulaResult | null>(null);

  // Ohm's Law state
  const [ohmsLaw, setOhmsLaw] = useState<OhmsLawInputs>(
    initialValues as OhmsLawInputs || {}
  );

  // Power state
  const [power, setPower] = useState<PowerInputs>(initialValues as PowerInputs || {});

  // LED Resistor state
  const [ledResistor, setLedResistor] = useState<LEDResistorInputs>(
    initialValues as LEDResistorInputs || {}
  );

  // Capacitor state
  const [capacitor, setCapacitor] = useState<CapacitorChargeInputs>({});

  // Series resistance state
  const [seriesResistors, setSeriesResistors] = useState<number[]>([]);
  const [seriesInput, setSeriesInput] = useState('');

  // Parallel resistance state
  const [parallelResistors, setParallelResistors] = useState<number[]>([]);
  const [parallelInput, setParallelInput] = useState('');

  const handleCalculate = () => {
    let calculatedResult: FormulaResult | null = null;

    switch (activeTab) {
      case 'ohms_law':
        calculatedResult = calculateOhmsLaw(ohmsLaw);
        break;
      case 'power':
        calculatedResult = calculatePower(power);
        break;
      case 'led_resistor':
        calculatedResult = calculateLEDResistor(ledResistor);
        break;
      case 'capacitor_charge':
        calculatedResult = calculateCapacitorCharge(capacitor);
        break;
      case 'series_resistance':
        calculatedResult = calculateSeriesResistance({ resistors: seriesResistors });
        break;
      case 'parallel_resistance':
        calculatedResult = calculateParallelResistance({ resistors: parallelResistors });
        break;
    }

    setResult(calculatedResult);
  };

  const handleClear = () => {
    setResult(null);
    switch (activeTab) {
      case 'ohms_law':
        setOhmsLaw({});
        break;
      case 'power':
        setPower({});
        break;
      case 'led_resistor':
        setLedResistor({});
        break;
      case 'capacitor_charge':
        setCapacitor({});
        break;
      case 'series_resistance':
        setSeriesResistors([]);
        setSeriesInput('');
        break;
      case 'parallel_resistance':
        setParallelResistors([]);
        setParallelInput('');
        break;
    }
  };

  const renderOhmsLawInputs = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Voltage (V)
        </label>
        <input
          type="number"
          step="any"
          value={ohmsLaw.voltage ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setOhmsLaw({ ...ohmsLaw, voltage: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Enter voltage in volts"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Current (A)
        </label>
        <input
          type="number"
          step="any"
          value={ohmsLaw.current ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setOhmsLaw({ ...ohmsLaw, current: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Enter current in amps"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Resistance (Ω)
        </label>
        <input
          type="number"
          step="any"
          value={ohmsLaw.resistance ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setOhmsLaw({ ...ohmsLaw, resistance: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Enter resistance in ohms"
        />
      </div>
      <p className="text-xs text-slate-400 italic">
        Enter any two values to calculate the third
      </p>
    </div>
  );

  const renderPowerInputs = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Voltage (V)
        </label>
        <input
          type="number"
          step="any"
          value={power.voltage ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setPower({ ...power, voltage: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Voltage in volts"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Current (A)
        </label>
        <input
          type="number"
          step="any"
          value={power.current ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setPower({ ...power, current: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Current in amps"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Resistance (Ω)
        </label>
        <input
          type="number"
          step="any"
          value={power.resistance ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setPower({ ...power, resistance: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Resistance in ohms"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Power (W)
        </label>
        <input
          type="number"
          step="any"
          value={power.power ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setPower({ ...power, power: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Power in watts"
        />
      </div>
      <p className="text-xs text-slate-400 italic">
        Enter any two values to calculate power or other values
      </p>
    </div>
  );

  const renderLEDResistorInputs = () => (
    <div className="space-y-3">
      <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mb-3">
        <p className="text-sm text-blue-200">
          This calculates the resistor needed to limit current through an LED.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Source Voltage (Vs)
        </label>
        <input
          type="number"
          step="any"
          value={ledResistor.sourceVoltage ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setLedResistor({
                ...ledResistor,
                sourceVoltage: parseNumericInput(e.target.value),
              });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="e.g., 5V or 9V"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          LED Forward Voltage (Vf)
        </label>
        <input
          type="number"
          step="any"
          value={ledResistor.forwardVoltage ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setLedResistor({
                ...ledResistor,
                forwardVoltage: parseNumericInput(e.target.value),
              });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Typically 1.8V-3.3V"
        />
        <p className="text-xs text-slate-400 mt-1">
          Red: ~1.8V, Green: ~2.0V, Blue: ~3.3V, White: ~3.3V
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Desired Current (I)
        </label>
        <input
          type="number"
          step="any"
          value={ledResistor.current ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setLedResistor({ ...ledResistor, current: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Typically 0.020A (20mA)"
        />
        <p className="text-xs text-slate-400 mt-1">
          Standard LEDs: 20mA (0.020A), High-power: up to 1A
        </p>
      </div>
    </div>
  );

  const renderCapacitorInputs = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Capacitance (F)
        </label>
        <input
          type="number"
          step="any"
          value={capacitor.capacitance ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setCapacitor({ ...capacitor, capacitance: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Enter capacitance in farads"
        />
        <p className="text-xs text-slate-400 mt-1">
          Common values: 0.0001F (100μF), 0.000001F (1μF)
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Voltage (V)
        </label>
        <input
          type="number"
          step="any"
          value={capacitor.voltage ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setCapacitor({ ...capacitor, voltage: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Voltage across capacitor"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Charge (C)
        </label>
        <input
          type="number"
          step="any"
          value={capacitor.charge ?? ''}
          onChange={(e) => {
            if (validateNumericInput(e.target.value)) {
              setCapacitor({ ...capacitor, charge: parseNumericInput(e.target.value) });
              setResult(null);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Charge in coulombs"
        />
      </div>
      <p className="text-xs text-slate-400 italic">
        Enter any two values to calculate the third
      </p>
    </div>
  );

  const renderSeriesResistanceInputs = () => (
    <div className="space-y-3">
      <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mb-3">
        <p className="text-sm text-blue-200">
          Resistors in series: Total resistance = R₁ + R₂ + R₃ + ...
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Add Resistor Value (Ω)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            value={seriesInput}
            onChange={(e) => {
              if (validateNumericInput(e.target.value)) {
                setSeriesInput(e.target.value);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = parseNumericInput(seriesInput);
                if (value !== undefined && value > 0) {
                  setSeriesResistors([...seriesResistors, value]);
                  setSeriesInput('');
                  setResult(null);
                }
              }
            }}
            className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter resistance value"
          />
          <button
            onClick={() => {
              const value = parseNumericInput(seriesInput);
              if (value !== undefined && value > 0) {
                setSeriesResistors([...seriesResistors, value]);
                setSeriesInput('');
                setResult(null);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Add
          </button>
        </div>
      </div>
      {seriesResistors.length > 0 && (
        <div className="bg-slate-700 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Resistors:</span>
            <button
              onClick={() => {
                setSeriesResistors([]);
                setResult(null);
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-1">
            {seriesResistors.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-200">R{i + 1}: {formatWithUnit(r, 'Ω')}</span>
                <button
                  onClick={() => {
                    setSeriesResistors(seriesResistors.filter((_, idx) => idx !== i));
                    setResult(null);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderParallelResistanceInputs = () => (
    <div className="space-y-3">
      <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mb-3">
        <p className="text-sm text-blue-200">
          Resistors in parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Add Resistor Value (Ω)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            value={parallelInput}
            onChange={(e) => {
              if (validateNumericInput(e.target.value)) {
                setParallelInput(e.target.value);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = parseNumericInput(parallelInput);
                if (value !== undefined && value > 0) {
                  setParallelResistors([...parallelResistors, value]);
                  setParallelInput('');
                  setResult(null);
                }
              }
            }}
            className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter resistance value"
          />
          <button
            onClick={() => {
              const value = parseNumericInput(parallelInput);
              if (value !== undefined && value > 0) {
                setParallelResistors([...parallelResistors, value]);
                setParallelInput('');
                setResult(null);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Add
          </button>
        </div>
      </div>
      {parallelResistors.length > 0 && (
        <div className="bg-slate-700 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Resistors:</span>
            <button
              onClick={() => {
                setParallelResistors([]);
                setResult(null);
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-1">
            {parallelResistors.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-200">R{i + 1}: {formatWithUnit(r, 'Ω')}</span>
                <button
                  onClick={() => {
                    setParallelResistors(parallelResistors.filter((_, idx) => idx !== i));
                    setResult(null);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInputs = () => {
    switch (activeTab) {
      case 'ohms_law':
        return renderOhmsLawInputs();
      case 'power':
        return renderPowerInputs();
      case 'led_resistor':
        return renderLEDResistorInputs();
      case 'capacitor_charge':
        return renderCapacitorInputs();
      case 'series_resistance':
        return renderSeriesResistanceInputs();
      case 'parallel_resistance':
        return renderParallelResistanceInputs();
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Formula Calculator</h3>
            <p className="text-xs text-slate-400">Interactive circuit calculations</p>
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

      {/* Tabs */}
      <div className="bg-slate-750 px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {FORMULA_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
              }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Description */}
        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-sm text-slate-300">
            {FORMULA_TABS.find((t) => t.id === activeTab)?.description}
          </p>
        </div>

        {/* Visual Diagram */}
        <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
          <FormulaDiagram formulaType={activeTab} />
        </div>

        {/* Inputs */}
        {renderInputs()}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Calculate
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-green-400">Result</h4>
              <span className="text-2xl font-mono font-bold text-white">
                {formatWithUnit(result.value, result.unit)}
              </span>
            </div>

            <div className="bg-slate-800/50 rounded p-3">
              <p className="text-sm font-semibold text-blue-400 mb-2">Formula Used:</p>
              <p className="font-mono text-lg text-white">{result.formula}</p>
            </div>

            <div className="bg-slate-800/50 rounded p-3">
              <p className="text-sm font-semibold text-purple-400 mb-2">Step-by-Step:</p>
              <div className="space-y-1">
                {result.steps.map((step, i) => (
                  <p key={i} className="text-sm text-slate-200 font-mono">
                    {step || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {result === null && activeTab !== 'series_resistance' && activeTab !== 'parallel_resistance' && (
          <div className="text-center text-slate-400 text-sm italic py-4">
            Fill in the required values and click Calculate
          </div>
        )}
      </div>
    </div>
  );
}
