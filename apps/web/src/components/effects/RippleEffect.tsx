import { useEffect, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface RippleEffectProps {
  color?: string;
  size?: number;
  duration?: number;
}

export function RippleEffect({ color = '#3b82f6', size = 100, duration = 600 }: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [rippleId, setRippleId] = useState(0);

  const addRipple = (e: MouseEvent | TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    const newRipple: Ripple = {
      id: rippleId,
      x,
      y,
      size,
      color,
    };

    setRipples((prev) => [...prev, newRipple]);
    setRippleId((prev) => prev + 1);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, duration);
  };

  useEffect(() => {
    const buttons = document.querySelectorAll('[data-ripple="true"]');

    buttons.forEach((button) => {
      button.addEventListener('click', addRipple as EventListener);
      button.addEventListener('touchstart', addRipple as EventListener);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener('click', addRipple as EventListener);
        button.removeEventListener('touchstart', addRipple as EventListener);
      });
    };
  }, [rippleId]);

  return (
    <>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ripple-effect pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: ripple.color,
          }}
        />
      ))}
    </>
  );
}

// Hook for easy ripple usage in components
export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [rippleId, setRippleId] = useState(0);

  const createRipple = (
    event: React.MouseEvent | React.TouchEvent,
    options?: { color?: string; size?: number; duration?: number }
  ) => {
    const { color = '#3b82f6', size = 100, duration = 600 } = options || {};
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const x = ('touches' in event ? event.touches[0].clientX : event.clientX) - rect.left;
    const y = ('touches' in event ? event.touches[0].clientY : event.clientY) - rect.top;

    const newRipple: Ripple = {
      id: rippleId,
      x,
      y,
      size,
      color,
    };

    setRipples((prev) => [...prev, newRipple]);
    setRippleId((prev) => prev + 1);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, duration);
  };

  const RippleContainer = () => (
    <>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ripple-effect pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: ripple.color,
          }}
        />
      ))}
    </>
  );

  return { createRipple, RippleContainer };
}
