# AI Resume Reviewer — Backend

A FastAPI backend that accepts resume files, extracts their text content, and sends the result to a Groq-hosted LLM for structured AI evaluation against a job description.

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
| PDF report generation | ReportLab |
| HTTP client | httpx |
| Config | python-dotenv |

---

## Project Structure

```
backend/
├── main.py                  # FastAPI app setup, CORS middleware
├── requirements.txt
├── vercel.json              # Vercel deployment config (rewrites → api/index)
├── .python-version          # Pins Python 3.12 for Vercel
├── .env.example             # Environment variable template
├── api/
│   └── index.py             # Vercel serverless entrypoint (re-exports app from main.py)
├── routes/
│   └── resume.py            # /resume/extract, /resume/review, /resume/report endpoints
├── schemas/
│   └── resume.py            # Pydantic models for request/response contracts
├── services/
│   ├── extraction_service.py  # pdfplumber / python-docx parsing
│   ├── resume_service.py      # Orchestrates extraction → validation → LLM → scoring
│   ├── llm_service.py         # Groq API calls (review + resume validation)
│   ├── score_service.py       # Weighted overall score calculation
│   └── report_service.py      # ReportLab PDF report generation
└── prompts/
    └── resume.py              # System prompts for review and resume validation
```

---

## API Endpoints

### `POST /resume/extract`
Accepts a multipart file upload (`application/pdf` or `.docx`), extracts plain text, runs an LLM-based validation step to confirm the file is actually a resume, and returns the text for user review before analysis.

**Request:** `multipart/form-data` with a `file` field  
**Response:**
```json
{
  "extracted_text": "...",
  "extraction_warnings": []
}
```

**Validation pipeline:**
1. Character-length check — text must be between 200 and 5000 characters (HTTP 400 otherwise)
2. LLM validation — `is_valid_resume()` calls the Groq API with the extracted text and returns a `ResumeExtractionValidation` object (`is_resume`, `confidence`, `validation_message`). If `is_resume` is `false`, the endpoint returns HTTP 400 with the `validation_message` as the error detail.

---

### `POST /resume/review`
Sends the (potentially user-edited) resume text, a job description, and an experience level to the LLM and returns a structured evaluation.

**Request body:**
```json
{
  "resume_text": "...",        // min 200 characters
  "job_description": "...",   // min 50 characters
  "experience_level": "junior | mid | senior"
}
```

**Response:** See `ResumeReviewResponse` in `schemas/resume.py` — includes overall score, ATS/technical/communication sub-scores with reasoning, skills list, strengths, weaknesses, missing keywords, patch-based actionable improvements, and a job fit verdict.

Each item in `recommendations` includes:

| Field | Type | Description |
|---|---|---|
| `priority` | `"high" \| "medium" \| "low"` | Importance ranking |
| `title` | `string` | Short heading for the improvement |
| `section` | `"summary" \| "experience" \| "skills" \| "projects" \| "education"` | Target resume section |
| `action` | `"append" \| "insert" \| "replace"` | How to apply — `append`/`insert` are auto-applied by the frontend; `replace` is a manual suggestion |
| `suggested_content` | `string` | Exact text to add (or `Current: …\nSuggested: …` format for `replace`) |
| `reasoning` | `string` | 1–2 sentences explaining why this change matters for the target role |

---

### `GET /resume/experience-level`
Returns the list of valid experience level values: `["junior", "mid", "senior"]`.

---

### `POST /resume/report`
Generates a formatted PDF report from a completed review result and returns it as a file download.

**Request body:** A `ResumeReviewResponse` JSON object (the full output of `/resume/review`)

**Response:** `application/pdf` binary — `Content-Disposition: attachment; filename="resume-analysis-report.pdf"`

The report includes:
- Overall score with a visual progress bar
- ATS, Technical, and Communication score cards
- Executive summary
- Detailed score breakdowns with reasoning
- Skills listed as a comma-separated string
- Strengths, weaknesses, and missing keywords as bulleted lists
- Prioritised recommendations table (HIGH / MEDIUM / LOW)
- Job fit verdict with explanation

The PDF is generated in-memory via a temporary file and deleted after the response is sent. ReportLab is used for all layout and rendering. All LLM-generated text is sanitized before rendering to replace Unicode characters outside Helvetica's Latin-1 range (em dashes, curly quotes, ellipsis, etc.) with ASCII equivalents.

---

## Scoring

The overall score is a weighted average computed in `score_service.py`:

| Dimension | Weight |
|---|---|
| Technical | 50% |
| ATS | 30% |
| Communication | 20% |

All individual scores are integers from 0–100 produced by the LLM. The overall score is rounded to the nearest integer.

---

## Setup

### 1. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Obtain at [console.groq.com](https://console.groq.com) |
| `ALLOWED_ORIGINS` | No | Comma-separated frontend origins. Defaults to `http://localhost:5173,http://127.0.0.1:5173`. Set to your Vercel frontend URL in production. |

### 4. Run the development server
```bash
uvicorn main:app --reload
```
The server starts at `http://localhost:8000`.

---

## Deployment (Vercel)

The backend is deployed as a Python serverless function on Vercel.

Live URL: **https://ai-resume-reviewer-be.vercel.app**

### How it works
- `api/index.py` re-exports the FastAPI `app` from `main.py` — Vercel treats any file inside `api/` as a serverless function entrypoint
- `vercel.json` rewrites all requests (`/.*`) to `/api/index`
- `.python-version` pins Python 3.12

### Deploy steps
1. Import the repo into Vercel → set **Root Directory** to `backend`
2. Add environment variables in Vercel project settings:
   ```
   GROQ_API_KEY     = your_groq_api_key
   ALLOWED_ORIGINS  = https://your-frontend.vercel.app
   ```
3. Deploy — Vercel auto-detects `vercel.json`

---

## CORS

Allowed origins are configured via the `ALLOWED_ORIGINS` environment variable (comma-separated list). The default value is `http://localhost:5173,http://127.0.0.1:5173` for local development.

In production, set `ALLOWED_ORIGINS` to your deployed frontend URL (e.g. `https://your-frontend.vercel.app`) in the Vercel project environment variables.

---

## Known Limitations & Shortcomings

### File Format Support
- **No image support.** Resumes submitted as `.jpg`, `.png`, `.webp`, or any other image format are rejected. There is no OCR pipeline.
- **No scanned PDF support.** `pdfplumber` extracts text from the PDF's text layer. A resume scanned as an image embedded in a PDF will return an empty or near-empty string and fail validation. Tools like Tesseract or a vision-capable model would be needed to handle these.
- **No `.odt`, `.rtf`, or `.txt` support.** Only `.pdf` and `.docx` are accepted.
- **Multi-column PDF layouts** can confuse pdfplumber's reading order. Text from side-by-side columns may be interleaved, potentially degrading LLM evaluation quality.

### Resume Validation
- The 5000-character upper limit on extracted text will silently truncate long resumes since `validate_resume` raises an HTTP 400 for anything over this length. Long resumes are rejected rather than truncated gracefully.
- Validation runs only on the extracted text, not the user-edited text sent for review. A user could edit the text down below 200 characters after extraction and bypass the extraction-side check (the `ResumeRequest` schema enforces `min_length=200`, so this is caught at the review stage).

### LLM & Groq API
- **Rate limit sensitivity.** The Groq free tier has strict Tokens Per Minute (TPM) limits. With a large resume and long job description, requests can exceed the limit and return HTTP 413 or 429 errors. There is no retry logic or backoff strategy in place.
- **No streaming.** The LLM response is awaited in full before returning to the client. For long responses this can feel slow (3–10 seconds).
- **Model is hardcoded.** The model name is set directly in `llm_service.py`. Switching models requires a code change.
- **Model compatibility requirement.** Only models that support Groq's `json_schema` structured output format can be used. Not all Groq-hosted models support this — check the supported models list at [console.groq.com/docs/structured-outputs](https://console.groq.com/docs/structured-outputs#supported-models) before changing the model. Using an incompatible model will cause HTTP 400 errors on all LLM calls.
- **`max_completion_tokens` must be sized correctly.** If this value is too low to complete the JSON schema, Groq returns a `json_validate_failed` error (`max completion tokens reached before generating a valid document`). The review call uses 3000 tokens and the validation call uses 800 tokens.
- **No fallback.** If the LLM returns malformed JSON or a response that fails Pydantic validation, the error propagates as an unhandled exception and results in an HTTP 500.
- **Prompt injection risk.** The system prompt contains a note instructing the model to ignore instructions inside the resume or job description. However, this is a soft safeguard — a sufficiently adversarial input could still influence model behavior.

### Authentication & Security
- **No authentication.** Any client that can reach the server can submit requests. There is no API key, user session, or rate limiting at the application level.
- **No file size enforcement beyond content validation.** There is no `Content-Length` check before reading the file into memory. Very large uploads are read entirely before being rejected.

### Deployment
- Deployed on Vercel using `@vercel/python` via the `api/index.py` serverless entrypoint.
- CORS origins are controlled via the `ALLOWED_ORIGINS` environment variable — no code changes needed for new deployments.
- Python version is pinned via `.python-version`.
- Vercel Python serverless functions have a cold start on first request after inactivity (~1–3s on free tier).
