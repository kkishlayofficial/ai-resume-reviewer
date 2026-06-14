import styles from './Chip.module.css';

interface ChipProps {
  label: string;
  variant?: 'default' | 'danger' | 'primary';
}

export function Chip({ label, variant = 'default' }: ChipProps) {
  return (
    <span className={`${styles.chip} ${styles[variant]}`}>{label}</span>
  );
}
