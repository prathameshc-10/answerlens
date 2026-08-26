"""Results JSON and stored page images."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.session_store import get_session

router = APIRouter()


@router.get("/api/results/{session_id}")
def api_results(session_id: str) -> dict:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.model_dump()


@router.get("/api/image/{session_id}/{type}/{page_number}")
def api_image(
    session_id: str,
    page_number: int,
    type: Literal["qp", "ans"],  # noqa: A002 — path param name from the API spec
) -> FileResponse:
    if get_session(session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if page_number < 1:
        raise HTTPException(status_code=400, detail="page_number must be >= 1")

    root = settings.STORAGE_ROOT.resolve()
    path = (root / session_id / type / f"page_{page_number}.png").resolve()
    try:
        path.relative_to(root)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid path") from exc
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path, media_type="image/png")
