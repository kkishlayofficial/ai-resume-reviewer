import { useEffect, useState } from 'react';
import styles from './ExtractionLoading.module.css';
import { ProgressBar } from '../../../components/ui/ProgressBar/ProgressBar';

interface ExtractionLoadingProps {
  phase?: 'extracting' | 'parsing';
}

const EXTRACTION_STEPS = [
  { label: 'Parsing document', duration: 700 },
  { label: 'Analyzing formatting', duration: 800 },
  { label: 'Preparing editable content', duration: 700 },
];

const PARSING_STEPS = [
  { label: 'Parsing resume structure', duration: 700 },
  { label: 'Identifying sections', duration: 800 },
  { label: 'Building resume model', duration: 700 },
];

export function ExtractionLoading({ phase = 'extracting' }: ExtractionLoadingProps) {
  const isParsing = phase === 'parsing';
  const STEPS = isParsing ? PARSING_STEPS : EXTRACTION_STEPS;

  const [progress, setProgress] = useState(isParsing ? 50 : 5);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setProgress(isParsing ? 50 : 5);
    setActiveStep(0);

    const targetMax = isParsing ? 97 : 47;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 3, targetMax);
        return next;
      });
    }, 80);

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => setActiveStep(i), elapsed);
      timers.push(t);
      elapsed += step.duration;
    });

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const title = isParsing
    ? 'Structuring your resume...'
    : 'Extracting text from your resume...';

  return (
    <div className={styles.wrapper} role="status" aria-live="polite" aria-label={title}>
      <div className={styles.card}>
        <div className={styles.spinnerWrapper} aria-hidden="true">
          <div className={styles.spinner} />
        </div>

        <h2 className={styles.title}>{title}</h2>

        {isParsing && (
          <p className={styles.subtitle}>Converting extracted text into a structured resume model</p>
        )}

        <div className={styles.progressWrapper}>
          <ProgressBar value={progress} animated />
        </div>

        <ul className={styles.steps} role="list">
          {STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <li
                key={step.label}
                className={`${styles.step} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.stepIcon} aria-hidden="true">
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="#DCFCE7" />
                      <path d="M4 7l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isActive ? (
                    <span className={styles.dotActive} />
                  ) : (
                    <span className={styles.dotFuture} />
                  )}
                </span>
                {step.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
