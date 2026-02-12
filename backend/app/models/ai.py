from __future__ import annotations

from pydantic import BaseModel, Field


class ReminderGenerateRequest(BaseModel):
    activity: str = Field(min_length=2, max_length=200)
    user_context: str | None = Field(default=None, max_length=500)
    frequency: str = Field(default="daily", max_length=50)


class ReminderGenerateResponse(BaseModel):
    reminder_title: str
    reminder_message: str
    suggested_time: str
    frequency: str
    provider: str


class RecurrenceParseRequest(BaseModel):
    natural_language_rule: str = Field(min_length=3, max_length=300)


class RecurrenceParseResponse(BaseModel):
    rule_text: str
    rrule: str
    start_hint: str
    provider: str
