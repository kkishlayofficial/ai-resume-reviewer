import type { Priority } from '../../../types/resume';
import styles from './Badge.module.css';

interface BadgeProps {
  priority: Priority;
}

const LABEL: Record<Priority, string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

export function Badge({ priority }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[priority]}`}>
      {LABEL[priority]}
    </span>
  );
}
