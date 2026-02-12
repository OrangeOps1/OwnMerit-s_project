from datetime import datetime, timezone
from uuid import uuid4


def assign_voucher(user_id: str, submission_id: str) -> dict:
    # Stub service; replace with real eVoucher API integration.
    return {
        "reward_id": str(uuid4()),
        "user_id": user_id,
        "submission_id": submission_id,
        "voucher_code": f"OM-{str(uuid4())[:8].upper()}",
        "status": "assigned",
        "assigned_at": datetime.now(timezone.utc).isoformat(),
    }
