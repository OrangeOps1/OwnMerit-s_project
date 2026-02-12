from __future__ import annotations

from collections.abc import Iterable
from threading import Lock

from app.models.proof import AiSuggestion, ProofSubmission, SubmissionStatus


class ProofRepository:
    def __init__(self) -> None:
        self._items: dict[str, ProofSubmission] = {}
        self._lock = Lock()

    def add(self, submission: ProofSubmission) -> ProofSubmission:
        with self._lock:
            self._items[submission.id] = submission
        return submission

    def get(self, submission_id: str) -> ProofSubmission | None:
        with self._lock:
            return self._items.get(submission_id)

    def list(
        self,
        *,
        status: SubmissionStatus | None = None,
        ai_suggestion: AiSuggestion | None = None,
        min_score: float | None = None,
    ) -> list[ProofSubmission]:
        with self._lock:
            values: Iterable[ProofSubmission] = self._items.values()
            items = list(values)

        if status is not None:
            items = [item for item in items if item.status == status]
        if ai_suggestion is not None:
            items = [item for item in items if item.ai_suggestion == ai_suggestion]
        if min_score is not None:
            items = [item for item in items if item.normalized_score >= min_score]

        return sorted(items, key=lambda item: item.created_at, reverse=True)


proof_repository = ProofRepository()
