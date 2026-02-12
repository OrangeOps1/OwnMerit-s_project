# API Contract (Starter)

Base URL: `http://127.0.0.1:8000`

## Health

- `GET /health`
  - Returns service status

## Activities

- `GET /activities`
  - List all activities
- `POST /activities`
  - Create a new activity (assigned or voluntary template)

## Submissions

- `POST /submissions`
  - Create activity proof submission (text + optional image URL)
- `GET /submissions`
  - List submissions, filterable by status/user/activity

## Admin

- `GET /admin/dashboard`
  - Admin summary metrics (counts)
- `GET /admin/submissions`
  - Admin list for all submissions with filters
- `GET /admin/rewards`
  - List assigned rewards/vouchers
- `GET /admin/activities`
  - List all activities for management
- `POST /admin/activities`
  - Create activity from admin panel
- `PATCH /admin/activities/{activity_id}`
  - Update activity fields
- `DELETE /admin/activities/{activity_id}`
  - Remove activity
- `PATCH /admin/submissions/{submission_id}/approve`
  - Approve submission and trigger reward flow
- `PATCH /admin/submissions/{submission_id}/reject`
  - Reject submission with feedback

## AI

- `POST /ai/reminders/generate`
  - Generate supportive reminder text
- `POST /ai/recurrence/parse`
  - Convert natural language schedule to structured recurrence

## Calendar

- `POST /calendar/events`
  - Create calendar event via integration service

## Progress

- `GET /progress/{user_id}`
  - Return metrics for charting:
    - completion count
    - streak
    - approval ratio
