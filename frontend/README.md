# AI Resume Reviewer — Frontend

A React + TypeScript single-page application that guides users through a 3-step wizard to upload a resume, verify the extracted content, and view a detailed AI evaluation report.

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
├── src/
│   ├── App.tsx                    # Root component — renders Navbar, Hero, Features,
│   │                              #   HowItWorks, ResumeReview, Footer
│   ├── index.css                  # Global CSS variables (design tokens, dark mode)
│   ├── hooks/
│   │   └── useTheme.ts            # Dark/light theme toggle with localStorage persistence
│   ├── types/
│   │   └── resume.ts              # TypeScript interfaces mirroring backend Pydantic schemas
│   ├── services/
│   │   └── resumeApi.ts           # API layer — extractResume(), reviewResume(), getReport()
│   │                              #   with a MOCK_MODE flag for development without a backend
│   ├── components/
│   │   ├── Navbar/                # Site header with theme toggle
│   │   ├── Hero/                  # Landing hero section
│   │   ├── Features/              # Feature highlights section
│   │   ├── HowItWorks/            # Step explanation section
│   │   ├── Footer/
│   │   └── ui/                    # Reusable primitives
│   │       ├── Badge/             # Status badge (fit / not fit, priority levels)
│   │       ├── Button/            # Primary / secondary / ghost variants
│   │       ├── Card/              # Container with optional shadow
│   │       ├── Chip/              # Inline tag for skills / keywords
│   │       ├── CircularScore/     # SVG ring chart for the overall score
│   │       └── ProgressBar/       # Linear progress bar
│   └── modules/
│       └── resume-review/
│           ├── ResumeReview.tsx           # Top-level state machine (phase + dirty flags,
│           │                              #   localStorage persistence, PDF download handler,
│           │                              #   apply-recommendation + re-evaluate handlers)
│           ├── utils/
│           │   └── applyRecommendation.ts # Section-aware text patching utility
│           ├── StepWizard/                # Step indicator nav bar
│           ├── Step1Upload/               # File picker with drag-and-drop
│           ├── ExtractionLoading/         # Animated loading screen (upload → verify)
│           ├── Step2Verify/               # Resume text editor + highlight overlay + JD input
│           ├── AnalysisLoading/           # Animated loading screen (verify → dashboard)
│           └── Step3Dashboard/            # Full evaluation report + actionable improvements
```

---

## Application Flow

```
upload  ──[extract file]──▶  extracting  ──[API success]──▶  verify
                                │
                           [API error]
                                │
                                ▼
                             upload (error shown)

verify  ──[review]──▶  reviewing  ──[API success]──▶  dashboard
                           │
                      [API error]
                           │
                           ▼
                        verify (error shown)
```

The `phase` field in `ResumeReview`'s state drives which component is mounted. The `StepWizard` nav bar derives its state from `maxReachedStep`, `step1Dirty`, and `step2Dirty` flags — preventing users from jumping to a step whose inputs have changed since it was last completed.

---

## Development Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Install and run
```bash
cd frontend
npm install
npm run dev
```
The dev server starts at `http://localhost:5173`.

### Build for production
```bash
npm run build       # Type-checks then bundles
npm run preview     # Preview the production build locally
```

### Linting
```bash
npm run lint
```

---

## Mock Mode

`src/services/resumeApi.ts` exports a `MOCK_MODE` flag:

```ts
export const MOCK_MODE = true;
```

When `true`, both `extractResume()` and `reviewResume()` return hardcoded mock data with artificial delays (`2.2s` extraction, `3.5s` review) instead of calling the backend. This lets you develop and test the full UI without a running backend.

Set `MOCK_MODE = false` and ensure the backend is running on `http://localhost:8000` to use real data.

---

## State Persistence

All session state is persisted to `localStorage` so a page refresh does not lose progress.

| Storage key | Contents |
|---|---|
| `resume-review-state` | Phase, extracted text, edited resume text, job description, experience level, review result, baseline result, applied recommendation indices, step progress, dirty flags |
| `resume-review-file` | The uploaded `File` serialized as a Base64 data URL (`{ dataUrl, name }`) |

**What survives a refresh:**
- Extracted and edited resume text (including all applied improvements)
- Job description and experience level
- Full review result and baseline result (for score delta)
- Applied recommendation indices (`appliedRecommendations`)
- Step progress (`maxReachedStep`, dirty flags)
- The uploaded file (reconstructed via `atob` + `new File(...)`)

**What doesn’t survive:**
- In-flight phases (`extracting`, `reviewing`) — normalized back to the preceding stable phase on load
- Transient error messages- Applied highlight ranges (`appliedRanges`) — these are positional and would be stale after a refresh; cards still show ✓ Applied state via the persisted `appliedRecommendations` index array
- Persisted review results from before the new schema (missing `section`/`action` fields) — automatically wiped on load to prevent crashes
Calling **Start Over** (reset) removes both storage keys.

If the file is too large and writing to localStorage would exceed the quota, the file persistence step fails silently — all other state is still saved.

---

## Theming

The app supports light and dark mode. The active theme is stored in `localStorage` under `theme`. The `useTheme` hook reads this on mount, applies `data-theme="dark"` or `data-theme="light"` to `<html>`, and falls back to the OS `prefers-color-scheme` media query. All colors, spacing, and radius values are defined as CSS custom properties in `src/index.css`.

---

## Known Limitations & Shortcomings

### File Handling
- **No image support.** Resume images (`.jpg`, `.png`, `.webp`, etc.) cannot be uploaded. The file input and drop zone only accept `.pdf` and `.docx`. There is no client-side OCR or image-to-text conversion. Users with image-format resumes must convert them first.
- **No scanned PDF detection.** A PDF that is a scanned image will be accepted by the file picker but will return blank or near-blank extracted text from the backend. There is no client-side warning for this case.
- **10 MB client-side size hint only.** The "Max 10MB" label in the drop zone is UI text only — there is no JavaScript enforcement of a file size limit before upload. Oversized files are sent to the backend and may cause slow or failed requests.
- **Single file only.** There is no support for uploading multiple resume versions or comparing two resumes side by side.

### Resume Text Editing (Step 2)
- **No rich-text editor.** The extracted resume is displayed in a plain `<textarea>`. Formatting, bullet points, and layout information from the original document are lost. The user sees flat plain text.
- **Highlight overlay.** When improvements are applied via Step 3, newly inserted content is highlighted green using a transparent-textarea + absolutely-positioned overlay technique. Highlights clear automatically on manual edits (since character positions become stale).
- **No diff view.** There is no way to visually compare the original extracted text against the user’s edits. The “Reset to Original” button reverts all edits at once with no confirmation.
- **Extraction warnings are shown but not actionable.** If the backend returns `extraction_warnings`, they are displayed as a warning banner in Step 2. However, there is no automated correction — the user must fix any issues manually in the text editor.
- **Section-header matching is heuristic.** The `applyRecommendation` utility detects section boundaries by matching common header strings (e.g. “SKILLS”, “Technical Skills”, “Work Experience”). Non-standard or unusual section headings may not be matched, in which case the content is appended at the end of the document.

### Dashboard (Step 3)- **Actionable improvement cards** — each recommendation includes the target `section`, `action` type, `suggested_content`, and `reasoning`. Clicking **+ Add to Resume** on `append`/`insert` cards patches the resume text and highlights the insertion in green in Step 2. `replace`-type cards show a suggested rewrite and prompt manual editing.
- **Score deltas** — after re-evaluating, the original baseline score is preserved so the before → after comparison (e.g. `78 → 91  +13`) is always visible.
- **Applied counter** — `Applied: N/M` badge tracks how many improvements have been applied.
- **Re-evaluate Resume button** — appears after at least one improvement is applied; triggers a full re-score of the updated resume text.- **PDF export available.** The "Download Report" button calls `POST /resume/report` with the review result, receives a binary PDF from the backend, and triggers a browser file download via a temporary blob URL. The object URL is revoked after a short delay to ensure the download initiates before cleanup.
- **No share link.** There is no way to generate a shareable URL or copy results to the clipboard.
- **No history.** Each session is stateless. Previous analyses are not stored and cannot be retrieved.

### API & Error Handling
- **Generic error messages.** API errors display the backend's `detail` string directly (or a fallback message). There is no differentiation between network errors, rate limit errors (HTTP 429), and validation errors (HTTP 400) — the user sees a single error banner without guidance on what to do.
- **No retry mechanism.** If the API call fails due to a transient error (timeout, rate limit), the user must manually click the button again.
- **No request cancellation.** If the user navigates back during extraction or review, the in-flight `fetch` request is not cancelled.

### Accessibility
- The drag-and-drop zone has basic keyboard support (`Enter` to open the file picker) but no `role="application"` or live region announcements for drag state changes.
- Score colors in Step 3 rely on color alone to convey severity (green/blue/amber/red). There are no patterns or icons as a secondary indicator for users with color vision deficiency.

### Responsiveness
- The two-column layout in Step 2 collapses to a single column below 900px. Steps 1 and 3 are generally mobile-friendly, but Step 3's multi-card dashboard has not been optimized for very small screens.

### Testing
- There are no unit tests, integration tests, or end-to-end tests. The `MOCK_MODE` flag serves as a manual testing convenience but is not tied to any automated test suite.

### Deployment
- The backend URL is hardcoded to `http://localhost:8000` in `resumeApi.ts`. Deploying to a non-local environment requires a code change (or an environment variable approach using `import.meta.env`).
- No CI/CD pipeline or build configuration for hosting platforms is included.

---

## Original Vite Template Notes

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
