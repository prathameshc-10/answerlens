"""Pydantic data models shared by the API and both LLM providers."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class BoundingBox(BaseModel):
    """Axis-aligned box in normalized page coordinates (0-1), origin at top-left."""

    model_config = ConfigDict(extra="ignore")

    page: int = Field(..., ge=1, description="1-indexed page number")
    x: float = Field(..., description="Left edge, 0-1")
    y: float = Field(..., description="Top edge, 0-1")
    width: float = Field(..., description="Width, 0-1")
    height: float = Field(..., description="Height, 0-1")

    @field_validator("page", mode="before")
    @classmethod
    def _page_at_least_one(cls, value: object) -> int:
        try:
            number = int(value)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            return 1
        return max(1, number)

    @field_validator("x", "y", "width", "height", mode="before")
    @classmethod
    def _coerce_unit_interval(cls, value: object) -> float:
        number = float(value)
        # Models sometimes return percentages (0-100) instead of 0-1.
        if 1.0 < number <= 100.0:
            number = number / 100.0
        return number

    @model_validator(mode="after")
    def _clamp(self) -> BoundingBox:
        self.x = min(max(self.x, 0.0), 1.0)
        self.y = min(max(self.y, 0.0), 1.0)
        self.width = min(max(self.width, 0.0), 1.0)
        self.height = min(max(self.height, 0.0), 1.0)
        if self.x + self.width > 1.0:
            self.width = max(0.0, 1.0 - self.x)
        if self.y + self.height > 1.0:
            self.height = max(0.0, 1.0 - self.y)
        return self


class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    number: str = Field(..., description='Printed label, e.g. "11(a)"')
    text: str
    bbox: BoundingBox
    page: int = Field(..., ge=1)
    max_marks: Optional[float] = None


class Answer(BaseModel):
    """A student answer block. `bboxes` supports answers that continue across pages."""

    model_config = ConfigDict(extra="ignore")

    id: str
    matched_question_number: Optional[str] = Field(
        default=None,
        description="Question label the student wrote, if any (e.g. 'Q11(a)')",
    )
    raw_text: str
    bboxes: list[BoundingBox] = Field(
        default_factory=list,
        description="One box per page region this answer occupies",
    )
    page: int = Field(..., ge=1, description="First page this answer appears on")
    spans_pages: list[int] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def _coerce_legacy_bbox(cls, data: object) -> object:
        """Accept a single `bbox` from older prompts and wrap it as `bboxes`."""
        if isinstance(data, dict) and "bboxes" not in data and "bbox" in data:
            bbox = data.get("bbox")
            data = {**data, "bboxes": [bbox] if bbox is not None else []}
        return data

    @model_validator(mode="after")
    def _fill_spans(self) -> Answer:
        pages = sorted({b.page for b in self.bboxes} | {self.page} | set(self.spans_pages))
        self.spans_pages = pages
        if not self.page and pages:
            self.page = pages[0]
        return self


class GradingResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    score: float
    max_score: float
    verdict: Literal["correct", "partially_correct", "incorrect"]
    feedback: str


class MappedResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    question: Question
    answer: Optional[Answer] = None
    status: Literal["answered", "unanswered", "unmatched"]
    grading: Optional[GradingResult] = None


class SessionData(BaseModel):
    model_config = ConfigDict(extra="ignore")

    session_id: str
    question_paper_images: list[str] = Field(default_factory=list)
    answer_sheet_images: list[str] = Field(default_factory=list)
    questions: list[Question] = Field(default_factory=list)
    answers: list[Answer] = Field(default_factory=list)
    mapped_results: list[MappedResult] = Field(default_factory=list)
    unmatched_answers: list[Answer] = Field(default_factory=list)
    status: str = "created"


class Progress(BaseModel):
    stage: str
    percent: int = Field(..., ge=0, le=100)
    status: Literal["processing", "done", "error"]
    detail: Optional[str] = None


# ---------------------------------------------------------------------------
# LLM structured-output wrappers (identical shape for Gemini and Groq)
# ---------------------------------------------------------------------------


class QuestionExtractionResult(BaseModel):
    questions: list[Question]


class AnswerExtractionResult(BaseModel):
    answers: list[Answer]


class MappingMatch(BaseModel):
    question_id: str
    answer_id: Optional[str] = None
    status: Literal["answered", "unanswered", "unmatched"]
    reason: Optional[str] = None


class MappingExtractionResult(BaseModel):
    matches: list[MappingMatch] = Field(default_factory=list)
    unmatched_answer_ids: list[str] = Field(default_factory=list)
