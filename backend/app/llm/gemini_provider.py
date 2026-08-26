"""Gemini vision provider (google-generativeai SDK)."""

from __future__ import annotations

import base64
import json
import logging

import google.generativeai as genai

from app.config import settings
from app.llm.base import LLMProvider, LLMProviderError, parse_llm_json
from app.llm.prompts import (
    render_extract_answers_prompt,
    render_extract_questions_prompt,
    render_grade_answer_prompt,
    render_map_answers_prompt,
)
from app.models import Answer, MappedResult, Question
from app.utils.pdf_to_images import downscale_for_llm

logger = logging.getLogger(__name__)

GEMINI_BATCH_SIZE = 8


class GeminiProvider(LLMProvider):
    def __init__(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise LLMProviderError("GEMINI_API_KEY is not set")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._model_name = settings.GEMINI_MODEL
        self._model = genai.GenerativeModel(
            model_name=self._model_name,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )

    def extract_questions(self, images: list[bytes]) -> list[dict]:
        questions: list[Question] = []
        for start, chunk in _iter_batches(images, GEMINI_BATCH_SIZE):
            page_start = start + 1
            page_end = start + len(chunk)
            prompt = render_extract_questions_prompt(page_start=page_start, page_end=page_end)
            payload = self._generate(prompt, chunk, page_start=page_start)
            batch = self.parse_questions(payload)
            questions.extend(batch)
        questions = _reindex_questions(questions)
        return [q.model_dump() for q in questions]

    def extract_answers(self, images: list[bytes]) -> list[dict]:
        answers: list[Answer] = []
        for start, chunk in _iter_batches(images, GEMINI_BATCH_SIZE):
            page_start = start + 1
            page_end = start + len(chunk)
            prompt = render_extract_answers_prompt(page_start=page_start, page_end=page_end)
            payload = self._generate(prompt, chunk, page_start=page_start)
            batch = self.parse_answers(payload)
            answers.extend(batch)
        answers = _reindex_answers(answers)
        return [a.model_dump() for a in answers]

    def map_answers_to_questions(self, questions: list[dict], answers: list[dict]) -> list[dict]:
        q_models = [Question.model_validate(q) for q in questions]
        a_models = [Answer.model_validate(a) for a in answers]
        prompt = render_map_answers_prompt(
            questions_json=json.dumps([q.model_dump() for q in q_models], indent=2),
            answers_json=json.dumps([a.model_dump() for a in a_models], indent=2),
        )
        payload = self._generate(prompt, images=None)
        mapped: list[MappedResult] = self.parse_mapping(payload, q_models, a_models)
        return [m.model_dump() for m in mapped]

    def grade_answer(self, question: dict, answer: dict) -> dict:
        prompt = render_grade_answer_prompt(
            question_json=json.dumps(question, indent=2),
            answer_json=json.dumps(answer, indent=2),
        )
        payload = self._generate(prompt, images=None)
        return self.parse_grading(payload).model_dump()

    def _generate(
        self,
        prompt: str,
        images: list[bytes] | None,
        *,
        page_start: int = 1,
    ) -> dict:
        parts: list[object] = [prompt]
        if images:
            for offset, image_bytes in enumerate(images):
                page_number = page_start + offset
                parts.append(f"[PAGE {page_number}]")
                parts.append(_inline_image_part(downscale_for_llm(image_bytes)))
        try:
            response = self._model.generate_content(parts)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Gemini generate_content failed")
            raise LLMProviderError(f"Gemini request failed: {exc}") from exc
        text = getattr(response, "text", None) or _response_text(response)
        return parse_llm_json(text)


def _inline_image_part(image_bytes: bytes, mime_type: str = "image/png") -> dict:
    """Send images as inline_data (base64) parts as required by the Gemini path."""
    return {
        "inline_data": {
            "mime_type": mime_type,
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }


def _response_text(response: object) -> str:
    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        texts = [getattr(part, "text", "") for part in parts if getattr(part, "text", "")]
        if texts:
            return "\n".join(texts)
    raise LLMProviderError("Gemini returned no text (possibly blocked by safety filters)")


def _iter_batches(items: list[bytes], size: int):
    for start in range(0, len(items), size):
        yield start, items[start : start + size]


def _reindex_questions(questions: list[Question]) -> list[Question]:
    from app.llm.base import assign_question_ids

    return assign_question_ids(questions, start=1)


def _reindex_answers(answers: list[Answer]) -> list[Answer]:
    from app.llm.base import assign_answer_ids

    return assign_answer_ids(answers, start=1)
