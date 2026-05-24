import React, { useState } from 'react';
import { TaskCategory } from '../types';

const CATEGORIES: { value: TaskCategory; color: string }[] = [
  { value: 'Work', color: '#ff6b35' },
  { value: 'Study', color: '#9575cd' },
  { value: 'Creative', color: '#f7934c' },
  { value: 'Personal', color: '#4caf50' },
  { value: 'Other', color: '#78909c' },
];

interface SessionFormProps {
  onTaskChange: (name: string, category: TaskCategory) => void;
  onSaveSession: (name: string, category: TaskCategory, notes: string) => Promise<void>;
  pomodoroCount: number;
  isTimerRunning: boolean;
}

export function SessionForm({
  onTaskChange,
  onSaveSession,
  pomodoroCount,
  isTimerRunning,
}: SessionFormProps) {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState<'idle' | 'saved' | 'error'>('idle');

  const catColor = CATEGORIES.find((c) => c.value === category)?.color ?? '#ff6b35';

  const handleSave = async () => {
    if (!taskName.trim()) return;
    setSaving(true);
    try {
      await onSaveSession(taskName.trim(), category, notes);
      setSavedState('saved');
      setTimeout(() => setSavedState('idle'), 2500);
    } catch {
      setSavedState('error');
      setTimeout(() => setSavedState('idle'), 2500);
    } finally {
      setSaving(false);
    }
  };

  const canSave = taskName.trim().length > 0 && !saving && !isTimerRunning;

  return (
    <div className="session-form">
      <div className="sf-label">Current Session</div>

      <input
        type="text"
        className="sf-input"
        placeholder="What are you working on?"
        value={taskName}
        disabled={isTimerRunning}
        onChange={(e) => {
          setTaskName(e.target.value);
          onTaskChange(e.target.value, category);
        }}
      />

      <div className="sf-cats">
        {CATEGORIES.map(({ value, color }) => (
          <button
            key={value}
            className={`sf-cat ${category === value ? 'active' : ''}`}
            style={{ '--cat': color } as React.CSSProperties}
            disabled={isTimerRunning}
            onClick={() => {
              setCategory(value);
              onTaskChange(taskName, value);
            }}
          >
            {value}
          </button>
        ))}
      </div>

      <textarea
        className="sf-notes"
        placeholder="Notes (optional)"
        value={notes}
        rows={2}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        className={`sf-save ${savedState}`}
        disabled={!canSave}
        onClick={handleSave}
        style={{ '--btn-color': catColor } as React.CSSProperties}
      >
        {saving && 'Saving…'}
        {!saving && savedState === 'saved' && '✓ Session saved'}
        {!saving && savedState === 'error' && '✗ Save failed — retry'}
        {!saving && savedState === 'idle' && (
          <>
            {isTimerRunning ? 'Pause timer to save' : 'Save Session'}
            {pomodoroCount > 0 && (
              <span className="sf-badge">{pomodoroCount} 🍅</span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
