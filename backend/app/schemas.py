from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SubmissionStatus = Literal["pending", "approved", "rejected"]
ActivityType = Literal["assigned", "voluntary"]
UserRole = Literal["user", "admin"]


class ActivityCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=1000)
    activity_type: ActivityType = "assigned"
    assigned_to_user_id: str | None = None
    recurrence_text: str | None = None


class ActivityUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    activity_type: ActivityType | None = None
    assigned_to_user_id: str | None = None
    recurrence_text: str | None = None


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = "user"
    group: str = "general"


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    group: str
    created_at: str


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: str
    user: UserPublic


class SubmissionCreate(BaseModel):
    activity_id: str
    user_id: str | None = None
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
