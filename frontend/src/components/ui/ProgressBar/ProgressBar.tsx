import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0–100
  animated?: boolean;
}

export function ProgressBar({ value, animated = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`${styles.fill} ${animated ? styles.animated : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
