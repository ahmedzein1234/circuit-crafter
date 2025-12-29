/**
 * Educational content for circuit components
 */

import type { ComponentType } from '../types/components';

export interface ComponentEducation {
  name: string;
  symbol: string;
  description: string;
  howItWorks: string;
  formula?: string;
  formulaDescription?: string;
  realWorldExamples: string[];
  safetyTips?: string[];
  funFact?: string;
  category: 'power' | 'passive' | 'active' | 'logic' | 'output' | 'protection';
}

export const COMPONENT_EDUCATION: Record<ComponentType, ComponentEducation> = {
  battery: {
    name: 'Battery',
    symbol: '+||-',
    description: 'A battery gives power to your circuit! It\'s like the engine that makes everything work.',
    howItWorks: 'Inside a battery, special chemicals create electricity. The electricity flows out from one side (positive +) and comes back to the other side (negative -).',
    formula: 'P = V × I',
    formulaDescription: 'Power = Voltage × Current (how much energy you get)',
    realWorldExamples: [
      'TV remote controls (AA batteries)',
      'Toy cars and robots',
      'Flashlights',
      'Game controllers',
    ],
    safetyTips: [
      'Never connect + and - together without anything in between',
      'Keep batteries in a cool, dry place',
      'Recycle old batteries - don\'t throw them in the trash',
    ],
    funFact: 'The first battery was invented in 1800 - over 200 years ago!',
    category: 'power',
  },

  resistor: {
    name: 'Resistor',
    symbol: '\/\/\/\/',
    description: 'A resistor slows down electricity, like a speed bump for electrons! It protects other parts from too much power.',
    howItWorks: 'Resistors are made of special materials that make it harder for electricity to flow through. This slows down the electricity and keeps it at a safe level.',
    formula: 'V = I × R',
    formulaDescription: 'Voltage = Current × Resistance (Ohm\'s Law - a super important rule!)',
    realWorldExamples: [
      'Volume knobs on speakers',
      'Protecting LEDs from burning out',
      'Dimmer switches for lights',
      'Game controllers',
    ],
    safetyTips: [
      'Use the right resistor or parts might get too hot',
      'Bigger numbers = more slowing down of electricity',
    ],
    funFact: 'Resistors have colored stripes that are like a secret code telling you how strong they are!',
    category: 'passive',
  },

  led: {
    name: 'LED (Light)',
    symbol: '▷|',
    description: 'An LED is a tiny light that glows when electricity flows through it. Different LEDs make different colors!',
    howItWorks: 'When electricity goes through the LED, it lights up! LEDs only work one way, so you need to connect them the right way around. The long leg is positive (+) and the short leg is negative (-).',
    formula: 'R = (Vs - Vf) / I',
    formulaDescription: 'How to find the right resistor for your LED',
    realWorldExamples: [
      'Power lights on computers and TVs',
      'Traffic lights',
      'Christmas lights',
      'Flashlights',
      'Your phone screen',
    ],
    safetyTips: [
      'Always use a resistor with your LED or it will burn out!',
      'Connect it the right way - long leg to positive (+)',
      'Don\'t stare at super bright LEDs',
    ],
    funFact: 'LEDs use way less energy than old light bulbs and can last for over 10 years!',
    category: 'output',
  },

  switch: {
    name: 'Switch',
    symbol: '/ o',
    description: 'A switch lets you turn your circuit ON or OFF! It\'s like a gate that opens and closes for electricity.',
    howItWorks: 'When you flip the switch to ON, it makes a bridge for electricity to flow across. When you flip it to OFF, it breaks the bridge and stops the electricity.',
    realWorldExamples: [
      'Light switches on your wall',
      'Power buttons on toys and games',
      'Keys on a keyboard',
      'The button that turns on a flashlight',
    ],
    funFact: 'You probably flip light switches about 70,000 times in your whole life!',
    category: 'passive',
  },

  capacitor: {
    name: 'Capacitor',
    symbol: '||',
    description: 'A capacitor stores electrical energy in an electric field. It can charge up and release energy quickly.',
    howItWorks: 'Two conductive plates separated by an insulator (dielectric) store charge. Electrons accumulate on one plate and are depleted from the other.',
    formula: 'Q = C × V',
    formulaDescription: 'Charge (Coulombs) = Capacitance (Farads) × Voltage (Volts)',
    realWorldExamples: [
      'Camera flash units',
      'Power supply smoothing',
      'Touch screens',
      'Radio tuning circuits',
      'Energy storage in hybrid cars',
    ],
    safetyTips: [
      'Large capacitors can hold dangerous charge',
      'Discharge capacitors before handling',
      'Check voltage ratings',
    ],
    funFact: 'Supercapacitors can charge in seconds and are being used in some buses!',
    category: 'passive',
  },

  diode: {
    name: 'Diode',
    symbol: '▷|',
    description: 'A diode is a one-way valve for electricity. It allows current to flow in only one direction.',
    howItWorks: 'The P-N junction in a diode allows electrons to flow from cathode to anode but blocks reverse flow (until breakdown voltage).',
    formula: 'Vf ≈ 0.7V (silicon)',
    formulaDescription: 'Forward voltage drop is typically 0.7V for silicon diodes, 0.3V for germanium',
    realWorldExamples: [
      'Power supply rectifiers',
      'Reverse polarity protection',
      'Signal detection in radios',
      'Solar panel blocking diodes',
    ],
    safetyTips: [
      'Check polarity - cathode is marked with a band',
      'Don\'t exceed reverse voltage rating',
    ],
    funFact: 'The first diodes were called "cat\'s whisker" detectors and used in early radios!',
    category: 'active',
  },

  transistor: {
    name: 'Transistor (NPN)',
    symbol: 'NPN',
    description: 'A transistor is an electronic switch that can also amplify signals. It\'s the building block of all modern electronics!',
    howItWorks: 'A small current at the base controls a larger current from collector to emitter. It\'s like a water faucet controlled by a small handle.',
    formula: 'Ic = β × Ib',
    formulaDescription: 'Collector Current = Gain (β) × Base Current',
    realWorldExamples: [
      'Computer processors (billions of transistors!)',
      'Audio amplifiers',
      'Motor controllers',
      'Touch-sensitive switches',
    ],
    safetyTips: [
      'Don\'t exceed maximum voltage/current ratings',
      'Use heat sinks for power transistors',
    ],
    funFact: 'A modern computer chip has more transistors than there are stars in the Milky Way!',
    category: 'active',
  },

  buzzer: {
    name: 'Buzzer',
    symbol: '))))',
    description: 'A buzzer converts electrical signals into sound. It\'s used to create audio alerts and tones.',
    howItWorks: 'An electromagnet vibrates a metal disc at a specific frequency, creating sound waves that we can hear.',
    realWorldExamples: [
      'Alarm clocks',
      'Microwave ovens',
      'Doorbells',
      'Game show buzzers',
      'Smoke detectors',
    ],
    safetyTips: [
      'Check voltage rating before connecting',
      'Prolonged loud buzzing can damage hearing',
    ],
    funFact: 'Piezoelectric buzzers can create frequencies from 1Hz to over 100kHz!',
    category: 'output',
  },

  motor: {
    name: 'DC Motor',
    symbol: 'M',
    description: 'A motor converts electrical energy into mechanical rotation. It\'s how robots move!',
    howItWorks: 'Current through wire coils creates magnetic fields that interact with permanent magnets, causing the rotor to spin.',
    formula: 'T = k × I',
    formulaDescription: 'Torque is proportional to current - more current means more force!',
    realWorldExamples: [
      'Electric fans',
      'Toy cars',
      'Power tools',
      'Electric vehicles',
      'Hard drives',
    ],
    safetyTips: [
      'Keep fingers away from rotating parts',
      'Don\'t stall motors - they can overheat',
      'Use flyback diodes to protect circuits',
    ],
    funFact: 'The world\'s smallest motor is just 200 nanometers - 500 times smaller than a human hair!',
    category: 'output',
  },

  potentiometer: {
    name: 'Potentiometer',
    symbol: '---/\\---',
    description: 'A potentiometer is a variable resistor. You can adjust its resistance by turning a knob or sliding a lever.',
    howItWorks: 'A wiper moves along a resistive element, changing how much resistance is in the circuit. It\'s like a dimmer switch!',
    formula: 'R = (position%) × Rmax',
    formulaDescription: 'Effective resistance depends on wiper position',
    realWorldExamples: [
      'Volume controls on speakers',
      'Dimmer switches for lights',
      'Joystick controllers',
      'Servo position feedback',
    ],
    funFact: 'Potentiometers were used in early analog computers to set variables!',
    category: 'passive',
  },

  fuse: {
    name: 'Fuse',
    symbol: '—|—',
    description: 'A fuse is a safety device that protects circuits by melting and breaking the circuit if too much current flows.',
    howItWorks: 'A thin wire inside the fuse heats up with current. If current exceeds the rating, the wire melts and opens the circuit.',
    formula: 'I²t rating',
    formulaDescription: 'Fuses are rated by how much energy they can handle before blowing',
    realWorldExamples: [
      'Car fuse boxes',
      'Home electrical panels',
      'Power supplies',
      'Christmas lights',
    ],
    safetyTips: [
      'Always replace with same rating',
      'Never bypass a fuse with wire',
      'Find and fix the problem that caused the fuse to blow',
    ],
    funFact: 'The first electrical fuses were invented in 1864, before light bulbs existed!',
    category: 'protection',
  },

  ground: {
    name: 'Ground',
    symbol: '⏚',
    description: 'Ground is where electricity comes back to after doing its job. Think of it as the finish line in a race!',
    howItWorks: 'Electricity flows from the battery\'s positive (+) side, through your circuit, and returns to ground. Ground is like home base - it\'s always at 0 volts.',
    realWorldExamples: [
      'The bottom wire in your house electricity',
      'The metal body of your car',
      'The ground pin (round one) on wall outlets',
    ],
    safetyTips: [
      'Always connect ground to complete your circuit',
      'Ground keeps electricity safe',
    ],
    funFact: 'Some power lines actually use the Earth itself as a wire!',
    category: 'power',
  },

  wire: {
    name: 'Wire',
    symbol: '———',
    description: 'Wires carry electrical current from one component to another with minimal resistance.',
    howItWorks: 'Free electrons in the metal conductor flow easily when voltage is applied, carrying current through the circuit.',
    realWorldExamples: [
      'Household electrical wiring',
      'USB cables',
      'Circuit board traces',
      'Power lines',
    ],
    safetyTips: [
      'Use appropriate wire gauge for current',
      'Check insulation for damage',
    ],
    funFact: 'Copper wire can carry electricity at about 95% the speed of light!',
    category: 'passive',
  },

  and_gate: {
    name: 'AND Gate',
    symbol: 'AND',
    description: 'An AND gate outputs HIGH only when ALL inputs are HIGH. It\'s like saying "both A AND B must be true".',
    howItWorks: 'The gate compares its inputs and only produces a 1 output when all inputs are 1.',
    formula: 'Y = A · B',
    formulaDescription: 'Output = Input A AND Input B (both must be 1)',
    realWorldExamples: [
      'Security systems (all sensors must trigger)',
      'Seatbelt warning (seat occupied AND belt unbuckled)',
      'Safety interlocks',
    ],
    funFact: 'Claude Shannon proved in 1937 that any logical operation can be built from combinations of basic gates!',
    category: 'logic',
  },

  or_gate: {
    name: 'OR Gate',
    symbol: 'OR',
    description: 'An OR gate outputs HIGH when ANY input is HIGH. It\'s like saying "either A OR B (or both)".',
    howItWorks: 'The gate checks if at least one input is 1, and if so, outputs 1.',
    formula: 'Y = A + B',
    formulaDescription: 'Output = Input A OR Input B (either or both)',
    realWorldExamples: [
      'Doorbell buttons (front OR back door)',
      'Alarm triggers (any sensor)',
      'Multi-button game controllers',
    ],
    funFact: 'OR gates are used in adder circuits - the building blocks of calculators!',
    category: 'logic',
  },

  not_gate: {
    name: 'NOT Gate (Inverter)',
    symbol: 'NOT',
    description: 'A NOT gate inverts its input. HIGH becomes LOW, and LOW becomes HIGH.',
    howItWorks: 'The gate flips the input signal - if input is 1, output is 0, and vice versa.',
    formula: 'Y = Ā',
    formulaDescription: 'Output = NOT Input (opposite of input)',
    realWorldExamples: [
      'Indicator lights (ON when system OFF)',
      'Normally-closed switches',
      'Digital signal inversion',
    ],
    funFact: 'A NOT gate is the simplest logic gate, needing just one transistor to build!',
    category: 'logic',
  },
};

export const COMPONENT_CATEGORIES = {
  power: {
    name: 'Power',
    description: 'Parts that give energy',
    components: ['battery', 'ground'] as ComponentType[],
  },
  passive: {
    name: 'Basic Parts',
    description: 'Simple parts that control electricity',
    components: ['resistor', 'capacitor', 'potentiometer', 'switch', 'wire'] as ComponentType[],
  },
  active: {
    name: 'Smart Parts',
    description: 'Advanced parts that control the flow',
    components: ['diode', 'transistor'] as ComponentType[],
  },
  logic: {
    name: 'Brain Parts',
    description: 'Parts that make decisions (ON or OFF)',
    components: ['and_gate', 'or_gate', 'not_gate'] as ComponentType[],
  },
  output: {
    name: 'Action Parts',
    description: 'Parts that make lights, sounds, or movement',
    components: ['led', 'buzzer', 'motor'] as ComponentType[],
  },
  protection: {
    name: 'Safety Parts',
    description: 'Parts that keep your circuit safe',
    components: ['fuse'] as ComponentType[],
  },
};
