import { useEffect, useState } from 'react';

// Animated checkmark for success
interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export function SuccessCheckmark({
  size = 80,
  color = '#22c55e',
  duration = 800,
  onComplete,
}: SuccessCheckmarkProps) {
  const [visible, setVisible] = useState(true);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    // Scale in animation
    const scaleTimeout = setTimeout(() => setScale(1), 50);

    // Complete callback
    const completeTimeout = setTimeout(() => {
      onComplete?.();
    }, duration);

    // Hide after animation
    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, duration + 500);

    return () => {
      clearTimeout(scaleTimeout);
      clearTimeout(completeTimeout);
      clearTimeout(hideTimeout);
    };
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transition-transform duration-300"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Circle background */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="4"
          opacity="0.2"
        />

        {/* Animated circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="283"
          strokeDashoffset="283"
          className="animate-checkmark-stroke"
          style={{
            animation: 'checkmarkCircle 0.6s ease-out forwards',
          }}
        />

        {/* Checkmark */}
        <path
          d="M 30 50 L 45 65 L 70 35"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset="100"
          className="animate-checkmark-stroke"
          style={{
            animationDelay: '0.3s',
          }}
        />
      </svg>
    </div>
  );
}

// Error X animation
interface ErrorXProps {
  size?: number;
  color?: string;
  onComplete?: () => void;
}

export function ErrorX({ size = 80, color = '#ef4444', onComplete }: ErrorXProps) {
  const [visible, setVisible] = useState(true);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const scaleTimeout = setTimeout(() => setScale(1), 50);

    const completeTimeout = setTimeout(() => {
      onComplete?.();
    }, 800);

    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, 1300);

    return () => {
      clearTimeout(scaleTimeout);
      clearTimeout(completeTimeout);
      clearTimeout(hideTimeout);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center animate-glitch">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transition-transform duration-300"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Circle background */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="4"
          opacity="0.2"
        />

        {/* Animated circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="283"
          strokeDashoffset="283"
          className="animate-checkmark-stroke"
        />

        {/* X mark - first line */}
        <path
          d="M 35 35 L 65 65"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="50"
          strokeDashoffset="50"
          className="animate-checkmark-stroke"
          style={{
            animationDelay: '0.3s',
          }}
        />

        {/* X mark - second line */}
        <path
          d="M 65 35 L 35 65"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="50"
          strokeDashoffset="50"
          className="animate-checkmark-stroke"
          style={{
            animationDelay: '0.4s',
          }}
        />
      </svg>
    </div>
  );
}

// Success popup banner
interface SuccessBannerProps {
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

export function SuccessBanner({ message, description, duration = 3000, onClose }: SuccessBannerProps) {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 min-w-80 max-w-md transition-all duration-400 ${
        isClosing ? 'animate-fade-out translate-x-8' : 'animate-slide-in-bottom'
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <SuccessCheckmark size={40} color="#ffffff" />
        </div>
        <div className="flex-1 text-white">
          <h3 className="font-bold text-lg">{message}</h3>
          {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        </div>
        <button
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setVisible(false);
              onClose?.();
            }, 400);
          }}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Loading spinner with circuit theme
export function CircuitLoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-rotate-continuous"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeDasharray="80, 200"
          strokeLinecap="round"
        />
        <circle cx="25" cy="5" r="3" fill="#3b82f6" />
        <circle cx="45" cy="25" r="3" fill="#8b5cf6" />
        <circle cx="25" cy="45" r="3" fill="#06b6d4" />
        <circle cx="5" cy="25" r="3" fill="#10b981" />
      </svg>
    </div>
  );
}

// Skeleton loading for UI elements
export function SkeletonLoader({ width = '100%', height = '20px', className = '' }) {
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{
        width,
        height,
      }}
    />
  );
}

// Pulse dot for "recording" or "live" indicator
export function PulseDot({ color = '#ef4444', size = 12 }: { color?: string; size?: number }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className="absolute animate-ping rounded-full opacity-75"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
