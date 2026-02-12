# Own Merits Project

Incentive-first support platform for Own Merits.  
The system helps users complete life-improving activities, submit proof, track progress, and receive rewards/vouchers.

## Tech Stack

- Frontend: Next.js (React + TypeScript)
- Backend: FastAPI (Python)
- Database: MongoDB (Atlas or local)
- AI: MiniMax service layer (stub-ready)

## Repository Structure

- `backend/` - FastAPI app, routers, auth/session logic, Mongo integration
- `frontend/` - Next.js app (user + admin UI)
- `docs/` - architecture, API contract, team workflow docs

## Prerequisites

- Python 3.11+ (3.14 works in this repo)
- Node.js 18+
- npm
- MongoDB Atlas URI (recommended for hackathon)

## 1) Clone

```bash
git clone <your-repo-url>
cd "Hackaton project"
```

## 2) Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `backend/.env` at minimum:

- `MONGODB_URL=<your mongodb uri>`
- `MONGODB_DB_NAME=ownmerits`

Optional:

- `AUTO_SEED_DATA=true` to seed demo users/data
- `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

Start backend:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URLs:

- API root: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## 3) Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
```

Ensure `frontend/.env` contains:

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

Start frontend:

```bash
npm run dev
```

Frontend URLs:

- App: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin`

## Demo Accounts

- Admin: `admin@ownmerits.org` / `Password123!`
- User: `user@ownmerits.org` / `Password123!`
- Voucher-ready user: `voucher@ownmerits.org` / `Password123!`

## What is implemented

- Auth: register/login/logout/me with bearer sessions
- Role-based access: admin-only endpoints and admin UI
- Activity management: CRUD in admin UI + user activity feed
- Proof submissions: text + image URL flow
- Admin review: approve/reject submissions
- Progress: user progress endpoint and frontend progress view
- Rewards: user voucher/reward retrieval + QR voucher screen

## API Documentation

See:

- `docs/API_CONTRACT.md`
- Swagger at `http://127.0.0.1:8000/docs`

## Team Docs

- `docs/ARCHITECTURE.md`
- `docs/TEAM_COLLABORATION.md`
- `docs/CURSOR_TEAM_PROMPT.md`

## Troubleshooting

- **Mongo timeout on Atlas**
  - Check Atlas Network Access (allow your current IP)
  - Check DB user credentials and URI
  - Some WiFi networks block MongoDB port `27017`; mobile hotspot often fixes this fast

- **Frontend can’t reach backend**
  - Confirm backend is running on port `8000`
  - Confirm `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env`
  - Restart frontend after env changes

- **Old dev server process/port conflicts**
  - Stop running processes and restart both backend + frontend
