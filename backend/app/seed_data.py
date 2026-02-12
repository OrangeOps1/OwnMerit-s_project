from datetime import datetime, timedelta, timezone

from pymongo.database import Database
from app.security import hash_password


def seed_if_needed(db: Database) -> dict:
    """
    Seed starter records only for empty collections.
    Safe to run on every startup.
    """
    now = datetime.now(timezone.utc)
    inserted = {
        "users": 0,
        "activities": 0,
        "submissions": 0,
        "rewards": 0,
        "reminders": 0,
        "sessions": 0,
    }

    # Ensure essential indexes exist for auth/session lookups.
    try:
        db.users.create_index("email", unique=True)
    except Exception:
        pass
    try:
        db.sessions.create_index("token", unique=True)
    except Exception:
        pass

    demo_users = [
        {
            "id": "user_demo_1",
            "name": "Alex Participant",
            "email": "user@ownmerits.org",
            "password_hash": hash_password("Password123!"),
            "role": "user",
            "group": "care_leaver",
            "created_at": now.isoformat(),
        },
        {
            "id": "admin_demo_1",
            "name": "Sam Coordinator",
            "email": "admin@ownmerits.org",
            "password_hash": hash_password("Password123!"),
            "role": "admin",
            "group": "staff",
            "created_at": now.isoformat(),
        },
        {
            "id": "user_demo_voucher",
            "name": "Mia VoucherReady",
            "email": "voucher@ownmerits.org",
            "password_hash": hash_password("Password123!"),
            "role": "user",
            "group": "care_leaver",
            "created_at": now.isoformat(),
        },
    ]

    # Upsert keeps old DBs compatible and guarantees login-capable demo users.
    for demo_user in demo_users:
        existing = db.users.find_one({"id": demo_user["id"]}, {"_id": 0})
        if not existing:
            db.users.insert_one(demo_user)
            inserted["users"] += 1
            continue

        updates = {}
        for key, value in demo_user.items():
            if key not in existing or existing.get(key) in ("", None):
                updates[key] = value
        if updates:
            db.users.update_one({"id": demo_user["id"]}, {"$set": updates})

    if db.activities.count_documents({}) == 0:
        activities = [
            {
                "id": "activity_demo_1",
                "title": "Attend weekly mentoring session",
                "description": "Join your mentoring session and share one key takeaway.",
                "activity_type": "assigned",
                "assigned_to_user_id": "user_demo_1",
                "recurrence_text": "Every Wednesday at 4pm",
                "created_at": now.isoformat(),
            },
            {
                "id": "activity_demo_2",
                "title": "Complete CV update",
                "description": "Review and update your CV with one new skill or achievement.",
                "activity_type": "assigned",
                "assigned_to_user_id": "user_demo_1",
                "recurrence_text": None,
                "created_at": now.isoformat(),
            },
            {
                "id": "activity_demo_3",
                "title": "Voluntary wellbeing walk",
                "description": "Take a 20-minute walk and log how you felt after it.",
                "activity_type": "voluntary",
                "assigned_to_user_id": "user_demo_1",
                "recurrence_text": "Twice a week",
                "created_at": now.isoformat(),
            },
        ]
        db.activities.insert_many(activities)
        inserted["activities"] = len(activities)

    if db.submissions.count_documents({}) == 0:
        submissions = [
            {
                "id": "submission_demo_1",
                "activity_id": "activity_demo_1",
                "user_id": "user_demo_1",
                "proof_text": "Attended mentoring. Learned a new approach to interview prep.",
                "proof_image_url": "https://placehold.co/600x400/png",
                "status": "approved",
                "created_at": (now - timedelta(days=2)).isoformat(),
                "reviewed_at": (now - timedelta(days=1)).isoformat(),
                "review_feedback": "Great progress and clear reflection.",
            },
            {
                "id": "submission_demo_2",
                "activity_id": "activity_demo_2",
                "user_id": "user_demo_1",
                "proof_text": "Updated CV with volunteering experience.",
                "proof_image_url": None,
                "status": "pending",
                "created_at": now.isoformat(),
                "reviewed_at": None,
                "review_feedback": None,
            },
        ]
        db.submissions.insert_many(submissions)
        inserted["submissions"] = len(submissions)

    if db.rewards.count_documents({}) == 0:
        rewards = [
            {
                "reward_id": "reward_demo_1",
                "user_id": "user_demo_1",
                "submission_id": "submission_demo_1",
                "voucher_code": "OM-DEMO2026",
                "status": "assigned",
                "assigned_at": (now - timedelta(days=1)).isoformat(),
            }
        ]
        db.rewards.insert_many(rewards)
        inserted["rewards"] = len(rewards)

    if db.reminders.count_documents({}) == 0:
        reminders = [
            {
                "id": "reminder_demo_1",
                "user_id": "user_demo_1",
                "activity_id": "activity_demo_3",
                "next_run_at": (now + timedelta(days=1)).isoformat(),
                "channel": "in_app",
                "created_at": now.isoformat(),
            }
        ]
        db.reminders.insert_many(reminders)
        inserted["reminders"] = len(reminders)

    # Ensure voucher-ready demo user has enough approved submissions and a voucher.
    voucher_user_id = "user_demo_voucher"
    voucher_activity_ids = []
    for idx in range(1, 11):
        activity_id = f"activity_voucher_{idx}"
        voucher_activity_ids.append(activity_id)
        if not db.activities.find_one({"id": activity_id}, {"_id": 1}):
            db.activities.insert_one(
                {
                    "id": activity_id,
                    "title": f"Voucher Track Activity {idx}",
                    "description": "Completed activity for voucher-track demo user.",
                    "activity_type": "assigned",
                    "assigned_to_user_id": voucher_user_id,
                    "recurrence_text": None,
                    "created_at": (now - timedelta(days=20 - idx)).isoformat(),
                }
            )
            inserted["activities"] += 1

        submission_id = f"submission_voucher_{idx}"
        if not db.submissions.find_one({"id": submission_id}, {"_id": 1}):
            db.submissions.insert_one(
                {
                    "id": submission_id,
                    "activity_id": activity_id,
                    "user_id": voucher_user_id,
                    "proof_text": f"Completed voucher activity {idx}.",
                    "proof_image_url": "https://placehold.co/600x400/png",
                    "status": "approved",
                    "created_at": (now - timedelta(days=12 - idx)).isoformat(),
                    "reviewed_at": (now - timedelta(days=11 - idx)).isoformat(),
                    "review_feedback": "Approved for voucher demo track.",
                }
            )
            inserted["submissions"] += 1

    if not db.rewards.find_one({"user_id": voucher_user_id, "status": "assigned"}, {"_id": 1}):
        db.rewards.insert_one(
            {
                "reward_id": "reward_voucher_demo_1",
                "user_id": voucher_user_id,
                "submission_id": "submission_voucher_10",
                "voucher_code": "OM-VOUCHER-DEMO-100PTS",
                "status": "assigned",
                "assigned_at": now.isoformat(),
                "value": 10,
                "currency": "GBP",
                "retailer": "Tesco",
                "expires_at": (now + timedelta(days=30)).isoformat(),
            }
        )
        inserted["rewards"] += 1

    return inserted
