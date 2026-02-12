from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Query, Request

from app.schemas import SubmissionCreate

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("")
def create_submission(payload: SubmissionCreate, request: Request) -> dict:
    db = request.app.state.db
    now_iso = datetime.now(timezone.utc).isoformat()
    item = {
        "id": str(uuid4()),
        "activity_id": payload.activity_id,
        "user_id": payload.user_id,
        "proof_text": payload.proof_text,
        "proof_image_url": payload.proof_image_url,
        "status": "pending",
        "created_at": now_iso,
        "reviewed_at": None,
        "review_feedback": None,
    }
    db.submissions.insert_one(item)
    return item


@router.get("")
def list_submissions(
    request: Request,
    status: str | None = Query(default=None),
    user_id: str | None = Query(default=None),
    activity_id: str | None = Query(default=None),
) -> dict:
    db = request.app.state.db
    filters: dict = {}
    if status:
        filters["status"] = status
    if user_id:
        filters["user_id"] = user_id
    if activity_id:
        filters["activity_id"] = activity_id
    items = list(db.submissions.find(filters, {"_id": 0}).sort("created_at", -1))
    return {"items": items}
