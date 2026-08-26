"""
Versioned LLM prompt templates and JSON schemas.

Iterate here without touching route or provider business logic.
"""

from __future__ import annotations

PROMPTS_VERSION = "2026-08-26.1"

BOUNDING_BOX_SCHEMA = """
{
  "page": "integer, 1-indexed page number of the image this box refers to",
  "x": "float 0-1, left edge as a fraction of page width",
  "y": "float 0-1, top edge as a fraction of page height",
  "width": "float 0-1, box width as a fraction of page width",
  "height": "float 0-1, box height as a fraction of page height"
}
""".strip()

QUESTION_JSON_SCHEMA = """
{
  "questions": [
    {
      "id": "string, stable id like q_1, q_2 in printed order",
      "number": "string, printed label e.g. \\"11(a)\\"",
      "text": "string, full question wording including any sub-instructions",
      "page": "integer, 1-indexed page the question appears on",
      "max_marks": "number or null, printed mark allocation if visible",
      "bbox": {BOUNDING_BOX}
    }
  ]
}
""".replace("{BOUNDING_BOX}", BOUNDING_BOX_SCHEMA)

ANSWER_JSON_SCHEMA = """
{
  "answers": [
    {
      "id": "string, stable id like a_1, a_2 in reading order",
      "matched_question_number": "string or null, label the student wrote (e.g. Q11(a), 11 a), 11.a)",
      "raw_text": "string, transcription of the handwritten answer (best effort)",
      "page": "integer, 1-indexed first page of this answer",
      "spans_pages": "array of integers, every page this answer occupies",
      "bboxes": [
        {BOUNDING_BOX}
      ]
    }
  ]
}
""".replace("{BOUNDING_BOX}", BOUNDING_BOX_SCHEMA)

MAPPING_JSON_SCHEMA = """
{
  "matches": [
    {
      "question_id": "string, id from the questions list",
      "answer_id": "string or null, id from the answers list when matched",
      "status": "answered | unanswered | unmatched",
      "reason": "short explanation of why this mapping was chosen"
    }
  ],
  "unmatched_answer_ids": ["string ids of answers that must not be forced onto a question"]
}
"""

GRADING_JSON_SCHEMA = """
{
  "score": "number, awarded marks",
  "max_score": "number, maximum marks for this question",
  "verdict": "correct | partially_correct | incorrect",
  "feedback": "string, brief teacher-style comment"
}
"""

EXTRACT_QUESTIONS_PROMPT = """
You are an expert exam-paper parser. The images that follow are pages of a
printed QUESTION PAPER, in order. Image 1 is page 1, image 2 is page 2, etc.

Task:
1. Extract every assessable question in printed order.
2. Split labelled sub-parts into separate entries. "11(a)" and "11(b)" are two
   questions. Likewise "3(i)" / "3(ii)", or "Q4 (a)" / "Q4 (b)".
3. For each question return a bounding box covering the printed question text
   on that page (not the whole page). Coordinates MUST be normalized 0-1
   relative to the page image (origin top-left). Never use pixels.
4. Capture max_marks when printed next to the question; otherwise null.
5. Ignore running headers, footers, generic instructions, and cover pages
   that contain no numbered questions.
6. Preserve the exact printed numbering in `number` (e.g. "11(a)", not "11a").

Return ONLY valid JSON matching this schema:
{SCHEMA}

Prompts version: {VERSION}
""".strip()

EXTRACT_ANSWERS_PROMPT = """
You are an expert at reading handwritten student answer sheets. The images
that follow are pages of ONE student's ANSWER SHEET, in order. Image 1 is
page 1, image 2 is page 2, etc.

Do NOT run a separate OCR pipeline in your reasoning — read the handwriting
directly from the images.

Task:
1. Segment the sheet into distinct answer blocks. A block is one student's
   attempt at one question (it may be several paragraphs).
2. Detect question-number labels the student wrote, including variants:
   "Q11(a)", "11 a)", "11.a", "11-a", "Question 11 a", "Ans 11(b)". Store the
   raw label in matched_question_number. If none is visible, set it to null.
3. If an answer continues onto the next page, emit ONE answer object with
   multiple bboxes (one per page region) and spans_pages listing every page.
4. Rough work, doodles, struck-through text, and unlabelled scraps should
   still be extracted as their own blocks with matched_question_number = null
   so they can be left unmatched later. Never invent a question number for them.
5. Bounding boxes MUST be normalized 0-1 relative to each page image
   (origin top-left), covering the ink of that answer as tightly as practical.
6. Transcribe raw_text as faithfully as possible. Uncertain words may be
   marked with [?].

Return ONLY valid JSON matching this schema:
{SCHEMA}

Prompts version: {VERSION}
""".strip()

MAP_ANSWERS_PROMPT = """
You are matching a student's handwritten answers to the questions from an
exam paper. Matching is by identity of the question, NOT by page position.
Answers may appear out of order.

Matching rules (apply in this order):
a) Explicit number label: fuzzy-match the student's matched_question_number
   against question.number. These are the SAME question:
   "11 a" == "11(a)" == "Q11(a)" == "11.a" == "11-a" == "11 a)".
   Do NOT treat "11" as a match for "11(a)" when "11(b)" also exists — sub-parts
   are distinct questions.
b) If no usable label, use (i) remaining sequential/positional order among
   still-unmatched items AND (ii) semantic similarity between question text
   and answer content. Only match when you are confident.
c) Never force-match garbage, doodles, or rough work. Put those answer ids
   in unmatched_answer_ids with no question.
d) Every question MUST appear in `matches` (status "unanswered" and
   answer_id null if nothing fits).
e) An answer may map to at most one question. A question may map to at most
   one answer.

Return ONLY valid JSON matching this schema:
{SCHEMA}

QUESTIONS:
{QUESTIONS}

ANSWERS:
{ANSWERS}

Prompts version: {VERSION}
""".strip()

GRADE_ANSWER_PROMPT = """
You are an exam grader. Score the student's answer against the question.
Be reasonably charitable toward spelling and transcription artefacts from
handwriting, but do not award marks for content that is missing or wrong.

Use max_marks from the question when provided; otherwise use 1.0.
score must be between 0 and max_score.
verdict:
  - "correct" if the answer substantially meets the question
  - "partially_correct" if some credit is due but it is incomplete or mixed
  - "incorrect" if it does not address the question or is wrong

Return ONLY valid JSON matching this schema:
{SCHEMA}

QUESTION:
{QUESTION}

ANSWER:
{ANSWER}

Prompts version: {VERSION}
""".strip()

OCR_STRUCTURING_PREFIX = """
The following text was produced by local Tesseract OCR because a vision model
was unavailable. Bounding-box hints (normalized 0-1) are included per text
block when known. Structure this OCR into the required JSON schema. Prefer
the provided block bboxes over guessing. If a bbox is unknown, estimate
conservatively from the block list.
""".strip()


def render_extract_questions_prompt(*, page_start: int, page_end: int) -> str:
    extra = f"\nThese images are pages {page_start} through {page_end} of the question paper.\n"
    return extra + EXTRACT_QUESTIONS_PROMPT.format(SCHEMA=QUESTION_JSON_SCHEMA, VERSION=PROMPTS_VERSION)


def render_extract_answers_prompt(*, page_start: int, page_end: int) -> str:
    extra = f"\nThese images are pages {page_start} through {page_end} of the answer sheet.\n"
    return extra + EXTRACT_ANSWERS_PROMPT.format(SCHEMA=ANSWER_JSON_SCHEMA, VERSION=PROMPTS_VERSION)


def render_map_answers_prompt(*, questions_json: str, answers_json: str) -> str:
    return MAP_ANSWERS_PROMPT.format(
        SCHEMA=MAPPING_JSON_SCHEMA,
        QUESTIONS=questions_json,
        ANSWERS=answers_json,
        VERSION=PROMPTS_VERSION,
    )


def render_grade_answer_prompt(*, question_json: str, answer_json: str) -> str:
    return GRADE_ANSWER_PROMPT.format(
        SCHEMA=GRADING_JSON_SCHEMA,
        QUESTION=question_json,
        ANSWER=answer_json,
        VERSION=PROMPTS_VERSION,
    )
