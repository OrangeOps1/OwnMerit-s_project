from fastapi import APIRouter, Depends, Request

from app.schemas import ProgressResponse
from app.security import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/me")
def get_my_progress(
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return _build_progress_for_user(current_user["id"], request)


@router.get("/{user_id}")
def get_user_progress(
    user_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> dict:
    if current_user["role"] != "admin":
        user_id = current_user["id"]
    return _build_progress_for_user(user_id, request)


def _build_progress_for_user(user_id: str, request: Request) -> dict:
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
