import { useState, useEffect, useRef } from "react";
import type { ExperienceLevel, ResumeReviewResponse, Resume } from "../../types/resume";
import { applyPatch } from "./utils/applyPatch";
import { resumeToText } from "./utils/resumeToText";
import {
  extractResume,
  parseResume,
  reviewResume,
  getReport,
  downloadResume,
} from "../../services/resumeApi";
import styles from "./ResumeReview.module.css";
import { StepWizard } from "./StepWizard/StepWizard";
import { Step1Upload } from "./Step1Upload/Step1Upload";
import { ExtractionLoading } from "./ExtractionLoading/ExtractionLoading";
import { Step2Verify } from "./Step2Verify/Step2Verify";
import { AnalysisLoading } from "./AnalysisLoading/AnalysisLoading";
import { Step3Dashboard } from "./Step3Dashboard/Step3Dashboard";

type Phase = "upload" | "extracting" | "parsing" | "verify" | "reviewing" | "dashboard";

interface State {
  phase: Phase;
  file: File | null;
  extractedText: string;            // raw text from extraction (for reference)
  extractionWarnings: string[];
  parsedResume: Resume | null;      // original parsed model — never mutated
  editedResume: Resume | null;      // user-edited version (this is what gets reviewed)
  jobDescription: string;
  experienceLevel: ExperienceLevel;
  reviewResult: ResumeReviewResponse | null;
  baselineResult: ResumeReviewResponse | null;
  appliedRecommendations: number[];
  rejectedRecommendations: number[];
  error: string | null;
  maxReachedStep: 1 | 2 | 3;
  step1Dirty: boolean;
  step2Dirty: boolean;
  recommendationAddedContents: string[];
}

const INITIAL_STATE: State = {
  phase: "upload",
  file: null,
  extractedText: "",
  extractionWarnings: [],
  parsedResume: null,
  editedResume: null,
  jobDescription: "",
  experienceLevel: "mid",
  reviewResult: null,
  baselineResult: null,
  appliedRecommendations: [],
  rejectedRecommendations: [],
  error: null,
  maxReachedStep: 1,
  step1Dirty: false,
  step2Dirty: false,
  recommendationAddedContents: [],
};

const STORAGE_KEY = "resume-review-state-v2";
const FILE_STORAGE_KEY = "resume-review-file";

type PersistedState = Omit<State, "file" | "error">;

function loadPersistedFile(): File | null {
  try {
    const raw = localStorage.getItem(FILE_STORAGE_KEY);
    if (!raw) return null;
    const { dataUrl, name } = JSON.parse(raw) as { dataUrl: string; name: string };
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

    // Discard stale state that predates the structured resume model
    if (parsed.editedResume && !("contact" in parsed.editedResume)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILE_STORAGE_KEY);
      return INITIAL_STATE;
    }

    // Discard stale reviewResult that uses old recommendation schema (missing `operation`)
    const hasStaleRecs = (result: ResumeReviewResponse | null) =>
      result?.recommendations?.some((r) => !("operation" in r)) ?? false;
    if (hasStaleRecs(parsed.reviewResult) || hasStaleRecs(parsed.baselineResult)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILE_STORAGE_KEY);
      return INITIAL_STATE;
    }

    const phase: Phase =
      parsed.phase === "extracting" || parsed.phase === "parsing"
        ? "upload"
        : parsed.phase === "reviewing"
          ? "verify"
          : parsed.phase;
    const file = loadPersistedFile();
    return { ...INITIAL_STATE, ...parsed, phase, file, error: null, recommendationAddedContents: parsed.recommendationAddedContents ?? [] };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: State): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { file: _file, error: _error, ...toSave } = state;
  const phase: Phase =
    toSave.phase === "extracting" || toSave.phase === "parsing"
      ? "upload"
      : toSave.phase === "reviewing"
        ? "verify"
        : toSave.phase;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...toSave, phase }));
}

function phaseToStep(phase: Phase): 1 | 2 | 3 {
  if (phase === "upload" || phase === "extracting" || phase === "parsing") return 1;
  if (phase === "verify" || phase === "reviewing") return 2;
  return 3;
}

function completedStepsFor(maxReachedStep: 1 | 2 | 3, currentStep: 1 | 2 | 3): number[] {
  return Array.from({ length: maxReachedStep }, (_, i) => i + 1).filter((s) => s !== currentStep);
}

export function ResumeReview() {
  const [state, setState] = useState<State>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

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
        // Quota exceeded — silently skip
      }
    };
    reader.readAsDataURL(state.file);
  }, [state.file]);

  const handleExtract = async (file: File) => {
    setState((s) => ({ ...s, phase: "extracting", file, error: null }));
    try {
      const extractResult = await extractResume(file);
      // Immediately chain into parsing phase
      setState((s) => ({ ...s, phase: "parsing" }));
      const parseResult = await parseResume(extractResult.extracted_text);
      setState((s) => ({
        ...s,
        phase: "verify",
        extractedText: extractResult.extracted_text,
        extractionWarnings: extractResult.extraction_warnings,
        parsedResume: parseResult.structured_resume,
        editedResume: parseResult.structured_resume,
        step1Dirty: false,
        step2Dirty: false,
        maxReachedStep: Math.max(s.maxReachedStep, 2) as 1 | 2 | 3,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        phase: "upload",
        error: e instanceof Error ? e.message : "Extraction failed. Please try again.",
      }));
    }
  };

  const handleReview = async (
    resume: Resume,
    jobDescription: string,
    level: ExperienceLevel,
  ) => {
    setState((s) => ({
      ...s,
      phase: "reviewing",
      editedResume: resume,
      jobDescription,
      experienceLevel: level,
      error: null,
    }));

    try {
      const resumeText = resumeToText(resume);
      const result = await reviewResume({
        resume_text: resumeText,
        job_description: jobDescription,
        experience_level: level,
      });
      setState((s) => ({
        ...s,
        phase: "dashboard",
        reviewResult: result,
        baselineResult: s.baselineResult ?? result,
        appliedRecommendations: [],
        rejectedRecommendations: [],
        recommendationAddedContents: [],
        step2Dirty: false,
        maxReachedStep: 3,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        phase: "verify",
        error: e instanceof Error ? e.message : "Review failed. Please try again.",
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

  const handleFileChange = (newFile: File | null) => {
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

  const handleResumeChange = (resume: Resume) => {
    setState((s) => ({
      ...s,
      editedResume: resume,
      step2Dirty: s.reviewResult !== null || s.step2Dirty,
    }));
  };

  const handleApplyRecommendation = (index: number) => {
    const patch = state.reviewResult?.recommendations[index];
    if (!patch || !state.editedResume) return;
    const updatedResume = applyPatch(state.editedResume, patch);
    setState((s) => ({
      ...s,
      editedResume: updatedResume,
      appliedRecommendations: [...s.appliedRecommendations, index],
      recommendationAddedContents: [...s.recommendationAddedContents, patch.content],
      step2Dirty: true,
    }));
  };

  const handleResetResume = () => {
    setState((s) => ({
      ...s,
      editedResume: s.parsedResume,
      recommendationAddedContents: [],
    }));
  };

  const handleRejectRecommendation = (index: number) => {
    setState((s) => ({
      ...s,
      rejectedRecommendations: [...s.rejectedRecommendations, index],
    }));
  };

  const wizardRef = useRef<HTMLDivElement>(null);

  const handleReEvaluate = () => {
    if (!state.editedResume) return;
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    handleReview(state.editedResume, state.jobDescription, state.experienceLevel);
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
    if (step === current) return;
    if (step > state.maxReachedStep) return;
    if (step >= 2 && state.step1Dirty) return;
    if (step === 3 && state.step2Dirty) return;
    if (step === 1) setState((s) => ({ ...s, phase: "upload", error: null }));
    if (step === 2) setState((s) => ({ ...s, phase: "verify", error: null }));
    if (step === 3) setState((s) => ({ ...s, phase: "dashboard", error: null }));
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
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadResume = async (format: "pdf" | "docx") => {
    if (!state.editedResume) return;
    try {
      await downloadResume(state.editedResume, format);
    } catch (e) {
      console.error(e);
    }
  };

  const currentStep = phaseToStep(state.phase);
  const completedSteps = completedStepsFor(state.maxReachedStep, currentStep);

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
            Upload your resume, edit the structured content, and receive a
            comprehensive AI evaluation.
          </p>
        </div>

        <div ref={wizardRef}>
        <StepWizard
          currentStep={currentStep}
          completedSteps={completedSteps}
          lockedSteps={lockedSteps}
          onStepClick={handleStepClick}
        />
        </div>

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

        {(state.phase === "extracting" || state.phase === "parsing") && (
          <ExtractionLoading phase={state.phase === "parsing" ? "parsing" : "extracting"} />
        )}

        {state.phase === "verify" && state.editedResume && (
          <Step2Verify
            parsedResume={state.parsedResume!}
            editedResume={state.editedResume}
            extractionWarnings={state.extractionWarnings}
            jobDescription={state.jobDescription}
            experienceLevel={state.experienceLevel}
            onResumeChange={handleResumeChange}
            onJobDescriptionChange={handleJobDescriptionChange}
            onExperienceLevelChange={handleExperienceLevelChange}
            onReview={handleReview}
            onBack={handleBack}
            onResetResume={handleResetResume}
            recommendationAddedContents={state.recommendationAddedContents}
          />
        )}

        {state.phase === "reviewing" && <AnalysisLoading />}

        {state.phase === "dashboard" && state.reviewResult && (
          <Step3Dashboard
            result={state.reviewResult}
            baselineResult={state.baselineResult}
            appliedRecommendations={state.appliedRecommendations}
            rejectedRecommendations={state.rejectedRecommendations}
            onApplyRecommendation={handleApplyRecommendation}
            onRejectRecommendation={handleRejectRecommendation}
            onReEvaluate={handleReEvaluate}
            onReset={handleReset}
            handleDownloadReport={handleDownloadReport}
            handleDownloadResume={handleDownloadResume}
          />
        )}
      </div>
    </section>
  );
}

