from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Query, Request

from app.schemas import SubmissionCreate
from app.security import get_current_user

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("")
def create_submission(
    payload: SubmissionCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = request.app.state.db
    now_iso = datetime.now(timezone.utc).isoformat()
    owner_user_id = payload.user_id or current_user["id"]
    if current_user["role"] != "admin":
        owner_user_id = current_user["id"]
    item = {
        "id": str(uuid4()),
        "activity_id": payload.activity_id,
        "user_id": owner_user_id,
        "proof_text": payload.proof_text,
        "proof_image_url": payload.proof_image_url,
        "status": "pending",
        "created_at": now_iso,
        "reviewed_at": None,
        "review_feedback": None,
    }
    db.submissions.insert_one(item)
    item.pop("_id", None)
    return item


@router.get("")
def list_submissions(
    request: Request,
    status: str | None = Query(default=None),
    user_id: str | None = Query(default=None),
    activity_id: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = request.app.state.db
    filters: dict = {}
    if status:
        filters["status"] = status
    if user_id:
        filters["user_id"] = user_id
    if activity_id:
        filters["activity_id"] = activity_id
    if current_user["role"] != "admin":
        filters["user_id"] = current_user["id"]
    items = list(db.submissions.find(filters, {"_id": 0}).sort("created_at", -1))
    return {"items": items}
