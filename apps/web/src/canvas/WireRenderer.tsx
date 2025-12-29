import { Group, Line, Circle } from 'react-konva';
import { useCircuitStore } from '../stores/circuitStore';
import type { Position } from '@circuit-crafter/shared';
import { COMPONENT_DEFAULTS } from '@circuit-crafter/shared';
import { getAbsoluteTerminalPosition } from './utils/terminalPosition';
import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  position: number; // 0 to 1 along the path
  speed: number;
}

export function WireRenderer() {
  const { components, wires, selectedWireId, simulationResult, selectWire, removeWire, showCurrentFlow } =
    useCircuitStore();
  const animationFrameRef = useRef<number>();
  const [particles, setParticles] = useState<Map<string, Particle[]>>(new Map());
  const lastTimeRef = useRef<number>(Date.now());

  const findTerminalPosition = (terminalId: string): Position | null => {
    for (const component of components) {
      const terminal = component.terminals.find((t) => t.id === terminalId);
      if (terminal) {
        // Get component dimensions based on type
        const dimensions = COMPONENT_DEFAULTS[component.type as keyof typeof COMPONENT_DEFAULTS];
        const width = dimensions?.width ?? 60;
        const height = dimensions?.height ?? 40;

        // Return the absolute visual position of the terminal
        return getAbsoluteTerminalPosition(terminal, component, width, height);
      }
    }
    return null;
  };

  const getWireSimulation = (wireId: string) => {
    return simulationResult?.wires.find((w) => w.wireId === wireId);
  };

  // Animate particles along wires
  useEffect(() => {
    if (!showCurrentFlow || !simulationResult) {
      setParticles(new Map());
      return;
    }

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = now;

      setParticles((prevParticles) => {
        const newParticles = new Map<string, Particle[]>();

        wires.forEach((wire) => {
          const simulation = getWireSimulation(wire.id);
          if (!simulation?.isCarryingCurrent) {
            newParticles.set(wire.id, []);
            return;
          }

          const current = Math.abs(simulation.current || 0);
          const particleSpeed = Math.min(0.3 + current * 2, 1.5); // Speed based on current
          const particleCount = Math.min(Math.ceil(current * 3) + 2, 8); // More particles = more current

          let wireParticles = prevParticles.get(wire.id) || [];

          // Update existing particles
          wireParticles = wireParticles
            .map((p) => ({
              ...p,
              position: (p.position + p.speed * deltaTime) % 1,
            }))
            .filter((p) => p.position < 1);

          // Add new particles if needed
          while (wireParticles.length < particleCount) {
            const spacing = 1 / particleCount;
            const newPosition = wireParticles.length * spacing;
            wireParticles.push({
              id: Math.random(),
              position: newPosition,
              speed: particleSpeed,
            });
          }

          newParticles.set(wire.id, wireParticles);
        });

        return newParticles;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showCurrentFlow, simulationResult, wires]);

  const getPointAlongPath = (points: number[], t: number): Position => {
    // Calculate total path length
    const segments: { start: Position; end: Position; length: number }[] = [];
    let totalLength = 0;

    for (let i = 0; i < points.length - 2; i += 2) {
      const start = { x: points[i], y: points[i + 1] };
      const end = { x: points[i + 2], y: points[i + 3] };
      const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      segments.push({ start, end, length });
      totalLength += length;
    }

    // Find which segment our position is on
    const targetDistance = t * totalLength;
    let currentDistance = 0;

    for (const segment of segments) {
      if (currentDistance + segment.length >= targetDistance) {
        const segmentT = (targetDistance - currentDistance) / segment.length;
        return {
          x: segment.start.x + (segment.end.x - segment.start.x) * segmentT,
          y: segment.start.y + (segment.end.y - segment.start.y) * segmentT,
        };
      }
      currentDistance += segment.length;
    }

    // Return end point if we somehow overshoot
    const lastSegment = segments[segments.length - 1];
    return lastSegment.end;
  };

  return (
    <Group>
      {wires.map((wire) => {
        const fromPos = findTerminalPosition(wire.fromTerminal);
        const toPos = findTerminalPosition(wire.toTerminal);

        if (!fromPos || !toPos) return null;

        const isSelected = selectedWireId === wire.id;
        const simulation = getWireSimulation(wire.id);
        const isActive = simulation?.isCarryingCurrent ?? false;
        const current = Math.abs(simulation?.current || 0);

        // Create path with right angles
        const midX = (fromPos.x + toPos.x) / 2;
        const points = [
          fromPos.x,
          fromPos.y,
          midX,
          fromPos.y,
          midX,
          toPos.y,
          toPos.x,
          toPos.y,
        ];

        // Get particles for this wire
        const wireParticles = particles.get(wire.id) || [];

        // Color intensity based on current
        const wireIntensity = Math.min(current * 50 + 0.3, 1);
        const wireColor = isActive
          ? `rgba(0, 255, 136, ${wireIntensity})`
          : '#4b5563';

        return (
          <Group key={wire.id}>
            {/* Wire background (for selection) */}
            <Line
              points={points}
              stroke={isSelected ? '#3b82f6' : wireColor}
              strokeWidth={isSelected ? 4 : 3}
              lineCap="round"
              lineJoin="round"
              listening={true}
              onClick={() => selectWire(wire.id)}
              onDblClick={() => removeWire(wire.id)}
              hitStrokeWidth={12}
            />

            {/* Glow effect for high current */}
            {isActive && current > 0.5 && (
              <Line
                points={points}
                stroke="#00ff88"
                strokeWidth={6}
                lineCap="round"
                lineJoin="round"
                opacity={Math.min(current * 0.3, 0.5)}
                shadowColor="#00ff88"
                shadowBlur={10}
                listening={false}
              />
            )}

            {/* Electron particles */}
            {showCurrentFlow && isActive && wireParticles.map((particle) => {
              const pos = getPointAlongPath(points, particle.position);
              const particleSize = 3 + current * 2;
              const particleOpacity = Math.min(0.6 + current * 0.4, 1);

              return (
                <Circle
                  key={particle.id}
                  x={pos.x}
                  y={pos.y}
                  radius={particleSize}
                  fill="#00ff88"
                  opacity={particleOpacity}
                  shadowColor="#00ff88"
                  shadowBlur={8}
                  listening={false}
                />
              );
            })}

            {/* Junction points */}
            <Circle
              x={fromPos.x}
              y={fromPos.y}
              radius={isActive ? 4 : 3}
              fill={isActive ? '#00ff88' : '#6b7280'}
              opacity={isActive ? wireIntensity : 1}
              shadowColor={isActive ? '#00ff88' : undefined}
              shadowBlur={isActive ? 6 : 0}
              listening={false}
            />
            <Circle
              x={toPos.x}
              y={toPos.y}
              radius={isActive ? 4 : 3}
              fill={isActive ? '#00ff88' : '#6b7280'}
              opacity={isActive ? wireIntensity : 1}
              shadowColor={isActive ? '#00ff88' : undefined}
              shadowBlur={isActive ? 6 : 0}
              listening={false}
            />
          </Group>
        );
      })}
    </Group>
  );
}
