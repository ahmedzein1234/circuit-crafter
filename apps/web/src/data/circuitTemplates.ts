// Circuit Templates - Pre-built circuits to help users get started

import type { CircuitComponent, Wire } from '@circuit-crafter/shared';
import { generateId } from '@circuit-crafter/shared';
import {
  createBattery,
  createResistor,
  createLED,
  createSwitch,
  createANDGate,
  createORGate,
  createNOTGate,
  createGround,
  createMotor,
  createBuzzer,
} from '@circuit-crafter/circuit-engine';

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'basics' | 'logic' | 'practical' | 'fun';
  icon: string;
  tags: string[];
  // Factory function to generate fresh components with unique IDs
  create: () => { components: CircuitComponent[]; wires: Wire[] };
}

// Helper to create a wire between two terminals
function createWire(fromTerminalId: string, toTerminalId: string): Wire {
  return {
    id: generateId(),
    fromTerminal: fromTerminalId,
    toTerminal: toTerminalId,
    path: [],
  };
}

export const circuitTemplates: CircuitTemplate[] = [
  // ===== BEGINNER CIRCUITS =====
  {
    id: 'basic-led',
    name: 'Basic LED Circuit',
    description: 'A simple circuit with a battery, resistor, and LED. The foundation of all electronics!',
    difficulty: 'beginner',
    category: 'basics',
    icon: '💡',
    tags: ['LED', 'resistor', 'beginner'],
    create: () => {
      const battery = createBattery({ x: 100, y: 150 }, 9);
      const resistor = createResistor({ x: 220, y: 150 }, 330);
      const led = createLED({ x: 340, y: 120 }, 2, 0.02, 'red');
      const ground = createGround({ x: 100, y: 280 });

      // Wire connections: Battery+ -> Resistor -> LED+ -> LED- -> Ground -> Battery-
      const wires = [
        createWire(battery.terminals[0].id, resistor.terminals[0].id), // Battery+ to Resistor in
        createWire(resistor.terminals[1].id, led.terminals[0].id), // Resistor out to LED+
        createWire(led.terminals[1].id, ground.terminals[0].id), // LED- to Ground
        createWire(ground.terminals[0].id, battery.terminals[1].id), // Ground to Battery-
      ];

      return { components: [battery, resistor, led, ground], wires };
    },
  },
  {
    id: 'switch-led',
    name: 'Switched LED',
    description: 'Control an LED with a switch. Click the switch to turn the light on and off!',
    difficulty: 'beginner',
    category: 'basics',
    icon: '🔘',
    tags: ['switch', 'LED', 'control'],
    create: () => {
      const battery = createBattery({ x: 80, y: 150 }, 9);
      const switchComp = createSwitch({ x: 180, y: 150 }, true);
      const resistor = createResistor({ x: 280, y: 150 }, 330);
      const led = createLED({ x: 400, y: 120 }, 2, 0.02, 'green');
      const ground = createGround({ x: 80, y: 280 });

      const wires = [
        createWire(battery.terminals[0].id, switchComp.terminals[0].id),
        createWire(switchComp.terminals[1].id, resistor.terminals[0].id),
        createWire(resistor.terminals[1].id, led.terminals[0].id),
        createWire(led.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, switchComp, resistor, led, ground], wires };
    },
  },
  {
    id: 'two-leds-series',
    name: 'LEDs in Series',
    description: 'Two LEDs connected in series - both share the same current.',
    difficulty: 'beginner',
    category: 'basics',
    icon: '💡💡',
    tags: ['LED', 'series', 'multiple'],
    create: () => {
      const battery = createBattery({ x: 80, y: 180 }, 9);
      const resistor = createResistor({ x: 180, y: 180 }, 220);
      const led1 = createLED({ x: 300, y: 150 }, 2, 0.02, 'red');
      const led2 = createLED({ x: 420, y: 150 }, 2, 0.02, 'yellow');
      const ground = createGround({ x: 80, y: 320 });

      const wires = [
        createWire(battery.terminals[0].id, resistor.terminals[0].id),
        createWire(resistor.terminals[1].id, led1.terminals[0].id),
        createWire(led1.terminals[1].id, led2.terminals[0].id),
        createWire(led2.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, resistor, led1, led2, ground], wires };
    },
  },

  // ===== LOGIC GATES =====
  {
    id: 'and-gate-demo',
    name: 'AND Gate',
    description: 'Both switches must be ON for the LED to light up. This is how AND logic works!',
    difficulty: 'intermediate',
    category: 'logic',
    icon: '🔲',
    tags: ['AND', 'logic', 'gate'],
    create: () => {
      const battery = createBattery({ x: 60, y: 200 }, 5);
      const switch1 = createSwitch({ x: 160, y: 120 }, true);
      const switch2 = createSwitch({ x: 160, y: 260 }, true);
      const andGate = createANDGate({ x: 300, y: 170 });
      const resistor = createResistor({ x: 420, y: 185 }, 330);
      const led = createLED({ x: 540, y: 155 }, 2, 0.02, 'blue');
      const ground = createGround({ x: 60, y: 350 });

      const wires = [
        createWire(battery.terminals[0].id, switch1.terminals[0].id),
        createWire(battery.terminals[0].id, switch2.terminals[0].id),
        createWire(switch1.terminals[1].id, andGate.terminals[0].id), // Input A
        createWire(switch2.terminals[1].id, andGate.terminals[1].id), // Input B
        createWire(andGate.terminals[2].id, resistor.terminals[0].id), // Output
        createWire(resistor.terminals[1].id, led.terminals[0].id),
        createWire(led.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, switch1, switch2, andGate, resistor, led, ground], wires };
    },
  },
  {
    id: 'or-gate-demo',
    name: 'OR Gate',
    description: 'Either switch (or both) will light up the LED. This is OR logic!',
    difficulty: 'intermediate',
    category: 'logic',
    icon: '🔳',
    tags: ['OR', 'logic', 'gate'],
    create: () => {
      const battery = createBattery({ x: 60, y: 200 }, 5);
      const switch1 = createSwitch({ x: 160, y: 120 }, true);
      const switch2 = createSwitch({ x: 160, y: 260 }, true);
      const orGate = createORGate({ x: 300, y: 170 });
      const resistor = createResistor({ x: 420, y: 185 }, 330);
      const led = createLED({ x: 540, y: 155 }, 2, 0.02, 'green');
      const ground = createGround({ x: 60, y: 350 });

      const wires = [
        createWire(battery.terminals[0].id, switch1.terminals[0].id),
        createWire(battery.terminals[0].id, switch2.terminals[0].id),
        createWire(switch1.terminals[1].id, orGate.terminals[0].id),
        createWire(switch2.terminals[1].id, orGate.terminals[1].id),
        createWire(orGate.terminals[2].id, resistor.terminals[0].id),
        createWire(resistor.terminals[1].id, led.terminals[0].id),
        createWire(led.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, switch1, switch2, orGate, resistor, led, ground], wires };
    },
  },
  {
    id: 'not-gate-demo',
    name: 'NOT Gate (Inverter)',
    description: 'The LED is ON when the switch is OFF, and OFF when the switch is ON. Logic inversion!',
    difficulty: 'intermediate',
    category: 'logic',
    icon: '🔄',
    tags: ['NOT', 'inverter', 'logic'],
    create: () => {
      const battery = createBattery({ x: 80, y: 180 }, 5);
      const switchComp = createSwitch({ x: 180, y: 180 }, true);
      const notGate = createNOTGate({ x: 300, y: 180 });
      const resistor = createResistor({ x: 400, y: 180 }, 330);
      const led = createLED({ x: 520, y: 150 }, 2, 0.02, 'red');
      const ground = createGround({ x: 80, y: 320 });

      const wires = [
        createWire(battery.terminals[0].id, switchComp.terminals[0].id),
        createWire(switchComp.terminals[1].id, notGate.terminals[0].id),
        createWire(notGate.terminals[1].id, resistor.terminals[0].id),
        createWire(resistor.terminals[1].id, led.terminals[0].id),
        createWire(led.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, switchComp, notGate, resistor, led, ground], wires };
    },
  },

  // ===== PRACTICAL CIRCUITS =====
  {
    id: 'motor-control',
    name: 'Motor Control',
    description: 'Control a DC motor with a switch. Watch it spin when you flip the switch!',
    difficulty: 'beginner',
    category: 'practical',
    icon: '⚙️',
    tags: ['motor', 'control', 'practical'],
    create: () => {
      const battery = createBattery({ x: 100, y: 150 }, 6);
      const switchComp = createSwitch({ x: 220, y: 150 }, true);
      const motor = createMotor({ x: 360, y: 120 }, 6);
      const ground = createGround({ x: 100, y: 280 });

      const wires = [
        createWire(battery.terminals[0].id, switchComp.terminals[0].id),
        createWire(switchComp.terminals[1].id, motor.terminals[0].id),
        createWire(motor.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, switchComp, motor, ground], wires };
    },
  },
  {
    id: 'buzzer-alarm',
    name: 'Simple Alarm',
    description: 'A buzzer that sounds when the switch is pressed. Great for doorbells!',
    difficulty: 'beginner',
    category: 'practical',
    icon: '🔔',
    tags: ['buzzer', 'alarm', 'sound'],
    create: () => {
      const battery = createBattery({ x: 100, y: 150 }, 5);
      const switchComp = createSwitch({ x: 220, y: 150 }, true);
      const buzzer = createBuzzer({ x: 360, y: 120 }, 1000);
      const ground = createGround({ x: 100, y: 280 });

      const wires = [
        createWire(battery.terminals[0].id, switchComp.terminals[0].id),
        createWire(switchComp.terminals[1].id, buzzer.terminals[0].id),
        createWire(buzzer.terminals[1].id, ground.terminals[0].id),
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return { components: [battery, switchComp, buzzer, ground], wires };
    },
  },

  // ===== FUN CIRCUITS =====
  {
    id: 'traffic-light',
    name: 'Traffic Light',
    description: 'A colorful display with red, yellow, and green LEDs. Build your own traffic light!',
    difficulty: 'intermediate',
    category: 'fun',
    icon: '🚦',
    tags: ['LED', 'colors', 'fun'],
    create: () => {
      const battery = createBattery({ x: 80, y: 200 }, 9);
      const resistor1 = createResistor({ x: 200, y: 100 }, 330);
      const resistor2 = createResistor({ x: 200, y: 200 }, 330);
      const resistor3 = createResistor({ x: 200, y: 300 }, 330);
      const ledRed = createLED({ x: 340, y: 70 }, 2, 0.02, 'red');
      const ledYellow = createLED({ x: 340, y: 170 }, 2, 0.02, 'yellow');
      const ledGreen = createLED({ x: 340, y: 270 }, 2, 0.02, 'green');
      const ground = createGround({ x: 450, y: 350 });

      const wires = [
        // Power to resistors
        createWire(battery.terminals[0].id, resistor1.terminals[0].id),
        createWire(battery.terminals[0].id, resistor2.terminals[0].id),
        createWire(battery.terminals[0].id, resistor3.terminals[0].id),
        // Resistors to LEDs
        createWire(resistor1.terminals[1].id, ledRed.terminals[0].id),
        createWire(resistor2.terminals[1].id, ledYellow.terminals[0].id),
        createWire(resistor3.terminals[1].id, ledGreen.terminals[0].id),
        // LEDs to ground
        createWire(ledRed.terminals[1].id, ground.terminals[0].id),
        createWire(ledYellow.terminals[1].id, ground.terminals[0].id),
        createWire(ledGreen.terminals[1].id, ground.terminals[0].id),
        // Ground to battery
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return {
        components: [battery, resistor1, resistor2, resistor3, ledRed, ledYellow, ledGreen, ground],
        wires,
      };
    },
  },
  {
    id: 'rgb-display',
    name: 'RGB Color Mix',
    description: 'Three colored LEDs - mix them to understand how colors combine!',
    difficulty: 'intermediate',
    category: 'fun',
    icon: '🌈',
    tags: ['RGB', 'colors', 'LED'],
    create: () => {
      const battery = createBattery({ x: 60, y: 200 }, 9);
      const switch1 = createSwitch({ x: 160, y: 100 }, false);
      const switch2 = createSwitch({ x: 160, y: 200 }, false);
      const switch3 = createSwitch({ x: 160, y: 300 }, false);
      const resistor1 = createResistor({ x: 280, y: 100 }, 330);
      const resistor2 = createResistor({ x: 280, y: 200 }, 330);
      const resistor3 = createResistor({ x: 280, y: 300 }, 330);
      const ledRed = createLED({ x: 420, y: 70 }, 2, 0.02, 'red');
      const ledGreen = createLED({ x: 420, y: 170 }, 2, 0.02, 'green');
      const ledBlue = createLED({ x: 420, y: 270 }, 2, 0.02, 'blue');
      const ground = createGround({ x: 520, y: 380 });

      const wires = [
        // Power to switches
        createWire(battery.terminals[0].id, switch1.terminals[0].id),
        createWire(battery.terminals[0].id, switch2.terminals[0].id),
        createWire(battery.terminals[0].id, switch3.terminals[0].id),
        // Switches to resistors
        createWire(switch1.terminals[1].id, resistor1.terminals[0].id),
        createWire(switch2.terminals[1].id, resistor2.terminals[0].id),
        createWire(switch3.terminals[1].id, resistor3.terminals[0].id),
        // Resistors to LEDs
        createWire(resistor1.terminals[1].id, ledRed.terminals[0].id),
        createWire(resistor2.terminals[1].id, ledGreen.terminals[0].id),
        createWire(resistor3.terminals[1].id, ledBlue.terminals[0].id),
        // LEDs to ground
        createWire(ledRed.terminals[1].id, ground.terminals[0].id),
        createWire(ledGreen.terminals[1].id, ground.terminals[0].id),
        createWire(ledBlue.terminals[1].id, ground.terminals[0].id),
        // Ground to battery
        createWire(ground.terminals[0].id, battery.terminals[1].id),
      ];

      return {
        components: [battery, switch1, switch2, switch3, resistor1, resistor2, resistor3, ledRed, ledGreen, ledBlue, ground],
        wires,
      };
    },
  },
];

// Get templates by category
export function getTemplatesByCategory(category: CircuitTemplate['category']): CircuitTemplate[] {
  return circuitTemplates.filter((t) => t.category === category);
}

// Get templates by difficulty
export function getTemplatesByDifficulty(difficulty: CircuitTemplate['difficulty']): CircuitTemplate[] {
  return circuitTemplates.filter((t) => t.difficulty === difficulty);
}

// Search templates by name or tags
export function searchTemplates(query: string): CircuitTemplate[] {
  const lowerQuery = query.toLowerCase();
  return circuitTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
