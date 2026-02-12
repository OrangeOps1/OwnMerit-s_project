from app.config import settings
from app.schemas import ReminderRequest, ReminderResponse


def generate_reminder(payload: ReminderRequest) -> ReminderResponse:
    # Hackathon-safe fallback. Replace with real MiniMax API call.
    if not settings.minimax_api_key:
        friendly = (
            f"Quick nudge: {payload.activity_title} is coming up ({payload.due_label}). "
            "You are building great momentum one step at a time."
        )
        return ReminderResponse(message=friendly, model_used="fallback-template")

    friendly = (
        f"Hi! Your next step is {payload.activity_title} ({payload.due_label}). "
        "Small progress counts and we are cheering you on."
    )
    return ReminderResponse(message=friendly, model_used=settings.minimax_model)


def parse_recurrence_text(text: str) -> dict:
    # Minimal parser placeholder to keep API contract ready.
    lowered = text.lower()
    return {
        "raw_text": text,
        "frequency": "weekly" if "week" in lowered else "custom",
        "notes": "Replace with MiniMax structured extraction in next iteration.",
    }
