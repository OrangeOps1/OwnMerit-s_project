from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from app.schemas import SubmissionReview
from app.services.voucher_service import assign_voucher

router = APIRouter(prefix="/admin", tags=["admin"])


@router.patch("/submissions/{submission_id}/approve")
def approve_submission(
    submission_id: str, payload: SubmissionReview, request: Request
) -> dict:
    db = request.app.state.db
    submission = db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    reviewed_at = datetime.now(timezone.utc).isoformat()
    db.submissions.update_one(
        {"id": submission_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": reviewed_at,
                "review_feedback": payload.feedback,
            }
        },
    )

    reward = assign_voucher(
        user_id=submission["user_id"],
        submission_id=submission_id,
    )
    db.rewards.insert_one(reward)

    return {"submission_id": submission_id, "status": "approved", "reward": reward}


@router.patch("/submissions/{submission_id}/reject")
def reject_submission(
    submission_id: str, payload: SubmissionReview, request: Request
) -> dict:
    db = request.app.state.db
    matched = db.submissions.count_documents({"id": submission_id})
    if not matched:
        raise HTTPException(status_code=404, detail="Submission not found")

    reviewed_at = datetime.now(timezone.utc).isoformat()
    db.submissions.update_one(
        {"id": submission_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": reviewed_at,
                "review_feedback": payload.feedback,
            }
        },
    )

    return {"submission_id": submission_id, "status": "rejected"}
