/**
 * Factory for creating circuit components
 */

import type {
  ComponentType,
  CircuitComponent,
  BatteryComponent,
  ResistorComponent,
  LEDComponent,
  SwitchComponent,
  WireComponent,
  LogicGateComponent,
  GroundComponent,
  CapacitorComponent,
  DiodeComponent,
  TransistorComponent,
  BuzzerComponent,
  MotorComponent,
  PotentiometerComponent,
  FuseComponent,
  Position,
  Terminal,
} from '@circuit-crafter/shared';
import { generateId, COMPONENT_DEFAULTS } from '@circuit-crafter/shared';

function createTerminal(
  type: Terminal['type'],
  offsetX: number,
  offsetY: number,
  basePosition: Position
): Terminal {
  return {
    id: generateId(),
    type,
    position: {
      x: basePosition.x + offsetX,
      y: basePosition.y + offsetY,
    },
    connectedTo: [],
  };
}

export function createBattery(position: Position, voltage: number = 9): BatteryComponent {
  const defaults = COMPONENT_DEFAULTS.battery;
  return {
    id: generateId(),
    type: 'battery',
    position,
    rotation: 0,
    terminals: [
      createTerminal('positive', defaults.width, defaults.height / 2, position),
      createTerminal('negative', 0, defaults.height / 2, position),
    ],
    properties: { voltage },
  };
}

export function createResistor(position: Position, resistance: number = 1000): ResistorComponent {
  const defaults = COMPONENT_DEFAULTS.resistor;
  return {
    id: generateId(),
    type: 'resistor',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input', 0, defaults.height / 2, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: { resistance },
  };
}

export function createLED(
  position: Position,
  forwardVoltage: number = 2,
  maxCurrent: number = 0.02
): LEDComponent {
  const defaults = COMPONENT_DEFAULTS.led;
  return {
    id: generateId(),
    type: 'led',
    position,
    rotation: 0,
    terminals: [
      createTerminal('positive', defaults.width / 2, 0, position),
      createTerminal('negative', defaults.width / 2, defaults.height, position),
    ],
    properties: { forwardVoltage, maxCurrent },
  };
}

export function createSwitch(position: Position, isOpen: boolean = true): SwitchComponent {
  const defaults = COMPONENT_DEFAULTS.switch;
  return {
    id: generateId(),
    type: 'switch',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input', 0, defaults.height / 2, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: { isOpen },
  };
}

export function createWire(fromPosition: Position, toPosition: Position): WireComponent {
  return {
    id: generateId(),
    type: 'wire',
    position: fromPosition,
    rotation: 0,
    terminals: [
      createTerminal('input', 0, 0, fromPosition),
      createTerminal('output', toPosition.x - fromPosition.x, toPosition.y - fromPosition.y, fromPosition),
    ],
    properties: {},
  };
}

export function createANDGate(position: Position): LogicGateComponent {
  const defaults = COMPONENT_DEFAULTS.and_gate;
  return {
    id: generateId(),
    type: 'and_gate',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input_a', 0, defaults.height / 4, position),
      createTerminal('input_b', 0, (defaults.height * 3) / 4, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: {},
  };
}

export function createORGate(position: Position): LogicGateComponent {
  const defaults = COMPONENT_DEFAULTS.or_gate;
  return {
    id: generateId(),
    type: 'or_gate',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input_a', 0, defaults.height / 4, position),
      createTerminal('input_b', 0, (defaults.height * 3) / 4, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: {},
  };
}

export function createNOTGate(position: Position): LogicGateComponent {
  const defaults = COMPONENT_DEFAULTS.not_gate;
  return {
    id: generateId(),
    type: 'not_gate',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input', 0, defaults.height / 2, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: {},
  };
}

export function createGround(position: Position): GroundComponent {
  const defaults = COMPONENT_DEFAULTS.ground;
  return {
    id: generateId(),
    type: 'ground',
    position,
    rotation: 0,
    terminals: [createTerminal('input', defaults.width / 2, 0, position)],
    properties: {},
  };
}

export function createCapacitor(
  position: Position,
  capacitance: number = COMPONENT_DEFAULTS.capacitor.capacitance
): CapacitorComponent {
  const defaults = COMPONENT_DEFAULTS.capacitor;
  return {
    id: generateId(),
    type: 'capacitor',
    position,
    rotation: 0,
    terminals: [
      createTerminal('positive', 0, defaults.height / 2, position),
      createTerminal('negative', defaults.width, defaults.height / 2, position),
    ],
    properties: { capacitance },
  };
}

export function createDiode(
  position: Position,
  forwardVoltage: number = COMPONENT_DEFAULTS.diode.forwardVoltage
): DiodeComponent {
  const defaults = COMPONENT_DEFAULTS.diode;
  return {
    id: generateId(),
    type: 'diode',
    position,
    rotation: 0,
    terminals: [
      createTerminal('anode', 0, defaults.height / 2, position),
      createTerminal('cathode', defaults.width, defaults.height / 2, position),
    ],
    properties: {
      forwardVoltage,
      reverseVoltage: COMPONENT_DEFAULTS.diode.reverseVoltage,
    },
  };
}

export function createTransistor(
  position: Position,
  gain: number = COMPONENT_DEFAULTS.transistor.gain
): TransistorComponent {
  const defaults = COMPONENT_DEFAULTS.transistor;
  return {
    id: generateId(),
    type: 'transistor',
    position,
    rotation: 0,
    terminals: [
      createTerminal('base', 0, defaults.height / 2, position),
      createTerminal('collector', defaults.width / 2, 0, position),
      createTerminal('emitter', defaults.width / 2, defaults.height, position),
    ],
    properties: { gain },
  };
}

export function createBuzzer(
  position: Position,
  frequency: number = COMPONENT_DEFAULTS.buzzer.frequency
): BuzzerComponent {
  const defaults = COMPONENT_DEFAULTS.buzzer;
  return {
    id: generateId(),
    type: 'buzzer',
    position,
    rotation: 0,
    terminals: [
      createTerminal('positive', defaults.width / 2, 0, position),
      createTerminal('negative', defaults.width / 2, defaults.height, position),
    ],
    properties: {
      frequency,
      forwardVoltage: COMPONENT_DEFAULTS.buzzer.forwardVoltage,
    },
  };
}

export function createMotor(
  position: Position,
  ratedVoltage: number = COMPONENT_DEFAULTS.motor.ratedVoltage
): MotorComponent {
  const defaults = COMPONENT_DEFAULTS.motor;
  return {
    id: generateId(),
    type: 'motor',
    position,
    rotation: 0,
    terminals: [
      createTerminal('positive', defaults.width / 2, 0, position),
      createTerminal('negative', defaults.width / 2, defaults.height, position),
    ],
    properties: {
      ratedVoltage,
      ratedCurrent: COMPONENT_DEFAULTS.motor.ratedCurrent,
    },
  };
}

export function createPotentiometer(
  position: Position,
  maxResistance: number = COMPONENT_DEFAULTS.potentiometer.maxResistance,
  initialPosition: number = 50
): PotentiometerComponent {
  const defaults = COMPONENT_DEFAULTS.potentiometer;
  return {
    id: generateId(),
    type: 'potentiometer',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input', 0, defaults.height / 2, position),
      createTerminal('wiper', defaults.width / 2, 0, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: {
      maxResistance,
      position: initialPosition,
    },
  };
}

export function createFuse(
  position: Position,
  rating: number = COMPONENT_DEFAULTS.fuse.rating
): FuseComponent {
  const defaults = COMPONENT_DEFAULTS.fuse;
  return {
    id: generateId(),
    type: 'fuse',
    position,
    rotation: 0,
    terminals: [
      createTerminal('input', 0, defaults.height / 2, position),
      createTerminal('output', defaults.width, defaults.height / 2, position),
    ],
    properties: {
      rating,
      isBlown: false,
    },
  };
}

export function createComponent(type: ComponentType, position: Position): CircuitComponent {
  switch (type) {
    case 'battery':
      return createBattery(position);
    case 'resistor':
      return createResistor(position);
    case 'led':
      return createLED(position);
    case 'switch':
      return createSwitch(position);
    case 'wire':
      return createWire(position, position);
    case 'and_gate':
      return createANDGate(position);
    case 'or_gate':
      return createORGate(position);
    case 'not_gate':
      return createNOTGate(position);
    case 'ground':
      return createGround(position);
    case 'capacitor':
      return createCapacitor(position);
    case 'diode':
      return createDiode(position);
    case 'transistor':
      return createTransistor(position);
    case 'buzzer':
      return createBuzzer(position);
    case 'motor':
      return createMotor(position);
    case 'potentiometer':
      return createPotentiometer(position);
    case 'fuse':
      return createFuse(position);
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}
