"""Question-number fuzzy matching and mapping finalization helpers."""

from __future__ import annotations

import re

from app.models import Answer, MappedResult, Question

_LEADING_Q = re.compile(r"^(?:q(?:uestion)?|ans(?:wer)?|a)\s*", re.IGNORECASE)
_NOISE = re.compile(r"[.\-_:#\[\]{}]")


def normalize_question_number(raw: str | None) -> str:
    """
    Collapse common student/teacher label variants to a comparable token.

    Examples:
        "Q11(a)"  -> "11a"
        "11 a)"   -> "11a"
        "11.a"    -> "11a"
        "11-a"    -> "11a"
        "Q 11 (A)"-> "11a"
    """
    if not raw:
        return ""
    text = raw.strip().lower()
    text = _LEADING_Q.sub("", text)
    text = text.replace("(", "").replace(")", "")
    text = _NOISE.sub("", text)
    text = re.sub(r"\s+", "", text)
    return text


def question_numbers_match(left: str | None, right: str | None) -> bool:
    a = normalize_question_number(left)
    b = normalize_question_number(right)
    return bool(a) and a == b


def merge_continuation_answers(answers: list[Answer]) -> list[Answer]:
    """
    Merge adjacent answer blocks that share the same explicit question label
    (typical when an answer continues onto the next page, or when batched
    vision calls split a multi-page answer).
    """
    if not answers:
        return []

    merged: list[Answer] = []
    for answer in answers:
        key = normalize_question_number(answer.matched_question_number)
        if (
            key
            and merged
            and normalize_question_number(merged[-1].matched_question_number) == key
        ):
            prev = merged[-1]
            combined_text = prev.raw_text.rstrip() + "\n\n" + answer.raw_text.lstrip()
            combined_boxes = list(prev.bboxes) + list(answer.bboxes)
            pages = sorted(set(prev.spans_pages) | set(answer.spans_pages) | {answer.page})
            merged[-1] = prev.model_copy(
                update={
                    "raw_text": combined_text,
                    "bboxes": combined_boxes,
                    "spans_pages": pages,
                }
            )
        else:
            merged.append(answer)
    return merged


def ensure_complete_mapping(
    questions: list[Question],
    answers: list[Answer],
    mapped: list[MappedResult],
) -> tuple[list[MappedResult], list[Answer]]:
    """
    Guarantee one MappedResult per question (printed order) and collect
    answers that were not confidently matched.

    Matching priority already applied by the LLM is preserved. A second
    pass fills unanswered questions when an unused answer has a fuzzy-
    matching explicit number label. Unlabeled leftover answers stay unmatched.
    """
    answers_by_id = {a.id: a for a in answers}
    used_answer_ids: set[str] = set()
    by_question: dict[str, MappedResult] = {}

    for item in mapped:
        question = item.question
        answer = item.answer
        status = item.status
        if answer is not None:
            # Re-bind to the canonical Answer object when ids match.
            answer = answers_by_id.get(answer.id, answer)
            used_answer_ids.add(answer.id)
            status = "answered"
        elif status == "unmatched":
            status = "unanswered"
        else:
            status = "unanswered"
            answer = None
        by_question[question.id] = MappedResult(
            question=question,
            answer=answer,
            status=status,
            grading=item.grading,
        )

    for question in questions:
        if question.id not in by_question:
            by_question[question.id] = MappedResult(
                question=question,
                answer=None,
                status="unanswered",
                grading=None,
            )

    labeled: dict[str, list[Answer]] = {}
    for answer in answers:
        if answer.id in used_answer_ids:
            continue
        key = normalize_question_number(answer.matched_question_number)
        if key:
            labeled.setdefault(key, []).append(answer)

    for question in questions:
        current = by_question[question.id]
        if current.status == "answered":
            continue
        key = normalize_question_number(question.number)
        candidates = [a for a in labeled.get(key, []) if a.id not in used_answer_ids]
        if len(candidates) == 1:
            chosen = candidates[0]
            by_question[question.id] = MappedResult(
                question=question,
                answer=chosen,
                status="answered",
                grading=None,
            )
            used_answer_ids.add(chosen.id)

    ordered = [by_question[q.id] for q in questions]
    unmatched = [a for a in answers if a.id not in used_answer_ids]
    return ordered, unmatched
