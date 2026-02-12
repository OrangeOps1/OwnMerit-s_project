from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class TaskMatch(str, Enum):
    YES = "yes"
    PARTIAL = "partial"
    NO = "no"


class SubmissionStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"


class AiSuggestion(str, Enum):
    APPROVE = "ai_suggested_approve"
    REVIEW = "ai_suggested_review"


class VisionOutput(BaseModel):
    task_match: TaskMatch
    confidence: float = Field(ge=0.0, le=1.0)
    visible_evidence: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)
    safety_flags: list[str] = Field(default_factory=list)
    final_recommendation: Literal["pending_manual_review"] = "pending_manual_review"


class DecisionResult(BaseModel):
    normalized_score: float = Field(ge=0.0, le=1.0)
    status: SubmissionStatus = SubmissionStatus.PENDING_APPROVAL
    ai_suggestion: AiSuggestion


class ProofSubmission(BaseModel):
    id: str
    created_at: datetime
    task_context: str
    note: str | None = None
    image_url: str
    status: SubmissionStatus
    ai_suggestion: AiSuggestion
    normalized_score: float = Field(ge=0.0, le=1.0)
    model_output: VisionOutput
