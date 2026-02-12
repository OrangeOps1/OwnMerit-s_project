from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import admin_reviews, ai, proofs


def create_app() -> FastAPI:
    app = FastAPI(
        title="Own Merit Proof Checking API",
        version="0.1.0",
        description="Upload proof images and expose admin-ready AI evidence payloads.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    backend_dir = Path(__file__).resolve().parents[1]
    uploads_dir = backend_dir / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    app.include_router(proofs.router)
    app.include_router(admin_reviews.router)
    app.include_router(ai.router)

    @app.get("/health", tags=["system"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
