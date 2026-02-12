# Architecture Overview

## Stack

- Frontend: React (team implementation in `frontend/`)
- Backend: FastAPI (`backend/`)
- Database: MongoDB
- AI: MiniMax API (via service abstraction)
- Integrations:
  - Google Calendar (service abstraction)
  - eVoucher API (service abstraction)

## High-level flow

1. Admin creates activities or assigns existing templates.
2. User completes an activity and uploads text/image proof.
3. Submission enters `pending` status.
4. Admin reviews and approves/rejects.
5. On approval, reward flow can issue a voucher.
6. Progress endpoints aggregate completion metrics for charting.
7. AI reminders generate supportive nudges from user activity history.

## Backend layers

- `routers/`: HTTP endpoints grouped by domain
- `schemas.py`: request/response contracts
- `models.py`: Mongo document shape constants/helpers
- `database.py`: Mongo connection and dependency providers
- `services/`: external integrations (MiniMax, voucher, calendar)

## Mongo collections

- `users`
- `activities`
- `submissions`
- `rewards`
- `reminders`

## Design principles

- Incentive-first language and behavior
- Keep external services behind interfaces for easy mocking
- Prefer simple schemas to maximize iteration speed in hackathon conditions
