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
}

function ScoreCard({ label, score, reasoning }: ScoreCardProps) {
  const color =
    score >= 90 ? '#16A34A' : score >= 75 ? '#2563EB' : score >= 50 ? '#D97706' : '#DC2626';

  return (
    <div className={styles.scoreCard}>
      <div className={styles.scoreCardTop}>
        <span className={styles.scoreCardLabel}>{label}</span>
        <span className={styles.scoreCardValue} style={{ color }}>
          {score}
        </span>
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
  onReset: () => void;
  handleDownloadReport: () => void;
}

export function Step3Dashboard({ result, onReset, handleDownloadReport }: Step3DashboardProps) {
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
            <h3 className={styles.overallLabel}>Overall Score</h3>
            <p className={styles.overallDesc}>
              Weighted score — 30% ATS · 50% Technical · 20% Communication
            </p>
          </div>
        </div>
      </Card>

      {/* ── 3 Score Cards ────────────────────────────────────────────── */}
      <div className={styles.scoreGrid}>
        <ScoreCard label="ATS Score" score={ats_score.score} reasoning={ats_score.reasoning} />
        <ScoreCard label="Technical Score" score={technical_score.score} reasoning={technical_score.reasoning} />
        <ScoreCard label="Communication Score" score={communication_score.score} reasoning={communication_score.reasoning} />
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

      {/* ── Recommendations ───────────────────────────────────────────── */}
      <Card shadow="sm" className={styles.section}>
        <h3 className={styles.sectionTitle}>Recommendations</h3>
        <div className={styles.recList}>
          {recommendations.map((rec, i) => (
            <div key={i} className={styles.recCard}>
              <div className={styles.recHeader}>
                <Badge priority={rec.priority} />
                <h4 className={styles.recTitle}>{rec.title}</h4>
              </div>
              <p className={styles.recText}>{rec.recommendation}</p>
            </div>
          ))}
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

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className={styles.dashActions}>
        <Button variant="secondary" size="lg" onClick={handleDownloadReport}>
          Download Report
        </Button>
        <Button variant="primary" size="lg" onClick={onReset}>
          Review Another Resume
        </Button>
      </div>
    </div>
  );
}
