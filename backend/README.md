# FastAPI Proof Checking Backend

## Run locally

1. Create a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Start the API:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

## Core endpoints

- `GET /health`
- `POST /api/proofs/upload` (`multipart/form-data`: `image`, `task_context`, optional `note`)
- `GET /api/admin/reviews`
- `GET /api/admin/reviews/{submission_id}`
