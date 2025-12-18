/**
 * Circuit solver using simplified Ohm's law and Kirchhoff's laws
 */

import type {
  CircuitComponent,
  Wire,
  SimulationResult,
  ComponentSimulationResult,
  WireSimulationResult,
  SimulationWarning,
  SimulationOptions,
  OscilloscopeData,
  ComponentTrace,
} from '@circuit-crafter/shared';
import { DEFAULT_SIMULATION_OPTIONS, SIMULATION } from '@circuit-crafter/shared';
import { CircuitGraph } from './CircuitGraph';

export class CircuitSolver {
  private _options: Required<SimulationOptions>;

  constructor(options: SimulationOptions = {}) {
    this._options = { ...DEFAULT_SIMULATION_OPTIONS, ...options } as Required<SimulationOptions>;
  }

  get maxIterations(): number {
    return this._options.maxIterations;
  }

  solve(components: CircuitComponent[], wires: Wire[]): SimulationResult {
    const warnings: SimulationWarning[] = [];
    const componentResults: ComponentSimulationResult[] = [];
    const wireResults: WireSimulationResult[] = [];

    // Build circuit graph
    const graph = new CircuitGraph(components, wires);

    // Find power sources (batteries)
    const batteries = components.filter((c) => c.type === 'battery');
    const grounds = components.filter((c) => c.type === 'ground');

    // Check for basic circuit validity
    if (batteries.length === 0) {
      warnings.push({
        type: 'open_circuit',
        message: 'No power source in circuit',
        componentIds: [],
        severity: 'warning',
      });
    }

    // Check for ground reference
    if (grounds.length === 0 && batteries.length > 0) {
      warnings.push({
        type: 'no_ground',
        message: 'No ground reference - using battery negative as reference',
        componentIds: [],
        severity: 'info',
      });
    }

    // Calculate voltages and currents
    let hasShortCircuit = false;
    let hasOpenCircuit = batteries.length === 0;
    let totalPower = 0;

    // Simple nodal analysis for each battery
    for (const battery of batteries) {
      const batteryVoltage = battery.properties.voltage;
      const positiveTerminal = battery.terminals.find((t) => t.type === 'positive');
      const negativeTerminal = battery.terminals.find((t) => t.type === 'negative');

      if (!positiveTerminal || !negativeTerminal) continue;

      const positiveNode = graph.getNodeByTerminal(positiveTerminal.id);
      const negativeNode = graph.getNodeByTerminal(negativeTerminal.id);

      if (!positiveNode || !negativeNode) continue;

      // Set battery node voltages
      positiveNode.voltage = batteryVoltage;
      negativeNode.voltage = 0;

      // Find complete circuit paths
      const paths = graph.findAllPaths(positiveNode.id, negativeNode.id);

      if (paths.length === 0) {
        hasOpenCircuit = true;
        warnings.push({
          type: 'open_circuit',
          message: 'No complete path from positive to negative terminal',
          componentIds: [battery.id],
          severity: 'warning',
        });
      }

      // Calculate current through each path
      for (const path of paths) {
        let totalResistance = 0;

        // Sum resistance along path
        for (let i = 0; i < path.length - 1; i++) {
          const nodeId = path[i];
          const nextNodeId = path[i + 1];

          // Find edge between nodes
          for (const edge of graph.edges.values()) {
            if (
              (edge.sourceNodeId === nodeId && edge.targetNodeId === nextNodeId) ||
              (edge.sourceNodeId === nextNodeId && edge.targetNodeId === nodeId)
            ) {
              if (edge.resistance === Infinity) {
                totalResistance = Infinity;
                break;
              }
              totalResistance += edge.resistance;
              break;
            }
          }
          if (totalResistance === Infinity) break;
        }

        // Check for short circuit
        if (totalResistance < SIMULATION.MIN_RESISTANCE) {
          hasShortCircuit = true;
          warnings.push({
            type: 'short_circuit',
            message: 'Short circuit detected - very low resistance path',
            componentIds: [battery.id],
            severity: 'error',
          });
          totalResistance = SIMULATION.MIN_RESISTANCE;
        }

        // Calculate current: I = V / R
        const current = totalResistance === Infinity ? 0 : batteryVoltage / totalResistance;

        // Update edge currents
        for (let i = 0; i < path.length - 1; i++) {
          const nodeId = path[i];
          const nextNodeId = path[i + 1];

          for (const edge of graph.edges.values()) {
            if (
              (edge.sourceNodeId === nodeId && edge.targetNodeId === nextNodeId) ||
              (edge.sourceNodeId === nextNodeId && edge.targetNodeId === nodeId)
            ) {
              edge.current += current;
              break;
            }
          }
        }

        // Calculate node voltages along path using voltage divider
        let cumulativeResistance = 0;
        for (let i = 1; i < path.length - 1; i++) {
          const prevNodeId = path[i - 1];
          const nodeId = path[i];

          // Find edge resistance
          for (const edge of graph.edges.values()) {
            if (
              (edge.sourceNodeId === prevNodeId && edge.targetNodeId === nodeId) ||
              (edge.sourceNodeId === nodeId && edge.targetNodeId === prevNodeId)
            ) {
              cumulativeResistance += edge.resistance === Infinity ? 0 : edge.resistance;
              break;
            }
          }

          const node = graph.getNode(nodeId);
          if (node && totalResistance !== Infinity && totalResistance > 0) {
            const voltageDrop = (cumulativeResistance / totalResistance) * batteryVoltage;
            node.voltage = batteryVoltage - voltageDrop;
          }
        }
      }
    }

    // Generate component results
    for (const component of components) {
      const result = this.calculateComponentResult(component, graph);
      componentResults.push(result);

      if (result.isOverloaded) {
        warnings.push({
          type: 'overload',
          message: `${component.type} is overloaded`,
          componentIds: [component.id],
          severity: 'warning',
        });
      }

      totalPower += result.power;
    }

    // Generate wire results
    for (const wire of wires) {
      const wireResult = this.calculateWireResult(wire, graph);
      wireResults.push(wireResult);
    }

    return {
      success: !hasShortCircuit,
      components: componentResults,
      wires: wireResults,
      warnings,
      totalPower,
      hasShortCircuit,
      hasOpenCircuit,
      timestamp: Date.now(),
    };
  }

  private calculateComponentResult(
    component: CircuitComponent,
    graph: CircuitGraph
  ): ComponentSimulationResult {
    let voltage = 0;
    let current = 0;
    let power = 0;
    let isOverloaded = false;
    let brightness: number | undefined;
    let logicState: boolean | undefined;
    let isActive: boolean | undefined;
    let isBlown: boolean | undefined;
    let effectiveResistance: number | undefined;

    // Get terminal nodes
    const terminalNodes = component.terminals
      .map((t) => graph.getNodeByTerminal(t.id))
      .filter(Boolean);

    if (terminalNodes.length >= 2) {
      const node1 = terminalNodes[0]!;
      const node2 = terminalNodes[1]!;
      voltage = Math.abs(node1.voltage - node2.voltage);

      // Find current through component edge
      for (const edge of graph.edges.values()) {
        if (edge.componentId === component.id) {
          current = edge.current;
          break;
        }
      }
    }

    // Calculate power: P = V * I
    power = voltage * current;

    // Component-specific calculations
    switch (component.type) {
      case 'battery':
        // Battery supplies power
        power = Math.abs(power);
        break;

      case 'resistor':
        // Check for overload (simplified)
        const maxPower = 0.25; // 1/4 watt typical resistor
        isOverloaded = power > maxPower * SIMULATION.OVERLOAD_FACTOR;
        break;

      case 'led':
        const maxCurrent = component.properties.maxCurrent || 0.02;
        isOverloaded = current > maxCurrent * SIMULATION.OVERLOAD_FACTOR;
        // Brightness based on current
        brightness = Math.min(1, current / maxCurrent);
        break;

      case 'switch':
        // Switch has no power consumption
        power = 0;
        break;

      case 'and_gate':
      case 'or_gate':
      case 'not_gate':
        logicState = this.evaluateLogicGate(component, graph);
        break;

      case 'capacitor':
        // Capacitors block DC in steady state (simplified)
        // In real simulation would model charge/discharge
        isActive = current > 0.0001;
        break;

      case 'diode':
        // Diode conducts in forward bias only
        const diodeForwardVoltage = component.properties.forwardVoltage || 0.7;
        if (terminalNodes.length >= 2) {
          const anodeNode = terminalNodes[0]!;
          const cathodeNode = terminalNodes[1]!;
          const diodeVoltage = anodeNode.voltage - cathodeNode.voltage;
          // Only conducts if anode is higher than cathode by forward voltage
          isActive = diodeVoltage >= diodeForwardVoltage;
          if (!isActive) {
            current = 0; // Block reverse current
          }
        }
        break;

      case 'transistor':
        // Simplified NPN transistor model
        // Current flows collector to emitter when base is high
        const baseTerminal = component.terminals.find((t) => t.type === 'base');
        if (baseTerminal) {
          const baseNode = graph.getNodeByTerminal(baseTerminal.id);
          const baseVoltage = baseNode?.voltage || 0;
          isActive = baseVoltage >= 0.7; // Base-emitter threshold
          if (!isActive) {
            current = 0; // Transistor is off
          }
        }
        break;

      case 'buzzer':
        // Buzzer activates when powered
        const buzzerForwardVoltage = component.properties.forwardVoltage || 3;
        isActive = voltage >= buzzerForwardVoltage && current > 0.001;
        isOverloaded = voltage > buzzerForwardVoltage * SIMULATION.OVERLOAD_FACTOR;
        break;

      case 'motor':
        // Motor spins when powered
        const motorRatedVoltage = component.properties.ratedVoltage || 6;
        const motorRatedCurrent = component.properties.ratedCurrent || 0.5;
        isActive = current > 0.01;
        isOverloaded = current > motorRatedCurrent * SIMULATION.OVERLOAD_FACTOR ||
                       voltage > motorRatedVoltage * SIMULATION.OVERLOAD_FACTOR;
        // Motor brightness represents speed (0-1)
        brightness = Math.min(1, voltage / motorRatedVoltage);
        break;

      case 'potentiometer':
        // Variable resistance based on position (0-100%)
        const potMaxResistance = component.properties.maxResistance || 10000;
        const potPosition = component.properties.position || 50;
        effectiveResistance = (potPosition / 100) * potMaxResistance;
        isActive = current > 0.0001;
        break;

      case 'fuse':
        // Fuse blows if current exceeds rating
        const fuseRating = component.properties.rating || 1;
        isBlown = component.properties.isBlown || current > fuseRating;
        isActive = !isBlown && current > 0.0001;
        if (isBlown) {
          current = 0; // No current flows through blown fuse
        }
        isOverloaded = current > fuseRating * 0.8; // Warning at 80% of rating
        break;
    }

    // Determine state
    let state: ComponentSimulationResult['state'] = 'normal';
    if (isBlown) {
      state = 'blown';
    } else if (isOverloaded) {
      state = 'overloaded';
    } else if (component.type === 'switch') {
      state = component.properties.isOpen ? 'open' : 'closed';
    } else if (isActive !== undefined) {
      state = isActive ? 'active' : 'off';
    } else if (current > 0.0001) {
      state = 'powered';
    } else {
      state = 'off';
    }

    return {
      componentId: component.id,
      state,
      voltage,
      current,
      power,
      isOverloaded,
      brightness,
      logicState,
      isActive,
      isBlown,
      effectiveResistance,
    };
  }

  private calculateWireResult(wire: Wire, graph: CircuitGraph): WireSimulationResult {
    let current = 0;
    let voltage = 0;

    // Find wire edge
    for (const edge of graph.edges.values()) {
      if (edge.wireId === wire.id) {
        current = edge.current;

        const sourceNode = graph.getNode(edge.sourceNodeId);
        const targetNode = graph.getNode(edge.targetNodeId);
        if (sourceNode && targetNode) {
          voltage = Math.abs(sourceNode.voltage - targetNode.voltage);
        }
        break;
      }
    }

    return {
      wireId: wire.id,
      current,
      voltage,
      isCarryingCurrent: current > 0.0001,
    };
  }

  private evaluateLogicGate(component: CircuitComponent, graph: CircuitGraph): boolean {
    const inputTerminals = component.terminals.filter(
      (t) => t.type === 'input' || t.type === 'input_a' || t.type === 'input_b'
    );

    const inputs: boolean[] = inputTerminals.map((terminal) => {
      const node = graph.getNodeByTerminal(terminal.id);
      return node ? node.voltage >= SIMULATION.LOGIC_THRESHOLD_VOLTAGE : false;
    });

    switch (component.type) {
      case 'and_gate':
        return inputs.every(Boolean);
      case 'or_gate':
        return inputs.some(Boolean);
      case 'not_gate':
        return !inputs[0];
      default:
        return false;
    }
  }

  /**
   * Run transient simulation to capture time-varying behavior
   * Useful for oscilloscope visualization, especially for capacitors and inductors
   */
  solveTransient(
    components: CircuitComponent[],
    wires: Wire[],
    duration: number,
    timeStep: number
  ): OscilloscopeData {
    const traces: ComponentTrace[] = [];
    const numSteps = Math.floor(duration / timeStep);

    // Initialize traces for all components that can have voltage readings
    const measurableComponents = components.filter(
      c => c.type !== 'wire' && c.type !== 'ground'
    );

    for (const component of measurableComponents) {
      traces.push({
        componentId: component.id,
        data: [],
      });
    }

    // Store capacitor charges (Q = C * V)
    const capacitorCharges = new Map<string, number>();
    components
      .filter(c => c.type === 'capacitor')
      .forEach(c => capacitorCharges.set(c.id, 0));

    // Run simulation for each time step
    for (let step = 0; step <= numSteps; step++) {
      const currentTime = step * timeStep;

      // Update capacitor voltages based on stored charge
      const componentsWithCapacitorState = components.map(c => {
        if (c.type === 'capacitor') {
          const charge = capacitorCharges.get(c.id) || 0;
          const capacitance = c.properties.capacitance || 0.0001; // 100µF default
          const voltage = charge / capacitance;

          return {
            ...c,
            // Store voltage in a way the solver can use
            _transientVoltage: voltage,
          } as CircuitComponent;
        }
        return c;
      });

      // Solve circuit at this time step
      const result = this.solve(componentsWithCapacitorState, wires);

      // Record data points for each component
      for (const componentResult of result.components) {
        const trace = traces.find(t => t.componentId === componentResult.componentId);
        if (trace) {
          trace.data.push({
            time: currentTime,
            voltage: componentResult.voltage,
            current: componentResult.current,
          });
        }

        // Update capacitor charge for next step
        const component = components.find(c => c.id === componentResult.componentId);
        if (component?.type === 'capacitor') {
          const oldCharge = capacitorCharges.get(component.id) || 0;

          // Q = Q + I * dt (charge accumulation)
          const newCharge = oldCharge + componentResult.current * timeStep;

          // Add some damping to prevent oscillation artifacts
          const dampedCharge = newCharge * 0.99;

          capacitorCharges.set(component.id, dampedCharge);
        }
      }
    }

    return {
      traces,
      currentTime: duration,
      duration,
      timeStep,
    };
  }
}
