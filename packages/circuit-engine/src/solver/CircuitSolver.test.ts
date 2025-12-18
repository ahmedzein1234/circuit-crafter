import { describe, it, expect } from 'vitest';
import { CircuitSolver } from './CircuitSolver';
import { createBattery, createResistor, createLED, createSwitch, createGround } from '../components/ComponentFactory';
import type { Wire } from '@circuit-crafter/shared';

describe('CircuitSolver', () => {
  const solver = new CircuitSolver();

  describe('solve', () => {
    it('should detect open circuit when no components', () => {
      const result = solver.solve([], []);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('open_circuit');
    });

    it('should solve simple battery-resistor circuit', () => {
      const battery = createBattery({ x: 100, y: 100 }, 9);
      const resistor = createResistor({ x: 200, y: 100 }, 1000);
      const ground = createGround({ x: 300, y: 100 });

      const wires: Wire[] = [
        {
          id: 'wire-1',
          fromTerminal: battery.terminals[0].id, // positive
          toTerminal: resistor.terminals[0].id, // input
          path: [],
        },
        {
          id: 'wire-2',
          fromTerminal: resistor.terminals[1].id, // output
          toTerminal: ground.terminals[0].id,
          path: [],
        },
        {
          id: 'wire-3',
          fromTerminal: ground.terminals[0].id,
          toTerminal: battery.terminals[1].id, // negative
          path: [],
        },
      ];

      const result = solver.solve([battery, resistor, ground], wires);

      expect(result.success).toBe(true);
      expect(result.hasShortCircuit).toBe(false);
    });

    it('should calculate LED brightness', () => {
      const battery = createBattery({ x: 100, y: 100 }, 9);
      const resistor = createResistor({ x: 200, y: 100 }, 350); // ~20mA at 7V
      const led = createLED({ x: 300, y: 100 }, 2, 0.02);

      const wires: Wire[] = [
        {
          id: 'wire-1',
          fromTerminal: battery.terminals[0].id,
          toTerminal: resistor.terminals[0].id,
          path: [],
        },
        {
          id: 'wire-2',
          fromTerminal: resistor.terminals[1].id,
          toTerminal: led.terminals[0].id,
          path: [],
        },
        {
          id: 'wire-3',
          fromTerminal: led.terminals[1].id,
          toTerminal: battery.terminals[1].id,
          path: [],
        },
      ];

      const result = solver.solve([battery, resistor, led], wires);

      expect(result.success).toBe(true);

      const ledResult = result.components.find(c => c.componentId === led.id);
      expect(ledResult).toBeDefined();
      expect(ledResult!.brightness).toBeGreaterThan(0);
    });

    it('should handle open switch correctly', () => {
      const battery = createBattery({ x: 100, y: 100 }, 9);
      const switchComp = createSwitch({ x: 200, y: 100 }, true); // open
      const led = createLED({ x: 300, y: 100 }, 2, 0.02);

      const wires: Wire[] = [
        {
          id: 'wire-1',
          fromTerminal: battery.terminals[0].id,
          toTerminal: switchComp.terminals[0].id,
          path: [],
        },
        {
          id: 'wire-2',
          fromTerminal: switchComp.terminals[1].id,
          toTerminal: led.terminals[0].id,
          path: [],
        },
        {
          id: 'wire-3',
          fromTerminal: led.terminals[1].id,
          toTerminal: battery.terminals[1].id,
          path: [],
        },
      ];

      const result = solver.solve([battery, switchComp, led], wires);

      const ledResult = result.components.find(c => c.componentId === led.id);
      expect(ledResult).toBeDefined();
      expect(ledResult!.state).toBe('off');
    });

    it('should detect LED overload', () => {
      const battery = createBattery({ x: 100, y: 100 }, 9);
      const led = createLED({ x: 200, y: 100 }, 2, 0.02); // max 20mA

      // Direct connection without resistor - will overload
      const wires: Wire[] = [
        {
          id: 'wire-1',
          fromTerminal: battery.terminals[0].id,
          toTerminal: led.terminals[0].id,
          path: [],
        },
        {
          id: 'wire-2',
          fromTerminal: led.terminals[1].id,
          toTerminal: battery.terminals[1].id,
          path: [],
        },
      ];

      const result = solver.solve([battery, led], wires);

      const ledResult = result.components.find(c => c.componentId === led.id);
      expect(ledResult).toBeDefined();
      expect(ledResult!.isOverloaded).toBe(true);
    });
  });
});
