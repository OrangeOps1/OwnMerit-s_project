from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Request

from app.schemas import ActivityCreate

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("")
def list_activities(request: Request) -> dict:
    db = request.app.state.db
    items = list(db.activities.find({}, {"_id": 0}).sort("created_at", -1))
    return {"items": items}


@router.post("")
def create_activity(payload: ActivityCreate, request: Request) -> dict:
    db = request.app.state.db
    now_iso = datetime.now(timezone.utc).isoformat()
    item = {
        "id": str(uuid4()),
        "title": payload.title,
        "description": payload.description,
        "activity_type": payload.activity_type,
        "assigned_to_user_id": payload.assigned_to_user_id,
        "recurrence_text": payload.recurrence_text,
        "created_at": now_iso,
    }
    db.activities.insert_one(item)
    return item
