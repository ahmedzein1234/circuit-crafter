# Circuit Crafter - Visual Effects & Animations Guide

This guide documents all the visual effects and animations added to Circuit Crafter to make the game visually exciting and fun.

## Table of Contents

1. [CSS Animations](#css-animations)
2. [Circuit Animations](#circuit-animations)
3. [UI Animations](#ui-animations)
4. [Celebration Effects](#celebration-effects)
5. [Interactive Feedback](#interactive-feedback)
6. [Background & Ambiance](#background--ambiance)
7. [Usage Examples](#usage-examples)

---

## CSS Animations

All CSS animations are defined in `apps/web/src/styles/index.css`. Simply add the appropriate class to any element.

### Available Animation Classes

| Class | Description | Duration | Use Case |
|-------|-------------|----------|----------|
| `animate-bounce-drop` | Bounce effect when dropping components | 500ms | Component placement |
| `animate-led-pulse` | Pulsing glow effect | 1s infinite | Active LEDs |
| `animate-electricity-flow` | Dashed line animation | 800ms infinite | Wire current flow |
| `hover-lift` | Lift effect on hover | 200ms | Interactive elements |
| `animate-float` | Floating motion | 4s infinite | Background particles |
| `animate-gradient-shift` | Animated gradient background | 8s infinite | Panels/cards |
| `animate-glitch` | Glitch/error effect | 300ms | Error states |
| `animate-star-burst` | Expanding star burst | 800ms | Success moments |
| `animate-switch-toggle` | Switch toggle animation | 300ms | Switch components |
| `animate-modal-slide-in` | Modal entrance | 400ms | Modal dialogs |
| `animate-stagger-in` | Staggered list entrance | 400ms | Lists/menus |
| `animate-checkmark-stroke` | SVG stroke animation | 600ms | Checkmarks |
| `skeleton` | Loading skeleton shimmer | 1.5s infinite | Loading states |
| `animate-ping` | Expanding ping effect | 1s infinite | Notifications |
| `animate-wiggle` | Wiggle for hints | 500ms | Hint indicators |
| `animate-glow-pulse` | Pulsing glow | 2s infinite | Active elements |
| `animate-float-up` | Float upward and fade | 3s | XP/points |
| `animate-rotate-continuous` | Continuous rotation | 2s infinite | Loading spinners |
| `animate-heartbeat` | Heartbeat pulse | 1.5s infinite | Important alerts |
| `animate-slide-in-bottom` | Slide in from bottom | 400ms | Toast notifications |
| `animate-fade-out` | Fade out | 300ms | Dismissing elements |

### Usage Example

```tsx
// Bounce effect on component drop
<div className="animate-bounce-drop">
  <Component />
</div>

// Pulsing LED
<div className="animate-led-pulse">
  <LED />
</div>

// Staggered list items
<ul>
  <li className="animate-stagger-in">Item 1</li>
  <li className="animate-stagger-in">Item 2</li>
  <li className="animate-stagger-in">Item 3</li>
</ul>
```

---

## Circuit Animations

### 1. Enhanced Wire Current Flow

**File**: `apps/web/src/canvas/WireRenderer.tsx`

**Features**:
- Animated electron particles flowing along wires
- Particle speed and count based on current intensity
- Glowing effect for high current
- Junction point glow at wire connections

**Already Implemented**: Yes, enhanced with particle animation system.

### 2. Switch Toggle Animation

**File**: `apps/web/src/canvas/shapes/SwitchShape.tsx`

**Features**:
- Smooth lever movement with easing
- Bounce effect during toggle
- Glow on contacts when powered
- Shadow effects during animation

**Usage**: Automatically triggered when switch is toggled (double-click).

### 3. LED Glow Effect

**File**: `apps/web/src/canvas/shapes/LEDShape.tsx`

**Features**:
- Pulsing glow based on brightness
- Color-specific glow (red, green, blue, yellow, white)
- Overload indicators with spark effects
- Light emission arrows when active

**Already Implemented**: Yes, with Konva animation.

### 4. Motor Spinning Animation

**File**: `apps/web/src/canvas/shapes/MotorShape.tsx`

**Features**:
- Rotating shaft indicator
- Speed-based rotation rate
- Visual speed percentage display
- Glow effect when active

**Already Implemented**: Yes, with continuous rotation animation.

### 5. Spark Effects (Enhanced)

**File**: `apps/web/src/canvas/effects/SparkEffect.tsx`

**Features**:
- Branching lightning-like sparks
- Particle spray with physics (gravity, air resistance)
- Multi-layered glowing core
- Intensity-based spark frequency and size

**Usage**:
```tsx
import { SparkEffect } from '@/canvas/effects/SparkEffect';

<SparkEffect
  x={componentX}
  y={componentY}
  active={isOverloaded}
  intensity={0.8} // 0-1
/>
```

### 6. Electricity Flow Effect (NEW)

**File**: `apps/web/src/canvas/effects/ElectricityFlowEffect.tsx`

**Features**:
- Lightning bolts along wire paths
- Pulsing energy at endpoints
- Energy orbs that travel along paths

**Usage**:
```tsx
import { ElectricityFlowEffect, EnergyOrb } from '@/canvas/effects/ElectricityFlowEffect';

// Lightning effect
<ElectricityFlowEffect
  fromX={startX}
  fromY={startY}
  toX={endX}
  toY={endY}
  active={isActive}
  intensity={0.7}
  color="#00ff88"
/>

// Energy orb
<EnergyOrb
  path={[x1, y1, x2, y2, x3, y3]}
  active={true}
  speed={1.5}
  color="#00ff88"
  size={6}
/>
```

---

## UI Animations

### 1. Ripple Effect (NEW)

**File**: `apps/web/src/components/effects/RippleEffect.tsx`

**Usage**:

```tsx
import { useRipple } from '@/components/effects';

function MyButton() {
  const { createRipple, RippleContainer } = useRipple();

  return (
    <button
      className="relative overflow-hidden"
      onClick={(e) => createRipple(e, { color: '#3b82f6', size: 100 })}
    >
      Click Me
      <RippleContainer />
    </button>
  );
}

// Or use data attribute approach
<button data-ripple="true">Auto Ripple</button>
<RippleEffect />
```

### 2. Success Animations (NEW)

**File**: `apps/web/src/components/effects/SuccessAnimations.tsx`

**Components**:

#### Success Checkmark
```tsx
<SuccessCheckmark
  size={80}
  color="#22c55e"
  duration={800}
  onComplete={() => console.log('Done!')}
/>
```

#### Error X
```tsx
<ErrorX
  size={80}
  color="#ef4444"
  onComplete={() => console.log('Error shown')}
/>
```

#### Success Banner
```tsx
<SuccessBanner
  message="Circuit Complete!"
  description="You earned 100 XP"
  duration={3000}
  onClose={() => console.log('Banner closed')}
/>
```

#### Loading Spinner
```tsx
<CircuitLoadingSpinner size={40} />
```

#### Skeleton Loader
```tsx
<SkeletonLoader width="100%" height="20px" />
```

#### Pulse Dot
```tsx
<PulseDot color="#ef4444" size={12} />
```

---

## Celebration Effects

### 1. Confetti & Sparkles (Existing)

**File**: `apps/web/src/components/effects/CelebrationEffects.tsx`

```tsx
<CelebrationEffects
  trigger={shouldCelebrate}
  type="confetti" // or "sparkles" or "xp"
  onComplete={() => setShouldCelebrate(false)}
/>

<XPGainEffect amount={100} onComplete={() => {}} />

<LevelUpEffect level={5} onComplete={() => {}} />
```

### 2. Fireworks Effect (NEW)

**File**: `apps/web/src/components/effects/FireworksEffect.tsx`

**Features**:
- Full-screen fireworks display
- Customizable colors and duration
- Particle trails and physics
- Multiple simultaneous fireworks

```tsx
<FireworksEffect
  active={showFireworks}
  duration={5000}
  colors={['#ef4444', '#3b82f6', '#10b981']}
  onComplete={() => setShowFireworks(false)}
/>
```

### 3. Star Shower Effect (NEW)

Simpler celebration effect:

```tsx
<StarShowerEffect
  active={showStars}
  duration={3000}
  onComplete={() => setShowStars(false)}
/>
```

---

## Interactive Feedback

### Component Drop Feedback

When a component is dropped on the canvas:

```tsx
// In CircuitCanvas.tsx
<Group
  className="animate-bounce-drop"
  onDragEnd={handleDrop}
>
  <ComponentRenderer />
</Group>
```

### Button Press Animations

All buttons automatically have press animations:

```css
/* Already applied globally */
.btn {
  @apply hover:scale-105 active:scale-95;
  transition: all 200ms;
}
```

### Error Shake

For validation errors:

```tsx
<div className={hasError ? 'error-shake' : ''}>
  <Input />
</div>
```

### Hint Wiggle

For drawing attention:

```tsx
<div className="animate-wiggle">
  <HintIcon />
</div>
```

---

## Background & Ambiance

### 1. Particle Background (NEW)

**File**: `apps/web/src/components/effects/ParticleBackground.tsx`

**Features**:
- Floating particles with connections
- Mouse interaction (particles avoid cursor)
- Customizable colors and speed

```tsx
<ParticleBackground
  particleCount={30}
  colors={['#3b82f6', '#8b5cf6', '#06b6d4']}
  speed={0.5}
  interactive={true}
/>
```

### 2. Animated Grid Background (NEW)

Moving grid pattern:

```tsx
<AnimatedGridBackground />
```

### 3. Floating Orbs (NEW)

Large ambient glow orbs:

```tsx
<FloatingOrbs />
```

---

## Usage Examples

### Complete Circuit Success Flow

```tsx
import {
  SuccessCheckmark,
  CelebrationEffects,
  FireworksEffect,
  SuccessBanner,
} from '@/components/effects';

function CircuitCompleteFlow() {
  const [showCheck, setShowCheck] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Show checkmark
    setTimeout(() => {
      setShowCheck(false);
      setShowConfetti(true);
    }, 1000);

    // 2. Show confetti
    setTimeout(() => {
      setShowFireworks(true);
    }, 1500);

    // 3. Show banner
    setTimeout(() => {
      setShowBanner(true);
    }, 2000);
  }, []);

  return (
    <>
      {showCheck && <SuccessCheckmark />}
      {showConfetti && <CelebrationEffects trigger type="confetti" />}
      {showFireworks && <FireworksEffect active duration={3000} />}
      {showBanner && (
        <SuccessBanner
          message="Circuit Complete!"
          description="You've mastered basic circuits!"
        />
      )}
    </>
  );
}
```

### Adding Background Ambiance

In your main App component:

```tsx
import { ParticleBackground, AnimatedGridBackground } from '@/components/effects';

function App() {
  return (
    <>
      <ParticleBackground particleCount={20} />
      <AnimatedGridBackground />
      {/* Rest of your app */}
    </>
  );
}
```

### Interactive Button with Ripple

```tsx
import { useRipple } from '@/components/effects';

function ActionButton({ onClick, children }) {
  const { createRipple, RippleContainer } = useRipple();

  return (
    <button
      className="btn btn-primary relative overflow-hidden"
      onClick={(e) => {
        createRipple(e, { color: 'rgba(255, 255, 255, 0.5)' });
        onClick?.(e);
      }}
    >
      {children}
      <RippleContainer />
    </button>
  );
}
```

### Circuit Component with Effects

```tsx
import { SparkEffect } from '@/canvas/effects/SparkEffect';
import { ElectricityFlowEffect } from '@/canvas/effects/ElectricityFlowEffect';

function ResistorComponent({ isOverloaded, current, position }) {
  return (
    <Group x={position.x} y={position.y}>
      {/* Resistor shape */}
      <ResistorShape />

      {/* Overload sparks */}
      {isOverloaded && (
        <SparkEffect
          x={0}
          y={0}
          active={true}
          intensity={0.8}
        />
      )}

      {/* Current flow effect */}
      {current > 0 && (
        <ElectricityFlowEffect
          fromX={-20}
          fromY={0}
          toX={20}
          toY={0}
          active={true}
          intensity={Math.min(current / 5, 1)}
        />
      )}
    </Group>
  );
}
```

---

## Performance Notes

1. **Particle Effects**: Limit particle count on mobile devices
2. **Canvas Animations**: Use `requestAnimationFrame` for smooth 60fps
3. **CSS Animations**: Hardware-accelerated with `transform` and `opacity`
4. **Cleanup**: Always cancel animations in `useEffect` cleanup functions

## Accessibility

- All animations respect `prefers-reduced-motion` media query
- Success/error feedback includes both visual and semantic indicators
- Interactive elements maintain focus states
- Color combinations meet WCAG contrast requirements

---

## Adding Your Own Effects

### CSS Animation Template

```css
@keyframes myAnimation {
  0% {
    /* Start state */
  }
  100% {
    /* End state */
  }
}

.animate-my-animation {
  animation: myAnimation 1s ease-in-out;
}
```

### React Component Template

```tsx
import { useEffect, useState } from 'react';

interface MyEffectProps {
  active: boolean;
  onComplete?: () => void;
}

export function MyEffect({ active, onComplete }: MyEffectProps) {
  useEffect(() => {
    if (!active) return;

    // Your animation logic here

    const cleanup = () => {
      // Cleanup code
    };

    return cleanup;
  }, [active]);

  return (
    <div className="my-effect">
      {/* Your effect JSX */}
    </div>
  );
}
```

---

## Next Steps

1. Add sound effects to complement visual feedback
2. Create preset animation sequences for common scenarios
3. Add accessibility settings panel to disable animations
4. Implement GPU-accelerated shader effects for advanced visuals
5. Create animation timeline editor for complex sequences

---

**Enjoy making Circuit Crafter visually exciting!**
