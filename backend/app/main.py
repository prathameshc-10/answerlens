"""AnswerLens FastAPI application."""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import settings
from app.routers import process, results, upload

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(
    title="AnswerLens",
    description="AI-powered assessment grading: extract, map, highlight, and optionally grade handwritten answers.",
    version=__version__,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(process.router)
app.include_router(results.router)


@app.get("/")
def root() -> dict:
    return {
        "name": "AnswerLens",
        "version": __version__,
        "llm_provider": settings.LLM_PROVIDER,
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
