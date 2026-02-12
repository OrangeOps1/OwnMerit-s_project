# API Contract (Starter)

Base URL: `http://127.0.0.1:8000`

## Health

- `GET /health`
  - Returns service status

## Auth

- `POST /api/auth/register`
  - Create a new user account
- `POST /api/auth/login`
  - Login with email/password and get bearer token
- `GET /api/auth/me`
  - Get current authenticated user
- `POST /api/auth/logout`
  - Invalidate current session token

## Activities

- `GET /api/activities`
  - List all activities
- `POST /api/activities`
  - Create a new activity (assigned or voluntary template)

## Submissions

- `POST /api/submissions`
  - Create activity proof submission (text + optional image URL)
- `GET /api/submissions`
  - List submissions, filterable by status/user/activity

## Admin

- `GET /api/admin/dashboard`
  - Admin summary metrics (counts)
- `GET /api/admin/submissions`
  - Admin list for all submissions with filters
- `GET /api/admin/rewards`
  - List assigned rewards/vouchers
- `GET /api/admin/users`
  - List registered users
- `POST /api/admin/users`
  - Create user from staff dashboard
- `GET /api/admin/activities`
  - List all activities for management
- `POST /api/admin/activities`
  - Create activity from admin panel
- `PATCH /api/admin/activities/{activity_id}`
  - Update activity fields
- `DELETE /api/admin/activities/{activity_id}`
  - Remove activity
- `PATCH /api/admin/submissions/{submission_id}/approve`
  - Approve submission and trigger reward flow
- `PATCH /api/admin/submissions/{submission_id}/reject`
  - Reject submission with feedback

## AI

- `POST /api/ai/reminders/generate`
  - Generate supportive reminder text
- `POST /api/ai/recurrence/parse`
  - Convert natural language schedule to structured recurrence

## Calendar

- `POST /api/calendar/events`
  - Create calendar event via integration service

## Progress

- `GET /api/progress/me`
  - Return metrics for authenticated user
- `GET /api/progress/{user_id}`
  - Return metrics for charting:
    - completion count
    - streak
    - approval ratio

## Rewards

- `GET /api/rewards/me`
  - Return rewards/vouchers assigned to authenticated user
