from datetime import datetime, timezone
from uuid import uuid4


def create_calendar_event(user_id: str, title: str, start_iso: str, end_iso: str) -> dict:
    # Stub service; replace with Google Calendar integration.
    return {
        "event_id": str(uuid4()),
        "user_id": user_id,
        "title": title,
        "start_iso": start_iso,
        "end_iso": end_iso,
        "provider": "stub",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
