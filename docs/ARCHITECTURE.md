# Architecture Overview

## Stack

- Frontend: React (team implementation in `frontend/`)
- Backend: FastAPI (`backend/`)
- Database: MongoDB
- AI: MiniMax API (via service abstraction)
- Integrations:
  - Google Calendar (service abstraction)
  - eVoucher API (service abstraction)

## Backend architecture (current)

The backend is organized as a modular FastAPI app:

- Entry point: `backend/app/main.py`
- Config and env: `backend/app/config.py`
- DB connection: `backend/app/database.py`
- Validation contracts: `backend/app/schemas.py`
- Security and session auth: `backend/app/security.py`
- Route modules: `backend/app/routers/`
- External integrations and stubs: `backend/app/services/`
- Demo bootstrap data: `backend/app/seed_data.py`

## Auth and authorization

- Authentication uses email/password login.
- Passwords are stored as salted PBKDF2 hashes.
- Login creates a session token stored in MongoDB.
- API auth uses `Authorization: Bearer <token>`.
- Admin routes are protected by role checks.
- User routes are scoped to the authenticated user where needed.

## Core flows

1. User logs in and gets a bearer token.
2. User fetches assigned/voluntary activities.
3. User submits proof (text/image URL) for an activity.
4. Submission becomes `pending` for review.
5. Admin reviews submissions and approves/rejects.
6. Approval assigns voucher/reward records.
7. User reads progress and reward data for chart/QR voucher views.
8. AI reminder endpoints generate supportive task nudges.

## Backend layers

- `routers/auth.py`: register/login/me/logout
- `routers/admin.py`: admin dashboard, users, activities, submission review
- `routers/activities.py`: user/admin activity reads and creation
- `routers/submissions.py`: proof submission and listing
- `routers/progress.py`: user progress metrics (`/me` and admin-compatible read)
- `routers/rewards.py`: authenticated reward lookup (`/rewards/me`)
- `routers/ai.py`: reminder and recurrence parsing
- `routers/calendar.py`: calendar event creation
- `routers/health.py`: health status
- `schemas.py`: request/response contracts
- `database.py`: Mongo connection and dependency providers
- `services/`: external integrations (MiniMax, voucher, calendar)
- `security.py`: password hashing, token sessions, role guards

## Mongo collections

- `users`
- `sessions`
- `activities`
- `submissions`
- `rewards`
- `reminders`

## Seeded demo accounts

- Admin: `admin@ownmerits.org` / `Password123!`
- User: `user@ownmerits.org` / `Password123!`
- Voucher-ready user: `voucher@ownmerits.org` / `Password123!`

## Design principles

- Incentive-first language and behavior
- Keep external services behind interfaces for easy mocking
- Prefer simple schemas to maximize iteration speed in hackathon conditions
- Separate auth, admin, and user concerns for fast team collaboration
