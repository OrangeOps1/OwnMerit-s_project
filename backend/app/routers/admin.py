from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, Request

from app.schemas import ActivityCreate, ActivityUpdate, SubmissionReview
from app.services.voucher_service import assign_voucher

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def admin_dashboard(request: Request) -> dict:
    db = request.app.state.db
    return {
        "activities_count": db.activities.count_documents({}),
        "submissions_pending": db.submissions.count_documents({"status": "pending"}),
        "submissions_approved": db.submissions.count_documents({"status": "approved"}),
        "submissions_rejected": db.submissions.count_documents({"status": "rejected"}),
        "rewards_assigned": db.rewards.count_documents({"status": "assigned"}),
    }


@router.get("/submissions")
def admin_list_submissions(
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


@router.get("/rewards")
def admin_list_rewards(request: Request) -> dict:
    db = request.app.state.db
    items = list(db.rewards.find({}, {"_id": 0}).sort("assigned_at", -1))
    return {"items": items}


@router.get("/activities")
def admin_list_activities(request: Request) -> dict:
    db = request.app.state.db
    items = list(db.activities.find({}, {"_id": 0}).sort("created_at", -1))
    return {"items": items}


@router.post("/activities")
def admin_create_activity(payload: ActivityCreate, request: Request) -> dict:
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


@router.patch("/activities/{activity_id}")
def admin_update_activity(
    activity_id: str, payload: ActivityUpdate, request: Request
) -> dict:
    db = request.app.state.db
    existing = db.activities.find_one({"id": activity_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Activity not found")

    changes = payload.model_dump(exclude_none=True)
    if not changes:
        return existing

    db.activities.update_one({"id": activity_id}, {"$set": changes})
    updated = db.activities.find_one({"id": activity_id}, {"_id": 0})
    return updated


@router.delete("/activities/{activity_id}")
def admin_delete_activity(activity_id: str, request: Request) -> dict:
    db = request.app.state.db
    deleted = db.activities.delete_one({"id": activity_id})
    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"activity_id": activity_id, "deleted": True}


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

    reward = db.rewards.find_one({"submission_id": submission_id}, {"_id": 0})
    if not reward:
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
