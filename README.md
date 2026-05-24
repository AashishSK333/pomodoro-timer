# Pomodoro Timer

A Mac-compatible Pomodoro timer web app with local session storage and on-demand Notion sync via Claude MCP.

## Features

- **Circular SVG timer** with animated ring — Focus (25m), Short Break (5m), Long Break (15m)
- **Click-to-edit** timer digits to set any custom duration
- **Light / dark theme** toggle
- **Session labeling** — task name, category (Work / Study / Creative / Personal / Other), and notes
- **Session history** — scrollable list with time-ago, category, pomodoro count, and status
- **Local-first storage** — sessions saved to SQLite instantly, no external service required
- **Notion sync via Claude MCP** — push sessions to your Notion workspace on demand, no API key setup
- **Browser notifications** and **Web Audio API** beep on session completion

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Python FastAPI + SQLite |
| Notion sync | Claude MCP (claude.ai Notion integration) |

## Prerequisites

- Node.js 18+
- Python 3.11+

## Setup

**1. Frontend**

```bash
cd frontend
npm install
```

**2. Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running

Open two terminals:

```bash
# Terminal 1 — frontend (http://localhost:5173)
cd frontend && npm run dev

# Terminal 2 — backend (http://localhost:8000)
cd backend && source .venv/bin/activate && uvicorn main:app --reload
```

Then open **http://localhost:5173** in your browser.

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Root — theme state, useTimer hook
│   │   ├── api.ts                   # fetch wrappers for backend
│   │   ├── hooks/useTimer.ts        # timer countdown, audio, notifications
│   │   ├── components/
│   │   │   ├── Timer.tsx            # ring SVG, mode tabs, edit mode
│   │   │   ├── SessionForm.tsx      # task input, categories, save button
│   │   │   └── SessionHistory.tsx   # live session list from backend
│   │   ├── types/index.ts
│   │   └── index.css                # design tokens, light/dark themes
│   └── vite.config.ts               # proxies /api/* → localhost:8000
│
├── backend/
│   ├── main.py                      # FastAPI routes
│   ├── db.py                        # SQLite read/write
│   ├── sessions.db                  # auto-created on first run
│   └── requirements.txt
│
└── .env                             # Notion DB reference (for Claude MCP sync)
```

## How Notion Sync Works

Sessions are stored locally in `backend/sessions.db`. No Notion API key is needed by the app.

To push sessions to Notion, ask Claude (in a Claude Code session with Notion MCP connected):

> "Sync my unsynced pomodoro sessions to Notion"

Claude will:
1. Call `GET /sessions/unsynced` to fetch un-pushed sessions
2. Create pages in the **Pomodoro Sessions** Notion database via MCP
3. Call `POST /sessions/{id}/mark-synced` for each one

Synced sessions show an **N** badge in the history panel.

**Notion database:** `c296be46ce5e49869f1e71af9bc2d5e6`
**Data source ID:** `ecdc8a2d-5f14-4d4d-8020-3bfa72493b24`

## Backend API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/sessions` | All sessions, newest first |
| POST | `/sessions` | Save a session |
| GET | `/sessions/unsynced` | Sessions not yet in Notion |
| POST | `/sessions/{id}/mark-synced` | Mark session as synced |

## Session Schema

```json
{
  "id": "1",
  "name": "Deep work on auth module",
  "date": "2026-05-24T10:00:00Z",
  "category": "Work",
  "pomodorosCompleted": 4,
  "workDuration": 100,
  "breakDuration": 15,
  "status": "Completed",
  "notes": "Finished OAuth flow",
  "syncedToNotion": false
}
```

Categories: `Work` · `Study` · `Creative` · `Personal` · `Other`
