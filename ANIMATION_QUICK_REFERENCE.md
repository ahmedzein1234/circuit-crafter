# Animation Quick Reference Card

## Circuit Effects

| Effect | File | Usage |
|--------|------|-------|
| Electron Flow | `WireRenderer.tsx` | Auto (when current flows) |
| Switch Toggle | `SwitchShape.tsx` | Auto (on double-click) |
| LED Pulse | `LEDShape.tsx` | Auto (when lit) |
| Motor Spin | `MotorShape.tsx` | Auto (when active) |
| Sparks | `SparkEffect.tsx` | `<SparkEffect x={x} y={y} active intensity={0.8} />` |
| Lightning | `ElectricityFlowEffect.tsx` | `<ElectricityFlowEffect fromX fromY toX toY active />` |

## UI Feedback

| Effect | Type | Usage |
|--------|------|-------|
| Ripple | Component | `const {createRipple, RippleContainer} = useRipple()` |
| Success Checkmark | Component | `<SuccessCheckmark size={80} />` |
| Error X | Component | `<ErrorX size={80} />` |
| Loading | Component | `<CircuitLoadingSpinner size={40} />` |
| Skeleton | Component | `<SkeletonLoader width height />` |
| Bounce Drop | CSS | `className="animate-bounce-drop"` |
| Error Shake | CSS | `className="error-shake"` |
| Wiggle Hint | CSS | `className="animate-wiggle"` |

## Celebrations

| Effect | File | Usage |
|--------|------|-------|
| Confetti | `CelebrationEffects.tsx` | `<CelebrationEffects trigger type="confetti" />` |
| Fireworks | `FireworksEffect.tsx` | `<FireworksEffect active duration={5000} />` |
| Stars | `FireworksEffect.tsx` | `<StarShowerEffect active duration={3000} />` |
| XP Gain | `CelebrationEffects.tsx` | `<XPGainEffect amount={100} />` |
| Level Up | `CelebrationEffects.tsx` | `<LevelUpEffect level={5} />` |

## Background/Ambiance

| Effect | Component | Props |
|--------|-----------|-------|
| Particles | `<ParticleBackground />` | `particleCount, colors, speed, interactive` |
| Grid | `<AnimatedGridBackground />` | None |
| Orbs | `<FloatingOrbs />` | None |

## Common CSS Classes

```css
animate-bounce-drop      /* Component drop */
animate-led-pulse        /* LED glow */
animate-float           /* Gentle floating */
animate-fade-in         /* Fade entrance */
animate-fade-out        /* Fade exit */
animate-slide-in-bottom /* Toast notification */
animate-modal-slide-in  /* Modal entrance */
animate-stagger-in      /* List items */
animate-glow-pulse      /* Active elements */
animate-ping            /* Notification badge */
animate-wiggle          /* Hint shake */
animate-glitch          /* Error effect */
animate-star-burst      /* Success burst */
skeleton                /* Loading state */
hover-lift              /* Hover elevation */
```

## Import Patterns

```tsx
// All effects in one import
import {
  SparkEffect,
  ElectricityFlowEffect,
  FireworksEffect,
  SuccessCheckmark,
  ParticleBackground,
  useRipple,
} from '@/components/effects';

// Or specific imports
import { SparkEffect } from '@/canvas/effects/SparkEffect';
import { SuccessCheckmark } from '@/components/effects/SuccessAnimations';
```

## Event Handlers

```tsx
// Button with ripple
const { createRipple, RippleContainer } = useRipple();
<button onClick={(e) => createRipple(e)}>
  Click
  <RippleContainer />
</button>

// Component drop
<Group
  className="animate-bounce-drop"
  onDragEnd={handleDrop}
/>

// Switch toggle (auto-animated)
<SwitchShape onDoubleClick={toggleSwitch} />
```

## Timing Reference

| Duration | Use Case |
|----------|----------|
| 200ms | Hover effects, button press |
| 300-400ms | Modal/panel transitions |
| 500ms | Component animations |
| 600-800ms | Success feedback |
| 1-2s | Continuous pulses |
| 3-5s | Celebration sequences |

## Performance Tips

1. Limit particles to 20-30 on mobile
2. Use CSS transforms (not left/top)
3. Cancel `requestAnimationFrame` in cleanup
4. Prefer `opacity` and `transform` for animations
5. Use `will-change` sparingly
6. Check `prefers-reduced-motion`

## Accessibility

```tsx
// Respect motion preferences
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

{!prefersReducedMotion && <ParticleBackground />}
```

## Color Palette

```tsx
// Circuit theme colors
const COLORS = {
  current: '#00ff88',      // Active current
  overload: '#ef4444',     // Danger/overload
  success: '#22c55e',      // Success green
  warning: '#f59e0b',      // Warning amber
  info: '#3b82f6',         // Info blue
  purple: '#8b5cf6',       // Accent purple
  cyan: '#06b6d4',         // Accent cyan
};
```
