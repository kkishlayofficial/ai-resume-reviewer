import { useEffect, useState } from 'react';
import styles from './AnalysisLoading.module.css';

const MESSAGES = [
  'Analyzing Resume...',
  'Matching against Job Description...',
  'Calculating ATS Score...',
  'Evaluating Technical Skills...',
  'Generating Recommendations...',
];

export function AnalysisLoading() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setActiveIndex((i) => (i < MESSAGES.length - 1 ? i + 1 : i));
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 70);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={styles.wrapper} role="status" aria-live="polite" aria-label="Analyzing resume">
      <div className={styles.card}>
        <div className={styles.orbitWrapper} aria-hidden="true">
          <div className={styles.orbitRing} />
          <div className={styles.orbitRing2} />
          <div className={styles.orbitCore} />
        </div>

        <h2 className={styles.title}>Analyzing Resume</h2>

        <ul className={styles.messages} role="list">
          {MESSAGES.map((msg, i) => (
            <li
              key={msg}
              className={`${styles.message} ${i === activeIndex ? styles.messageActive : ''} ${i < activeIndex ? styles.messageDone : ''}`}
            >
              <span className={styles.msgIcon} aria-hidden="true">
                {i < activeIndex ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="#DCFCE7" />
                    <path d="M4 7l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : i === activeIndex ? (
                  <span className={styles.activeDot} />
                ) : (
                  <span className={styles.futureDot} />
                )}
              </span>
              {msg}
            </li>
          ))}
        </ul>

        <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <p className={styles.estimate}>Estimated completion: 3–5 seconds</p>
      </div>
    </div>
  );
}
