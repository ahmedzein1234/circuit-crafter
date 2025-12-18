/**
 * Types for Formula Calculator
 */

export type FormulaType =
  | 'ohms_law'
  | 'power'
  | 'led_resistor'
  | 'capacitor_charge'
  | 'series_resistance'
  | 'parallel_resistance';

export interface OhmsLawInputs {
  voltage?: number;
  current?: number;
  resistance?: number;
}

export interface PowerInputs {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
}

export interface LEDResistorInputs {
  sourceVoltage?: number;
  forwardVoltage?: number;
  current?: number;
}

export interface CapacitorChargeInputs {
  capacitance?: number;
  voltage?: number;
  charge?: number;
}

export interface SeriesResistanceInputs {
  resistors: number[];
}

export interface ParallelResistanceInputs {
  resistors: number[];
}

export interface FormulaResult {
  value: number;
  unit: string;
  steps: string[];
  formula: string;
}

export interface FormulaTab {
  id: FormulaType;
  name: string;
  description: string;
  icon: string;
}

export type ResistanceUnit = 'Ω' | 'kΩ' | 'MΩ';
export type VoltageUnit = 'V' | 'mV' | 'kV';
export type CurrentUnit = 'A' | 'mA' | 'μA';
export type PowerUnit = 'W' | 'mW' | 'kW';
export type CapacitanceUnit = 'F' | 'mF' | 'μF' | 'nF' | 'pF';
export type ChargeUnit = 'C' | 'mC' | 'μC';
