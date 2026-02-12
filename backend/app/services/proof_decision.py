from __future__ import annotations

import os

from app.models.proof import AiSuggestion, DecisionResult, TaskMatch, VisionOutput


DEFAULT_REVIEW_THRESHOLD = 0.75
TASK_MATCH_ADJUSTMENT = {
    TaskMatch.YES: 0.15,
    TaskMatch.PARTIAL: -0.05,
    TaskMatch.NO: -0.25,
}
SAFETY_FLAG_PENALTIES = {
    "low_light": 0.08,
    "blurry": 0.10,
    "unclear_subject": 0.12,
    "occluded": 0.10,
}


def _clamp_score(value: float) -> float:
    return max(0.0, min(1.0, value))


def review_threshold() -> float:
    raw = os.getenv("REVIEW_SCORE_THRESHOLD")
    if raw is None:
        return DEFAULT_REVIEW_THRESHOLD
    try:
        value = float(raw)
    except ValueError:
        return DEFAULT_REVIEW_THRESHOLD
    return _clamp_score(value)


def compute_normalized_score(output: VisionOutput) -> float:
    score = output.confidence
    score += TASK_MATCH_ADJUSTMENT.get(output.task_match, 0.0)

    for flag in output.safety_flags:
        score -= SAFETY_FLAG_PENALTIES.get(flag, 0.05)

    score += min(len(output.visible_evidence) * 0.02, 0.08)
    score -= min(len(output.missing_evidence) * 0.03, 0.15)
    return _clamp_score(score)


def decide_submission(output: VisionOutput) -> DecisionResult:
    score = compute_normalized_score(output)
    suggestion = (
        AiSuggestion.APPROVE if score >= review_threshold() else AiSuggestion.REVIEW
    )
    return DecisionResult(normalized_score=score, ai_suggestion=suggestion)
