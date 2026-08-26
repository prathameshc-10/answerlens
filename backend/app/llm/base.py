"""Abstract LLM provider and shared JSON parsing helpers."""

from __future__ import annotations

import json
import re
from abc import ABC, abstractmethod
from typing import Any

from app.models import (
    Answer,
    AnswerExtractionResult,
    GradingResult,
    MappedResult,
    MappingExtractionResult,
    Question,
    QuestionExtractionResult,
)

_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)
_THINK = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


class LLMProviderError(RuntimeError):
    pass


def parse_llm_json(text: str) -> dict[str, Any]:
    """Parse a model response into a JSON object, stripping fences / think tags."""
    if not text or not text.strip():
        raise LLMProviderError("Empty LLM response")

    cleaned = _THINK.sub("", text).strip()
    cleaned = _FENCE.sub("", cleaned).strip()

    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise LLMProviderError("LLM response was not valid JSON") from None
        try:
            payload = json.loads(cleaned[start : end + 1])
        except json.JSONDecodeError as exc:
            raise LLMProviderError(f"LLM response was not valid JSON: {exc}") from exc

    if not isinstance(payload, dict):
        raise LLMProviderError("LLM JSON root must be an object")
    return payload


def assign_question_ids(questions: list[Question], start: int = 1) -> list[Question]:
    out: list[Question] = []
    for index, question in enumerate(questions, start=start):
        qid = question.id.strip() if question.id else ""
        if not qid or qid.lower() in {"null", "none"}:
            qid = f"q_{index}"
        out.append(question.model_copy(update={"id": qid, "page": question.bbox.page or question.page}))
    return out


def assign_answer_ids(answers: list[Answer], start: int = 1) -> list[Answer]:
    out: list[Answer] = []
    for index, answer in enumerate(answers, start=start):
        aid = answer.id.strip() if answer.id else ""
        if not aid or aid.lower() in {"null", "none"}:
            aid = f"a_{index}"
        pages = sorted(set(answer.spans_pages) | {b.page for b in answer.bboxes} | {answer.page})
        out.append(answer.model_copy(update={"id": aid, "spans_pages": pages, "page": pages[0] if pages else answer.page}))
    return out


class LLMProvider(ABC):
    """
    Swap Gemini / Groq here only via the factory.

    Return values are plain dicts, but each dict MUST validate against the
    Pydantic models in app.models so both providers share one schema:
      extract_questions -> list[Question]
      extract_answers   -> list[Answer]
      map_answers_to_questions -> list[MappedResult]
      grade_answer -> GradingResult
    """

    @abstractmethod
    def extract_questions(self, images: list[bytes]) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def extract_answers(self, images: list[bytes]) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def map_answers_to_questions(self, questions: list[dict], answers: list[dict]) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def grade_answer(self, question: dict, answer: dict) -> dict:
        raise NotImplementedError

    @staticmethod
    def parse_questions(payload: dict[str, Any]) -> list[Question]:
        result = QuestionExtractionResult.model_validate(payload)
        return assign_question_ids(result.questions)

    @staticmethod
    def parse_answers(payload: dict[str, Any]) -> list[Answer]:
        result = AnswerExtractionResult.model_validate(payload)
        return assign_answer_ids(result.answers)

    @staticmethod
    def parse_mapping(
        payload: dict[str, Any],
        questions: list[Question],
        answers: list[Answer],
    ) -> list[MappedResult]:
        parsed = MappingExtractionResult.model_validate(payload)
        questions_by_id = {q.id: q for q in questions}
        answers_by_id = {a.id: a for a in answers}
        unmatched = set(parsed.unmatched_answer_ids)
        mapped: list[MappedResult] = []
        seen_questions: set[str] = set()

        for match in parsed.matches:
            question = questions_by_id.get(match.question_id)
            if question is None:
                continue
            seen_questions.add(question.id)
            answer = answers_by_id.get(match.answer_id) if match.answer_id else None
            if answer and answer.id in unmatched:
                answer = None
            status = match.status
            if answer is None:
                status = "unanswered"
            else:
                status = "answered"
            mapped.append(
                MappedResult(question=question, answer=answer, status=status, grading=None)
            )

        for question in questions:
            if question.id not in seen_questions:
                mapped.append(
                    MappedResult(question=question, answer=None, status="unanswered", grading=None)
                )
        return mapped

    @staticmethod
    def parse_grading(payload: dict[str, Any]) -> GradingResult:
        return GradingResult.model_validate(payload)
