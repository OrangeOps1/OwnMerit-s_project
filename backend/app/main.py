from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_client, get_db
from app.routers.activities import router as activities_router
from app.routers.admin import router as admin_router
from app.routers.ai import router as ai_router
from app.routers.calendar import router as calendar_router
from app.routers.health import router as health_router
from app.routers.progress import router as progress_router
from app.routers.submissions import router as submissions_router
from app.seed_data import seed_if_needed


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = create_client()
    app.state.client = client
    app.state.db = get_db(client)
    if settings.auto_seed_data:
        seed_if_needed(app.state.db)
    yield
    client.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(activities_router, prefix=settings.api_prefix)
app.include_router(submissions_router, prefix=settings.api_prefix)
app.include_router(admin_router, prefix=settings.api_prefix)
app.include_router(ai_router, prefix=settings.api_prefix)
app.include_router(progress_router, prefix=settings.api_prefix)
app.include_router(calendar_router, prefix=settings.api_prefix)
