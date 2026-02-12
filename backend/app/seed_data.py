from datetime import datetime, timedelta, timezone

from pymongo.database import Database


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
    }

    if db.users.count_documents({}) == 0:
        users = [
            {
                "id": "user_demo_1",
                "name": "Alex Participant",
                "role": "user",
                "group": "care_leaver",
                "created_at": now.isoformat(),
            },
            {
                "id": "admin_demo_1",
                "name": "Sam Coordinator",
                "role": "admin",
                "group": "staff",
                "created_at": now.isoformat(),
            },
        ]
        db.users.insert_many(users)
        inserted["users"] = len(users)

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

    return inserted
