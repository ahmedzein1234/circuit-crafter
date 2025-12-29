import { useEffect, useState, useCallback } from 'react';
import { create } from 'zustand';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Store for managing XP notifications
interface XPNotification {
  id: number;
  amount: number;
  reason: string;
  x: number;
  y: number;
  timestamp: number;
}

interface XPNotificationStore {
  notifications: XPNotification[];
  addNotification: (amount: number, reason: string, x?: number, y?: number) => void;
  removeNotification: (id: number) => void;
}

let notificationId = 0;

export const useXPNotificationStore = create<XPNotificationStore>((set) => ({
  notifications: [],
  addNotification: (amount, reason, x, y) => {
    const id = notificationId++;
    // Default position is center-right of screen if not specified
    const posX = x ?? window.innerWidth - 200;
    const posY = y ?? 100 + (notificationId % 5) * 60;

    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, amount, reason, x: posX, y: posY, timestamp: Date.now() },
      ],
    }));

    // Auto-remove after animation
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 2500);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

// Individual floating XP component
interface FloatingXPProps {
  amount: number;
  reason: string;
  x: number;
  y: number;
  onComplete: () => void;
}

function FloatingXP({ amount, reason, x, y, onComplete }: FloatingXPProps) {
  const [position, setPosition] = useState({ y: 0, opacity: 1, scale: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion, show static then fade
    if (prefersReducedMotion) {
      setPosition({ y: 0, opacity: 1, scale: 1 });
      const complete = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(complete);
    }

    // Initial pop-in animation
    const popIn = setTimeout(() => {
      setPosition({ y: 0, opacity: 1, scale: 1.2 });
    }, 50);

    // Settle
    const settle = setTimeout(() => {
      setPosition({ y: 0, opacity: 1, scale: 1 });
    }, 200);

    // Float up and fade
    const interval = setInterval(() => {
      setPosition((prev) => ({
        y: prev.y - 1.5,
        opacity: Math.max(0, prev.opacity - 0.015),
        scale: prev.scale,
      }));
    }, 16);

    // Complete
    const complete = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(popIn);
      clearTimeout(settle);
      clearInterval(interval);
      clearTimeout(complete);
    };
  }, [onComplete, prefersReducedMotion]);

  return (
    <div
      className="fixed pointer-events-none z-[60] flex flex-col items-center"
      style={{
        left: x,
        top: prefersReducedMotion ? y : y + position.y,
        opacity: position.opacity,
        transform: `scale(${position.scale})`,
        transition: prefersReducedMotion ? 'none' : 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Main XP amount */}
      <div className="flex items-center gap-1">
        <span className="text-3xl font-black text-yellow-400 drop-shadow-lg"
          style={{
            textShadow: '0 0 20px rgba(234, 179, 8, 0.6), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          +{amount}
        </span>
        <span className="text-xl font-bold text-yellow-300">XP</span>
      </div>

      {/* Reason */}
      <div className="text-xs text-gray-300 font-medium mt-0.5 px-2 py-0.5 bg-black/50 rounded-full">
        {reason}
      </div>

      {/* Sparkle particles - hidden when reduced motion */}
      {!prefersReducedMotion && (
        <div className="absolute -inset-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 30}%`,
                top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 30}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Container that renders all active XP notifications
export function FloatingXPContainer() {
  const { notifications, removeNotification } = useXPNotificationStore();

  return (
    <>
      {notifications.map((notification) => (
        <FloatingXP
          key={notification.id}
          amount={notification.amount}
          reason={notification.reason}
          x={notification.x}
          y={notification.y}
          onComplete={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
}

// Hook for showing XP gains with position
export function useFloatingXP() {
  const addNotification = useXPNotificationStore((state) => state.addNotification);

  const showXPGain = useCallback(
    (amount: number, reason: string, x?: number, y?: number) => {
      addNotification(amount, reason, x, y);
    },
    [addNotification]
  );

  return { showXPGain };
}
