"""
Groq provider — fallback / free-tier alternative when Gemini quota is exhausted.

Vision path: current Groq vision models (default qwen/qwen3.6-27b).
The historical default llama-3.2-90b-vision-preview has been decommissioned.

Fallback path: if the configured model is not vision-capable, or a vision
call fails, run local Tesseract OCR and send the extracted text to a Groq
text model for structuring. Handwriting OCR quality is limited; prefer Gemini
vision when quota is available.
"""

from __future__ import annotations

import base64
import io
import json
import logging
from typing import Any

from groq import Groq
from PIL import Image

from app.config import settings
from app.llm.base import LLMProvider, LLMProviderError, parse_llm_json
from app.llm.prompts import (
    OCR_STRUCTURING_PREFIX,
    render_extract_answers_prompt,
    render_extract_questions_prompt,
    render_grade_answer_prompt,
    render_map_answers_prompt,
)
from app.models import Answer, MappedResult, Question
from app.utils.pdf_to_images import downscale_for_llm

logger = logging.getLogger(__name__)

# qwen/qwen3.6-27b accepts at most 5 images per request (Groq vision docs).
GROQ_VISION_BATCH_SIZE = 5

_VISION_HINTS = (
    "vision",
    "qwen3.6",
    "qwen3.8",
    "llama-4",
    "scout",
    "maverick",
)


class GroqProvider(LLMProvider):
    def __init__(self) -> None:
        if not settings.GROQ_API_KEY:
            raise LLMProviderError("GROQ_API_KEY is not set")
        self._client = Groq(api_key=settings.GROQ_API_KEY)
        self._vision_model = settings.GROQ_MODEL
        self._text_model = settings.GROQ_TEXT_MODEL
        self._use_vision = _looks_like_vision_model(self._vision_model)

    def extract_questions(self, images: list[bytes]) -> list[dict]:
        questions: list[Question] = []
        for start, chunk in _iter_batches(images, GROQ_VISION_BATCH_SIZE):
            page_start = start + 1
            page_end = start + len(chunk)
            prompt = render_extract_questions_prompt(page_start=page_start, page_end=page_end)
            payload = self._generate_with_images(prompt, chunk, page_start=page_start)
            questions.extend(self.parse_questions(payload))
        from app.llm.base import assign_question_ids

        questions = assign_question_ids(questions, start=1)
        return [q.model_dump() for q in questions]

    def extract_answers(self, images: list[bytes]) -> list[dict]:
        answers: list[Answer] = []
        for start, chunk in _iter_batches(images, GROQ_VISION_BATCH_SIZE):
            page_start = start + 1
            page_end = start + len(chunk)
            prompt = render_extract_answers_prompt(page_start=page_start, page_end=page_end)
            payload = self._generate_with_images(prompt, chunk, page_start=page_start)
            answers.extend(self.parse_answers(payload))
        from app.llm.base import assign_answer_ids

        answers = assign_answer_ids(answers, start=1)
        return [a.model_dump() for a in answers]

    def map_answers_to_questions(self, questions: list[dict], answers: list[dict]) -> list[dict]:
        q_models = [Question.model_validate(q) for q in questions]
        a_models = [Answer.model_validate(a) for a in answers]
        prompt = render_map_answers_prompt(
            questions_json=json.dumps([q.model_dump() for q in q_models], indent=2),
            answers_json=json.dumps([a.model_dump() for a in a_models], indent=2),
        )
        payload = self._chat_text(prompt)
        mapped: list[MappedResult] = self.parse_mapping(payload, q_models, a_models)
        return [m.model_dump() for m in mapped]

    def grade_answer(self, question: dict, answer: dict) -> dict:
        prompt = render_grade_answer_prompt(
            question_json=json.dumps(question, indent=2),
            answer_json=json.dumps(answer, indent=2),
        )
        payload = self._chat_text(prompt)
        return self.parse_grading(payload).model_dump()

    def _generate_with_images(self, prompt: str, images: list[bytes], *, page_start: int) -> dict:
        if self._use_vision:
            try:
                return self._chat_vision(prompt, images, page_start=page_start)
            except LLMProviderError as exc:
                logger.warning("Groq vision call failed (%s); falling back to Tesseract OCR", exc)
        return self._chat_ocr_fallback(prompt, images, page_start=page_start)

    def _chat_vision(self, prompt: str, images: list[bytes], *, page_start: int) -> dict:
        content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
        for offset, image_bytes in enumerate(images):
            page_number = page_start + offset
            scaled = downscale_for_llm(image_bytes)
            b64 = base64.b64encode(scaled).decode("utf-8")
            content.append({"type": "text", "text": f"[PAGE {page_number}]"})
            content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{b64}"},
                }
            )
        return self._chat(model=self._vision_model, content=content)

    def _chat_ocr_fallback(self, prompt: str, images: list[bytes], *, page_start: int) -> dict:
        ocr_payload = _ocr_pages(images, page_start=page_start)
        text_prompt = (
            f"{OCR_STRUCTURING_PREFIX}\n\n"
            f"{prompt}\n\n"
            f"OCR_BLOCKS_JSON:\n{json.dumps(ocr_payload, indent=2)}"
        )
        return self._chat_text(text_prompt)

    def _chat_text(self, prompt: str) -> dict:
        # Mapping, grading, and OCR structuring are text-only.
        return self._chat(model=self._text_model, content=prompt)

    def _chat(self, *, model: str, content: Any) -> dict:
        messages = [{"role": "user", "content": content}]
        try:
            completion = self._client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.2,
                response_format={"type": "json_object"},
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Groq chat.completions failed (model=%s)", model)
            raise LLMProviderError(f"Groq request failed: {exc}") from exc
        text = completion.choices[0].message.content or ""
        return parse_llm_json(text)


def _looks_like_vision_model(model: str) -> bool:
    lowered = model.lower()
    return any(hint in lowered for hint in _VISION_HINTS)


def _iter_batches(items: list[bytes], size: int):
    for start in range(0, len(items), size):
        yield start, items[start : start + size]


def _ocr_pages(images: list[bytes], *, page_start: int) -> list[dict[str, Any]]:
    try:
        import pytesseract
    except ImportError as exc:
        raise LLMProviderError(
            "pytesseract is required for the Groq OCR fallback. Install tesseract-ocr."
        ) from exc

    pages: list[dict[str, Any]] = []
    for offset, image_bytes in enumerate(images):
        page_number = page_start + offset
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = image.size
        try:
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        except Exception as exc:  # noqa: BLE001
            raise LLMProviderError(f"Tesseract OCR failed: {exc}") from exc

        blocks: dict[int, dict[str, Any]] = {}
        n = len(data.get("text", []))
        for i in range(n):
            word = (data["text"][i] or "").strip()
            if not word:
                continue
            block_id = int(data["block_num"][i])
            left, top = int(data["left"][i]), int(data["top"][i])
            w, h = int(data["width"][i]), int(data["height"][i])
            bucket = blocks.setdefault(
                block_id,
                {"words": [], "left": left, "top": top, "right": left + w, "bottom": top + h},
            )
            bucket["words"].append(word)
            bucket["left"] = min(bucket["left"], left)
            bucket["top"] = min(bucket["top"], top)
            bucket["right"] = max(bucket["right"], left + w)
            bucket["bottom"] = max(bucket["bottom"], top + h)

        block_list = []
        for block in blocks.values():
            box = {
                "page": page_number,
                "x": block["left"] / width,
                "y": block["top"] / height,
                "width": (block["right"] - block["left"]) / width,
                "height": (block["bottom"] - block["top"]) / height,
            }
            block_list.append({"text": " ".join(block["words"]), "bbox": box})

        full_text = " ".join(b["text"] for b in block_list)
        pages.append({"page": page_number, "full_text": full_text, "blocks": block_list})
    return pages
