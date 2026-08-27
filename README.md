# AnswerLens

AnswerLens maps a question paper to one student's handwritten answer sheet. A teacher uploads both files; the API extracts questions and answers, maps them (including out-of-order answers), draws bounding-box highlights, and optionally grades.

The UI flow is unchanged: **Upload → Extracting → Results**.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit Query |
| Backend | FastAPI, Gemini or Groq vision models, PyMuPDF / Pillow |

Sessions are in-memory on the backend. Restarting the API server clears them.

## Prerequisites

- Node.js 20+
- Python 3.11+ (3.12–3.14 also work locally)
- A [Gemini](https://aistudio.google.com/apikey) API key (default) **or** a [Groq](https://console.groq.com/keys) API key

## Quick start

Run the API and the UI in two terminals.

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows Git Bash / macOS / Linux
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set at least one provider key:

```
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: http://localhost:8000/health  
OpenAPI docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. The UI calls the API at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`).

## How the app talks to the API

Starting mapping from the upload screen runs this sequence through RTK Query (`frontend/store/api/examApi.ts`):

1. `POST /api/session/create` — create a session
2. `POST /api/upload/question-paper` — form-data: `session_id`, `files`
3. `POST /api/upload/answer-sheet` — form-data: `session_id`, `files`
4. `POST /api/process/{session_id}` — start extraction (returns 202)
5. `GET /api/progress/{session_id}` — poll until `stage` and `status` are `done`
6. `GET /api/results/{session_id}` — mapped questions, answers, grading
7. `GET /api/image/{session_id}/ans/{page}` — answer-sheet page images for highlights

Upload validation (type and size) lives in `frontend/formConfig/examUpload.ts` and matches the backend: PDF or image, max 20 MB.

Bounding boxes are normalized 0–1 relative to the page image. Overlay math:

```
left   = bbox.x * imgWidth
top    = bbox.y * imgHeight
width  = bbox.width * imgWidth
height = bbox.height * imgHeight
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `LLM_PROVIDER` | `gemini` | `gemini` or `groq` |
| `GEMINI_API_KEY` | empty | Google AI Studio key |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Gemini vision model |
| `GROQ_API_KEY` | empty | Groq Cloud key |
| `GROQ_MODEL` | `qwen/qwen3.6-27b` | Groq vision model |
| `GROQ_TEXT_MODEL` | `openai/gpt-oss-20b` | Groq text model (mapping, grading, OCR fallback) |
| `GRADING_ENABLED` | `true` | Set `false` to skip per-answer grading |
| `MAX_UPLOAD_MB` | `20` | Max size per uploaded file |
| `PORT` | `8000` | HTTP port |
| `STORAGE_ROOT` | system temp dir | Where page PNGs are written |
| `PDF_DPI` | `175` | PDF rasterization DPI |

### Frontend (`frontend/.env.local`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Backend origin used by RTK Query and page images |

## Project layout

```
backend/                 FastAPI app
  app/main.py            CORS, routers
  app/routers/           session, upload, process, results
  app/llm/               Gemini / Groq providers and prompts
  app/models.py          Pydantic schemas

frontend/                Next.js UI
  app/                   App Router entry
  components/exams/      Upload, extracting, and results screens
  formConfig/            Upload validation
  store/api/examApi.ts   RTK Query endpoints
  types/exam.ts          Shared TypeScript interfaces
```

## Docker (backend)

```bash
cd backend
docker build -t answerlens-backend .
docker run --rm -p 8000:8000 --env-file .env answerlens-backend
```

Point `NEXT_PUBLIC_API_BASE_URL` at the container host (for example `http://localhost:8000`).

More backend detail: [backend/README.md](backend/README.md).
