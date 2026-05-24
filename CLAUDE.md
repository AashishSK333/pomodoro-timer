# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pomodoro timer web app. Sessions stored locally in SQLite; Notion sync is done on-demand via Claude MCP (no API key required).

- **Frontend**: React + Vite + TypeScript — `frontend/`
- **Backend**: Python FastAPI — `backend/`
- **Storage**: SQLite — `backend/sessions.db`
- **Notion DB**: "Pomodoro Sessions" — data source ID `ecdc8a2d-5f14-4d4d-8020-3bfa72493b24`

## Commands

**Frontend**
```
cd frontend && npm install        # first time
cd frontend && npm run dev        # dev server → http://localhost:5173
```

**Backend**
```
cd backend
source .venv/bin/activate         # activate venv
pip install -r requirements.txt   # first time
uvicorn main:app --reload         # API → http://localhost:8000
```

Both must run simultaneously. Vite proxies `/api/*` → `http://localhost:8000`.

## Environment

No API keys required. Sessions are stored locally in `backend/sessions.db` (SQLite, auto-created on first run).

The `.env` file contains only the Notion database reference used by Claude MCP for sync — the backend itself does not read it.

## Backend API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/sessions` | List all sessions (newest first) |
| POST | `/sessions` | Save a new session |
| GET | `/sessions/unsynced` | Sessions not yet pushed to Notion |
| POST | `/sessions/{id}/mark-synced` | Mark a session as synced after Notion push |

Key files: `backend/db.py` (SQLite logic), `backend/main.py` (FastAPI routes).

## Notion Sync (via Claude MCP)

Ask Claude: **"Sync my unsynced pomodoro sessions to Notion"**

Claude will:
1. `GET /sessions/unsynced` — fetch sessions where `syncedToNotion = false`
2. Use Notion MCP tools to create pages in the "Pomodoro Sessions" database
3. `POST /sessions/{id}/mark-synced` for each one

The **N** badge in the history panel shows sessions already synced.

## Frontend Architecture

- `useTimer` hook lives in `App.tsx` — Timer component is fully presentational
- `setCustomDuration(seconds)` in `useTimer` lets users override the default duration
- Theme (`dark` | `light`) stored in `App.tsx` state; applied via `data-theme` on `<html>`
- Session save flow: pomodoros complete → SessionForm → `POST /api/sessions` → SQLite
- History refreshes via `refreshTrigger` counter prop on `SessionHistory`
- Audio: Web Audio API triple-beep on session end (no external files; needs prior user gesture)

## Code Style

- TypeScript strict mode — no `any`, type all function params and returns
- React: functional components only, hooks for all stateful logic
- Python: type hints everywhere, Pydantic models for all request/response shapes
- Format Python: `ruff format .` from `backend/`
- CSS: design tokens via CSS custom properties in `index.css`; light/dark via `[data-theme]`
