from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Protocol

from app.models.proof import TaskMatch, VisionOutput


class VisionProvider(Protocol):
    def analyze_proof(
        self,
        *,
        image_path: Path,
        task_context: str,
        note: str | None,
    ) -> VisionOutput: ...


def parse_vision_output(raw_json: str) -> VisionOutput:
    try:
        payload = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Vision provider returned invalid JSON") from exc
    return VisionOutput.model_validate(payload)


class MockVisionProvider:
    """Deterministic fallback provider for local/demo environments."""

    LOW_QUALITY_TOKENS = ("blurry", "dark", "lowlight", "unclear")
    MISMATCH_TOKENS = ("wrong", "different", "notask", "irrelevant")

    def analyze_proof(
        self,
        *,
        image_path: Path,
        task_context: str,
        note: str | None,
    ) -> VisionOutput:
        inspect_text = " ".join(
            [image_path.name.lower(), task_context.lower(), (note or "").lower()]
        )

        task_match = TaskMatch.YES
        confidence = 0.83
        missing_evidence: list[str] = []
        safety_flags: list[str] = []

        if any(token in inspect_text for token in self.MISMATCH_TOKENS):
            task_match = TaskMatch.NO
            confidence = 0.28
            missing_evidence.append("Observed scene does not match described task.")
        elif "partial" in inspect_text:
            task_match = TaskMatch.PARTIAL
            confidence = 0.62
            missing_evidence.append("Some expected completion cues are missing.")

        if any(token in inspect_text for token in self.LOW_QUALITY_TOKENS):
            safety_flags.append("unclear_subject")
            safety_flags.append("blurry")
            confidence -= 0.15

        visible_evidence = [
            f"Task context received: {task_context[:120]}",
            "Image was successfully uploaded and analyzed.",
        ]
        if note:
            visible_evidence.append(f"User note considered: {note[:120]}")

        payload = {
            "task_match": task_match.value,
            "confidence": max(0.0, min(1.0, confidence)),
            "visible_evidence": visible_evidence,
            "missing_evidence": missing_evidence,
            "safety_flags": list(dict.fromkeys(safety_flags)),
            "final_recommendation": "pending_manual_review",
        }
        return parse_vision_output(json.dumps(payload))


def get_vision_provider() -> VisionProvider:
    provider_name = os.getenv("VISION_PROVIDER", "mock").strip().lower()
    if provider_name == "mock":
        return MockVisionProvider()
    raise ValueError(
        f"Unsupported VISION_PROVIDER '{provider_name}'. "
        "Set VISION_PROVIDER=mock for local setup."
    )
