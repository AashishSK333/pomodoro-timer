import { useState, useCallback, useEffect } from 'react';
import { Timer } from './components/Timer';
import { SessionForm } from './components/SessionForm';
import { SessionHistory } from './components/SessionHistory';
import { useTimer } from './hooks/useTimer';
import { TaskCategory, TimerMode } from './types';
import { saveSession } from './api';

export default function App() {
  const [taskName, setTaskName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const {
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
  } = useTimer(useCallback((_mode: TimerMode) => {}, []));

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const handleTaskChange = useCallback((name: string, _cat: TaskCategory) => {
    setTaskName(name);
  }, []);

  const handleSaveSession = useCallback(
    async (name: string, category: TaskCategory, notes: string) => {
      const breakDuration =
        pomodoroCount > 1
          ? (pomodoroCount - 1) * 5 + (pomodoroCount >= 4 ? 10 : 0)
          : 0;

      await saveSession({
        name,
        category,
        date: new Date().toISOString(),
        pomodorosCompleted: pomodoroCount,
        workDuration: accumulatedWork,
        breakDuration,
        status: pomodoroCount > 0 ? 'Completed' : 'Interrupted',
        notes,
      });

      resetSession();
      setRefreshTrigger((n) => n + 1);
    },
    [pomodoroCount, accumulatedWork, resetSession]
  );

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-logo">
          <span>🍅</span>
          <span>POMODORO</span>
        </div>
        <div className="header-right">
          <div className="app-badge">
            <span className="badge-dot" />
            <span>Notion sync active</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle light / dark"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="app-body">
        <div className="panel-left">
          <Timer
            mode={mode}
            timeLeft={timeLeft}
            isRunning={isRunning}
            pomodoroCount={pomodoroCount}
            progress={progress}
            taskName={taskName}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSwitchMode={switchMode}
            onSetCustomDuration={setCustomDuration}
          />
          <SessionForm
            onTaskChange={handleTaskChange}
            onSaveSession={handleSaveSession}
            pomodoroCount={pomodoroCount}
            isTimerRunning={isRunning}
          />
        </div>

        <div className="panel-right">
          <SessionHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
