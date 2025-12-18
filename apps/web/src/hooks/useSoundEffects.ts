import { useCallback, useRef, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sound settings store
interface SoundSettingsState {
  soundEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
}

export const useSoundSettings = create<SoundSettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      volume: 0.5,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'circuit-crafter-sound-settings',
    }
  )
);

// Sound effect types
type SoundEffect =
  | 'click'
  | 'connect'
  | 'disconnect'
  | 'drop'
  | 'achievement'
  | 'levelUp'
  | 'xp'
  | 'error'
  | 'success'
  | 'spark';

// Web Audio API based sound generator
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const { soundEnabled, volume } = useSoundSettings();

  // Initialize audio context on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate a simple tone
  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine', decay = true) => {
      if (!soundEnabled) return;

      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
        if (decay) {
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        }

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio context not available
      }
    },
    [soundEnabled, volume, getAudioContext]
  );

  // Play a chord (multiple notes)
  const playChord = useCallback(
    (frequencies: number[], duration: number) => {
      frequencies.forEach((freq, i) => {
        setTimeout(() => playTone(freq, duration, 'sine'), i * 50);
      });
    },
    [playTone]
  );

  // Sound effect implementations
  const play = useCallback(
    (effect: SoundEffect) => {
      if (!soundEnabled) return;

      switch (effect) {
        case 'click':
          playTone(800, 0.05, 'square');
          break;

        case 'connect':
          // Rising tone for successful connection
          playTone(440, 0.1, 'sine');
          setTimeout(() => playTone(660, 0.15, 'sine'), 80);
          break;

        case 'disconnect':
          // Falling tone
          playTone(440, 0.1, 'sine');
          setTimeout(() => playTone(330, 0.1, 'sine'), 80);
          break;

        case 'drop':
          // Thud sound
          playTone(150, 0.1, 'triangle');
          break;

        case 'achievement':
          // Triumphant chord progression
          playChord([523, 659, 784], 0.3); // C major
          setTimeout(() => playChord([587, 740, 880], 0.4), 200); // D major
          setTimeout(() => playChord([659, 831, 988], 0.5), 400); // E major
          break;

        case 'levelUp':
          // Ascending arpeggio
          const levelUpNotes = [262, 330, 392, 523, 659, 784];
          levelUpNotes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.2, 'sine'), i * 100);
          });
          break;

        case 'xp':
          // Quick sparkle sound
          playTone(880, 0.08, 'sine');
          setTimeout(() => playTone(1100, 0.1, 'sine'), 50);
          break;

        case 'error':
          // Buzzer sound
          playTone(200, 0.15, 'sawtooth');
          setTimeout(() => playTone(150, 0.2, 'sawtooth'), 150);
          break;

        case 'success':
          // Positive confirmation
          playTone(523, 0.1, 'sine');
          setTimeout(() => playTone(659, 0.15, 'sine'), 100);
          setTimeout(() => playTone(784, 0.2, 'sine'), 200);
          break;

        case 'spark':
          // Electric spark/crackle
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              playTone(Math.random() * 1000 + 500, 0.02, 'sawtooth');
            }, i * 30);
          }
          break;
      }
    },
    [soundEnabled, playTone, playChord]
  );

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { play, soundEnabled };
}
