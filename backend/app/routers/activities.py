from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Request

from app.schemas import ActivityCreate
from app.security import get_current_user

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("")
def list_activities(
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = request.app.state.db
    filters: dict = {}
    if current_user["role"] != "admin":
        filters = {
            "$or": [
                {"assigned_to_user_id": current_user["id"]},
                {"activity_type": "voluntary"},
            ]
        }
    items = list(db.activities.find(filters, {"_id": 0}).sort("created_at", -1))
    return {"items": items}


@router.post("")
def create_activity(
    payload: ActivityCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = request.app.state.db
    now_iso = datetime.now(timezone.utc).isoformat()
    assigned_user_id = payload.assigned_to_user_id
    if current_user["role"] != "admin":
        assigned_user_id = current_user["id"]
    item = {
        "id": str(uuid4()),
        "title": payload.title,
        "description": payload.description,
        "activity_type": payload.activity_type,
        "assigned_to_user_id": assigned_user_id,
        "recurrence_text": payload.recurrence_text,
        "created_at": now_iso,
    }
    db.activities.insert_one(item)
    item.pop("_id", None)
    return item
