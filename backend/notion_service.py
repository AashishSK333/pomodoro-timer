from datetime import datetime, timezone
from typing import Any

from notion_client import Client


class NotionService:
    def __init__(self, api_key: str, database_id: str):
        self.client = Client(auth=api_key)
        self.database_id = database_id

    def create_session(self, data: dict[str, Any]) -> dict[str, Any]:
        raw_date = data["date"]
        if raw_date.endswith("Z"):
            raw_date = raw_date[:-1] + "+00:00"
        dt = datetime.fromisoformat(raw_date)
        notion_date = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000+00:00")

        props: dict[str, Any] = {
            "Session": {"title": [{"text": {"content": data["name"]}}]},
            "Date": {"date": {"start": notion_date}},
            "Task Category": {"select": {"name": data["category"]}},
            "Pomodoros Completed": {"number": data["pomodorosCompleted"]},
            "Work Duration (min)": {"number": data["workDuration"]},
            "Break Duration (min)": {"number": data["breakDuration"]},
            "Status": {"select": {"name": data["status"]}},
        }

        if data.get("notes"):
            props["Notes"] = {
                "rich_text": [{"text": {"content": data["notes"][:2000]}}]
            }

        page = self.client.pages.create(
            parent={"database_id": self.database_id},
            properties=props,
        )
        return self._page_to_dict(page)

    def get_sessions(self, limit: int = 50) -> list[dict[str, Any]]:
        response = self.client.databases.query(
            database_id=self.database_id,
            sorts=[{"property": "Date", "direction": "descending"}],
            page_size=limit,
        )
        return [self._page_to_dict(p) for p in response["results"]]

    def _page_to_dict(self, page: dict[str, Any]) -> dict[str, Any]:
        props = page["properties"]

        def title(p: dict) -> str:
            items = p.get("title", [])
            return items[0]["plain_text"] if items else ""

        def select(p: dict) -> str:
            sel = p.get("select")
            return sel["name"] if sel else ""

        def number(p: dict) -> int:
            return int(p.get("number") or 0)

        def date_start(p: dict) -> str:
            d = p.get("date")
            return d["start"] if d else datetime.utcnow().isoformat()

        def rich_text(p: dict) -> str | None:
            items = p.get("rich_text", [])
            return items[0]["plain_text"] if items else None

        return {
            "id": page["id"],
            "name": title(props.get("Session", {})),
            "date": date_start(props.get("Date", {})),
            "category": select(props.get("Task Category", {})) or "Work",
            "pomodorosCompleted": number(props.get("Pomodoros Completed", {})),
            "workDuration": number(props.get("Work Duration (min)", {})),
            "breakDuration": number(props.get("Break Duration (min)", {})),
            "status": select(props.get("Status", {})) or "Completed",
            "notes": rich_text(props.get("Notes", {})),
        }
