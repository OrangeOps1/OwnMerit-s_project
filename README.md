# Own Merits Hackathon Project

Hackathon starter monorepo for an incentives-first support platform for Own Merits.

## What this repo contains

- `backend/` - FastAPI service with MongoDB integration and starter endpoints
- `frontend/` - React app placeholder and setup notes
- `docs/` - architecture and API contract docs for team alignment

## Quick start

### 1) Clone the repo

```bash
git clone <your-repo-url>
cd "<repo-folder>"
```

### 2) Configure MongoDB

Use either:

- Local MongoDB service running on your machine, or
- MongoDB Atlas connection string

Then set `MONGODB_URL` in `backend/.env`.

### 3) Start backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API will be available at:

- `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

### 4) Start frontend

Frontend is currently a scaffold placeholder.
If you already have your React app, place it under `frontend/` and follow `frontend/README.md`.

## Hackathon MVP scope

1. User completes assigned/voluntary activity with text + image proof
2. Admin approves submission
3. Voucher assignment trigger (stub service ready)
4. Progress tracking endpoint + UI chart
5. AI reminder endpoint via MiniMax (client stub ready)

## Team split suggestion

- Dev A: backend data models + activity/submission endpoints
- Dev B: admin approval + voucher integration
- Dev C: frontend dashboards + upload + chart
- Dev D: AI reminder + recurrence endpoint + polish

## Environment files

- Backend env template: `backend/.env.example`
- Frontend env template: `frontend/.env.example`

## Team docs

- Collaboration workflow: `docs/TEAM_COLLABORATION.md`
- Cursor shared prompt: `docs/CURSOR_TEAM_PROMPT.md`

## Notes

- This scaffold is intentionally minimal and hackathon-friendly.
- External integrations (MiniMax, Google Calendar, eVoucher) are prepared as service layers so they can be replaced or mocked quickly.
