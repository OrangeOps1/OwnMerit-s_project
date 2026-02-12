# Backend (FastAPI + MongoDB)

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Swagger

- `http://127.0.0.1:8000/docs`

## Environment

- `MONGODB_URL` and `MONGODB_DB_NAME` are required
- `MINIMAX_API_KEY` enables live AI integration (otherwise fallback response is used)
- `AUTO_SEED_DATA=true` seeds demo data on startup only for empty collections
