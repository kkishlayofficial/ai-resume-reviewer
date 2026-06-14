import styles from './StepWizard.module.css';

interface StepWizardProps {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
  lockedSteps?: number[];
  onStepClick?: (step: 1 | 2 | 3) => void;
}

const STEPS = [
  { num: 1, label: 'Upload Resume' },
  { num: 2, label: 'Verify Content' },
  { num: 3, label: 'AI Review' },
];

export function StepWizard({ currentStep, completedSteps, lockedSteps = [], onStepClick }: StepWizardProps) {
  return (
    <div className={styles.wizard} role="tablist" aria-label="Resume review steps">
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.num);
        const isActive = currentStep === step.num;
        const isFuture = !isCompleted && !isActive;
        const isLocked = lockedSteps.includes(step.num);
        const isClickable = !isFuture && !isLocked && onStepClick;

        const className = [
          styles.step,
          isActive ? styles.active : '',
          isCompleted && !isLocked ? styles.completed : '',
          isCompleted && isLocked ? styles.locked : '',
          isFuture ? styles.future : '',
          isClickable ? styles.clickable : '',
        ]
          .filter(Boolean)
          .join(' ');

        const inner = (
          <>
            <div className={styles.stepCircle} aria-hidden="true">
              {isCompleted && !isLocked ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : isLocked ? (
                /* Modified dot */
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="3" fill="currentColor" />
                </svg>
              ) : (
                <span>{step.num}</span>
              )}
            </div>
            <span className={styles.stepLabel}>
              {step.label}
              {isLocked && (
                <span className={styles.modifiedBadge} title="Changes detected — complete the previous step to unlock">
                  modified
                </span>
              )}
            </span>
          </>
        );

        return (
          <div key={step.num} className={styles.stepWrapper} role="presentation">
            {isClickable ? (
              <button
                className={className}
                role="tab"
                aria-selected={isActive}
                aria-label={`Step ${step.num}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                onClick={() => onStepClick(step.num as 1 | 2 | 3)}
              >
                {inner}
              </button>
            ) : (
              <div
                className={className}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isFuture || isLocked}
                aria-label={`Step ${step.num}: ${step.label}${
                  isLocked ? ' (modified — complete previous step to unlock)' : isFuture ? ' (not yet available)' : ''
                }`}
              >
                {inner}
              </div>
            )}
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.connector} ${isCompleted && !isLocked ? styles.connectorDone : ''}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
