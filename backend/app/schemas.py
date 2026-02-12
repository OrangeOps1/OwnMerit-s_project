from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SubmissionStatus = Literal["pending", "approved", "rejected"]
ActivityType = Literal["assigned", "voluntary"]


class ActivityCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=1000)
    activity_type: ActivityType = "assigned"
    assigned_to_user_id: str | None = None
    recurrence_text: str | None = None


class SubmissionCreate(BaseModel):
    activity_id: str
    user_id: str
    proof_text: str = Field(default="", max_length=3000)
    proof_image_url: str | None = None


class SubmissionReview(BaseModel):
    feedback: str | None = None


class ReminderRequest(BaseModel):
    user_id: str
    activity_title: str
    due_label: str
    last_completion_days_ago: int | None = None


class ReminderResponse(BaseModel):
    message: str
    model_used: str


class RecurrenceParseRequest(BaseModel):
    text: str


class CalendarEventCreate(BaseModel):
    user_id: str
    title: str
    description: str = ""
    start_iso: datetime
    end_iso: datetime


class ProgressResponse(BaseModel):
    user_id: str
    total_submissions: int
    approved_submissions: int
    pending_submissions: int
    rejected_submissions: int
    approval_ratio: float
