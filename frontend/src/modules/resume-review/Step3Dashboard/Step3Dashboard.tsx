import type { ResumeReviewResponse } from '../../../types/resume';
import styles from './Step3Dashboard.module.css';
import { CircularScore } from '../../../components/ui/CircularScore/CircularScore';
import { Chip } from '../../../components/ui/Chip/Chip';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Card } from '../../../components/ui/Card/Card';

interface ScoreCardProps {
  label: string;
  score: number;
  reasoning: string;
  delta?: number;
}

function ScoreCard({ label, score, reasoning, delta }: ScoreCardProps) {
  const color =
    score >= 90 ? '#16A34A' : score >= 75 ? '#2563EB' : score >= 50 ? '#D97706' : '#DC2626';

  return (
    <div className={styles.scoreCard}>
      <div className={styles.scoreCardTop}>
        <span className={styles.scoreCardLabel}>{label}</span>
        <div className={styles.scoreValueGroup}>
          <span className={styles.scoreCardValue} style={{ color }}>
            {score}
          </span>
          {delta != null && delta !== 0 && (
            <span
              className={`${styles.scoreDeltaBadge} ${
                delta > 0 ? styles.scoreDeltaBadgePos : styles.scoreDeltaBadgeNeg
              }`}
            >
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>
      </div>
      <div className={styles.scoreCardBar}>
        <div className={styles.scoreBarTrack}>
          <div
            className={styles.scoreBarFill}
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <p className={styles.scoreCardReasoning}>{reasoning}</p>
    </div>
  );
}

interface Step3DashboardProps {
  result: ResumeReviewResponse;
  baselineResult: ResumeReviewResponse | null;
  appliedRecommendations: number[];
  rejectedRecommendations: number[];
  onApplyRecommendation: (index: number) => void;
  onRejectRecommendation: (index: number) => void;
  onReEvaluate: () => void;
  onReset: () => void;
  handleDownloadReport: () => void;
  handleDownloadResume: (format: 'pdf' | 'docx') => void;
}

export function Step3Dashboard({
  result,
  baselineResult,
  appliedRecommendations,
  rejectedRecommendations,
  onApplyRecommendation,
  onRejectRecommendation,
  onReEvaluate,
  onReset,
  handleDownloadReport,
  handleDownloadResume,
}: Step3DashboardProps) {
  const {
    overall_score,
    ats_score,
    technical_score,
    communication_score,
    summary,
    skills,
    strengths,
    weaknesses,
    missing_keywords,
    recommendations,
    job_fit,
  } = result;

  const overallDelta = baselineResult ? overall_score - baselineResult.overall_score : null;
  const atsDelta = baselineResult ? ats_score.score - baselineResult.ats_score.score : undefined;
  const techDelta = baselineResult ? technical_score.score - baselineResult.technical_score.score : undefined;
  const commDelta = baselineResult ? communication_score.score - baselineResult.communication_score.score : undefined;
  const hasApplied = appliedRecommendations.length > 0;

  return (
    <div className={styles.dashboard}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={styles.dashHeader}>
        <h2 className={styles.dashTitle}>Resume Evaluation Report</h2>
        <p className={styles.dashSub}>AI-powered analysis with explainable scores</p>
      </div>

      {/* ── Overall Score ────────────────────────────────────────────── */}
      <Card shadow="md" className={styles.overallCard}>
        <div className={styles.overallInner}>
          <CircularScore score={overall_score} size={160} strokeWidth={12} />
          <div className={styles.overallInfo}>
            <h3 className={styles.overallLabel}>Overall Score</h3>            {overallDelta !== null && overallDelta !== 0 && (
              <div className={styles.overallDeltaRow}>
                <span className={styles.overallDeltaFrom}>{baselineResult!.overall_score}</span>
                <span className={styles.overallDeltaArrow}>→</span>
                <span className={styles.overallDeltaTo}>{overall_score}</span>
                <span
                  className={`${styles.overallDeltaPill} ${
                    overallDelta > 0 ? styles.overallDeltaPillPos : styles.overallDeltaPillNeg
                  }`}
                >
                  {overallDelta > 0 ? '+' : ''}{overallDelta}
                </span>
              </div>
            )}            <p className={styles.overallDesc}>
              Weighted score — 30% ATS · 50% Technical · 20% Communication
            </p>
          </div>
        </div>
      </Card>

      {/* ── 3 Score Cards ────────────────────────────────────────────── */}
      <div className={styles.scoreGrid}>
        <ScoreCard label="ATS Score" score={ats_score.score} reasoning={ats_score.reasoning} delta={atsDelta} />
        <ScoreCard label="Technical Score" score={technical_score.score} reasoning={technical_score.reasoning} delta={techDelta} />
        <ScoreCard label="Communication Score" score={communication_score.score} reasoning={communication_score.reasoning} delta={commDelta} />
      </div>

      {/* ── Summary ───────────────────────────────────────────────────── */}
      <Card shadow="sm" className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.summaryText}>{summary}</p>
      </Card>

      {/* ── Skills ────────────────────────────────────────────────────── */}
      <Card shadow="sm" className={styles.section}>
        <h3 className={styles.sectionTitle}>Skills</h3>
        <div className={styles.chipSet} role="list" aria-label="Detected skills">
          {skills.map((s) => (
            <div key={s} role="listitem">
              <Chip label={s} variant="primary" />
            </div>
          ))}
        </div>
      </Card>

      {/* ── Strengths + Weaknesses ────────────────────────────────────── */}
      <div className={styles.swGrid}>
        <Card shadow="sm" className={styles.swCard}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.strengthDot} aria-hidden="true" />
            Strengths
          </h3>
          <ul className={styles.bulletList} role="list">
            {strengths.map((s, i) => (
              <li key={i} className={styles.bulletItem}>
                <span className={styles.bulletIconGreen} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="#DCFCE7" />
                    <path d="M4 7l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card shadow="sm" className={styles.swCard}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.weaknessDot} aria-hidden="true" />
            Weaknesses
          </h3>
          <ul className={styles.bulletList} role="list">
            {weaknesses.map((w, i) => (
              <li key={i} className={styles.bulletItem}>
                <span className={styles.bulletIconRed} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="#FEE2E2" />
                    <path d="M5 5l4 4M9 5l-4 4" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── Missing Keywords ──────────────────────────────────────────── */}
      <Card shadow="sm" className={styles.section}>
        <h3 className={styles.sectionTitle}>Missing Keywords</h3>
        <div className={styles.chipSet} role="list" aria-label="Missing keywords">
          {missing_keywords.map((kw) => (
            <div key={kw} role="listitem">
              <Chip label={kw} variant="danger" />
            </div>
          ))}
        </div>
      </Card>

      {/* ── Actionable Improvements ──────────────────────────────────────────────────── */}
      <Card shadow="sm" className={styles.section}>
        <div className={styles.recSectionHeader}>
          <h3 className={styles.sectionTitle}>Actionable Improvements</h3>
          {appliedRecommendations.length > 0 && (
            <span className={styles.appliedCounter}>
              Applied: {appliedRecommendations.length}/{recommendations.length}
            </span>
          )}
        </div>
        <div className={styles.recList}>
          {recommendations.map((rec, i) => {
            const isApplied = appliedRecommendations.includes(i);
            const isRejected = rejectedRecommendations.includes(i);
            const isReplace = rec.operation === 'replace';
            return (
              <div
                key={i}
                className={`${styles.recCard} ${isApplied ? styles.recCardApplied : ''}`}
              >
                <div className={styles.recHeader}>
                  <Badge priority={rec.priority} />
                  <h4 className={styles.recTitle}>{rec.title}</h4>
                  {rec.section && (
                    <span className={styles.recSectionTag}>
                      {rec.section.charAt(0).toUpperCase() + rec.section.slice(1)}
                    </span>
                  )}
                </div>

                {/* Diff view for replace; content box for append */}
                {isReplace && rec.target ? (
                  <div className={styles.diffContainer}>
                    <div className={styles.diffOld}>{rec.target}</div>
                    <div className={styles.diffNew}>{rec.content}</div>
                  </div>
                ) : (
                  <div className={styles.recContentBox}>
                    <span className={styles.recContentLabel}>Suggested Content</span>
                    <pre className={styles.recContent}>{rec.content}</pre>
                  </div>
                )}

                <p className={styles.recReasoning}>
                  <span className={styles.recReasoningLabel}>Reason: </span>
                  {rec.reasoning}
                </p>

                <div className={styles.recFooter}>
                  {isApplied ? (
                    <span className={styles.recAppliedBadge}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <circle cx="6" cy="6" r="6" fill="#16A34A" />
                        <path d="M3 6l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Applied
                    </span>
                  ) : isRejected ? (
                    <span className={styles.recRejectedNote}>Rejected</span>
                  ) : isReplace ? (
                    <div className={styles.diffActions}>
                      <button
                        className={styles.patchAcceptBtn}
                        onClick={() => onApplyRecommendation(i)}
                        aria-label={`Accept change: ${rec.title}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Accept
                      </button>
                      <button
                        className={styles.patchRejectBtn}
                        onClick={() => onRejectRecommendation(i)}
                        aria-label={`Reject change: ${rec.title}`}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.recAddBtn}
                      onClick={() => onApplyRecommendation(i)}
                      aria-label={`Add to resume: ${rec.title}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Add to Resume
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Job Fit ───────────────────────────────────────────────────── */}
      <div className={`${styles.jobFitCard} ${job_fit.fit ? styles.jobFitGreen : styles.jobFitRed}`}>
        <div className={styles.jobFitHeader}>
          <span className={styles.jobFitIcon} aria-hidden="true">
            {job_fit.fit ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#16A34A" />
                <path d="M5 10l3.5 3.5L15 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#DC2626" />
                <path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <h3 className={styles.jobFitTitle}>
            {job_fit.fit ? 'Good Fit' : 'Not a Strong Fit'}
          </h3>
        </div>
        <p className={styles.jobFitExplanation}>{job_fit.explanation}</p>
      </div>

      {/* ── Download Updated Resume ───────────────────────────────────── */}
      <Card shadow="sm" className={styles.section}>
        <div className={styles.downloadResumeSection}>
          <span className={styles.downloadResumeLabel}>Download Updated Resume</span>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', margin: 0 }}>
            Download your resume (with all applied improvements) in your preferred format.
          </p>
          <div className={styles.downloadFormatGroup}>
            <button
              className={styles.downloadResumeBtn}
              onClick={() => handleDownloadResume('docx')}
              aria-label="Download resume as DOCX"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Download as DOCX
            </button>
            <button
              className={styles.downloadResumeBtn}
              onClick={() => handleDownloadResume('pdf')}
              aria-label="Download resume as PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Download as PDF
            </button>
          </div>
        </div>
      </Card>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className={styles.dashActions}>
        {hasApplied && (
          <Button variant="primary" size="lg" onClick={onReEvaluate}>
            Re-evaluate Resume
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={handleDownloadReport}>
          Download Report
        </Button>
        <Button variant={hasApplied ? 'secondary' : 'primary'} size="lg" onClick={onReset}>
          Review Another Resume
        </Button>
      </div>
    </div>
  );
}
