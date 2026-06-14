import styles from './Features.module.css';

const FEATURES = [
  {
    title: 'ATS Optimization',
    desc: 'Analyze keyword alignment against the job description and identify gaps that reduce recruiter visibility.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: 'Technical Evaluation',
    desc: 'Evaluate the technologies, frameworks, and tools actually present in your resume against role requirements.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Explainable AI',
    desc: 'Every score comes with detailed reasoning. Understand exactly why you received each score and what to improve.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: 'Privacy First',
    desc: 'Your resume is processed in-memory and never permanently stored. Your personal information stays private.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className={styles.section} aria-labelledby="features-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="features-heading" className={styles.heading}>
            Everything You Need to Stand Out
          </h2>
          <p className={styles.subtext}>
            Professional-grade resume intelligence powered by AI.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.iconWrapper}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
