# AnswerLens backend

AI-powered assessment grading: a teacher uploads a question paper and one student's handwritten answer sheet. The API extracts questions, extracts answers, maps them (including out-of-order answers), returns normalized bounding boxes for overlay highlighting, and optionally grades.

No database — sessions live in memory for the process lifetime, keyed by `session_id`.

## Requirements

- Python 3.11 (Dockerfile). 3.12–3.14 also work locally with the pinned deps.
- A [Gemini](https://aistudio.google.com/apikey) API key (default) **or** a [Groq](https://console.groq.com/keys) API key
- Optional: [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) on the host if you use Groq's OCR fallback path

Sessions are in-memory only: restarting uvicorn wipes them.

## Setup

```bash
cd backend
python -m venv .venv
# Windows Git Bash / macOS / Linux
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set at least one provider key:

```
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
```

Run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

OpenAPI docs: http://localhost:8000/docs

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `LLM_PROVIDER` | `gemini` | `gemini` or `groq` |
| `GEMINI_API_KEY` | empty | Google AI Studio key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini vision model |
| `GROQ_API_KEY` | empty | Groq Cloud key |
| `GROQ_MODEL` | `qwen/qwen3.6-27b` | Groq **vision** model |
| `GROQ_TEXT_MODEL` | `openai/gpt-oss-20b` | Groq text model (mapping, grading, OCR fallback) |
| `GRADING_ENABLED` | `true` | Set `false` to skip per-answer grading |
| `MAX_UPLOAD_MB` | `20` | Max size per uploaded file |
| `PORT` | `8000` | HTTP port (used by Docker) |
| `STORAGE_ROOT` | system temp dir | Where page PNGs are written (`/tmp/{session_id}/qp\|ans/` in Docker) |
| `PDF_DPI` | `175` | PDF rasterization DPI (150–200 recommended) |

Prompt text lives in `app/llm/prompts.py` (`PROMPTS_VERSION`) so you can iterate without touching routes.

## Switching LLM providers

The factory (`app/llm/factory.py`) is the **only** place that chooses a backend. Routes always call `get_llm_provider()`.

**Gemini (default)** — send page images as `inline_data` (base64) with `response_mime_type: application/json`. Handwriting is read by the vision model; Tesseract is not used.

**Groq** — intended as the fallback / free-tier path when Gemini quota is exhausted:

```
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key
GROQ_MODEL=qwen/qwen3.6-27b
```

`llama-3.2-90b-vision-preview` is decommissioned on Groq. The default is the current vision model (`qwen/qwen3.6-27b`, max 5 images per request). If a vision call fails, or you point `GROQ_MODEL` at a text-only model, the provider OCRs pages with Tesseract locally and sends that text to `GROQ_TEXT_MODEL` for structuring.

## API flow (curl)

```bash
BASE=http://localhost:8000

# 1. Create a session
SID=$(curl -s -X POST "$BASE/api/session/create" | python -c "import sys,json; print(json.load(sys.stdin)['session_id'])")
echo "session_id=$SID"

# 2. Upload question paper (PDF or images). Repeat -F files=@... for extra pages.
curl -s -X POST "$BASE/api/upload/question-paper" \
  -F "session_id=$SID" \
  -F "files=@./question_paper.pdf"

# 3. Upload one student's answer sheet
curl -s -X POST "$BASE/api/upload/answer-sheet" \
  -F "session_id=$SID" \
  -F "files=@./answer_sheet.jpg"

# 4. Start the pipeline (returns 202 immediately; work continues in the background)
curl -s -X POST "$BASE/api/process/$SID"

# 5. Poll progress until status is "done" or "error"
curl -s "$BASE/api/progress/$SID"

# 6. Fetch mapped results (questions, mapped_results, unmatched_answers)
curl -s "$BASE/api/results/$SID"

# 7. Fetch a page image so the UI can draw normalized bbox overlays
#    type = qp | ans     page_number is 1-indexed
curl -s -o qp_page_1.png "$BASE/api/image/$SID/qp/1"
curl -s -o ans_page_1.png "$BASE/api/image/$SID/ans/1"
```

### Postman

1. `POST /api/session/create` — copy `session_id`.
2. `POST /api/upload/question-paper` — form-data: `session_id` (text), `files` (file). PDF or images.
3. `POST /api/upload/answer-sheet` — same, student's sheet.
4. `POST /api/process/{session_id}`.
5. `GET /api/progress/{session_id}` until `status=done`.
6. `GET /api/results/{session_id}`.
7. `GET /api/image/{session_id}/qp/1` and `/ans/1` for overlays.

Bounding boxes are **normalized 0–1** relative to the page image (`x`, `y` = top-left). Overlay math:

```
left   = bbox.x * imgWidth
top    = bbox.y * imgHeight
width  = bbox.width * imgWidth
height = bbox.height * imgHeight
```

Multi-page answers use `bboxes` (list) plus `spans_pages`. Unanswered questions appear with `status: "unanswered"` and `answer: null`. Rough work / doodles land in `unmatched_answers` and are never force-matched.

## Docker

```bash
docker build -t answerlens-backend .
docker run --rm -p 8000:8000 --env-file .env answerlens-backend
```

The container listens on `$PORT` (default 8000). Page images are stored under `STORAGE_ROOT` (default `/tmp`).

## Project layout

```
app/
  main.py              FastAPI app, CORS, routers
  config.py            env loading
  models.py            Pydantic schemas
  session_store.py     in-memory dict store
  llm/
    base.py            LLMProvider ABC + JSON parsers
    gemini_provider.py
    groq_provider.py
    factory.py         get_llm_provider()
    prompts.py         all prompt templates
  routers/
    upload.py          create session + uploads
    process.py         pipeline + progress
    results.py         results JSON + page images
  utils/
    pdf_to_images.py   PyMuPDF / Pillow conversion
    matching.py        question-number fuzzy match
```

## Pipeline stages

`POST /api/process/{session_id}` runs:

1. `extract_questions` — printed order, sub-parts split (`11(a)`, `11(b)`), bbox per question
2. `extract_answers` — handwritten blocks, student labels, multi-page `bboxes` / `spans_pages`
3. `map_answers_to_questions` — fuzzy number match, then LLM sequential/semantic match; leftovers → `unmatched_answers`
4. `grade_answer` — only if `GRADING_ENABLED=true`

Progress (`GET /api/progress/{session_id}`): `{ stage, percent, status }` where `status` is `processing` | `done` | `error`.
