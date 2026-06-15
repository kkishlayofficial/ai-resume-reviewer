import styles from './HowItWorks.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Upload & Parse Resume',
    desc: 'Securely upload your PDF or DOCX resume. AI extracts the content, validates it, and converts it into a structured, editable resume.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Edit & Optimize',
    desc: 'Review your structured resume, apply AI-powered improvements with one click, edit any section, and tailor it to your target job description.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Review & Export',
    desc: 'Compare scores, understand strengths and gaps, track improvements after applying suggestions, and download both your AI report and optimized resume.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section} aria-labelledby="how-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="how-heading" className={styles.heading}>
            How AI Resume Studio Works
          </h2>
          <p className={styles.subtext}>
            Transform your resume into an optimized, job-ready document through an AI-assisted editing workflow.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step.num} className={styles.stepWrapper}>
              <div className={styles.step}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--color-border-strong)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
