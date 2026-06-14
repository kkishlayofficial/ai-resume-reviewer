import { useEffect, useState } from 'react';
import styles from './ExtractionLoading.module.css';
import { ProgressBar } from '../../../components/ui/ProgressBar/ProgressBar';

const STEPS = [
  { label: 'Parsing PDF', duration: 700 },
  { label: 'Analyzing formatting', duration: 800 },
  { label: 'Preparing editable content', duration: 700 },
];

export function ExtractionLoading() {
  const [progress, setProgress] = useState(5);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 4, 95);
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
  }, []);

  return (
    <div className={styles.wrapper} role="status" aria-live="polite" aria-label="Extracting resume content">
      <div className={styles.card}>
        <div className={styles.spinnerWrapper} aria-hidden="true">
          <div className={styles.spinner} />
        </div>

        <h2 className={styles.title}>Extracting text from your resume...</h2>

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
