# Formula Calculator - Quick Start Guide

## What is it?

An interactive educational calculator built into Circuit Crafter that helps students learn electronics by solving circuit formulas with step-by-step explanations and visual diagrams.

## 30-Second Overview

1. **Select any component** in your circuit (resistor, LED, battery, etc.)
2. **Click the "Calculator" tab** in the component info panel
3. **Enter values** in the input fields
4. **Click "Calculate"** to see the answer with full explanation
5. **Study the visual diagram** to understand the circuit

That's it! No external tools, no separate apps - everything integrated.

## The 6 Calculators

### 1. Ohm's Law (V = I × R)
**Use when**: You need to find voltage, current, or resistance
**Example**: "I have a 220Ω resistor and 9V battery. What's the current?"
**Answer**: Enter V=9, R=220 → Calculate → I = 40.91 mA

### 2. Power (P = V × I)
**Use when**: You need to calculate power consumption or dissipation
**Example**: "How much power does my 100Ω resistor dissipate at 5V?"
**Answer**: Enter V=5, R=100 → Calculate → P = 0.25 W (250 mW)

### 3. LED Resistor (R = (Vs - Vf) / I)
**Use when**: You're designing an LED circuit
**Example**: "I have a red LED (2V) and 9V battery. What resistor for 20mA?"
**Answer**: Enter Vs=9, Vf=2, I=0.020 → Calculate → R = 350Ω

### 4. Capacitor Charge (Q = C × V)
**Use when**: Working with capacitors
**Example**: "How much charge in a 100μF capacitor at 12V?"
**Answer**: Enter C=0.0001, V=12 → Calculate → Q = 1.2 mC

### 5. Series Resistance
**Use when**: Combining resistors in series
**Example**: "What's the total of 100Ω + 220Ω + 470Ω?"
**Answer**: Add each → Calculate → R_total = 790Ω

### 6. Parallel Resistance
**Use when**: Combining resistors in parallel
**Example**: "What's the equivalent of two 100Ω resistors in parallel?"
**Answer**: Add 100Ω twice → Calculate → R_total = 50Ω

## Features at a Glance

✨ **Visual Diagrams** - See the circuit for each formula
✨ **Step-by-Step** - Understand how the answer is calculated
✨ **Auto-Fill** - Component values automatically populate
✨ **Smart Units** - Automatically shows Ω, kΩ, MΩ, mA, μA, etc.
✨ **Input Validation** - Prevents invalid entries
✨ **Mobile-Friendly** - Works on tablets and phones
✨ **No Internet Required** - All calculations done locally

## Common Use Cases

### Beginner: "What current flows through my resistor?"
1. Build circuit: 9V battery + 1000Ω resistor
2. Select resistor → Calculator tab
3. See R=1000Ω already filled
4. Enter V=9
5. Calculate → I = 9 mA
6. Read steps to understand why

### Intermediate: "Design an LED circuit"
1. Select LED component
2. Calculator tab (LED Resistor opens)
3. Enter supply voltage (e.g., 5V)
4. LED forward voltage already filled (e.g., 2.0V)
5. Enter desired current (e.g., 0.020A for 20mA)
6. Calculate → Get resistor value (150Ω)
7. Add that resistor to your circuit!

### Advanced: "Find total resistance of complex network"
1. Use Series calculator for series branches
2. Use Parallel calculator for parallel branches
3. Combine results step-by-step
4. Verify with actual circuit simulation

## Tips for Learning

### Tip 1: Experiment!
Try different values and see how they affect the result. The calculator updates instantly.

### Tip 2: Read the Steps
Don't just look at the answer - read the step-by-step explanation to understand the process.

### Tip 3: Use the Diagrams
The visual circuit diagrams help you connect the math to real circuits.

### Tip 4: Check Your Work
Build the circuit in the simulator and compare the calculated values with the simulation results.

### Tip 5: Start Simple
Begin with Ohm's Law, then move to more complex calculations as you get comfortable.

## Keyboard Shortcuts

While using the calculator:
- **Tab** - Move between input fields
- **Enter** - Calculate (when focused on input)
- **Escape** - Clear inputs
- **Arrow Keys** - Navigate tabs

## Common Questions

**Q: Why are some fields pre-filled?**
A: When you select a component, its properties automatically fill the relevant fields to save you time.

**Q: Can I use different units?**
A: Yes! Results automatically display in the most readable unit (e.g., 1500Ω shows as 1.50 kΩ).

**Q: What if I make a mistake?**
A: Click "Clear" to reset all inputs, or just change the incorrect value and recalculate.

**Q: Do I need internet?**
A: No! All calculations happen in your browser. No data is sent anywhere.

**Q: Can I save my calculations?**
A: Currently, calculations are not saved. This is a future enhancement.

## Example Learning Path

### Day 1: Ohm's Law Basics
1. Open Ohm's Law calculator
2. Try: V=5, R=100 → Find I
3. Try: V=5, I=0.05 → Find R
4. Try: I=0.02, R=220 → Find V
5. Build circuits to verify each calculation

### Day 2: Power Calculations
1. Open Power calculator
2. Calculate power for different voltages and currents
3. Compare P=VI vs P=I²R vs P=V²/R
4. See which formula is easiest for different scenarios

### Day 3: LED Circuits
1. Design LED circuit with 5V supply
2. Try different LEDs (red, blue, white)
3. Calculate resistors for different currents
4. Build and test in simulator

### Day 4: Resistor Networks
1. Practice series resistor calculations
2. Practice parallel resistor calculations
3. Try complex combinations
4. Verify with simulation

### Day 5: Real Projects
1. Use calculator to design complete circuits
2. Calculate all values before building
3. Verify with simulation
4. Understand why values differ (real vs ideal)

## Best Practices

### ✅ Do:
- Read the step-by-step explanations
- Compare calculated values with simulation results
- Experiment with different input values
- Use the visual diagrams to understand circuits
- Start with simple calculations and progress

### ❌ Don't:
- Just copy the answer without understanding
- Skip reading the formula descriptions
- Ignore the units (Ω vs kΩ matters!)
- Forget to verify calculations in the simulator
- Use values that don't make physical sense

## Getting Help

### Understanding Formulas
Each calculator tab shows the formula being used. The step-by-step solution explains how the answer is derived.

### Visual Learning
Look at the circuit diagram to see how components connect and where voltages/currents are measured.

### Component Info
Click the "Information" tab (next to Calculator) to learn about the component's properties and how it works.

### Experimentation
The best way to learn is to try different values and see what happens. The calculator is safe - you can't break anything!

## Integration with Circuit Building

### Workflow 1: Design → Calculate → Build
1. Decide what you want to build
2. Use calculator to find component values
3. Place components in circuit
4. Run simulation to verify

### Workflow 2: Build → Calculate → Verify
1. Build a circuit
2. Use calculator to predict behavior
3. Run simulation
4. Compare calculated vs simulated values

### Workflow 3: Learn → Practice → Apply
1. Learn a formula in the calculator
2. Practice with different values
3. Apply to real circuit design
4. Build and test

## Success Stories (What You'll Learn)

After using the Formula Calculator, you'll be able to:

✅ Calculate current through any resistor
✅ Design LED circuits confidently
✅ Understand power dissipation in components
✅ Combine resistors in series and parallel
✅ Predict circuit behavior before building
✅ Troubleshoot circuits by checking calculations
✅ Design circuits from specifications
✅ Explain your calculations to others

## Conclusion

The Formula Calculator turns math into understanding. Instead of just using formulas, you'll **understand** them through:
- Visual diagrams showing real circuits
- Step-by-step solutions explaining the process
- Immediate feedback encouraging exploration
- Integration with circuit building for verification

**Start Learning Now**: Build a simple circuit, select a component, and click the Calculator tab!

---

**Remember**: Electronics is learned by doing. Use the calculator, build circuits, experiment, and have fun!
