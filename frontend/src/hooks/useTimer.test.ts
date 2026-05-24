import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer, DURATIONS } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in focus mode with correct duration', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.mode).toBe('focus');
    expect(result.current.timeLeft).toBe(DURATIONS.focus);
    expect(result.current.isRunning).toBe(false);
  });

  it('counts down each second when running', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.timeLeft).toBe(DURATIONS.focus - 3);
    expect(result.current.isRunning).toBe(true);
  });

  it('stops counting down after pause', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));
    act(() => result.current.pause());
    const frozen = result.current.timeLeft;
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.timeLeft).toBe(frozen);
    expect(result.current.isRunning).toBe(false);
  });

  it('resets to full duration without running', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10000));
    act(() => result.current.reset());
    expect(result.current.timeLeft).toBe(DURATIONS.focus);
    expect(result.current.isRunning).toBe(false);
  });

  it('increments pomodoroCount and accumulatedWork on focus completion', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(DURATIONS.focus * 1000));
    expect(result.current.pomodoroCount).toBe(1);
    expect(result.current.accumulatedWork).toBe(25);
    expect(result.current.isRunning).toBe(false);
  });

  it('does not increment pomodoroCount on break completion', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.switchMode('shortBreak'));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(DURATIONS.shortBreak * 1000));
    expect(result.current.pomodoroCount).toBe(0);
  });

  it('switches mode and resets time correctly', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.switchMode('longBreak'));
    expect(result.current.mode).toBe('longBreak');
    expect(result.current.timeLeft).toBe(DURATIONS.longBreak);
    expect(result.current.isRunning).toBe(false);
  });

  it('applies a custom duration', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setCustomDuration(300));
    expect(result.current.timeLeft).toBe(300);
    expect(result.current.isRunning).toBe(false);
  });

  it('resets session counters independently of the timer', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(DURATIONS.focus * 1000));
    expect(result.current.pomodoroCount).toBe(1);
    act(() => result.current.resetSession());
    expect(result.current.pomodoroCount).toBe(0);
    expect(result.current.accumulatedWork).toBe(0);
  });

  it('calls onComplete with the finished mode', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(onComplete));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(DURATIONS.focus * 1000));
    expect(onComplete).toHaveBeenCalledWith('focus');
  });

  it('progress decreases from 1 toward 0 as time elapses', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.progress).toBe(1);
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(Math.floor(DURATIONS.focus / 2) * 1000));
    expect(result.current.progress).toBeLessThan(1);
    expect(result.current.progress).toBeGreaterThan(0);
  });
});
