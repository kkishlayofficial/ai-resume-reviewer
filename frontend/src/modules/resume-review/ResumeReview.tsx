import { useState, useEffect } from "react";
import type { ExperienceLevel, ResumeReviewResponse } from "../../types/resume";
import { applyRecommendationToText } from "./utils/applyRecommendation";
import {
  extractResume,
  reviewResume,
  getReport,
} from "../../services/resumeApi";
import styles from "./ResumeReview.module.css";
import { StepWizard } from "./StepWizard/StepWizard";
import { Step1Upload } from "./Step1Upload/Step1Upload";
import { ExtractionLoading } from "./ExtractionLoading/ExtractionLoading";
import { Step2Verify } from "./Step2Verify/Step2Verify";
import { AnalysisLoading } from "./AnalysisLoading/AnalysisLoading";
import { Step3Dashboard } from "./Step3Dashboard/Step3Dashboard";

type Phase = "upload" | "extracting" | "verify" | "reviewing" | "dashboard";

interface AppliedRange {
  start: number;
  end: number;
  recIndex: number;
}

interface State {
  phase: Phase;
  file: File | null;
  extractedText: string; // original extracted text (for Reset to Original)
  editedResumeText: string; // user-edited version of the resume text
  extractionWarnings: string[]; // warnings returned by the extraction API
  jobDescription: string; // persisted across step navigation
  experienceLevel: ExperienceLevel; // persisted across step navigation
  reviewResult: ResumeReviewResponse | null;
  baselineResult: ResumeReviewResponse | null; // first review result — never overwritten on re-evaluate
  appliedRecommendations: number[]; // indices of applied recs, persisted
  appliedRanges: AppliedRange[]; // transient highlight ranges — not persisted
  error: string | null;
  maxReachedStep: 1 | 2 | 3; // highest step ever successfully reached — survives back-navigation
  step1Dirty: boolean; // file changed after extraction — step 2+ locked until re-extract
  step2Dirty: boolean; // step 2 fields changed after review — step 3 locked until re-review
}

const INITIAL_STATE: State = {
  phase: "upload",
  file: null,
  extractedText: "",
  editedResumeText: "",
  extractionWarnings: [],
  jobDescription: "",
  experienceLevel: "mid",
  reviewResult: null,
  baselineResult: null,
  appliedRecommendations: [],
  appliedRanges: [],
  error: null,
  maxReachedStep: 1,
  step1Dirty: false,
  step2Dirty: false,
};

const STORAGE_KEY = "resume-review-state";
const FILE_STORAGE_KEY = "resume-review-file";

// Persisted shape excludes File (handled separately), transient error, and transient highlight ranges
type PersistedState = Omit<State, "file" | "error" | "appliedRanges">;

function loadPersistedFile(): File | null {
  try {
    const raw = localStorage.getItem(FILE_STORAGE_KEY);
    if (!raw) return null;
    const { dataUrl, name } = JSON.parse(raw) as {
      dataUrl: string;
      name: string;
    };
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], name, { type: mime });
  } catch {
    return null;
  }
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as PersistedState;

    // Discard any persisted reviewResult / baselineResult whose recommendations
    // predate the new schema (missing `section` field) to avoid runtime crashes.
    const hasStaleRecs = (result: ResumeReviewResponse | null) =>
      result?.recommendations?.some((r) => !("section" in r)) ?? false;
    if (hasStaleRecs(parsed.reviewResult) || hasStaleRecs(parsed.baselineResult)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILE_STORAGE_KEY);
      return INITIAL_STATE;
    }

    // Normalize in-flight phases — they cannot be resumed after a page refresh
    const phase: Phase =
      parsed.phase === "extracting"
        ? "upload"
        : parsed.phase === "reviewing"
          ? "verify"
          : parsed.phase;
    const file = loadPersistedFile();
    return { ...INITIAL_STATE, ...parsed, phase, file, error: null };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: State): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { file: _file, error: _error, appliedRanges: _appliedRanges, ...toSave } = state;
  // Don't persist in-flight phases
  const phase: Phase =
    toSave.phase === "extracting"
      ? "upload"
      : toSave.phase === "reviewing"
        ? "verify"
        : toSave.phase;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...toSave, phase }));
}

function phaseToStep(phase: Phase): 1 | 2 | 3 {
  if (phase === "upload" || phase === "extracting") return 1;
  if (phase === "verify" || phase === "reviewing") return 2;
  return 3;
}

// Completed steps are all steps up to maxReachedStep, minus the current step
function completedStepsFor(
  maxReachedStep: 1 | 2 | 3,
  currentStep: 1 | 2 | 3,
): number[] {
  return Array.from({ length: maxReachedStep }, (_, i) => i + 1).filter(
    (s) => s !== currentStep,
  );
}

export function ResumeReview() {
  const [state, setState] = useState<State>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Serialize the File object separately as a Base64 data URL
  useEffect(() => {
    if (!state.file) {
      localStorage.removeItem(FILE_STORAGE_KEY);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem(
          FILE_STORAGE_KEY,
          JSON.stringify({ dataUrl: reader.result, name: state.file!.name }),
        );
      } catch {
        // Quota exceeded — silently skip file persistence
      }
    };
    reader.readAsDataURL(state.file);
  }, [state.file]);

  const handleExtract = async (file: File) => {
    setState((s) => ({ ...s, phase: "extracting", file, error: null }));
    try {
      const result = await extractResume(file);
      console.log("Extracted text:", result.extracted_text);
      setState((s) => ({
        ...s,
        phase: "verify",
        extractedText: result.extracted_text,
        // Only reset edited text when a new file is extracted
        editedResumeText: result.extracted_text,
        extractionWarnings: result.extraction_warnings,
        step1Dirty: false,
        step2Dirty: false, // new extraction invalidates any prior review
        maxReachedStep: Math.max(s.maxReachedStep, 2) as 1 | 2 | 3,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        phase: "upload",
        error:
          e instanceof Error
            ? e.message
            : "Extraction failed. Please try again.",
      }));
    }
  };

  const handleReview = async (
    resumeText: string,
    jobDescription: string,
    level: ExperienceLevel,
  ) => {
    // Persist Step 2 values before transitioning to reviewing
    setState((s) => ({
      ...s,
      phase: "reviewing",
      editedResumeText: resumeText,
      jobDescription,
      experienceLevel: level,
      error: null,
    }));

    console.log("Reviewing with:", { resumeText, jobDescription, level });
    try {
      const result = await reviewResume({
        resume_text: resumeText,
        job_description: jobDescription,
        experience_level: level,
      });
      setState((s) => ({
        ...s,
        phase: "dashboard",
        reviewResult: result,
        baselineResult: s.baselineResult ?? result, // only set on the first review
        appliedRecommendations: [], // new rec set — reset applied indices
        appliedRanges: [],
        step2Dirty: false,
        maxReachedStep: 3,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        phase: "verify",
        error:
          e instanceof Error ? e.message : "Review failed. Please try again.",
      }));
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FILE_STORAGE_KEY);
    setState(INITIAL_STATE);
    setTimeout(() => {
      document.getElementById("review")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };
  const handleBack = () => setState((s) => ({ ...s, phase: "upload" }));

  // Called by Step1Upload whenever user actively picks / clears a file
  const handleFileChange = (newFile: File | null) => {
    // When a different file is selected, wipe all prior progress so the
    // wizard starts fresh with the new file
    if (newFile !== null && newFile !== state.file) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILE_STORAGE_KEY);
      setState({ ...INITIAL_STATE, file: newFile });
      return;
    }
    if (newFile === null) {
      localStorage.removeItem(FILE_STORAGE_KEY);
      setState({ ...INITIAL_STATE });
    }
  };

  // Step 2 field change handlers — mark dirty only when a review result already exists
  const handleResumeTextChange = (text: string) => {
    setState((s) => ({
      ...s,
      editedResumeText: text,
      appliedRanges: [], // positions become stale after manual edits
      step2Dirty: s.reviewResult !== null || s.step2Dirty,
    }));
  };

  const handleApplyRecommendation = (index: number) => {
    const rec = state.reviewResult?.recommendations[index];
    if (!rec || rec.action === "replace") return;
    const { newText, insertedStart, insertedEnd } = applyRecommendationToText(
      state.editedResumeText,
      rec.section,
      rec.action,
      rec.suggested_content,
    );
    setState((s) => ({
      ...s,
      editedResumeText: newText,
      appliedRecommendations: [...s.appliedRecommendations, index],
      appliedRanges: [
        ...s.appliedRanges,
        { start: insertedStart, end: insertedEnd, recIndex: index },
      ],
      step2Dirty: true,
    }));
  };

  const handleReEvaluate = () => {
    handleReview(
      state.editedResumeText,
      state.jobDescription,
      state.experienceLevel,
    );
  };

  const handleJobDescriptionChange = (jd: string) => {
    setState((s) => ({
      ...s,
      jobDescription: jd,
      step2Dirty: s.reviewResult !== null || s.step2Dirty,
    }));
  };

  const handleExperienceLevelChange = (lvl: ExperienceLevel) => {
    setState((s) => ({
      ...s,
      experienceLevel: lvl,
      step2Dirty: s.reviewResult !== null || s.step2Dirty,
    }));
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    const current = phaseToStep(state.phase);
    if (step === current) return; // already here
    if (step > state.maxReachedStep) return; // not yet unlocked
    if (step >= 2 && state.step1Dirty) return; // file changed — must re-extract first
    if (step === 3 && state.step2Dirty) return; // step 2 changed — must re-review first
    if (step === 1) setState((s) => ({ ...s, phase: "upload", error: null }));
    if (step === 2) setState((s) => ({ ...s, phase: "verify", error: null }));
    if (step === 3)
      setState((s) => ({ ...s, phase: "dashboard", error: null }));
  };

  const handleDownloadReport = async () => {
    try {
      const response = await getReport(state.reviewResult!);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "resume-analysis-report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay revocation so the browser has time to initiate the download
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (e) {
      console.log(e);
    }
  };

  const currentStep = phaseToStep(state.phase);
  const completedSteps = completedStepsFor(state.maxReachedStep, currentStep);

  // Steps that are completed but locked due to upstream changes
  const lockedSteps: number[] = [];
  if (state.step1Dirty) {
    if (completedSteps.includes(2)) lockedSteps.push(2);
    if (completedSteps.includes(3)) lockedSteps.push(3);
  }
  if (state.step2Dirty && completedSteps.includes(3)) {
    lockedSteps.push(3);
  }

  return (
    <section
      id='review'
      className={styles.section}
      aria-labelledby='review-heading'
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 id='review-heading' className={styles.sectionTitle}>
            Resume Review in 3 Simple Steps
          </h2>
          <p className={styles.sectionSub}>
            Upload your resume, verify the extracted content, and receive a
            comprehensive AI evaluation.
          </p>
        </div>

        <StepWizard
          currentStep={currentStep}
          completedSteps={completedSteps}
          lockedSteps={lockedSteps}
          onStepClick={handleStepClick}
        />

        {state.error && (
          <div className={styles.errorBanner} role='alert'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
            {state.error}
          </div>
        )}

        {state.phase === "upload" && (
          <Step1Upload
            onExtract={handleExtract}
            initialFile={state.file}
            onFileChange={handleFileChange}
          />
        )}

        {state.phase === "extracting" && <ExtractionLoading />}

        {state.phase === "verify" && (
          <Step2Verify
            extractedText={state.extractedText}
            resumeText={state.editedResumeText}
            extractionWarnings={state.extractionWarnings}
            jobDescription={state.jobDescription}
            experienceLevel={state.experienceLevel}
            onResumeTextChange={handleResumeTextChange}
            onJobDescriptionChange={handleJobDescriptionChange}
            onExperienceLevelChange={handleExperienceLevelChange}
            onReview={handleReview}
            onBack={handleBack}
            appliedRanges={state.appliedRanges}
          />
        )}

        {state.phase === "reviewing" && <AnalysisLoading />}

        {state.phase === "dashboard" && state.reviewResult && (
          <Step3Dashboard
            result={state.reviewResult}
            baselineResult={state.baselineResult}
            appliedRecommendations={state.appliedRecommendations}
            onApplyRecommendation={handleApplyRecommendation}
            onReEvaluate={handleReEvaluate}
            onReset={handleReset}
            handleDownloadReport={handleDownloadReport}
          />
        )}
      </div>
    </section>
  );
}
