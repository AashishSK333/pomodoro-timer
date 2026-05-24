import React, { useEffect, useState } from 'react';
import { Session, TaskCategory } from '../types';
import { getSessions } from '../api';

const CAT_COLOR: Record<TaskCategory, string> = {
  Work: '#ff6b35',
  Study: '#9575cd',
  Creative: '#f7934c',
  Personal: '#4caf50',
  Other: '#78909c',
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface SessionHistoryProps {
  refreshTrigger: number;
}

export function SessionHistory({ refreshTrigger }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
    getSessions()
      .then((data) => {
        setSessions(data);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [refreshTrigger]);

  const totalPoms = sessions.reduce((s, x) => s + x.pomodorosCompleted, 0);
  const totalMins = sessions.reduce((s, x) => s + x.workDuration, 0);

  return (
    <div className="history">
      <div className="history-head">
        <span className="history-title">Session History</span>
        {status === 'ok' && sessions.length > 0 && (
          <div className="history-stats">
            <span>{sessions.length} sessions</span>
            <span className="stat-sep">·</span>
            <span>{totalPoms} 🍅</span>
            <span className="stat-sep">·</span>
            <span>{totalMins}m</span>
          </div>
        )}
      </div>

      {status === 'loading' && (
        <div className="history-empty">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="history-empty">
          <span className="empty-icon">⚠</span>
          <p>Backend offline.<br />Start the FastAPI server.</p>
        </div>
      )}

      {status === 'ok' && sessions.length === 0 && (
        <div className="history-empty">
          <span className="empty-icon">🍅</span>
          <p>No sessions yet.<br />Complete your first pomodoro!</p>
        </div>
      )}

      {status === 'ok' && sessions.length > 0 && (
        <div className="history-list">
          {sessions.map((s, i) => {
            const color = CAT_COLOR[s.category];
            return (
              <div
                key={s.id ?? i}
                className="history-item"
                style={{ '--item-accent': color } as React.CSSProperties}
              >
                <div className="hi-row">
                  <span className="hi-name">{s.name}</span>
                  <span className="hi-time">{timeAgo(s.date)}</span>
                </div>
                <div className="hi-meta">
                  <span className="hi-cat" style={{ color }}>{s.category}</span>
                  <span className="hi-poms">{'🍅'.repeat(Math.min(s.pomodorosCompleted, 6))}</span>
                  <span className="hi-dur">{s.workDuration}m</span>
                  <span className={`hi-status ${s.status === 'Completed' ? 'done' : 'stopped'}`}>
                    {s.status}
                  </span>
                  {s.syncedToNotion && (
                    <span className="hi-notion" title="Synced to Notion">N</span>
                  )}
                </div>
                {s.notes && <div className="hi-notes">{s.notes}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
