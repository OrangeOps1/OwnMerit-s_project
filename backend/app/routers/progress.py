from fastapi import APIRouter, Request

from app.schemas import ProgressResponse

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/{user_id}")
def get_user_progress(user_id: str, request: Request) -> dict:
    db = request.app.state.db
    total = db.submissions.count_documents({"user_id": user_id})
    approved = db.submissions.count_documents({"user_id": user_id, "status": "approved"})
    pending = db.submissions.count_documents({"user_id": user_id, "status": "pending"})
    rejected = db.submissions.count_documents({"user_id": user_id, "status": "rejected"})

    ratio = 0.0
    if total > 0:
        ratio = round(approved / total, 3)

    response = ProgressResponse(
        user_id=user_id,
        total_submissions=total,
        approved_submissions=approved,
        pending_submissions=pending,
        rejected_submissions=rejected,
        approval_ratio=ratio,
    )
    return response.model_dump()
