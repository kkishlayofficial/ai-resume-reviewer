# AI Resume Reviewer — Backend

A FastAPI backend that extracts text from resume files, parses it into a structured model, and evaluates it against a job description using a Groq-hosted LLM with strict JSON schema output.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web framework | FastAPI 0.136 |
| Runtime | Python 3.14 |
| ASGI server | Uvicorn |
| Data validation | Pydantic v2 |
| PDF extraction | pdfplumber |
| DOCX extraction | python-docx |
| LLM provider | Groq API (`openai/gpt-oss-120b`) |
| Resume generation | ReportLab (PDF), python-docx (DOCX) |
| HTTP client | httpx (via Groq SDK) |
| Config | python-dotenv |

---

## Project Structure

```
backend/
├── main.py                    # FastAPI app, CORS middleware
├── requirements.txt
├── vercel.json                # Rewrites all requests to /api/index
├── .env.example
├── api/
│   └── index.py               # Vercel serverless entrypoint (re-exports app)
├── routes/
│   └── resume.py              # All API route handlers
├── schemas/
│   └── resume.py              # Pydantic models for all request/response contracts
├── services/
│   ├── extraction_service.py  # pdfplumber / python-docx text extraction
│   ├── resume_service.py      # Orchestration: validation, preprocessing, parse, review
│   ├── llm_service.py         # Groq API calls + make_strict_schema + heuristic validation
│   ├── score_service.py       # Weighted overall score calculation
│   ├── report_service.py      # ReportLab PDF analysis report generation
│   └── docx_service.py        # Resume PDF + DOCX file generation
└── prompts/
    └── resume.py              # System prompts for LLM review and parsing
```

---

## API Endpoints

### `POST /resume/extract`

Accepts a multipart file upload (`.pdf` or `.docx`), extracts plain text, and runs a heuristic validation to confirm the file is a resume.

**Request:** `multipart/form-data` — field `file`

**Response:**
```json
{
  "extracted_text": "...",
  "extraction_warnings": []
}
```

**Validation pipeline:**
1. Length check — text must be 200–5000 characters (HTTP 400 otherwise)
2. Keyword heuristic — checks for resume indicator terms (`experience`, `education`, `skills`, `projects`, `summary`, `employment`, `internship`, `certifications`, etc.). No LLM call required.

---

### `POST /resume/parse`

Parses extracted resume text into a structured `Resume` model using the LLM.

**Request body:**
```json
{ "extracted_text": "..." }
```

**Response:**
```json
{
  "structured_resume": {
    "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" },
    "summary": "",
    "experience": [{ "company": "", "role": "", "duration": "", "bullets": [] }],
    "education": [{ "institution": "", "degree": "", "duration": "", "details": [] }],
    "skills": [],
    "projects": [{ "name": "", "description": "", "bullets": [], "technologies": [] }],
    "certifications": []
  },
  "parse_warnings": []
}
```

Fields absent from the resume are returned as empty strings or empty arrays — never `null`.

---

### `POST /resume/review`

Evaluates the structured resume (serialised to text) against a job description using the LLM and returns a full analysis.

**Request body:**
```json
{
  "resume_text": "...",
  "job_description": "...",
  "experience_level": "junior | mid | senior"
}
```

**Response:** `ResumeReviewResponse` — see `schemas/resume.py`. Includes:

- `overall_score` — weighted average (integer 0–100)
- `ats_score`, `technical_score`, `communication_score` — `{ score, reasoning }`
- `summary` — ~100-word executive summary
- `skills`, `strengths`, `weaknesses`, `missing_keywords` — string arrays
- `recommendations` — array of `PatchOperation` objects (see below)
- `job_fit` — `{ fit: bool, explanation: string }`

Each `PatchOperation`:

| Field | Type | Description |
|---|---|---|
| `priority` | `"high" \| "medium" \| "low"` | Importance ranking |
| `title` | `string` | Short heading |
| `section` | `"summary" \| "experience" \| "skills" \| "projects" \| "education" \| "certifications"` | Target section |
| `operation` | `"append" \| "replace"` | How to apply |
| `content` | `string` | Text to add (append) or replace with (replace) |
| `target` | `string \| null` | (`replace` only) Exact existing text to overwrite |
| `item_name` | `string \| null` | (`experience`/`projects`) Company or project name to locate the right entry |
| `reasoning` | `string` | Why this change matters |

---

### `POST /resume/report`

Generates a formatted PDF analysis report and returns it as a file download.

**Request body:** A complete `ResumeReviewResponse` JSON object

**Response:** `application/pdf` — `Resume-Analysis-Report.pdf`

The report includes: overall score, sub-score cards with reasoning, executive summary, skills, strengths, weaknesses, missing keywords, prioritised recommendations, and job fit verdict.

---

### `POST /resume/download`

Generates a clean resume document from the structured `Resume` model.

**Request body:** `{ "resume": <Resume object> }`

**Query param:** `?format=docx` (default) or `?format=pdf`

**Response:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document` or `application/pdf`

Education entries are formatted as:
- Line 1: **Institution name** | Duration (bold)
- Line 2: Degree (muted)

---

## Scoring

| Dimension | Weight |
|---|---|
| Technical | 50% |
| ATS | 30% |
| Communication | 20% |

Computed in `score_service.py`. All sub-scores are integers 0–100.

---

## LLM Integration

`llm_service.py` exposes three functions:

- `generate_resume_review(system_prompt, user_prompt)` → `ResumeReviewAIOutput`
- `parse_resume(extracted_text)` → `Resume`
- `is_valid_resume(resume_text)` → `ResumeExtractionValidation` *(heuristic, no LLM call)*

### Multi-Model Fallback

For structured JSON output tasks (`generate_resume_review` and `parse_resume`), both functions use `_chat_with_fallback()` which automatically cycles through a priority list of Groq models:

1. `openai/gpt-oss-120b` (primary)
2. `meta-llama/llama-4-maverick-17b-128e-instruct`
3. `meta-llama/llama-4-scout-17b-16e-instruct`
4. `llama-3.3-70b-versatile`

**Fallback triggers:** The next model is tried on:
- HTTP 400 (unsupported feature, e.g. model doesn't support `json_schema`)
- HTTP 429 (rate limit on current model)
- HTTP 503 (model overloaded)
- `APITimeoutError` (request timeout)

**Fail-fast errors:** These are raised immediately without retry:
- HTTP 401/403 (invalid API key)
- `APIConnectionError` (network down)

If all models fail, the last encountered exception is raised.

### Schema & Response Format

All LLM calls use `response_format` with `type: json_schema` and `strict: True`. Pydantic's `model_json_schema()` output is pre-processed by `make_strict_schema()` which:
- Adds every property key to `required` on all nested objects (required by OpenAI strict mode)
- Sets `additionalProperties: false` recursively
- Removes `default` values (not permitted in strict mode)

**Error handling:** `APITimeoutError` → HTTP 504, `APIConnectionError` → HTTP 503, all other `APIStatusError` → HTTP 502.

**Token budgets:** parse = 4000 tokens, review = 3000 tokens.

---

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Obtain at [console.groq.com](https://console.groq.com) |
| `ALLOWED_ORIGINS` | No | Comma-separated frontend origins. Defaults to `http://localhost:5173,http://127.0.0.1:5173` |

```bash
# 4. Start the dev server
uvicorn main:app --reload
# API available at http://localhost:8000
```

---

## Deployment (Vercel)

Live URL: **https://ai-resume-reviewer-be.vercel.app**

- `api/index.py` re-exports the FastAPI `app` — Vercel treats it as a serverless function entrypoint
- `vercel.json` rewrites all requests (`/.*`) to `/api/index`
- `.python-version` pins Python 3.12 for Vercel

**Deploy steps:**
1. Import the repo into Vercel → set **Root Directory** to `backend`
2. Add environment variables in project settings:
   ```
   GROQ_API_KEY     = your_groq_api_key
   ALLOWED_ORIGINS  = https://your-frontend.vercel.app
   ```
3. Deploy

---

## CORS

Controlled via the `ALLOWED_ORIGINS` environment variable (comma-separated). Defaults to localhost for development. Set to your deployed frontend URL in production.

---

## Known Limitations

- **PDF and DOCX only** — no image resume support, no OCR
- **Scanned PDFs** (image-embedded) return empty or near-empty text and fail validation
- **Multi-column PDF layouts** can cause pdfplumber to interleave text from side-by-side columns, degrading parse quality
- **5000-character hard limit** — resumes exceeding this are rejected with HTTP 400 rather than truncated gracefully
- **No retry / backoff** — transient Groq rate limit errors (HTTP 429) surface directly to the client
- **No streaming** — full LLM responses are awaited before returning; typical latency is 3–10 s
- **Model is hardcoded** — only models supporting Groq's `json_schema` structured output can be used; see [supported models](https://console.groq.com/docs/structured-outputs#supported-models)
- **No authentication** — any client that can reach the server can submit requests
- **Prompt injection** — the system prompt instructs the model to ignore instructions inside the resume; this is a soft safeguard only
- **Cold start** — Vercel Python serverless functions take ~1–3 s to start after inactivity
