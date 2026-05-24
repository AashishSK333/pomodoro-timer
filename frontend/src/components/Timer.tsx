import React, { useState, useRef } from 'react';
import { TimerMode } from '../types';

const RADIUS = 108;
const CIRC = 2 * Math.PI * RADIUS; // 678.58

const MODE_LABELS: Record<TimerMode, string> = {
  focus:      'FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak:  'LONG BREAK',
};

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface TimerProps {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  pomodoroCount: number;
  progress: number;
  justCompleted: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onSetCustomDuration: (seconds: number) => void;
}

export function Timer({
  mode,
  timeLeft,
  isRunning,
  pomodoroCount,
  progress,
  justCompleted,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
  onSetCustomDuration,
}: TimerProps) {
  const [editMode, setEditMode] = useState(false);
  const [editMin, setEditMin] = useState('25');
  const [editSec, setEditSec] = useState('00');
  const minRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);

  const offset = CIRC * (1 - Math.max(0, Math.min(1, progress)));

  function enterEdit() {
    if (isRunning) return;
    setEditMin(String(Math.floor(timeLeft / 60)).padStart(2, '0'));
    setEditSec(String(timeLeft % 60).padStart(2, '0'));
    setEditMode(true);
    setTimeout(() => { minRef.current?.focus(); minRef.current?.select(); }, 0);
  }

  function confirmEdit() {
    const m = Math.min(99, Math.max(0, parseInt(editMin) || 0));
    const s = Math.min(59, Math.max(0, parseInt(editSec) || 0));
    onSetCustomDuration(m * 60 + s);
    setEditMode(false);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  function handleEditKey(e: React.KeyboardEvent, field: 'min' | 'sec') {
    if (e.key === 'Enter')  confirmEdit();
    if (e.key === 'Escape') cancelEdit();
    if (e.key === 'Tab' && field === 'min') {
      e.preventDefault();
      secRef.current?.focus();
      secRef.current?.select();
    }
  }

  function clamp(val: string, max: number): string {
    const n = parseInt(val);
    if (isNaN(n)) return val;
    return String(Math.min(max, Math.max(0, n)));
  }

  return (
    <div className="timer-container">
      {/* Mode tabs */}
      <div className="mode-tabs">
        {(Object.keys(MODE_LABELS) as TimerMode[]).map((m) => (
          <button
            key={m}
            className={`mode-tab ${mode === m ? 'active' : ''}`}
            onClick={() => { cancelEdit(); onSwitchMode(m); }}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="ring-wrapper">
        <svg className="timer-svg" viewBox="0 0 240 240">
          <circle className="ring-track"    cx="120" cy="120" r={RADIUS} />
          <circle
            className={`ring-progress ${justCompleted ? 'complete-flash' : ''}`}
            cx="120" cy="120" r={RADIUS}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="ring-inner">
          {/* Normal display — click to edit */}
          {!editMode && (
            <div
              className="timer-normal"
              onClick={enterEdit}
              title="Click to set custom time"
            >
              <div className="ring-time">{fmt(timeLeft)}</div>
              {pomodoroCount > 0 && (
                <div className="ring-dots">
                  {Array.from({ length: Math.min(pomodoroCount, 8) }).map((_, i) => (
                    <span key={i} className="ring-dot" />
                  ))}
                </div>
              )}
              <div className="timer-hint">CLICK TO EDIT</div>
            </div>
          )}

          {/* Edit mode */}
          {editMode && (
            <div className="timer-edit visible">
              <div className="timer-inputs">
                <input
                  ref={minRef}
                  className="time-input"
                  type="number"
                  min={0} max={99}
                  value={editMin}
                  onChange={(e) => setEditMin(clamp(e.target.value, 99))}
                  onKeyDown={(e) => handleEditKey(e, 'min')}
                />
                <span className="time-colon">:</span>
                <input
                  ref={secRef}
                  className="time-input"
                  type="number"
                  min={0} max={59}
                  value={editSec}
                  onChange={(e) => setEditSec(clamp(e.target.value, 59))}
                  onKeyDown={(e) => handleEditKey(e, 'sec')}
                />
              </div>
              <div className="edit-actions">
                <button className="btn-set" onClick={confirmEdit}>SET</button>
                <button className="btn-cancel-edit" onClick={cancelEdit}>CANCEL</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="btn-reset" onClick={onReset} aria-label="Reset">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        <button
          className="btn-primary"
          onClick={isRunning ? onPause : onStart}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="4" width="4" height="16" rx="1" />
              <rect x="15" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        <div className="session-counter">
          <span className="session-num">{pomodoroCount}</span>
          <span className="session-lbl">DONE</span>
        </div>
      </div>
    </div>
  );
}
