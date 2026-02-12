from fastapi import APIRouter

from app.schemas import CalendarEventCreate
from app.services.calendar_service import create_calendar_event

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.post("/events")
def create_event(payload: CalendarEventCreate) -> dict:
    event = create_calendar_event(
        user_id=payload.user_id,
        title=payload.title,
        start_iso=payload.start_iso.isoformat(),
        end_iso=payload.end_iso.isoformat(),
    )
    return event
