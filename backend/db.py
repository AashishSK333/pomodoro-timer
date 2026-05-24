import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent / "sessions.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT    NOT NULL,
                date         TEXT    NOT NULL,
                category     TEXT    NOT NULL DEFAULT 'Work',
                pomodoros    INTEGER NOT NULL DEFAULT 0,
                work_min     INTEGER NOT NULL DEFAULT 0,
                break_min    INTEGER NOT NULL DEFAULT 0,
                status       TEXT    NOT NULL DEFAULT 'Completed',
                notes        TEXT,
                synced_notion INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.commit()


def create_session(data: dict[str, Any]) -> dict[str, Any]:
    with _connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO sessions
                (name, date, category, pomodoros, work_min, break_min, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["name"],
                data["date"],
                data["category"],
                data["pomodorosCompleted"],
                data["workDuration"],
                data["breakDuration"],
                data["status"],
                data.get("notes"),
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM sessions WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return _row_to_dict(row)


def get_sessions(limit: int = 100) -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions ORDER BY date DESC LIMIT ?", (limit,)
        ).fetchall()
        return [_row_to_dict(r) for r in rows]


def get_unsynced_sessions() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions WHERE synced_notion = 0 ORDER BY date ASC"
        ).fetchall()
        return [_row_to_dict(r) for r in rows]


def mark_synced(session_id: int) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE sessions SET synced_notion = 1 WHERE id = ?", (session_id,)
        )
        conn.commit()


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "date": row["date"],
        "category": row["category"],
        "pomodorosCompleted": row["pomodoros"],
        "workDuration": row["work_min"],
        "breakDuration": row["break_min"],
        "status": row["status"],
        "notes": row["notes"],
        "syncedToNotion": bool(row["synced_notion"]),
    }
