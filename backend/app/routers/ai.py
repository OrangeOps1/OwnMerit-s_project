from fastapi import APIRouter

from app.schemas import RecurrenceParseRequest, ReminderRequest
from app.services.minimax_service import generate_reminder, parse_recurrence_text

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/reminders/generate")
def create_reminder(payload: ReminderRequest) -> dict:
    response = generate_reminder(payload)
    return response.model_dump()


@router.post("/recurrence/parse")
def parse_recurrence(payload: RecurrenceParseRequest) -> dict:
    return parse_recurrence_text(payload.text)
