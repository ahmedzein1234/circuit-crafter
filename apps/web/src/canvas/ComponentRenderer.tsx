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
import type { CircuitComponent } from '@circuit-crafter/shared';

export function ComponentRenderer() {
  const { components, selectedComponentId, simulationResult } = useCircuitStore();

  const getComponentSimulation = (componentId: string) => {
    return simulationResult?.components.find((c) => c.componentId === componentId);
  };

  const renderComponent = (component: CircuitComponent) => {
    const isSelected = selectedComponentId === component.id;
    const simulation = getComponentSimulation(component.id);

    const commonProps = {
      key: component.id,
      component,
      isSelected,
      simulation,
    };

    switch (component.type) {
      case 'battery':
        return <BatteryShape {...commonProps} />;
      case 'resistor':
        return <ResistorShape {...commonProps} />;
      case 'led':
        return <LEDShape {...commonProps} />;
      case 'switch':
        return <SwitchShape {...commonProps} />;
      case 'and_gate':
      case 'or_gate':
      case 'not_gate':
        return <LogicGateShape {...commonProps} />;
      case 'ground':
        return <GroundShape {...commonProps} />;
      case 'capacitor':
        return <CapacitorShape {...commonProps} />;
      case 'diode':
        return <DiodeShape {...commonProps} />;
      case 'transistor':
        return <TransistorShape {...commonProps} />;
      case 'buzzer':
        return <BuzzerShape {...commonProps} />;
      case 'motor':
        return <MotorShape {...commonProps} />;
      case 'potentiometer':
        return <PotentiometerShape {...commonProps} />;
      case 'fuse':
        return <FuseShape {...commonProps} />;
      default:
        return null;
    }
  };

  return <Group>{components.map(renderComponent)}</Group>;
}
