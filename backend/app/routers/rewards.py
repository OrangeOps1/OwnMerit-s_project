from fastapi import APIRouter, Depends, Request

from app.security import get_current_user

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("/me")
def list_my_rewards(
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = request.app.state.db
    items = list(
        db.rewards.find({"user_id": current_user["id"]}, {"_id": 0}).sort("assigned_at", -1)
    )
    return {"items": items}
