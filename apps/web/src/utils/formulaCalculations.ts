/**
 * Formula calculation utilities for Circuit Crafter
 */

import type {
  OhmsLawInputs,
  PowerInputs,
  LEDResistorInputs,
  CapacitorChargeInputs,
  SeriesResistanceInputs,
  ParallelResistanceInputs,
  FormulaResult,
  ResistanceUnit,
  VoltageUnit,
  CurrentUnit,
  PowerUnit,
  CapacitanceUnit,
} from '../types/formulas';

// Unit conversion factors (to base units)
export const RESISTANCE_UNITS: Record<ResistanceUnit, number> = {
  'Ω': 1,
  'kΩ': 1000,
  'MΩ': 1000000,
};

export const VOLTAGE_UNITS: Record<VoltageUnit, number> = {
  'mV': 0.001,
  'V': 1,
  'kV': 1000,
};

export const CURRENT_UNITS: Record<CurrentUnit, number> = {
  'μA': 0.000001,
  'mA': 0.001,
  'A': 1,
};

export const POWER_UNITS: Record<PowerUnit, number> = {
  'mW': 0.001,
  'W': 1,
  'kW': 1000,
};

export const CAPACITANCE_UNITS: Record<CapacitanceUnit, number> = {
  'pF': 1e-12,
  'nF': 1e-9,
  'μF': 1e-6,
  'mF': 0.001,
  'F': 1,
};

/**
 * Convert value to appropriate unit for display
 */
export function formatWithUnit(value: number, baseUnit: string): string {
  if (baseUnit === 'Ω') {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MΩ`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)} kΩ`;
    }
    return `${value.toFixed(2)} Ω`;
  }

  if (baseUnit === 'V') {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)} kV`;
    } else if (Math.abs(value) < 1) {
      return `${(value * 1000).toFixed(2)} mV`;
    }
    return `${value.toFixed(2)} V`;
  }

  if (baseUnit === 'A') {
    if (Math.abs(value) >= 1) {
      return `${value.toFixed(3)} A`;
    } else if (Math.abs(value) >= 0.001) {
      return `${(value * 1000).toFixed(2)} mA`;
    }
    return `${(value * 1000000).toFixed(2)} μA`;
  }

  if (baseUnit === 'W') {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)} kW`;
    } else if (Math.abs(value) < 1) {
      return `${(value * 1000).toFixed(2)} mW`;
    }
    return `${value.toFixed(2)} W`;
  }

  if (baseUnit === 'F') {
    if (Math.abs(value) >= 0.001) {
      return `${(value * 1000).toFixed(2)} mF`;
    } else if (Math.abs(value) >= 1e-6) {
      return `${(value * 1e6).toFixed(2)} μF`;
    } else if (Math.abs(value) >= 1e-9) {
      return `${(value * 1e9).toFixed(2)} nF`;
    }
    return `${(value * 1e12).toFixed(2)} pF`;
  }

  if (baseUnit === 'C') {
    if (Math.abs(value) >= 1) {
      return `${value.toFixed(3)} C`;
    } else if (Math.abs(value) >= 0.001) {
      return `${(value * 1000).toFixed(2)} mC`;
    }
    return `${(value * 1000000).toFixed(2)} μC`;
  }

  return `${value.toFixed(3)} ${baseUnit}`;
}

/**
 * Calculate using Ohm's Law (V = I × R)
 */
export function calculateOhmsLaw(inputs: OhmsLawInputs): FormulaResult | null {
  const { voltage, current, resistance } = inputs;
  const count = [voltage, current, resistance].filter((v) => v !== undefined).length;

  if (count !== 2) {
    return null; // Need exactly 2 values to solve for the third
  }

  const steps: string[] = [];

  // Solve for Voltage
  if (voltage === undefined && current !== undefined && resistance !== undefined) {
    const result = current * resistance;
    steps.push('Using Ohm\'s Law: V = I × R');
    steps.push(`V = ${formatWithUnit(current, 'A')} × ${formatWithUnit(resistance, 'Ω')}`);
    steps.push(`V = ${formatWithUnit(result, 'V')}`);

    return {
      value: result,
      unit: 'V',
      steps,
      formula: 'V = I × R',
    };
  }

  // Solve for Current
  if (current === undefined && voltage !== undefined && resistance !== undefined) {
    if (resistance === 0) return null; // Division by zero
    const result = voltage / resistance;
    steps.push('Using Ohm\'s Law: I = V / R');
    steps.push(`I = ${formatWithUnit(voltage, 'V')} / ${formatWithUnit(resistance, 'Ω')}`);
    steps.push(`I = ${formatWithUnit(result, 'A')}`);

    return {
      value: result,
      unit: 'A',
      steps,
      formula: 'I = V / R',
    };
  }

  // Solve for Resistance
  if (resistance === undefined && voltage !== undefined && current !== undefined) {
    if (current === 0) return null; // Division by zero
    const result = voltage / current;
    steps.push('Using Ohm\'s Law: R = V / I');
    steps.push(`R = ${formatWithUnit(voltage, 'V')} / ${formatWithUnit(current, 'A')}`);
    steps.push(`R = ${formatWithUnit(result, 'Ω')}`);

    return {
      value: result,
      unit: 'Ω',
      steps,
      formula: 'R = V / I',
    };
  }

  return null;
}

/**
 * Calculate power using various formulas
 */
export function calculatePower(inputs: PowerInputs): FormulaResult | null {
  const { voltage, current, resistance, power } = inputs;
  const count = [voltage, current, resistance, power].filter((v) => v !== undefined).length;

  if (count < 2) return null;

  const steps: string[] = [];

  // P = V × I
  if (power === undefined && voltage !== undefined && current !== undefined) {
    const result = voltage * current;
    steps.push('Using Power Formula: P = V × I');
    steps.push(`P = ${formatWithUnit(voltage, 'V')} × ${formatWithUnit(current, 'A')}`);
    steps.push(`P = ${formatWithUnit(result, 'W')}`);

    return { value: result, unit: 'W', steps, formula: 'P = V × I' };
  }

  // P = I² × R
  if (power === undefined && current !== undefined && resistance !== undefined) {
    const result = current * current * resistance;
    steps.push('Using Power Formula: P = I² × R');
    steps.push(`P = (${formatWithUnit(current, 'A')})² × ${formatWithUnit(resistance, 'Ω')}`);
    steps.push(`P = ${formatWithUnit(result, 'W')}`);

    return { value: result, unit: 'W', steps, formula: 'P = I² × R' };
  }

  // P = V² / R
  if (power === undefined && voltage !== undefined && resistance !== undefined) {
    if (resistance === 0) return null;
    const result = (voltage * voltage) / resistance;
    steps.push('Using Power Formula: P = V² / R');
    steps.push(`P = (${formatWithUnit(voltage, 'V')})² / ${formatWithUnit(resistance, 'Ω')}`);
    steps.push(`P = ${formatWithUnit(result, 'W')}`);

    return { value: result, unit: 'W', steps, formula: 'P = V² / R' };
  }

  // Solve for V from P = V × I
  if (voltage === undefined && power !== undefined && current !== undefined) {
    if (current === 0) return null;
    const result = power / current;
    steps.push('Using Power Formula: V = P / I');
    steps.push(`V = ${formatWithUnit(power, 'W')} / ${formatWithUnit(current, 'A')}`);
    steps.push(`V = ${formatWithUnit(result, 'V')}`);

    return { value: result, unit: 'V', steps, formula: 'V = P / I' };
  }

  // Solve for I from P = V × I
  if (current === undefined && power !== undefined && voltage !== undefined) {
    if (voltage === 0) return null;
    const result = power / voltage;
    steps.push('Using Power Formula: I = P / V');
    steps.push(`I = ${formatWithUnit(power, 'W')} / ${formatWithUnit(voltage, 'V')}`);
    steps.push(`I = ${formatWithUnit(result, 'A')}`);

    return { value: result, unit: 'A', steps, formula: 'I = P / V' };
  }

  // Solve for R from P = V² / R
  if (resistance === undefined && power !== undefined && voltage !== undefined) {
    if (power === 0) return null;
    const result = (voltage * voltage) / power;
    steps.push('Using Power Formula: R = V² / P');
    steps.push(`R = (${formatWithUnit(voltage, 'V')})² / ${formatWithUnit(power, 'W')}`);
    steps.push(`R = ${formatWithUnit(result, 'Ω')}`);

    return { value: result, unit: 'Ω', steps, formula: 'R = V² / P' };
  }

  return null;
}

/**
 * Calculate LED current limiting resistor
 */
export function calculateLEDResistor(inputs: LEDResistorInputs): FormulaResult | null {
  const { sourceVoltage, forwardVoltage, current } = inputs;

  if (
    sourceVoltage === undefined ||
    forwardVoltage === undefined ||
    current === undefined ||
    current === 0
  ) {
    return null;
  }

  const steps: string[] = [];
  const voltageDrop = sourceVoltage - forwardVoltage;
  const result = voltageDrop / current;

  steps.push('Calculate voltage drop across resistor:');
  steps.push(`Vr = Vs - Vf = ${formatWithUnit(sourceVoltage, 'V')} - ${formatWithUnit(forwardVoltage, 'V')}`);
  steps.push(`Vr = ${formatWithUnit(voltageDrop, 'V')}`);
  steps.push('');
  steps.push('Using Ohm\'s Law: R = Vr / I');
  steps.push(`R = ${formatWithUnit(voltageDrop, 'V')} / ${formatWithUnit(current, 'A')}`);
  steps.push(`R = ${formatWithUnit(result, 'Ω')}`);

  return {
    value: result,
    unit: 'Ω',
    steps,
    formula: 'R = (Vs - Vf) / I',
  };
}

/**
 * Calculate capacitor charge
 */
export function calculateCapacitorCharge(inputs: CapacitorChargeInputs): FormulaResult | null {
  const { capacitance, voltage, charge } = inputs;
  const count = [capacitance, voltage, charge].filter((v) => v !== undefined).length;

  if (count !== 2) return null;

  const steps: string[] = [];

  // Solve for Charge
  if (charge === undefined && capacitance !== undefined && voltage !== undefined) {
    const result = capacitance * voltage;
    steps.push('Using Capacitor Formula: Q = C × V');
    steps.push(`Q = ${formatWithUnit(capacitance, 'F')} × ${formatWithUnit(voltage, 'V')}`);
    steps.push(`Q = ${formatWithUnit(result, 'C')}`);

    return { value: result, unit: 'C', steps, formula: 'Q = C × V' };
  }

  // Solve for Capacitance
  if (capacitance === undefined && charge !== undefined && voltage !== undefined) {
    if (voltage === 0) return null;
    const result = charge / voltage;
    steps.push('Using Capacitor Formula: C = Q / V');
    steps.push(`C = ${formatWithUnit(charge, 'C')} / ${formatWithUnit(voltage, 'V')}`);
    steps.push(`C = ${formatWithUnit(result, 'F')}`);

    return { value: result, unit: 'F', steps, formula: 'C = Q / V' };
  }

  // Solve for Voltage
  if (voltage === undefined && charge !== undefined && capacitance !== undefined) {
    if (capacitance === 0) return null;
    const result = charge / capacitance;
    steps.push('Using Capacitor Formula: V = Q / C');
    steps.push(`V = ${formatWithUnit(charge, 'C')} / ${formatWithUnit(capacitance, 'F')}`);
    steps.push(`V = ${formatWithUnit(result, 'V')}`);

    return { value: result, unit: 'V', steps, formula: 'V = Q / C' };
  }

  return null;
}

/**
 * Calculate total series resistance
 */
export function calculateSeriesResistance(inputs: SeriesResistanceInputs): FormulaResult | null {
  const { resistors } = inputs;

  if (!resistors || resistors.length === 0) return null;

  const steps: string[] = [];
  const result = resistors.reduce((sum, r) => sum + r, 0);

  steps.push('For resistors in series: R_total = R₁ + R₂ + R₃ + ...');
  steps.push(`R_total = ${resistors.map((r) => formatWithUnit(r, 'Ω')).join(' + ')}`);
  steps.push(`R_total = ${formatWithUnit(result, 'Ω')}`);

  return {
    value: result,
    unit: 'Ω',
    steps,
    formula: 'R_total = R₁ + R₂ + ...',
  };
}

/**
 * Calculate total parallel resistance
 */
export function calculateParallelResistance(
  inputs: ParallelResistanceInputs
): FormulaResult | null {
  const { resistors } = inputs;

  if (!resistors || resistors.length === 0 || resistors.some((r) => r === 0)) return null;

  const steps: string[] = [];
  const reciprocalSum = resistors.reduce((sum, r) => sum + 1 / r, 0);
  const result = 1 / reciprocalSum;

  steps.push('For resistors in parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...');
  steps.push(`1/R_total = ${resistors.map((r) => `1/${formatWithUnit(r, 'Ω')}`).join(' + ')}`);
  steps.push(`1/R_total = ${reciprocalSum.toFixed(6)}`);
  steps.push(`R_total = ${formatWithUnit(result, 'Ω')}`);

  return {
    value: result,
    unit: 'Ω',
    steps,
    formula: '1/R_total = 1/R₁ + 1/R₂ + ...',
  };
}

/**
 * Validate numeric input
 */
export function validateNumericInput(value: string, allowNegative = false): boolean {
  if (value === '') return true;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (!allowNegative && num < 0) return false;
  return true;
}

/**
 * Parse numeric input safely
 */
export function parseNumericInput(value: string): number | undefined {
  if (value === '') return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}
