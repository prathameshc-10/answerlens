"""
Provider factory.

This is the ONLY module that should choose Gemini vs Groq. Routes and
pipeline code must call get_llm_provider() and must not import a provider
class directly.
"""

from __future__ import annotations

from functools import lru_cache

from app.config import settings
from app.llm.base import LLMProvider, LLMProviderError


@lru_cache(maxsize=1)
def get_llm_provider() -> LLMProvider:
    name = (settings.LLM_PROVIDER or "gemini").strip().lower()
    if name == "groq":
        from app.llm.groq_provider import GroqProvider

        return GroqProvider()
    if name == "gemini":
        from app.llm.gemini_provider import GeminiProvider

        return GeminiProvider()
    raise LLMProviderError(f'Unknown LLM_PROVIDER="{name}". Use "gemini" or "groq".')


def reset_llm_provider_cache() -> None:
    get_llm_provider.cache_clear()
