"""Pipeline execution and progress polling."""

from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse

from app.config import settings
from app.llm.base import LLMProviderError
from app.llm.factory import get_llm_provider
from app.models import Answer, GradingResult, MappedResult, Question
from app.session_store import get_progress, get_session, set_progress, update_session
from app.utils.matching import ensure_complete_mapping, merge_continuation_answers
from app.utils.pdf_to_images import read_bytes

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/process/{session_id}")
def process_session(session_id: str, background_tasks: BackgroundTasks) -> JSONResponse:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.question_paper_images:
        raise HTTPException(status_code=400, detail="Question paper has not been uploaded")
    if not session.answer_sheet_images:
        raise HTTPException(status_code=400, detail="Answer sheet has not been uploaded")
    if session.status == "processing":
        raise HTTPException(status_code=409, detail="Session is already processing")

    try:
        get_llm_provider()
    except LLMProviderError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    update_session(session_id, status="processing")
    set_progress(session_id, stage="queued", percent=0, status="processing")
    background_tasks.add_task(run_pipeline, session_id)
    return JSONResponse(
        status_code=202,
        content={"session_id": session_id, "status": "processing"},
    )


@router.get("/api/progress/{session_id}")
def api_progress(session_id: str) -> dict:
    if get_session(session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")
    progress = get_progress(session_id)
    if progress is None:
        return {"stage": "idle", "percent": 0, "status": "done"}
    return progress.model_dump()


def run_pipeline(session_id: str) -> None:
    try:
        _run_pipeline(session_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Pipeline failed for session %s", session_id)
        try:
            update_session(session_id, status="error")
        except KeyError:
            pass
        set_progress(
            session_id,
            stage="error",
            percent=_current_percent(session_id),
            status="error",
            detail=str(exc),
        )


def _run_pipeline(session_id: str) -> None:
    session = get_session(session_id)
    if session is None:
        raise RuntimeError("Session disappeared before processing")

    provider = get_llm_provider()

    set_progress(session_id, stage="extract_questions", percent=10, status="processing")
    qp_images = [read_bytes(path) for path in session.question_paper_images]
    questions = [Question.model_validate(item) for item in provider.extract_questions(qp_images)]
    update_session(session_id, questions=questions)

    set_progress(session_id, stage="extract_answers", percent=40, status="processing")
    ans_images = [read_bytes(path) for path in session.answer_sheet_images]
    answers = [Answer.model_validate(item) for item in provider.extract_answers(ans_images)]
    answers = merge_continuation_answers(answers)
    update_session(session_id, answers=answers)

    set_progress(session_id, stage="map_answers", percent=70, status="processing")
    mapped_raw = provider.map_answers_to_questions(
        [q.model_dump() for q in questions],
        [a.model_dump() for a in answers],
    )
    mapped = [MappedResult.model_validate(item) for item in mapped_raw]
    mapped, unmatched = ensure_complete_mapping(questions, answers, mapped)
    update_session(session_id, mapped_results=mapped, unmatched_answers=unmatched)

    if settings.GRADING_ENABLED:
        set_progress(session_id, stage="grading", percent=85, status="processing")
        graded: list[MappedResult] = []
        for item in mapped:
            if item.status == "answered" and item.answer is not None:
                try:
                    grading = GradingResult.model_validate(
                        provider.grade_answer(item.question.model_dump(), item.answer.model_dump())
                    )
                except LLMProviderError:
                    logger.exception("Grading failed for question %s", item.question.id)
                    grading = None
                graded.append(item.model_copy(update={"grading": grading}))
            else:
                graded.append(item)
        mapped = graded

    update_session(
        session_id,
        questions=questions,
        answers=answers,
        mapped_results=mapped,
        unmatched_answers=unmatched,
        status="done",
    )
    set_progress(session_id, stage="done", percent=100, status="done")


def _current_percent(session_id: str) -> int:
    progress = get_progress(session_id)
    return progress.percent if progress else 0
