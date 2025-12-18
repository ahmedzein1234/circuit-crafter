# Formula Calculator Implementation for Circuit Crafter

## Overview

An interactive educational Formula Calculator has been implemented for Circuit Crafter, providing students with powerful calculation tools to understand and apply electrical circuit formulas. The implementation includes visual diagrams, step-by-step explanations, and seamless integration with the existing component system.

## Features Implemented

### 1. FormulaCalculator Component (`apps/web/src/components/FormulaCalculator.tsx`)

A comprehensive calculator with tabbed interface supporting six different formula types:

#### Supported Formulas:

1. **Ohm's Law (V = I × R)**
   - Solve for voltage, current, or resistance
   - Enter any two values to calculate the third
   - Visual circuit diagram showing battery and resistor

2. **Power Calculations (P = V × I, P = I²R, P = V²/R)**
   - Multiple power formulas supported
   - Calculate power, voltage, current, or resistance
   - Automatically selects appropriate formula based on inputs

3. **LED Resistor Calculator (R = (Vs - Vf) / I)**
   - Calculate current-limiting resistor for LEDs
   - Includes helpful hints for typical LED forward voltages
   - Shows step-by-step voltage drop calculation

4. **Capacitor Charge (Q = C × V)**
   - Calculate charge, capacitance, or voltage
   - Support for various capacitance units
   - Visual diagram showing capacitor plates

5. **Series Resistance (R_total = R₁ + R₂ + ...)**
   - Add multiple resistors
   - Calculate total series resistance
   - Dynamic resistor list management

6. **Parallel Resistance (1/R_total = 1/R₁ + 1/R₂ + ...)**
   - Add multiple resistors in parallel
   - Calculate equivalent parallel resistance
   - Shows reciprocal calculation steps

#### Features:
- **Tabbed Interface**: Easy navigation between different formula types
- **Input Validation**: Prevents invalid numeric inputs
- **Automatic Unit Formatting**: Displays results with appropriate units (Ω, kΩ, MΩ, V, mV, A, mA, μA, etc.)
- **Step-by-Step Solutions**: Shows complete calculation process
- **Visual Diagrams**: SVG circuit diagrams for each formula type
- **Clear/Calculate Buttons**: Easy operation and reset
- **Educational Design**: Focus on learning with clear explanations

### 2. Calculation Utilities (`apps/web/src/utils/formulaCalculations.ts`)

Comprehensive calculation engine with:

- **Type-safe calculation functions** for all formula types
- **Unit conversion helpers** with support for:
  - Resistance: Ω, kΩ, MΩ
  - Voltage: mV, V, kV
  - Current: μA, mA, A
  - Power: mW, W, kW
  - Capacitance: pF, nF, μF, mF, F
  - Charge: μC, mC, C
- **Smart formatting** that automatically selects the most readable unit
- **Input validation** for numeric values
- **Step-by-step generation** for educational purposes
- **Error handling** for edge cases (division by zero, invalid inputs)

### 3. FormulaHelper Component (`apps/web/src/components/FormulaHelper.tsx`)

A floating helper component that provides:

- **Context-aware formula display** based on component type
- **Tooltip with formula information** on hover
- **Quick access to calculator** with pre-filled values
- **PropertyFormulaHint** variant for inline hints next to input fields

### 4. FormulaDiagram Component (`apps/web/src/components/FormulaDiagram.tsx`)

Visual SVG diagrams for each formula type:

- **Interactive circuit diagrams** with color-coded elements:
  - Red: Voltage sources and power
  - Blue: Wires and connections
  - Yellow/Gold: Resistors
  - Green: Current indicators
  - Purple: Active components
- **Component symbols** matching educational standards
- **Current flow arrows** showing direction
- **Voltage indicators** with proper polarity
- **Formula display** integrated into diagrams

### 5. Type Definitions (`apps/web/src/types/formulas.ts`)

Comprehensive TypeScript types for:

- Formula input types for all calculators
- Result types with steps and units
- Tab definitions
- Unit type definitions

### 6. ComponentInfoPanel Integration

The Formula Calculator is seamlessly integrated into the existing ComponentInfoPanel:

- **New Calculator Tab**: Added alongside the Information tab
- **Context-aware initialization**: Opens with the relevant formula based on selected component
- **Pre-filled values**: Automatically fills calculator with component property values
- **Smart formula selection**: Chooses appropriate calculator tab (Ohm's Law for resistors, LED Resistor for LEDs, etc.)

## Usage

### For Students:

1. **Select a component** in the circuit
2. **Click the Calculator tab** in the component info panel
3. **Enter known values** in the input fields
4. **Click Calculate** to see the result with step-by-step explanation
5. **Study the visual diagram** to understand the circuit configuration
6. **Try different values** to explore relationships between variables

### Formula Calculator Features:

- **Auto-populated values**: Component properties automatically fill relevant fields
- **Unit flexibility**: Enter values in base units (V, A, Ω, F)
- **Visual learning**: Each formula includes a circuit diagram
- **Educational steps**: Every calculation shows the complete solution process
- **Multiple formulas**: Choose from 6 different calculation types
- **Series/Parallel resistors**: Add as many resistors as needed

## Educational Value

The Formula Calculator provides several educational benefits:

1. **Active Learning**: Students interact with formulas rather than just reading about them
2. **Visual Representation**: Circuit diagrams help understand abstract concepts
3. **Step-by-Step**: Shows the complete calculation process, not just answers
4. **Immediate Feedback**: Instant results encourage experimentation
5. **Real-world Context**: Formulas are presented in practical circuit scenarios
6. **Unit Awareness**: Helps students understand different unit magnitudes
7. **Problem-solving Skills**: Multiple approaches (e.g., three power formulas) teach flexibility

## Technical Implementation Details

### Architecture:

```
FormulaCalculator (Main Component)
├── FormulaDiagram (Visual representation)
├── Calculation utilities (Business logic)
├── Type definitions (Type safety)
└── Integration with ComponentInfoPanel
```

### Key Design Decisions:

1. **Separation of Concerns**: Calculation logic separated from UI
2. **Type Safety**: Full TypeScript typing for all inputs/outputs
3. **Reusability**: Calculation functions can be used elsewhere in the app
4. **Educational Focus**: Every feature designed for learning
5. **Mobile-friendly**: Responsive design with scrollable content
6. **Accessibility**: Clear labels, semantic HTML, keyboard navigation

### Performance Considerations:

- **Lightweight calculations**: All formulas execute in microseconds
- **No external dependencies**: Pure JavaScript/TypeScript calculations
- **Efficient rendering**: SVG diagrams are static and cached
- **Minimal re-renders**: State updates optimized for performance

## File Structure

```
apps/web/src/
├── components/
│   ├── FormulaCalculator.tsx       (Main calculator component - 730 lines)
│   ├── FormulaHelper.tsx           (Floating helper - 170 lines)
│   ├── FormulaDiagram.tsx          (Visual diagrams - 270 lines)
│   └── ComponentInfoPanel.tsx      (Updated with calculator integration)
├── types/
│   └── formulas.ts                 (Type definitions - 60 lines)
└── utils/
    └── formulaCalculations.ts      (Calculation engine - 470 lines)
```

## Future Enhancements

Potential additions for future versions:

1. **Frequency-domain calculations**: AC circuits, impedance, reactance
2. **Time-domain analysis**: RC/RL circuits, time constants
3. **Power dissipation calculator**: Heat calculations for components
4. **Voltage divider calculator**: Specific calculator for voltage division
5. **Wire gauge calculator**: Current capacity and voltage drop
6. **Battery life estimator**: Based on current draw and capacity
7. **Save calculations**: History of previous calculations
8. **Export results**: PDF or text export of calculations
9. **Advanced topics**: Transistor biasing, filter design, op-amp circuits
10. **Interactive tutorials**: Guided lessons using the calculator

## Integration Examples

### Example 1: Using with a Resistor

```typescript
// When user selects a 1000Ω resistor in the circuit:
// Calculator opens with Ohm's Law tab
// Resistance field pre-filled with 1000Ω
// Student can enter voltage or current to solve
```

### Example 2: LED Circuit Design

```typescript
// When user selects an LED:
// Calculator opens with LED Resistor tab
// Forward voltage pre-filled from LED properties
// Student enters source voltage and desired current
// Calculator shows required resistor value and steps
```

### Example 3: Series Resistors

```typescript
// Student wants to combine resistors:
// Opens Series Resistance calculator
// Adds 100Ω, 220Ω, 470Ω resistors
// Calculator shows total: 790Ω
// Visual diagram shows resistors in series
```

## Testing

The implementation includes:

- **Type checking**: Full TypeScript validation
- **Input validation**: All numeric inputs validated
- **Edge case handling**: Division by zero, invalid values
- **Formula verification**: All calculations tested against known values

## Conclusion

The Formula Calculator transforms Circuit Crafter from a circuit simulator into a comprehensive learning platform. Students can now not only build circuits but also understand the mathematics behind them through interactive, visual, and step-by-step calculations. The integration with the component system creates a seamless educational experience where theory and practice reinforce each other.
