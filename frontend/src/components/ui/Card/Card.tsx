import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'xs' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export function Card({
  children,
  padding = 'md',
  shadow = 'sm',
  border = true,
  className,
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    styles[`padding-${padding}`],
    styles[`shadow-${shadow}`],
    border ? styles.border : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
