from __future__ import annotations

import json
import os
from typing import Any


def _extract_first_json_object(raw_text: str) -> dict[str, Any]:
    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Model response did not include a JSON object.")
    return json.loads(raw_text[start : end + 1])


def _heuristic_reminder(activity: str, frequency: str) -> dict[str, str]:
    clean_activity = activity.strip()
    return {
        "reminder_title": f"OwnMerit: {clean_activity}",
        "reminder_message": f"Small step today: complete '{clean_activity}' and upload your proof.",
        "suggested_time": "09:00",
        "frequency": frequency or "daily",
        "provider": "fallback",
    }


def _heuristic_recurrence(rule_text: str) -> dict[str, str]:
    lower = rule_text.lower()
    if "week" in lower:
        freq = "WEEKLY"
    elif "month" in lower:
        freq = "MONTHLY"
    else:
        freq = "DAILY"
    return {
        "rule_text": rule_text,
        "rrule": f"FREQ={freq}",
        "start_hint": "Use the next local occurrence at 09:00.",
        "provider": "fallback",
    }


class MiniMaxTextService:
    def __init__(self) -> None:
        self._api_key = os.getenv("MINIMAX_API_KEY", "").strip()
        self._model = os.getenv("MINIMAX_MODEL", "MiniMax-M2.1").strip() or "MiniMax-M2.1"

    def _client(self):
        if not self._api_key:
            raise ValueError("MINIMAX_API_KEY is not configured.")
        try:
            import anthropic
        except ImportError as exc:
            raise ValueError("anthropic SDK is not installed.") from exc
        return anthropic.Anthropic(api_key=self._api_key)

    def _chat_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        client = self._client()
        message = client.messages.create(
            model=self._model,
            max_tokens=500,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": [{"type": "text", "text": user_prompt}],
                }
            ],
        )

        text_chunks: list[str] = []
        for block in message.content:
            block_type = getattr(block, "type", "")
            if block_type == "text":
                text_chunks.append(getattr(block, "text", ""))
        raw_text = "\n".join(part for part in text_chunks if part).strip()
        if not raw_text:
            raise ValueError("Model returned no text output.")
        return _extract_first_json_object(raw_text)

    def generate_reminder(
        self,
        *,
        activity: str,
        frequency: str,
        user_context: str | None,
    ) -> dict[str, str]:
        system_prompt = (
            "You generate concise reminders for vulnerable users. "
            "Return ONLY valid JSON with keys: reminder_title, reminder_message, "
            "suggested_time, frequency, provider."
        )
        user_prompt = (
            f"Activity: {activity}\n"
            f"Frequency: {frequency}\n"
            f"Context: {user_context or 'N/A'}\n"
            "Constraints:\n"
            "- supportive tone\n"
            "- no punitive language\n"
            "- suggested_time in HH:MM 24h format\n"
            '- provider must be "minimax"\n'
        )

        try:
            result = self._chat_json(system_prompt, user_prompt)
            return {
                "reminder_title": str(result.get("reminder_title", f"OwnMerit: {activity}")),
                "reminder_message": str(
                    result.get(
                        "reminder_message",
                        f"Small step today: complete '{activity}' and upload your proof.",
                    )
                ),
                "suggested_time": str(result.get("suggested_time", "09:00")),
                "frequency": str(result.get("frequency", frequency or "daily")),
                "provider": str(result.get("provider", "minimax")),
            }
        except Exception:
            return _heuristic_reminder(activity, frequency)

    def parse_recurrence(self, *, natural_language_rule: str) -> dict[str, str]:
        system_prompt = (
            "You transform natural language recurrence into lightweight RRULE text. "
            "Return ONLY valid JSON with keys: rule_text, rrule, start_hint, provider."
        )
        user_prompt = (
            f"Rule: {natural_language_rule}\n"
            "Constraints:\n"
            "- Use RRULE format like FREQ=DAILY or FREQ=WEEKLY;BYDAY=MO,WE,FR\n"
            "- start_hint should be a short plain sentence\n"
            '- provider must be "minimax"\n'
        )
        try:
            result = self._chat_json(system_prompt, user_prompt)
            return {
                "rule_text": str(result.get("rule_text", natural_language_rule)),
                "rrule": str(result.get("rrule", "FREQ=DAILY")),
                "start_hint": str(result.get("start_hint", "Use tomorrow at 09:00 as start.")),
                "provider": str(result.get("provider", "minimax")),
            }
        except Exception:
            return _heuristic_recurrence(natural_language_rule)


minimax_text_service = MiniMaxTextService()
