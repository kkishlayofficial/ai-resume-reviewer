import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { ExperienceLevel } from '../../../types/resume';
import styles from './Step2Verify.module.css';
import { Button } from '../../../components/ui/Button/Button';

interface AppliedRange {
  start: number;
  end: number;
  recIndex: number;
}

function renderHighlightedText(
  text: string,
  ranges: AppliedRange[],
): ReactNode {
  if (ranges.length === 0) return text;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let pos = 0;
  for (const range of sorted) {
    if (range.start > pos) parts.push(text.slice(pos, range.start));
    const content = text.slice(range.start, range.end);
    if (content) {
      parts.push(
        <mark key={`${range.recIndex}-${range.start}`} className={styles.highlightMark}>
          {content}
        </mark>,
      );
    }
    pos = range.end;
  }
  if (pos < text.length) parts.push(text.slice(pos));
  return parts;
}

interface Step2VerifyProps {
  extractedText: string;
  resumeText: string;
  extractionWarnings: string[];
  jobDescription: string;
  experienceLevel: ExperienceLevel;
  onResumeTextChange: (text: string) => void;
  onJobDescriptionChange: (jd: string) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
  onReview: (resumeText: string, jobDescription: string, level: ExperienceLevel) => void;
  onBack: () => void;
  appliedRanges: AppliedRange[];
}

export function Step2Verify({
  extractedText,
  resumeText,
  extractionWarnings,
  jobDescription,
  experienceLevel,
  onResumeTextChange,
  onJobDescriptionChange,
  onExperienceLevelChange,
  onReview,
  onBack,
  appliedRanges,
}: Step2VerifyProps) {
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
  const overlayInnerRef = useRef<HTMLDivElement>(null);
  const hasHighlights = appliedRanges.length > 0;

  const handleResumeScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayInnerRef.current) {
      overlayInnerRef.current.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;
    }
  };

  const canReview = resumeText.trim().length >= 200 && jobDescription.trim().length >= 50;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* ── Left: Resume text ─────────────────────────────────────────── */}
        <div className={styles.leftCol}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Extracted Resume</h2>
          </div>

          <div className={styles.infoBanner} role="note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Review the extracted content before analysis to ensure formatting issues do not affect AI evaluation.
          </div>

          {extractionWarnings.length > 0 && (
            <ul className={styles.warningList} role="list" aria-label="Extraction warnings">
              {extractionWarnings.map((w, i) => (
                <li key={i} className={styles.warningItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {w}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              value={resumeText}
              onChange={(e) => onResumeTextChange(e.target.value)}
              onScroll={handleResumeScroll}
              aria-label="Extracted resume text"
              spellCheck={false}
              style={hasHighlights ? { color: 'transparent', caretColor: 'var(--color-text)', background: 'transparent' } : undefined}
            />
            {hasHighlights && (
              <div className={styles.textareaOverlay} aria-hidden="true">
                <div ref={overlayInnerRef}>
                  {renderHighlightedText(resumeText, appliedRanges)}
                </div>
              </div>
            )}
          </div>

          <div className={styles.textareaFooter}>
            <span className={styles.wordCount}>{wordCount} words</span>
            <button
              className={styles.resetBtn}
              onClick={() => onResumeTextChange(extractedText)}
              aria-label="Reset to original extracted text"
            >
              Reset to Original
            </button>
          </div>
        </div>

        {/* ── Right: JD + Level + Actions ────────────────────────────── */}
        <div className={styles.rightCol}>
          {/* Job Description */}
          <div className={`${styles.rightCard} ${styles.rightCardGrow}`}>
            <label htmlFor="jd-input" className={styles.rightCardTitle}>
              Job Description
            </label>
            <textarea
              id="jd-input"
              className={`${styles.textarea} ${styles.textareaShort}`}
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
            />
            {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
              <p className={styles.fieldHint}>Minimum 50 characters required</p>
            )}
          </div>

          {/* Experience Level */}
          <div className={styles.rightCard}>
            <label htmlFor="level-select" className={styles.rightCardTitle}>
              Experience Level
            </label>
            <select
              id="level-select"
              className={styles.select}
              value={experienceLevel}
              onChange={(e) => onExperienceLevelChange(e.target.value as ExperienceLevel)}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!canReview}
              onClick={() => onReview(resumeText, jobDescription, experienceLevel)}
              title={!canReview ? 'Resume text (200+ chars) and job description (50+ chars) are required' : undefined}
            >
              Review Resume
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
