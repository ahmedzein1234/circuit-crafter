/**
 * Effects Showcase Component
 *
 * This file demonstrates how to use all the visual effects and animations
 * available in Circuit Crafter. Use this as a reference for implementing
 * effects in your own components.
 *
 * To view this showcase, import and render it in your app:
 * import { EffectsShowcase } from './examples/EffectsShowcase';
 */

import { useState } from 'react';
import {
  // Celebration effects
  CelebrationEffects,
  XPGainEffect,
  LevelUpEffect,
  FireworksEffect,
  StarShowerEffect,

  // UI feedback
  useRipple,
  SuccessCheckmark,
  ErrorX,
  SuccessBanner,
  CircuitLoadingSpinner,
  SkeletonLoader,
  PulseDot,

  // Background
  ParticleBackground,
  AnimatedGridBackground,
  FloatingOrbs,
} from '../components/effects';

export function EffectsShowcase() {
  // State for controlling effects
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showErrorX, setShowErrorX] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'none' | 'particles' | 'grid' | 'orbs'>('none');

  // Ripple hook
  const { createRipple, RippleContainer } = useRipple();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative overflow-hidden">
      {/* Background Effects */}
      {backgroundType === 'particles' && (
        <ParticleBackground
          particleCount={30}
          colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
          speed={0.5}
          interactive={true}
        />
      )}
      {backgroundType === 'grid' && <AnimatedGridBackground />}
      {backgroundType === 'orbs' && <FloatingOrbs />}

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in">
          Circuit Crafter - Visual Effects Showcase
        </h1>

        {/* Background Controls */}
        <section className="panel p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Background Effects</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              className="btn btn-secondary"
              onClick={() => setBackgroundType('none')}
            >
              None
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setBackgroundType('particles')}
            >
              Particle Background
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setBackgroundType('grid')}
            >
              Animated Grid
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setBackgroundType('orbs')}
            >
              Floating Orbs
            </button>
          </div>
        </section>

        {/* Celebration Effects */}
        <section className="panel p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Celebration Effects</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="btn btn-primary"
              onClick={() => setShowConfetti(true)}
            >
              Confetti
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowFireworks(true)}
            >
              Fireworks
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowStars(true)}
            >
              Star Shower
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowXPGain(true)}
            >
              XP Gain
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowLevelUp(true)}
            >
              Level Up
            </button>
          </div>
        </section>

        {/* UI Feedback */}
        <section className="panel p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">UI Feedback</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button
              className="btn btn-primary relative overflow-hidden"
              onClick={(e) => createRipple(e, { color: 'rgba(59, 130, 246, 0.5)' })}
            >
              Ripple Effect
              <RippleContainer />
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCheckmark(true)}
            >
              Success Checkmark
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowErrorX(true)}
            >
              Error X
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowBanner(true)}
            >
              Success Banner
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CircuitLoadingSpinner size={30} />
              <span>Loading Spinner</span>
            </div>
            <div className="flex items-center gap-2">
              <PulseDot color="#ef4444" size={12} />
              <span>Live Indicator</span>
            </div>
          </div>

          {/* Skeleton Loaders */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Skeleton Loaders</h3>
            <div className="space-y-2">
              <SkeletonLoader width="100%" height="20px" />
              <SkeletonLoader width="80%" height="20px" />
              <SkeletonLoader width="60%" height="20px" />
            </div>
          </div>
        </section>

        {/* CSS Animations */}
        <section className="panel p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">CSS Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg text-center hover-lift cursor-pointer">
              Hover Lift
            </div>
            <div className="p-4 bg-gray-800 rounded-lg text-center animate-float">
              Float
            </div>
            <div className="p-4 bg-gray-800 rounded-lg text-center animate-glow-pulse">
              Glow Pulse
            </div>
            <div className="p-4 bg-gray-800 rounded-lg text-center animate-heartbeat">
              Heartbeat
            </div>
            <div className="p-4 bg-gray-800 rounded-lg text-center animate-wiggle">
              Wiggle
            </div>
            <div className="p-4 bg-gray-800 rounded-lg text-center error-shake">
              Error Shake
            </div>
          </div>
        </section>

        {/* Stagger Animation Demo */}
        <section className="panel p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Stagger Animation</h2>
          <ul className="space-y-2">
            <li className="animate-stagger-in p-3 bg-gray-800 rounded">Item 1</li>
            <li className="animate-stagger-in p-3 bg-gray-800 rounded">Item 2</li>
            <li className="animate-stagger-in p-3 bg-gray-800 rounded">Item 3</li>
            <li className="animate-stagger-in p-3 bg-gray-800 rounded">Item 4</li>
            <li className="animate-stagger-in p-3 bg-gray-800 rounded">Item 5</li>
          </ul>
        </section>

        {/* Code Examples */}
        <section className="panel p-6">
          <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ripple Effect</h3>
              <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
                <code>{`const { createRipple, RippleContainer } = useRipple();

<button
  onClick={(e) => createRipple(e)}
>
  Click Me
  <RippleContainer />
</button>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Fireworks</h3>
              <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
                <code>{`<FireworksEffect
  active={showFireworks}
  duration={5000}
  colors={['#ef4444', '#3b82f6']}
  onComplete={() => setShowFireworks(false)}
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">CSS Animation</h3>
              <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
                <code>{`<div className="animate-bounce-drop">
  Component dropped!
</div>`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>

      {/* Active Effects Rendering */}
      {showConfetti && (
        <CelebrationEffects
          trigger={showConfetti}
          type="confetti"
          onComplete={() => setShowConfetti(false)}
        />
      )}

      {showFireworks && (
        <FireworksEffect
          active={showFireworks}
          duration={5000}
          onComplete={() => setShowFireworks(false)}
        />
      )}

      {showStars && (
        <StarShowerEffect
          active={showStars}
          duration={3000}
          onComplete={() => setShowStars(false)}
        />
      )}

      {showCheckmark && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div onClick={() => setShowCheckmark(false)}>
            <SuccessCheckmark
              size={120}
              onComplete={() => setTimeout(() => setShowCheckmark(false), 1000)}
            />
          </div>
        </div>
      )}

      {showErrorX && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div onClick={() => setShowErrorX(false)}>
            <ErrorX
              size={120}
              onComplete={() => setTimeout(() => setShowErrorX(false), 1000)}
            />
          </div>
        </div>
      )}

      {showXPGain && (
        <XPGainEffect
          amount={250}
          onComplete={() => setShowXPGain(false)}
        />
      )}

      {showLevelUp && (
        <LevelUpEffect
          level={5}
          onComplete={() => setShowLevelUp(false)}
        />
      )}

      {showBanner && (
        <SuccessBanner
          message="Circuit Complete!"
          description="You've mastered the basics of electronics!"
          duration={3000}
          onClose={() => setShowBanner(false)}
        />
      )}
    </div>
  );
}

/**
 * Example: Circuit Success Flow
 *
 * Here's a complete example of how to create a success flow
 * when a user completes a circuit challenge:
 */
export function CircuitSuccessExample() {
  const [step, setStep] = useState(0);

  const handleCircuitComplete = () => {
    // Step 1: Show checkmark (1 second)
    setStep(1);

    setTimeout(() => {
      // Step 2: Show confetti (2 seconds)
      setStep(2);
    }, 1000);

    setTimeout(() => {
      // Step 3: Show XP gain (2 seconds)
      setStep(3);
    }, 2000);

    setTimeout(() => {
      // Step 4: Show success banner (3 seconds)
      setStep(4);
    }, 3000);

    setTimeout(() => {
      // Reset
      setStep(0);
    }, 6000);
  };

  return (
    <div className="p-8">
      <button className="btn btn-primary" onClick={handleCircuitComplete}>
        Trigger Success Flow
      </button>

      {step >= 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <SuccessCheckmark size={120} />
        </div>
      )}

      {step >= 2 && (
        <CelebrationEffects trigger type="confetti" />
      )}

      {step >= 3 && (
        <XPGainEffect amount={100} />
      )}

      {step >= 4 && (
        <SuccessBanner
          message="Circuit Complete!"
          description="You earned 100 XP"
        />
      )}
    </div>
  );
}
