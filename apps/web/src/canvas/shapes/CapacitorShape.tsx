import { Group, Rect, Line, Text } from 'react-konva';
import { TerminalDot } from '../TerminalDot';
import { useCircuitStore } from '../../stores/circuitStore';
import type { CircuitComponent, ComponentSimulationResult } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS, formatSI } from '@circuit-crafter/shared';
import { useEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import { getLocalTerminalPosition, getRotatableGroupProps, adjustDragEndPosition } from '../utils/terminalPosition';

interface CapacitorShapeProps {
  component: CircuitComponent;
  isSelected: boolean;
  simulation?: ComponentSimulationResult;
}

export function CapacitorShape({ component, isSelected, simulation }: CapacitorShapeProps) {
  const { selectComponent, updateComponentPosition } = useCircuitStore();
  const { width, height } = COMPONENT_DEFAULTS.capacitor;
  const chargeLevelRef = useRef<Konva.Line>(null);
  const [chargeLevel, setChargeLevel] = useState(0);
  const groupProps = getRotatableGroupProps(component, width, height);

  const isActive = simulation?.isActive ?? false;
  const voltage = Math.abs(simulation?.voltage ?? 0);

  // Charging animation - charge level represents state of charge
  useEffect(() => {
    if (!isActive) {
      setChargeLevel(0);
      return;
    }

    // Simulate charging: higher voltage = more charged
    const targetCharge = Math.min(voltage / 10, 1); // Normalize to 0-1
    const startCharge = chargeLevel;
    const duration = 1000; // 1 second animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      const newCharge = startCharge + (targetCharge - startCharge) * easeProgress;
      setChargeLevel(newCharge);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isActive, voltage]);

  // Pulsing animation for charge indicator
  useEffect(() => {
    if (!chargeLevelRef.current || !isActive || chargeLevel < 0.1) return;

    const node = chargeLevelRef.current;
    const baseOpacity = 0.7;
    const pulseRange = 0.2;

    const anim = new (window as any).Konva.Animation((frame: any) => {
      const period = 2000; // 2 second period
      const pulse = Math.sin((frame.time * 2 * Math.PI) / period) * pulseRange;
      node.opacity(baseOpacity + pulse);
    }, node.getLayer());

    anim.start();

    return () => {
      anim.stop();
    };
  }, [isActive, chargeLevel]);

  return (
    <Group
      {...groupProps}
      draggable
      onDragEnd={(e) => {
        const pos = adjustDragEndPosition(e.target.x(), e.target.y(), width, height);
        updateComponentPosition(component.id, pos);
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        selectComponent(component.id);
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={width + 10}
          height={height + 10}
          stroke="#3b82f6"
          strokeWidth={2}
          cornerRadius={4}
          dash={[5, 3]}
        />
      )}

      {/* Left wire */}
      <Line
        points={[0, height / 2, width / 2 - 4, height / 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
      />

      {/* Left plate */}
      <Line
        points={[width / 2 - 4, 2, width / 2 - 4, height - 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={4}
        lineCap="round"
      />

      {/* Charge level indicator (fill between plates) */}
      {isActive && chargeLevel > 0.1 && (
        <Line
          ref={chargeLevelRef}
          points={[
            width / 2 - 2,
            height - 2 - (height - 4) * chargeLevel,
            width / 2 - 2,
            height - 2,
          ]}
          stroke="#3b82f6"
          strokeWidth={3}
          lineCap="round"
          opacity={0.7}
          shadowColor="#3b82f6"
          shadowBlur={8}
          listening={false}
        />
      )}

      {/* Right plate */}
      <Line
        points={[width / 2 + 4, 2, width / 2 + 4, height - 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={4}
        lineCap="round"
      />

      {/* Right wire */}
      <Line
        points={[width / 2 + 4, height / 2, width, height / 2]}
        stroke={isActive ? '#22c55e' : '#374151'}
        strokeWidth={3}
        lineCap="round"
      />

      {/* Capacitance label */}
      <Text
        x={0}
        y={height + 4}
        width={width}
        text={formatSI((component.properties as { capacitance?: number }).capacitance ?? 0.000001, 'F', 0)}
        fontSize={10}
        fill="#9ca3af"
        align="center"
      />

      {/* Terminals */}
      {component.terminals.map((terminal) => (
        <TerminalDot
          key={terminal.id}
          terminal={{
            ...terminal,
            position: getLocalTerminalPosition(terminal, component, width, height),
          }}
          componentId={component.id}
        />
      ))}
    </Group>
  );
}
