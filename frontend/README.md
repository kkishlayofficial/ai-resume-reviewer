# AI Resume Reviewer — Frontend

A React + TypeScript single-page application that guides users through a 3-step wizard: upload a resume, verify and edit the structured content, then view and act on a detailed AI evaluation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | CSS Modules (custom design system via CSS variables) |
| Linting | ESLint 10 + typescript-eslint |
| No UI library | All components are hand-built |

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── vercel.json              # SPA rewrites (/* → /index.html)
├── .env.example
├── src/
│   ├── App.tsx              # Root — renders Navbar, Hero, Features, HowItWorks,
│   │                        #   ResumeReview, Footer
│   ├── index.css            # Global CSS variables (design tokens, dark/light mode)
│   ├── hooks/
│   │   └── useTheme.ts      # Dark/light theme toggle with localStorage persistence
│   ├── types/
│   │   └── resume.ts        # TypeScript interfaces mirroring backend Pydantic schemas
│   ├── services/
│   │   └── resumeApi.ts     # API layer — extractResume(), parseResume(),
│   │                        #   reviewResume(), getReport(), downloadResume()
│   │                        #   Includes MOCK_MODE flag for development
│   ├── components/
│   │   ├── Navbar/          # Site header with theme toggle
│   │   ├── Hero/            # Landing hero section
│   │   ├── Features/        # Feature highlights
│   │   ├── HowItWorks/      # Step explanation section
│   │   ├── Footer/
│   │   └── ui/              # Reusable primitives
│   │       ├── Badge/       # Priority / fit status badge
│   │       ├── Button/      # Primary / secondary / ghost variants
│   │       ├── Card/        # Container with optional shadow
│   │       ├── Chip/        # Inline tag for skills / keywords
│   │       ├── CircularScore/  # SVG ring chart for the overall score
│   │       └── ProgressBar/    # Linear progress bar
│   └── modules/
│       └── resume-review/
│           ├── ResumeReview.tsx        # Top-level state machine
│           ├── utils/
│           │   ├── applyPatch.ts       # Structured Resume model patcher
│           │   └── resumeToText.ts     # Resume model → plain text for LLM review
│           ├── StepWizard/             # Step indicator nav bar
│           ├── Step1Upload/            # File picker with drag-and-drop
│           ├── ExtractionLoading/      # Animated loading (upload → verify)
│           ├── Step2Verify/            # Structured editor (drag-and-drop bullets,
│           │                           #   AI badges, JD input, experience level)
│           ├── AnalysisLoading/        # Animated loading (verify → dashboard)
│           └── Step3Dashboard/         # Scores, recommendations, download buttons
```

---

## Application Flow

```
upload ──[upload file]──▶ extracting ──[extract OK]──▶ parsing ──[parse OK]──▶ verify
           │                  │                           │
           │             [error]                     [error]
           │                  └──────────────────────────┘
           │                              │
           ▼                              ▼
        upload                        upload (error shown)

verify ──[review]──▶ reviewing ──[review OK]──▶ dashboard
                         │
                    [error]
                         │
                         ▼
                      verify (error shown)
```

The `phase` field in `ResumeReview` state drives which component is rendered. `StepWizard` derives its state from `maxReachedStep`, `step1Dirty`, and `step2Dirty` — preventing navigation to a step whose inputs have changed since it was last completed.

---

## State Management

All state lives in a single `State` object in `ResumeReview.tsx`:

| Field | Description |
|---|---|
| `phase` | Current wizard phase |
| `file` | Uploaded `File` object |
| `extractedText` | Raw text from extraction |
| `parsedResume` | Original parsed `Resume` model — never mutated |
| `editedResume` | User-edited version — sent to LLM review and used for download |
| `jobDescription` | Pasted job description text |
| `experienceLevel` | `"junior"` \| `"mid"` \| `"senior"` |
| `reviewResult` | Latest `ResumeReviewResponse` |
| `baselineResult` | First review result — preserved for score delta |
| `appliedRecommendations` | Indices of applied `recommendations[]` entries |
| `rejectedRecommendations` | Indices of dismissed cards |
| `recommendationAddedContents` | `patch.content` strings of applied patches — used to identify AI-added items in Step 2 |
| `maxReachedStep` | Furthest step reached — controls step nav |
| `step1Dirty` / `step2Dirty` | Whether inputs changed since the step was completed |
| `error` | Current error message (transient, not persisted) |

---

## Session Persistence

All state is persisted to `localStorage` so a page refresh never loses progress.

| Key | Contents |
|---|---|
| `resume-review-state-v2` | All state fields except `file` and `error` |
| `resume-review-file` | Uploaded file serialised as `{ dataUrl, name }` |

**On load:**
- `extracting` / `parsing` phases → normalized back to `upload`
- `reviewing` phase → normalized back to `verify`
- Stale schemas (missing `operation` field on recommendations) → wiped and reset
- Missing `recommendationAddedContents` → defaults to `[]`

**Calling Start Over** removes both keys and resets to initial state.

If the file exceeds localStorage quota, file persistence fails silently. All other state is still saved.

---

## Step 2 — Structured Editor

Step 2 renders a full structured editor for the parsed resume, replacing the old plain-text textarea.

**Features:**
- Edit every field: contact info, summary, experience (role / company / duration / bullets), education (institution / degree / duration / details), skills, projects (name / description / bullets / technologies), certifications
- **Drag-and-drop bullet reordering** — grip handle appears on hover; drag any bullet to reorder within its list
- **AI indicator badges** — items added via recommendations are highlighted:
  - Bullets: `✦ AI` pill badge + purple left-border accent on the textarea
  - Chips (skills, certifications, technologies): green chip colour + `✦` prefix
  - Summary: `✦ AI recommendation applied` banner above the textarea
- **Reset to Original** — reverts `editedResume` to `parsedResume` and clears all AI badges
- Minimum JD length enforced (50 characters) before the Review button is enabled

---

## Step 3 — Dashboard

- Overall score ring chart + ATS / Technical / Communication score cards with reasoning
- Score delta badges (e.g. `+13`) appear after re-evaluation
- Skills chips, strengths, weaknesses, missing keywords
- Recommendation cards with `+ Add to Resume` / Reject buttons and priority badges
- Applied counter (`Applied: N / M`) and Re-evaluate button (enabled when ≥ 1 improvement applied)
- Job fit verdict card
- **Download Report** — `POST /resume/report` → PDF analysis report
- **Download Resume** — `POST /resume/download?format=pdf|docx` → formatted resume document

---

## Development Setup

### Prerequisites
- Node.js 20+

### Install and run
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Dev server at http://localhost:5173
```

### Build
```bash
npm run build    # Type-check + bundle
npm run preview  # Preview production build locally
```

### Lint
```bash
npm run lint
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend API base URL. Set to your deployed backend URL in production. |

---

## Mock Mode

`src/services/resumeApi.ts` exports a `MOCK_MODE` flag:

```ts
export const MOCK_MODE = false;
```

When `true`, all API calls return hardcoded sample data with artificial delays (no backend required). Set to `false` to use the real API.

---

## Error Handling

HTTP errors from the backend are automatically mapped to user-friendly messages by the `friendlyError()` helper in `src/services/resumeApi.ts`. Instead of exposing raw API details to users, they see clear, actionable guidance:

| HTTP Status | User Message |
|---|---|
| 400 | "The request was invalid. Please check your input and try again." |
| 413 | "The file is too large. Please upload a smaller file." |
| 422 | "The uploaded file could not be processed. Please ensure it is a valid resume." |
| 429 | "The AI service is currently busy. Please wait a moment and try again." |
| 500 | "Something went wrong on our end. Please try again." |
| 502 | "The AI service returned an unexpected response. Please try again." |
| 503 | "The AI service is temporarily unavailable. Please try again shortly." |
| 504 | "The AI service took too long to respond. Please try again." |

Error messages are displayed in a red banner alert with an icon in the ResumeReview component. If a network error occurs during any step (extraction, parsing, review, download), the error is shown and the wizard allows the user to retry without losing progress.

---

## Theming

Light and dark mode are supported. The active theme is persisted to `localStorage` under `theme`. The `useTheme` hook reads this on mount, applies `data-theme="dark"` or `data-theme="light"` to `<html>`, and falls back to `prefers-color-scheme`. All design tokens (colors, spacing, radii, shadows) are defined as CSS custom properties in `src/index.css`.

---

## Deployment (Vercel)

Live URL: **https://ai-resume-reviewer-rho-rust.vercel.app**

1. Import the repo into Vercel → set **Root Directory** to `frontend`
2. Framework preset: **Vite**
3. Add environment variable:
   ```
   VITE_API_BASE_URL = https://your-backend.vercel.app
   ```
4. Deploy — `vercel.json` handles SPA routing automatically

---

## Testing & Quality Assurance

The frontend includes 68 unit tests with full coverage of utilities, services, hooks, and components:

```bash
# Run tests in watch mode
npm run test

# Run tests once and exit
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test suites:**
- `applyPatch.test.ts` (15 tests) — Patch application logic for all resume sections
- `resumeApi.test.ts` (19 tests) — API client, friendly error messages, status code mapping
- `resumeToText.test.ts` (14 tests) — Resume model serialization with edge cases
- `useTheme.test.ts` (7 tests) — Theme toggle, localStorage persistence, DOM updates
- `ui.test.tsx` (13 tests) — Button, Card, Badge, Chip, CircularScore, ProgressBar components

**Configuration:** `vitest.config.ts` uses the React plugin, happy-dom environment, and v8 coverage provider. All tests run in happy-dom for fast, isolated unit testing without a full browser.

---

## Known Limitations

- **PDF/DOCX only** — no image resume support
- **No request cancellation** — navigating back during extraction or review does not cancel the in-flight `fetch`
- **No retry mechanism** — transient errors require a manual retry
- **No diff view** — Reset to Original reverts all edits without a before/after comparison
- **Step 3 not fully optimised for small screens** — the multi-card dashboard is readable but not polished on mobile
