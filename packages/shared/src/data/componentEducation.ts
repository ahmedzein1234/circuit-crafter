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
    description: 'A battery is a power source that converts chemical energy into electrical energy, providing voltage to power your circuit.',
    howItWorks: 'Inside a battery, chemical reactions between the electrodes and electrolyte create a flow of electrons from the negative terminal to the positive terminal through the circuit.',
    formula: 'P = V × I',
    formulaDescription: 'Power (Watts) = Voltage (Volts) × Current (Amps)',
    realWorldExamples: [
      'AA/AAA batteries in remote controls',
      'Car batteries (12V)',
      'Phone batteries (lithium-ion)',
      'Power banks for charging devices',
    ],
    safetyTips: [
      'Never short-circuit a battery',
      'Store batteries at room temperature',
      'Dispose of batteries properly',
    ],
    funFact: 'The first battery was invented by Alessandro Volta in 1800!',
    category: 'power',
  },

  resistor: {
    name: 'Resistor',
    symbol: '\/\/\/\/',
    description: 'A resistor limits the flow of electrical current in a circuit. It converts electrical energy into heat.',
    howItWorks: 'Resistors are made of materials that oppose electron flow. The resistance value determines how much the current is reduced.',
    formula: 'V = I × R',
    formulaDescription: 'Voltage (Volts) = Current (Amps) × Resistance (Ohms) - This is Ohm\'s Law!',
    realWorldExamples: [
      'Volume controls in audio equipment',
      'LED current limiters',
      'Temperature sensors (thermistors)',
      'Voltage dividers',
    ],
    safetyTips: [
      'Check power rating to prevent overheating',
      'Use the correct resistance value for your circuit',
    ],
    funFact: 'Resistor color bands tell you their value - it\'s like a secret code!',
    category: 'passive',
  },

  led: {
    name: 'LED (Light Emitting Diode)',
    symbol: '▷|',
    description: 'An LED is a semiconductor that emits light when current flows through it. It only works in one direction!',
    howItWorks: 'When electrons pass through the LED junction, they release energy as photons (light). The color depends on the semiconductor material used.',
    formula: 'R = (Vs - Vf) / I',
    formulaDescription: 'Calculate the resistor needed: (Source Voltage - LED Forward Voltage) / Desired Current',
    realWorldExamples: [
      'Status indicators on electronics',
      'Traffic lights',
      'TV remotes (infrared LEDs)',
      'Room lighting (LED bulbs)',
      'Digital displays',
    ],
    safetyTips: [
      'Always use a current-limiting resistor',
      'Check polarity - LEDs only work one way',
      'Don\'t look directly at bright LEDs',
    ],
    funFact: 'LEDs use 75% less energy than incandescent bulbs and last 25 times longer!',
    category: 'output',
  },

  switch: {
    name: 'Switch',
    symbol: '/ o',
    description: 'A switch controls whether current can flow through a circuit by opening or closing the connection.',
    howItWorks: 'When closed, the switch creates a complete path for current. When open, it breaks the circuit and stops current flow.',
    realWorldExamples: [
      'Light switches in your home',
      'Power buttons on devices',
      'Keyboard keys',
      'Door sensors',
    ],
    funFact: 'The average person flips a light switch about 70,000 times in their lifetime!',
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
    description: 'Ground is the reference point for all voltages in a circuit. It\'s typically at 0 volts.',
    howItWorks: 'Ground provides a common return path for current and establishes a baseline voltage for measurements.',
    realWorldExamples: [
      'Earth ground in home wiring',
      'Chassis ground in cars',
      'Signal ground in audio equipment',
    ],
    safetyTips: [
      'Earth ground is essential for safety',
      'Keep ground connections clean and secure',
    ],
    funFact: 'The Earth itself is used as a conductor in some long-distance power transmission!',
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
    name: 'Power Sources',
    description: 'Components that provide electrical energy',
    components: ['battery', 'ground'] as ComponentType[],
  },
  passive: {
    name: 'Passive Components',
    description: 'Components that don\'t amplify signals',
    components: ['resistor', 'capacitor', 'potentiometer', 'switch', 'wire'] as ComponentType[],
  },
  active: {
    name: 'Active Components',
    description: 'Semiconductor components that can amplify or switch',
    components: ['diode', 'transistor'] as ComponentType[],
  },
  logic: {
    name: 'Logic Gates',
    description: 'Digital components for binary logic',
    components: ['and_gate', 'or_gate', 'not_gate'] as ComponentType[],
  },
  output: {
    name: 'Output Devices',
    description: 'Components that convert electricity to light, sound, or motion',
    components: ['led', 'buzzer', 'motor'] as ComponentType[],
  },
  protection: {
    name: 'Protection Devices',
    description: 'Components that protect circuits from damage',
    components: ['fuse'] as ComponentType[],
  },
};
