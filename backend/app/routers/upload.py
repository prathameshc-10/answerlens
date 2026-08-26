"""Session creation and document upload."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import settings
from app.session_store import create_session, get_session, update_session
from app.utils.pdf_to_images import (
    ConversionError,
    clear_dir,
    convert_upload_to_pages,
    session_dir,
)

router = APIRouter()

ALLOWED_CONTENT = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/tiff",
    "image/bmp",
    "application/octet-stream",
    "",
}


@router.post("/api/session/create")
def api_create_session() -> dict:
    session = create_session()
    return {"session_id": session.session_id, "status": session.status}


@router.post("/api/upload/question-paper")
async def upload_question_paper(
    session_id: str = Form(...),
    files: list[UploadFile] = File(default=[]),
    file: UploadFile | None = File(default=None),
) -> dict:
    return await _upload(session_id, files=files, file=file, kind="qp")


@router.post("/api/upload/answer-sheet")
async def upload_answer_sheet(
    session_id: str = Form(...),
    files: list[UploadFile] = File(default=[]),
    file: UploadFile | None = File(default=None),
) -> dict:
    return await _upload(session_id, files=files, file=file, kind="ans")


async def _upload(
    session_id: str,
    *,
    files: list[UploadFile],
    file: UploadFile | None,
    kind: str,
) -> dict:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    uploads = [item for item in files if item is not None and item.filename]
    if file is not None and file.filename:
        uploads.append(file)
    if not uploads:
        raise HTTPException(status_code=400, detail="At least one file is required (field: files or file)")

    dest = session_dir(session_id, kind)
    clear_dir(dest)

    saved: list[Path] = []
    page_index = 1
    for upload in uploads:
        content_type = (upload.content_type or "").split(";")[0].strip().lower()
        if content_type not in ALLOWED_CONTENT:
            raise HTTPException(status_code=415, detail=f"Unsupported content type: {upload.content_type}")
        data = await upload.read()
        if not data:
            raise HTTPException(status_code=400, detail=f"Empty file: {upload.filename}")
        if len(data) > settings.max_upload_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds MAX_UPLOAD_MB ({settings.MAX_UPLOAD_MB} MB): {upload.filename}",
            )
        try:
            pages = convert_upload_to_pages(data, upload.filename or "upload", dest, page_index)
        except ConversionError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        saved.extend(pages)
        page_index += len(pages)

    paths = [str(path.resolve()) for path in saved]
    if kind == "qp":
        new_status = "ready" if session.answer_sheet_images else "qp_uploaded"
        session = update_session(
            session_id,
            question_paper_images=paths,
            status=new_status,
        )
    else:
        new_status = "ready" if session.question_paper_images else "ans_uploaded"
        session = update_session(
            session_id,
            answer_sheet_images=paths,
            status=new_status,
        )

    return {
        "session_id": session_id,
        "type": kind,
        "pages": len(paths),
        "image_paths": paths,
        "status": session.status,
    }
