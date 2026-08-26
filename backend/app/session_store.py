"""In-memory session and progress store, keyed by session_id."""

from __future__ import annotations

import threading
import uuid
from typing import Any, Literal, Optional

from app.models import Progress, SessionData

_lock = threading.Lock()
_sessions: dict[str, SessionData] = {}
_progress: dict[str, Progress] = {}


def create_session() -> SessionData:
    session_id = str(uuid.uuid4())
    data = SessionData(session_id=session_id, status="created")
    with _lock:
        _sessions[session_id] = data
        _progress[session_id] = Progress(stage="idle", percent=0, status="done")
    return data


def get_session(session_id: str) -> Optional[SessionData]:
    with _lock:
        return _sessions.get(session_id)


def require_session(session_id: str) -> SessionData:
    session = get_session(session_id)
    if session is None:
        raise KeyError(session_id)
    return session


def update_session(session_id: str, **fields: Any) -> SessionData:
    with _lock:
        session = _sessions.get(session_id)
        if session is None:
            raise KeyError(session_id)
        updated = session.model_copy(update=fields)
        _sessions[session_id] = updated
        return updated


def set_progress(
    session_id: str,
    *,
    stage: str,
    percent: int,
    status: Literal["processing", "done", "error"],
    detail: Optional[str] = None,
) -> Progress:
    progress = Progress(stage=stage, percent=percent, status=status, detail=detail)
    with _lock:
        _progress[session_id] = progress
    return progress


def get_progress(session_id: str) -> Optional[Progress]:
    with _lock:
        return _progress.get(session_id)
