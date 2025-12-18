import type { FormulaType } from '../types/formulas';

interface FormulaDiagramProps {
  formulaType: FormulaType;
}

/**
 * Visual circuit diagrams for different formula types
 */
export function FormulaDiagram({ formulaType }: FormulaDiagramProps) {
  const renderOhmsLawDiagram = () => (
    <svg viewBox="0 0 300 150" className="w-full h-auto">
      {/* Battery */}
      <g transform="translate(40, 40)">
        <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" strokeWidth="3" />
        <line x1="-8" y1="20" x2="8" y2="20" stroke="#ef4444" strokeWidth="3" />
        <line x1="-4" y1="25" x2="4" y2="25" stroke="#ef4444" strokeWidth="3" />
        <text x="0" y="50" fontSize="12" fill="#94a3b8" textAnchor="middle">V</text>
      </g>

      {/* Wires */}
      <line x1="40" y1="40" x2="120" y2="40" stroke="#60a5fa" strokeWidth="2" />
      <line x1="180" y1="40" x2="260" y2="40" stroke="#60a5fa" strokeWidth="2" />
      <line x1="40" y1="110" x2="260" y2="110" stroke="#60a5fa" strokeWidth="2" />

      {/* Resistor */}
      <g transform="translate(120, 40)">
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L55,5 L60,0 L70,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="35" y="25" fontSize="12" fill="#94a3b8" textAnchor="middle">R</text>
      </g>

      {/* Vertical connections */}
      <line x1="40" y1="65" x2="40" y2="110" stroke="#60a5fa" strokeWidth="2" />
      <line x1="260" y1="40" x2="260" y2="110" stroke="#60a5fa" strokeWidth="2" />

      {/* Current arrow */}
      <g transform="translate(150, 15)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="15" y="-5" fontSize="12" fill="#22c55e" textAnchor="middle">I</text>
      </g>

      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
        </marker>
      </defs>

      {/* Formula */}
      <text x="150" y="140" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">V = I × R</text>
    </svg>
  );

  const renderPowerDiagram = () => (
    <svg viewBox="0 0 300 150" className="w-full h-auto">
      {/* Load/Component */}
      <g transform="translate(130, 50)">
        <rect x="0" y="0" width="40" height="40" fill="none" stroke="#a78bfa" strokeWidth="2" />
        <text x="20" y="25" fontSize="12" fill="#94a3b8" textAnchor="middle">Load</text>
        <text x="20" y="55" fontSize="10" fill="#94a3b8" textAnchor="middle">P = V × I</text>
      </g>

      {/* Voltage indicator */}
      <g transform="translate(100, 70)">
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
        <text x="-10" y="5" fontSize="12" fill="#ef4444" textAnchor="end">V</text>
      </g>

      {/* Current indicator */}
      <g transform="translate(150, 40)">
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead2)" />
        <text x="0" y="-5" fontSize="12" fill="#22c55e" textAnchor="middle">I</text>
      </g>

      <defs>
        <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
        </marker>
      </defs>

      <text x="150" y="140" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">P = V × I = I²R = V²/R</text>
    </svg>
  );

  const renderLEDResistorDiagram = () => (
    <svg viewBox="0 0 300 180" className="w-full h-auto">
      {/* Battery */}
      <g transform="translate(40, 50)">
        <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" strokeWidth="3" />
        <line x1="-8" y1="20" x2="8" y2="20" stroke="#ef4444" strokeWidth="3" />
        <line x1="-4" y1="25" x2="4" y2="25" stroke="#ef4444" strokeWidth="3" />
        <text x="0" y="50" fontSize="12" fill="#94a3b8" textAnchor="middle">Vs</text>
      </g>

      {/* Resistor */}
      <g transform="translate(90, 50)">
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R</text>
      </g>

      {/* LED */}
      <g transform="translate(180, 40)">
        <polygon points="0,10 15,0 15,20" fill="none" stroke="#ef4444" strokeWidth="2" />
        <line x1="15" y1="0" x2="15" y2="20" stroke="#ef4444" strokeWidth="2" />
        <line x1="15" y1="10" x2="25" y2="10" stroke="#ef4444" strokeWidth="2" />
        {/* LED rays */}
        <line x1="10" y1="0" x2="5" y2="-5" stroke="#fbbf24" strokeWidth="1" />
        <line x1="15" y1="0" x2="10" y2="-5" stroke="#fbbf24" strokeWidth="1" />
        <text x="7" y="35" fontSize="12" fill="#94a3b8" textAnchor="middle">LED</text>
        <text x="7" y="47" fontSize="10" fill="#94a3b8" textAnchor="middle">Vf</text>
      </g>

      {/* Wires */}
      <line x1="40" y1="50" x2="90" y2="50" stroke="#60a5fa" strokeWidth="2" />
      <line x1="150" y1="50" x2="180" y2="50" stroke="#60a5fa" strokeWidth="2" />
      <line x1="205" y1="50" x2="240" y2="50" stroke="#60a5fa" strokeWidth="2" />
      <line x1="40" y1="120" x2="240" y2="120" stroke="#60a5fa" strokeWidth="2" />
      <line x1="40" y1="75" x2="40" y2="120" stroke="#60a5fa" strokeWidth="2" />
      <line x1="240" y1="50" x2="240" y2="120" stroke="#60a5fa" strokeWidth="2" />

      {/* Current arrow */}
      <g transform="translate(155, 30)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead3)" />
        <text x="10" y="-5" fontSize="12" fill="#22c55e" textAnchor="middle">I</text>
      </g>

      <defs>
        <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
        </marker>
      </defs>

      {/* Formula */}
      <text x="150" y="155" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">R = (Vs - Vf) / I</text>
      <text x="150" y="172" fontSize="11" fill="#94a3b8" textAnchor="middle">Current limiting resistor for LED</text>
    </svg>
  );

  const renderCapacitorDiagram = () => (
    <svg viewBox="0 0 300 150" className="w-full h-auto">
      {/* Capacitor plates */}
      <g transform="translate(130, 50)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#60a5fa" strokeWidth="4" />
        <line x1="15" y1="0" x2="15" y2="40" stroke="#60a5fa" strokeWidth="4" />
        <text x="7" y="60" fontSize="12" fill="#94a3b8" textAnchor="middle">C</text>
      </g>

      {/* Voltage source */}
      <g transform="translate(60, 60)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="3" />
        <line x1="-5" y1="10" x2="5" y2="10" stroke="#ef4444" strokeWidth="3" />
        <line x1="-3" y1="13" x2="3" y2="13" stroke="#ef4444" strokeWidth="3" />
        <text x="0" y="30" fontSize="12" fill="#94a3b8" textAnchor="middle">V</text>
      </g>

      {/* Wires */}
      <line x1="60" y1="60" x2="130" y2="60" stroke="#60a5fa" strokeWidth="2" />
      <line x1="145" y1="60" x2="220" y2="60" stroke="#60a5fa" strokeWidth="2" />
      <line x1="60" y1="73" x2="60" y2="90" stroke="#60a5fa" strokeWidth="2" />
      <line x1="60" y1="90" x2="220" y2="90" stroke="#60a5fa" strokeWidth="2" />
      <line x1="220" y1="60" x2="220" y2="90" stroke="#60a5fa" strokeWidth="2" />

      {/* Charge indicators */}
      <text x="120" y="45" fontSize="16" fill="#22c55e">+Q</text>
      <text x="150" y="45" fontSize="16" fill="#ef4444">-Q</text>

      {/* Formula */}
      <text x="150" y="130" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">Q = C × V</text>
    </svg>
  );

  const renderSeriesResistanceDiagram = () => (
    <svg viewBox="0 0 300 150" className="w-full h-auto">
      {/* Three resistors in series */}
      <g transform="translate(30, 60)">
        {/* R1 */}
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R₁</text>
      </g>

      <g transform="translate(110, 60)">
        {/* R2 */}
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R₂</text>
      </g>

      <g transform="translate(190, 60)">
        {/* R3 */}
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R₃</text>
      </g>

      {/* Connecting wires */}
      <line x1="90" y1="60" x2="110" y2="60" stroke="#60a5fa" strokeWidth="2" />
      <line x1="170" y1="60" x2="190" y2="60" stroke="#60a5fa" strokeWidth="2" />

      {/* Formula */}
      <text x="150" y="120" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">R_total = R₁ + R₂ + R₃</text>
    </svg>
  );

  const renderParallelResistanceDiagram = () => (
    <svg viewBox="0 0 300 180" className="w-full h-auto">
      {/* Junction points */}
      <circle cx="60" cy="90" r="3" fill="#60a5fa" />
      <circle cx="240" cy="90" r="3" fill="#60a5fa" />

      {/* Three resistors in parallel */}
      <g transform="translate(90, 50)">
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R₁</text>
      </g>

      <g transform="translate(90, 90)">
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R₂</text>
      </g>

      <g transform="translate(90, 130)">
        <path d="M0,0 L10,0 L15,5 L25,-5 L35,5 L45,-5 L50,0 L60,0" stroke="#fbbf24" strokeWidth="2" fill="none" />
        <text x="30" y="20" fontSize="12" fill="#94a3b8" textAnchor="middle">R₃</text>
      </g>

      {/* Connecting wires */}
      <line x1="60" y1="50" x2="90" y2="50" stroke="#60a5fa" strokeWidth="2" />
      <line x1="60" y1="90" x2="90" y2="90" stroke="#60a5fa" strokeWidth="2" />
      <line x1="60" y1="130" x2="90" y2="130" stroke="#60a5fa" strokeWidth="2" />
      <line x1="150" y1="50" x2="240" y2="50" stroke="#60a5fa" strokeWidth="2" />
      <line x1="150" y1="90" x2="240" y2="90" stroke="#60a5fa" strokeWidth="2" />
      <line x1="150" y1="130" x2="240" y2="130" stroke="#60a5fa" strokeWidth="2" />

      {/* Vertical junction lines */}
      <line x1="60" y1="50" x2="60" y2="130" stroke="#60a5fa" strokeWidth="2" />
      <line x1="240" y1="50" x2="240" y2="130" stroke="#60a5fa" strokeWidth="2" />

      {/* Formula */}
      <text x="150" y="175" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">1/R_total = 1/R₁ + 1/R₂ + 1/R₃</text>
    </svg>
  );

  switch (formulaType) {
    case 'ohms_law':
      return renderOhmsLawDiagram();
    case 'power':
      return renderPowerDiagram();
    case 'led_resistor':
      return renderLEDResistorDiagram();
    case 'capacitor_charge':
      return renderCapacitorDiagram();
    case 'series_resistance':
      return renderSeriesResistanceDiagram();
    case 'parallel_resistance':
      return renderParallelResistanceDiagram();
    default:
      return null;
  }
}
