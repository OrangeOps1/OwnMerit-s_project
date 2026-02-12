# Cursor Team Prompt (Copy/Paste)

Copy this prompt into Cursor when working on this project.

---

You are helping build the Own Merits hackathon platform.

## Project goal

Build an incentive-first support platform for vulnerable users (learning disabilities, care leavers, prison leavers). The app encourages progress through positive reminders and rewards, not punishment.

## Tech stack

- Frontend: React
- Backend: FastAPI (Python)
- Database: MongoDB
- AI provider: MiniMax

## Current backend structure

- FastAPI app entry: `backend/app/main.py`
- Routers in `backend/app/routers/`
- Schemas in `backend/app/schemas.py`
- Service integrations in `backend/app/services/`
- Startup seed script: `backend/app/seed_data.py`

## Must-have MVP features

1. User can view and complete activities
2. User can submit proof (text + image URL)
3. Admin can approve/reject submissions
4. Reward/voucher assignment flow on approval
5. AI reminder generation endpoint
6. Progress metrics endpoint for charting

## Existing API surface (do not break)

- `GET /health`
- `GET/POST /api/activities`
- `GET/POST /api/submissions`
- `PATCH /api/admin/submissions/{submission_id}/approve`
- `PATCH /api/admin/submissions/{submission_id}/reject`
- `POST /api/ai/reminders/generate`
- `POST /api/ai/recurrence/parse`
- `POST /api/calendar/events`
- `GET /api/progress/{user_id}`

## Collaboration rules

- Work only on the assigned issue scope
- Keep changes small and focused
- Do not hardcode secrets
- Keep language supportive and non-punitive in user-facing text
- Update docs if endpoint behavior changes

## Coding expectations

- Prefer simple, readable code over complex abstractions
- Add validation for request payloads
- Handle missing records with proper status codes
- Keep external integrations behind service files
- Preserve backward compatibility where possible

## Output expectations from you

When making changes:

- Explain what files were changed and why
- Mention any API contract updates
- Provide test steps
- Suggest next small improvement

When proposing copy/text:

- Use inclusive, supportive wording
- Avoid punitive language such as "failed", "penalty", or "non-compliant"

---

Use this context for all tasks unless I explicitly override requirements.
