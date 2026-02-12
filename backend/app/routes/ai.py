from __future__ import annotations

from fastapi import APIRouter

from app.models.ai import (
    RecurrenceParseRequest,
    RecurrenceParseResponse,
    ReminderGenerateRequest,
    ReminderGenerateResponse,
)
from app.services.minimax_text import minimax_text_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/reminders/generate", response_model=ReminderGenerateResponse)
def generate_reminder(payload: ReminderGenerateRequest) -> ReminderGenerateResponse:
    result = minimax_text_service.generate_reminder(
        activity=payload.activity,
        frequency=payload.frequency,
        user_context=payload.user_context,
    )
    return ReminderGenerateResponse(**result)


@router.post("/recurrence/parse", response_model=RecurrenceParseResponse)
def parse_recurrence(payload: RecurrenceParseRequest) -> RecurrenceParseResponse:
    result = minimax_text_service.parse_recurrence(
        natural_language_rule=payload.natural_language_rule
    )
    return RecurrenceParseResponse(**result)
