from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.models.proof import ProofSubmission
from app.services.proof_decision import decide_submission
from app.services.proof_repository import proof_repository
from app.services.vision_provider import get_vision_provider

router = APIRouter(prefix="/api/proofs", tags=["proofs"])


def _backend_dir() -> Path:
    return Path(__file__).resolve().parents[2]


def _sanitize_filename(filename: str) -> str:
    return "".join(ch if (ch.isalnum() or ch in ("-", "_", ".")) else "_" for ch in filename)


@router.post(
    "/upload",
    response_model=ProofSubmission,
    status_code=status.HTTP_201_CREATED,
)
async def upload_proof(
    image: UploadFile = File(...),
    task_context: str = Form(..., min_length=3),
    note: str | None = Form(default=None),
) -> ProofSubmission:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    upload_dir = _backend_dir() / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_filename = _sanitize_filename(image.filename or "proof_image")
    submission_id = str(uuid4())
    stored_name = f"{submission_id}_{safe_filename}"
    stored_path = upload_dir / stored_name
    stored_path.write_bytes(image_bytes)
    image_url = f"/uploads/{stored_name}"

    provider = get_vision_provider()
    model_output = provider.analyze_proof(
        image_path=stored_path,
        task_context=task_context,
        note=note,
    )
    decision = decide_submission(model_output)

    submission = ProofSubmission(
        id=submission_id,
        created_at=datetime.now(timezone.utc),
        task_context=task_context,
        note=note,
        image_url=image_url,
        status=decision.status,
        ai_suggestion=decision.ai_suggestion,
        normalized_score=decision.normalized_score,
        model_output=model_output,
    )
    return proof_repository.add(submission)
