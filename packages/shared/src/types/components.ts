/**
 * Component type definitions for Circuit Crafter
 */

export type ComponentType =
  | 'battery'
  | 'resistor'
  | 'led'
  | 'switch'
  | 'wire'
  | 'and_gate'
  | 'or_gate'
  | 'not_gate'
  | 'capacitor'
  | 'diode'
  | 'transistor'
  | 'buzzer'
  | 'motor'
  | 'potentiometer'
  | 'fuse'
  | 'ground';

export type TerminalType =
  | 'positive'
  | 'negative'
  | 'input'
  | 'output'
  | 'input_a'
  | 'input_b'
  | 'anode'
  | 'cathode'
  | 'base'
  | 'collector'
  | 'emitter'
  | 'wiper';

export interface Position {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  type: TerminalType;
  position: Position;
  connectedTo: string[];
}

export type LEDColor = 'red' | 'green' | 'blue' | 'yellow' | 'white';

export interface ComponentProperties {
  voltage?: number;
  resistance?: number;
  forwardVoltage?: number;
  maxCurrent?: number;
  capacitance?: number;
  isOpen?: boolean;
  // Diode properties
  reverseVoltage?: number;
  // Transistor properties
  gain?: number;
  // Motor properties
  ratedVoltage?: number;
  ratedCurrent?: number;
  // Potentiometer properties
  maxResistance?: number;
  position?: number; // 0-100%
  // Fuse properties
  rating?: number; // Amperes
  isBlown?: boolean;
  // Buzzer properties
  frequency?: number;
  // LED properties
  color?: LEDColor;
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number;
  terminals: Terminal[];
  properties: ComponentProperties;
  label?: string;
}

export interface BatteryComponent extends BaseComponent {
  type: 'battery';
  properties: {
    voltage: number;
  };
}

export interface ResistorComponent extends BaseComponent {
  type: 'resistor';
  properties: {
    resistance: number;
  };
}

export interface LEDComponent extends BaseComponent {
  type: 'led';
  properties: {
    forwardVoltage: number;
    maxCurrent: number;
    color: LEDColor;
  };
}

export interface SwitchComponent extends BaseComponent {
  type: 'switch';
  properties: {
    isOpen: boolean;
  };
}

export interface WireComponent extends BaseComponent {
  type: 'wire';
  properties: Record<string, never>;
}

export interface LogicGateComponent extends BaseComponent {
  type: 'and_gate' | 'or_gate' | 'not_gate';
  properties: Record<string, never>;
}

export interface GroundComponent extends BaseComponent {
  type: 'ground';
  properties: Record<string, never>;
}

export interface CapacitorComponent extends BaseComponent {
  type: 'capacitor';
  properties: {
    capacitance: number; // Farads
  };
}

export interface DiodeComponent extends BaseComponent {
  type: 'diode';
  properties: {
    forwardVoltage: number;
    reverseVoltage: number;
  };
}

export interface TransistorComponent extends BaseComponent {
  type: 'transistor';
  properties: {
    gain: number; // Beta/hFE
  };
}

export interface BuzzerComponent extends BaseComponent {
  type: 'buzzer';
  properties: {
    frequency: number; // Hz
    forwardVoltage: number;
  };
}

export interface MotorComponent extends BaseComponent {
  type: 'motor';
  properties: {
    ratedVoltage: number;
    ratedCurrent: number;
  };
}

export interface PotentiometerComponent extends BaseComponent {
  type: 'potentiometer';
  properties: {
    maxResistance: number;
    position: number; // 0-100%
  };
}

export interface FuseComponent extends BaseComponent {
  type: 'fuse';
  properties: {
    rating: number; // Amperes
    isBlown: boolean;
  };
}

export type CircuitComponent =
  | BatteryComponent
  | ResistorComponent
  | LEDComponent
  | SwitchComponent
  | WireComponent
  | LogicGateComponent
  | GroundComponent
  | CapacitorComponent
  | DiodeComponent
  | TransistorComponent
  | BuzzerComponent
  | MotorComponent
  | PotentiometerComponent
  | FuseComponent;

export interface Wire {
  id: string;
  fromTerminal: string;
  toTerminal: string;
  path: Position[];
}

export interface Circuit {
  id: string;
  name: string;
  description?: string;
  components: CircuitComponent[];
  wires: Wire[];
  createdAt: string;
  updatedAt: string;
}
