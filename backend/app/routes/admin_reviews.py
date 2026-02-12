from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.proof import AiSuggestion, ProofSubmission, SubmissionStatus
from app.services.proof_repository import proof_repository

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/reviews", response_model=list[ProofSubmission])
def list_reviews(
    status: SubmissionStatus | None = Query(default=None),
    ai_suggestion: AiSuggestion | None = Query(default=None),
    min_score: float | None = Query(default=None, ge=0.0, le=1.0),
) -> list[ProofSubmission]:
    return proof_repository.list(
        status=status,
        ai_suggestion=ai_suggestion,
        min_score=min_score,
    )


@router.get("/reviews/{submission_id}", response_model=ProofSubmission)
def get_review(submission_id: str) -> ProofSubmission:
    submission = proof_repository.get(submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return submission
