import os
import sqlite3
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db

_DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:4173,http://localhost:3000"
ALLOW_ORIGINS = os.environ.get("ALLOW_ORIGINS", _DEFAULT_ORIGINS).split(",")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Pomodoro API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SessionIn(BaseModel):
    name: str
    date: str
    category: str
    pomodorosCompleted: int
    workDuration: int
    breakDuration: int
    status: str
    notes: Optional[str] = None


class SessionOut(SessionIn):
    id: str
    syncedToNotion: bool = False


@app.get("/health")
def health():
    return {"status": "ok", "storage": "sqlite"}


@app.post("/sessions", response_model=SessionOut)
def create_session(body: SessionIn):
    try:
        return db.create_session(body.model_dump())
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/sessions", response_model=list[SessionOut])
def list_sessions():
    try:
        return db.get_sessions()
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/sessions/unsynced", response_model=list[SessionOut])
def list_unsynced():
    """Returns sessions not yet pushed to Notion — used by Claude MCP sync."""
    try:
        return db.get_unsynced_sessions()
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/sessions/{session_id}/mark-synced")
def mark_synced(session_id: int):
    """Called after Claude successfully creates a Notion page for this session."""
    try:
        db.mark_synced(session_id)
        return {"ok": True}
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
