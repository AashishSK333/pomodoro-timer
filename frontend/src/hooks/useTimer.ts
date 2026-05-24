import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode } from '../types';

export const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function playCompletionSound() {
  try {
    const ctx = new AudioContext();
    const times = [0, 0.18, 0.36];
    times.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + t + 0.14);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.5);
    });
  } catch {
    // AudioContext not available
  }
}

export function useTimer(onComplete?: (mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [totalForMode, setTotalForMode] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [accumulatedWork, setAccumulatedWork] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef(mode);
  const onCompleteRef = useRef(onComplete);

  modeRef.current = mode;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);

          playCompletionSound();
          const currentMode = modeRef.current;

          if (currentMode === 'focus') {
            setPomodoroCount((c) => c + 1);
            setAccumulatedWork((w) => w + 25);
          }

          if (Notification.permission === 'granted') {
            new Notification(
              currentMode === 'focus' ? '🍅 Focus session complete!' : '☕ Break is over!',
              {
                body: currentMode === 'focus' ? 'Time for a well-earned break.' : 'Back to deep work.',
                silent: true,
              }
            );
          }

          onCompleteRef.current?.(currentMode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalForMode);
  }, [totalForMode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setTotalForMode(DURATIONS[newMode]);
  }, []);

  const setCustomDuration = useCallback((seconds: number) => {
    setIsRunning(false);
    setTimeLeft(seconds);
    setTotalForMode(seconds);
  }, []);

  const resetSession = useCallback(() => {
    setPomodoroCount(0);
    setAccumulatedWork(0);
  }, []);

  const progress = totalForMode > 0 ? timeLeft / totalForMode : 1;

  return {
    mode,
    timeLeft,
    isRunning,
    pomodoroCount,
    accumulatedWork,
    progress,
    start,
    pause,
    reset,
    switchMode,
    setCustomDuration,
    resetSession,
  };
}
