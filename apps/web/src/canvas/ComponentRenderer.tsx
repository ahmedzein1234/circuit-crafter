import { Group } from 'react-konva';
import { useCircuitStore } from '../stores/circuitStore';
import { BatteryShape } from './shapes/BatteryShape';
import { ResistorShape } from './shapes/ResistorShape';
import { LEDShape } from './shapes/LEDShape';
import { SwitchShape } from './shapes/SwitchShape';
import { LogicGateShape } from './shapes/LogicGateShape';
import { GroundShape } from './shapes/GroundShape';
import { CapacitorShape } from './shapes/CapacitorShape';
import { DiodeShape } from './shapes/DiodeShape';
import { TransistorShape } from './shapes/TransistorShape';
import { BuzzerShape } from './shapes/BuzzerShape';
import { MotorShape } from './shapes/MotorShape';
import { PotentiometerShape } from './shapes/PotentiometerShape';
import { FuseShape } from './shapes/FuseShape';
import { SparkEffect } from './effects';
import type { CircuitComponent } from '@circuit-crafter/shared';

export function ComponentRenderer() {
  const { components, selectedComponentId, simulationResult } = useCircuitStore();

  const getComponentSimulation = (componentId: string) => {
    return simulationResult?.components.find((c) => c.componentId === componentId);
  };

  const renderComponent = (component: CircuitComponent) => {
    const isSelected = selectedComponentId === component.id;
    const simulation = getComponentSimulation(component.id);
    const isOverloaded = simulation?.isOverloaded || simulation?.state === 'overloaded' || simulation?.state === 'blown';

    const commonProps = {
      key: component.id,
      component,
      isSelected,
      simulation,
    };

    let componentShape: JSX.Element | null = null;

    switch (component.type) {
      case 'battery':
        componentShape = <BatteryShape {...commonProps} />;
        break;
      case 'resistor':
        componentShape = <ResistorShape {...commonProps} />;
        break;
      case 'led':
        componentShape = <LEDShape {...commonProps} />;
        break;
      case 'switch':
        componentShape = <SwitchShape {...commonProps} />;
        break;
      case 'and_gate':
      case 'or_gate':
      case 'not_gate':
        componentShape = <LogicGateShape {...commonProps} />;
        break;
      case 'ground':
        componentShape = <GroundShape {...commonProps} />;
        break;
      case 'capacitor':
        componentShape = <CapacitorShape {...commonProps} />;
        break;
      case 'diode':
        componentShape = <DiodeShape {...commonProps} />;
        break;
      case 'transistor':
        componentShape = <TransistorShape {...commonProps} />;
        break;
      case 'buzzer':
        componentShape = <BuzzerShape {...commonProps} />;
        break;
      case 'motor':
        componentShape = <MotorShape {...commonProps} />;
        break;
      case 'potentiometer':
        componentShape = <PotentiometerShape {...commonProps} />;
        break;
      case 'fuse':
        componentShape = <FuseShape {...commonProps} />;
        break;
      default:
        return null;
    }

    // Calculate intensity based on current vs max current
    const getOverloadIntensity = () => {
      if (!simulation?.current) return 0.5;
      const maxCurrent = (component.properties as { maxCurrent?: number }).maxCurrent || 0.05;
      const ratio = Math.abs(simulation.current) / maxCurrent;
      return Math.min(Math.max((ratio - 1) * 0.5, 0.3), 1);
    };

    return (
      <Group key={component.id}>
        {componentShape}
        {isOverloaded && (
          <SparkEffect
            x={component.position.x}
            y={component.position.y}
            active={true}
            intensity={getOverloadIntensity()}
          />
        )}
      </Group>
    );
  };

  return <Group>{components.map(renderComponent)}</Group>;
}
