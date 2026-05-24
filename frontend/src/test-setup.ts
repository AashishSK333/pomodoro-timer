import { vi } from 'vitest';

Object.defineProperty(global, 'Notification', {
  value: {
    permission: 'denied' as NotificationPermission,
    requestPermission: vi.fn().mockResolvedValue('denied'),
  },
  configurable: true,
  writable: true,
});

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      connect: vi.fn(),
      type: 'sine' as OscillatorType,
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    };
  }
}
Object.defineProperty(global, 'AudioContext', { value: MockAudioContext, writable: true });
