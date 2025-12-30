import { useEffect, useRef, useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { formatSI } from '@circuit-crafter/shared';

interface OscilloscopeProps {
  onClose?: () => void;
}

interface ChannelSettings {
  enabled: boolean;
  componentId: string | null;
  voltageScale: number; // Volts per division
  color: string;
  offset: number; // Vertical offset in divisions
}

export function Oscilloscope({ onClose }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { oscilloscopeData, components, isSimulating } = useCircuitStore();

  const [timebase, setTimebase] = useState(0.001); // Seconds per division (1ms default)
  const [triggerLevel, setTriggerLevel] = useState(0);
  const [triggerEnabled, setTriggerEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [channel1, setChannel1] = useState<ChannelSettings>({
    enabled: true,
    componentId: null,
    voltageScale: 2, // 2V per division
    color: '#22c55e', // green
    offset: 0,
  });

  const [channel2, setChannel2] = useState<ChannelSettings>({
    enabled: false,
    componentId: null,
    voltageScale: 2,
    color: '#3b82f6', // blue
    offset: 0,
  });

  // Canvas dimensions
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const DIVISIONS_X = 10;
  const DIVISIONS_Y = 8;
  const DIV_WIDTH = CANVAS_WIDTH / DIVISIONS_X;
  const DIV_HEIGHT = CANVAS_HEIGHT / DIVISIONS_Y;

  // Get selectable components (those with voltage readings)
  const selectableComponents = components.filter(c =>
    c.type !== 'wire' && c.type !== 'ground'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw graticule (grid)
    drawGraticule(ctx);

    // Draw waveforms
    if (oscilloscopeData && !isPaused) {
      if (channel1.enabled && channel1.componentId) {
        drawWaveform(ctx, channel1, oscilloscopeData);
      }
      if (channel2.enabled && channel2.componentId) {
        drawWaveform(ctx, channel2, oscilloscopeData);
      }
    }

    // Draw trigger level
    if (triggerEnabled) {
      drawTriggerLevel(ctx);
    }

    // Draw info overlay
    drawInfoOverlay(ctx);
  }, [oscilloscopeData, channel1, channel2, timebase, triggerLevel, triggerEnabled, isPaused]);

  const drawGraticule = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= DIVISIONS_X; i++) {
      const x = i * DIV_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= DIVISIONS_Y; i++) {
      const y = i * DIV_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Center lines (brighter)
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    // Center horizontal
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();

    // Center vertical
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
  };

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    channel: ChannelSettings,
    data: typeof oscilloscopeData
  ) => {
    if (!data || !channel.componentId) return;

    const componentData = data.traces.find(t => t.componentId === channel.componentId);
    if (!componentData || componentData.data.length === 0) return;

    const timeWindow = timebase * DIVISIONS_X;
    const startTime = Math.max(0, data.currentTime - timeWindow);

    // Filter data points in time window
    const visibleData = componentData.data.filter(
      point => point.time >= startTime && point.time <= data.currentTime
    );

    if (visibleData.length === 0) return;

    // Apply trigger if enabled
    let triggerIndex = 0;
    if (triggerEnabled && channel === channel1) {
      for (let i = 1; i < visibleData.length; i++) {
        if (visibleData[i - 1].voltage < triggerLevel && visibleData[i].voltage >= triggerLevel) {
          triggerIndex = i;
          break;
        }
      }
    }

    ctx.strokeStyle = channel.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let isFirstPoint = true;

    for (let i = triggerIndex; i < visibleData.length; i++) {
      const point = visibleData[i];
      const relativeTime = point.time - startTime;

      // Map time to x position
      const x = (relativeTime / timeWindow) * CANVAS_WIDTH;

      // Map voltage to y position
      const voltageDivisions = point.voltage / channel.voltageScale;
      const y = CANVAS_HEIGHT / 2 - (voltageDivisions + channel.offset) * DIV_HEIGHT;

      if (isFirstPoint) {
        ctx.moveTo(x, y);
        isFirstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  const drawTriggerLevel = (ctx: CanvasRenderingContext2D) => {
    const voltageDivisions = triggerLevel / channel1.voltageScale;
    const y = CANVAS_HEIGHT / 2 - (voltageDivisions + channel1.offset) * DIV_HEIGHT;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw label
    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px monospace';
    ctx.fillText(`T: ${triggerLevel.toFixed(2)}V`, 5, y - 5);
  };

  const drawInfoOverlay = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';

    const infoY = 15;
    let lineY = infoY;

    // Channel 1 info
    if (channel1.enabled && channel1.componentId) {
      const comp = components.find(c => c.id === channel1.componentId);
      ctx.fillStyle = channel1.color;
      ctx.fillText(`CH1: ${comp?.type || 'Unknown'} - ${channel1.voltageScale}V/div`, 5, lineY);
      lineY += 15;
    }

    // Channel 2 info
    if (channel2.enabled && channel2.componentId) {
      const comp = components.find(c => c.id === channel2.componentId);
      ctx.fillStyle = channel2.color;
      ctx.fillText(`CH2: ${comp?.type || 'Unknown'} - ${channel2.voltageScale}V/div`, 5, lineY);
      lineY += 15;
    }

    // Timebase info
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Timebase: ${formatSI(timebase, 's', 2)}/div`, 5, lineY);
  };

  const handleRunSimulation = () => {
    const { runTransientSimulation } = useCircuitStore.getState();
    const duration = timebase * DIVISIONS_X * 2; // Simulate 2 screens worth
    runTransientSimulation(duration, timebase / 10); // 10 points per division
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oscilloscope-title"
    >
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 max-w-5xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 id="oscilloscope-title" className="text-lg font-semibold text-white">Oscilloscope</h2>
            <p className="text-xs text-gray-400">Visualize voltage changes over time</p>
          </div>
          <button
            onClick={onClose}
            className="min-w-11 min-h-11 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close oscilloscope"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-900/30 border-b border-blue-800/50 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="text-blue-300 font-medium">How to use the oscilloscope:</p>
              <ol className="text-blue-200/70 text-xs mt-1 space-y-1 list-decimal list-inside">
                <li>Select a component to monitor from Channel 1 or 2</li>
                <li>Click "Run Transient Analysis" to simulate over time</li>
                <li>Adjust timebase and voltage scale to see the waveform</li>
              </ol>
              <p className="text-blue-200/50 text-xs mt-2 italic">
                Best for: Capacitor charging, switch transitions, and time-varying signals
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex">
          {/* Canvas */}
          <div className="flex-1 p-4 bg-black">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-gray-700"
            />
          </div>

          {/* Controls */}
          <div className="w-80 p-4 space-y-4 border-l border-gray-700 overflow-y-auto max-h-[600px]">
            {/* Simulation Controls */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Simulation</h3>
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {isSimulating ? 'Running...' : 'Run Transient Analysis'}
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            {/* Timebase */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Timebase</h3>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Time/Div</label>
                <select
                  value={timebase}
                  onChange={(e) => setTimebase(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                >
                  <option value={0.00001}>10 µs</option>
                  <option value={0.00005}>50 µs</option>
                  <option value={0.0001}>100 µs</option>
                  <option value={0.0005}>500 µs</option>
                  <option value={0.001}>1 ms</option>
                  <option value={0.005}>5 ms</option>
                  <option value={0.01}>10 ms</option>
                  <option value={0.05}>50 ms</option>
                  <option value={0.1}>100 ms</option>
                  <option value={0.5}>500 ms</option>
                  <option value={1}>1 s</option>
                </select>
              </div>
            </div>

            {/* Channel 1 */}
            <div className="space-y-2 p-3 bg-gray-800 rounded-lg border" style={{ borderColor: channel1.color }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: channel1.color }}>Channel 1</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={channel1.enabled}
                    onChange={(e) => setChannel1({ ...channel1, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-400">Enable</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Component</label>
                <select
                  value={channel1.componentId || ''}
                  onChange={(e) => setChannel1({ ...channel1, componentId: e.target.value || null })}
                  disabled={!channel1.enabled}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                >
                  <option value="">Select Component</option>
                  {selectableComponents.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.type} {comp.label ? `(${comp.label})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Voltage/Div</label>
                <select
                  value={channel1.voltageScale}
                  onChange={(e) => setChannel1({ ...channel1, voltageScale: parseFloat(e.target.value) })}
                  disabled={!channel1.enabled}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                >
                  <option value={0.5}>0.5 V</option>
                  <option value={1}>1 V</option>
                  <option value={2}>2 V</option>
                  <option value={5}>5 V</option>
                  <option value={10}>10 V</option>
                  <option value={20}>20 V</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Offset (div)</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={channel1.offset}
                  onChange={(e) => setChannel1({ ...channel1, offset: parseFloat(e.target.value) })}
                  disabled={!channel1.enabled}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{channel1.offset.toFixed(1)}</div>
              </div>
            </div>

            {/* Channel 2 */}
            <div className="space-y-2 p-3 bg-gray-800 rounded-lg border" style={{ borderColor: channel2.color }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: channel2.color }}>Channel 2</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={channel2.enabled}
                    onChange={(e) => setChannel2({ ...channel2, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-400">Enable</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Component</label>
                <select
                  value={channel2.componentId || ''}
                  onChange={(e) => setChannel2({ ...channel2, componentId: e.target.value || null })}
                  disabled={!channel2.enabled}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                >
                  <option value="">Select Component</option>
                  {selectableComponents.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.type} {comp.label ? `(${comp.label})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Voltage/Div</label>
                <select
                  value={channel2.voltageScale}
                  onChange={(e) => setChannel2({ ...channel2, voltageScale: parseFloat(e.target.value) })}
                  disabled={!channel2.enabled}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                >
                  <option value={0.5}>0.5 V</option>
                  <option value={1}>1 V</option>
                  <option value={2}>2 V</option>
                  <option value={5}>5 V</option>
                  <option value={10}>10 V</option>
                  <option value={20}>20 V</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Offset (div)</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={channel2.offset}
                  onChange={(e) => setChannel2({ ...channel2, offset: parseFloat(e.target.value) })}
                  disabled={!channel2.enabled}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{channel2.offset.toFixed(1)}</div>
              </div>
            </div>

            {/* Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Trigger</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={triggerEnabled}
                    onChange={(e) => setTriggerEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-400">Enable</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Level (V)</label>
                <input
                  type="number"
                  value={triggerLevel}
                  onChange={(e) => setTriggerLevel(parseFloat(e.target.value) || 0)}
                  disabled={!triggerEnabled}
                  step="0.1"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
