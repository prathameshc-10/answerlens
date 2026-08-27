"""Environment configuration loaded via python-dotenv."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _int(value: str | None, default: int) -> int:
    if value is None or value.strip() == "":
        return default
    return int(value)


class Settings:
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini").strip().lower()

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    # llama-3.2-90b-vision-preview has been decommissioned on Groq.
    # Default to the current Groq vision model (see https://console.groq.com/docs/vision).
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
    GROQ_TEXT_MODEL: str = os.getenv("GROQ_TEXT_MODEL", "openai/gpt-oss-20b")

    GRADING_ENABLED: bool = _bool(os.getenv("GRADING_ENABLED"), default=True)
    MAX_UPLOAD_MB: int = _int(os.getenv("MAX_UPLOAD_MB"), 20)
    PORT: int = _int(os.getenv("PORT"), 8000)
    PDF_DPI: int = _int(os.getenv("PDF_DPI"), 175)

    STORAGE_ROOT: Path = Path(os.getenv("STORAGE_ROOT") or tempfile.gettempdir()).resolve()

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024


settings = Settings()
