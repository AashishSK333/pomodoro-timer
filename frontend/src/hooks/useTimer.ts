import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode } from '../types';

export const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function playCompletionChime() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const beep = (startOffset: number, freq: number, dur = 0.35, peak = 0.18) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + startOffset;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };
    // 5 cycles, 1 second apart → ~5 seconds total. Each cycle is a two-tone chime (A5 + E6).
    for (let i = 0; i < 5; i++) {
      beep(i * 1.0, 880, 0.35);
      beep(i * 1.0 + 0.18, 1318, 0.35);
    }
    setTimeout(() => ctx.close().catch(() => {}), 6000);
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
  const [justCompleted, setJustCompleted] = useState(false);

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

          playCompletionChime();
          const currentMode = modeRef.current;

          setJustCompleted(true);

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

          // Auto-reset after the 5-second chime
          setTimeout(() => {
            setJustCompleted(false);
          }, 5000);

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
    setJustCompleted(false);
    setTimeLeft(totalForMode);
  }, [totalForMode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setJustCompleted(false);
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
    justCompleted,
    start,
    pause,
    reset,
    switchMode,
    setCustomDuration,
    resetSession,
  };
}
