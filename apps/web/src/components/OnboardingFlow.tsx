import { useEffect, useState } from 'react';
import { useOnboardingStore, ONBOARDING_STEPS } from '../stores/onboardingStore';
import { useCircuitStore } from '../stores/circuitStore';

export function OnboardingFlow() {
  const {
    isOnboardingActive,
    currentStepIndex,
    nextStep,
    previousStep,
    skipOnboarding,
  } = useOnboardingStore();

  const { components, wires, simulationResult } = useCircuitStore();
  const [spotlightPosition, setSpotlightPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  // Calculate spotlight position for highlighted element
  useEffect(() => {
    if (!isOnboardingActive || !currentStep?.targetElement) {
      setSpotlightPosition(null);
      setTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(currentStep.targetElement!);
      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;

        setSpotlightPosition({
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });

        // Calculate tooltip position based on preferred side
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        let x = rect.left;
        let y = rect.top;

        switch (currentStep.position) {
          case 'right':
            x = rect.right + 16;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'left':
            x = rect.left - tooltipWidth - 16;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.bottom + 16;
            break;
          case 'top':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.top - tooltipHeight - 16;
            break;
        }

        // Keep tooltip on screen
        x = Math.max(16, Math.min(x, window.innerWidth - tooltipWidth - 16));
        y = Math.max(16, Math.min(y, window.innerHeight - tooltipHeight - 16));

        setTooltipPosition({ x, y });
      }
    };

    updatePosition();
    const intervalId = setInterval(updatePosition, 100);

    return () => clearInterval(intervalId);
  }, [isOnboardingActive, currentStep]);

  // Auto-advance based on user actions
  useEffect(() => {
    if (!isOnboardingActive || !currentStep?.action) return;

    const checkProgress = () => {
      let shouldAdvance = false;

      switch (currentStep.action) {
        case 'drag-battery':
          shouldAdvance = components.some(c => c.type === 'battery');
          break;
        case 'drag-resistor':
          shouldAdvance = components.some(c => c.type === 'resistor');
          break;
        case 'drag-led':
          shouldAdvance = components.some(c => c.type === 'led');
          break;
        case 'connect-wire':
          shouldAdvance = wires.length >= 3; // At least 3 wires for a basic circuit
          break;
        case 'run-simulation':
          shouldAdvance = simulationResult !== null;
          break;
      }

      if (shouldAdvance) {
        setTimeout(() => nextStep(), 800); // Small delay before advancing
      }
    };

    checkProgress();
  }, [isOnboardingActive, currentStep, components, wires, simulationResult, nextStep]);

  if (!isOnboardingActive) return null;

  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 50, pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightPosition && (
              <rect
                x={spotlightPosition.x}
                y={spotlightPosition.y}
                width={spotlightPosition.width}
                height={spotlightPosition.height}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
          className="transition-all duration-300"
        />
      </svg>

      {/* Animated spotlight ring */}
      {spotlightPosition && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: spotlightPosition.x,
            top: spotlightPosition.y,
            width: spotlightPosition.width,
            height: spotlightPosition.height,
            transition: 'all 0.3s ease-out',
          }}
        >
          <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
          <div className="absolute inset-0 rounded-lg border-2 border-blue-400 opacity-50 animate-ping" />
        </div>
      )}

      {/* Tutorial tooltip */}
      <div
        className="absolute pointer-events-auto transition-all duration-300 ease-out"
        style={{
          left: tooltipPosition?.x ?? '50%',
          top: tooltipPosition?.y ?? '50%',
          transform: !tooltipPosition ? 'translate(-50%, -50%)' : 'none',
          zIndex: 100,
        }}
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Progress bar */}
          <div className="h-1 bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400 font-medium">
                    Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {/* Action indicator */}
            {currentStep.action && (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-300 text-xs">
                  <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>Complete this action to continue</span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={skipOnboarding}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
              >
                I already know this
              </button>

              <div className="flex gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={previousStep}
                    className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                )}
                {!currentStep.action && (
                  <button
                    onClick={nextStep}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-1"
                  >
                    Next
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        </div>

        {/* Arrow pointer to target element */}
        {currentStep.targetElement && spotlightPosition && tooltipPosition && (
          <svg
            className="absolute w-6 h-6 text-gray-800"
            style={{
              ...(currentStep.position === 'right' && { left: -12, top: '50%', transform: 'translateY(-50%) rotate(180deg)' }),
              ...(currentStep.position === 'left' && { right: -12, top: '50%', transform: 'translateY(-50%)' }),
              ...(currentStep.position === 'bottom' && { left: '50%', top: -12, transform: 'translateX(-50%) rotate(90deg)' }),
              ...(currentStep.position === 'top' && { left: '50%', bottom: -12, transform: 'translateX(-50%) rotate(-90deg)' }),
            }}
          >
            <path
              d="M12 2L2 12L12 22"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-gray-800/90 px-3 py-2 rounded-lg pointer-events-auto" style={{ zIndex: 100 }}>
        Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Esc</kbd> to skip tutorial
      </div>
    </div>
  );
}

// Hook to handle keyboard shortcuts
export function useOnboardingKeyboard() {
  const { isOnboardingActive, skipOnboarding } = useOnboardingStore();

  useEffect(() => {
    if (!isOnboardingActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipOnboarding();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingActive, skipOnboarding]);
}
