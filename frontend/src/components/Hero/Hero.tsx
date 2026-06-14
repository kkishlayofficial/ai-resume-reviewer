import styles from './Hero.module.css';
import { Button } from '../ui/Button/Button';

interface HeroProps {
  onReviewClick?: () => void;
}

export function Hero({ onReviewClick }: HeroProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.section} aria-label="Hero">
      <div className={styles.container}>
        {/* Left: Headline + CTA */}
        <div className={styles.left}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            AI-Powered Resume Analysis
          </div>

          <h1 className={styles.heading}>
            Review Your Resume with AI.{' '}
            <span className={styles.accent}>Get Actionable Insights</span>{' '}
            in Seconds.
          </h1>

          <p className={styles.subtext}>
            Upload your resume, verify the extracted content, compare it against any job
            description, and receive a detailed AI-powered evaluation with ATS score,
            technical assessment, communication analysis, and personalized recommendations.
          </p>

          <div className={styles.ctas}>
            <Button
              variant="primary"
              size="lg"
              onClick={onReviewClick ?? scrollTo('review')}
            >
              Review Resume
            </Button>
            <Button variant="secondary" size="lg" onClick={scrollTo('how-it-works')}>
              See How It Works
            </Button>
          </div>

          <ul className={styles.trustBadges} role="list">
            {[
              'ATS Analysis',
              'Technical Evaluation',
              'Explainable Scoring',
              'Privacy First',
            ].map((item) => (
              <li key={item} className={styles.trustItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="7" fill="#DCFCE7" />
                  <path d="M4 7l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Visual flow */}
        <div className={styles.right} aria-hidden="true">
          <div className={styles.flowCard}>
            <div className={styles.flowStep}>
              <div className={styles.fileIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#EFF6FF" />
                  <path d="M10 6h8l6 6v16a2 2 0 01-2 2H10a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#BFDBFE" />
                  <path d="M18 6l6 6h-4a2 2 0 01-2-2V6z" fill="#2563EB" />
                  <path d="M12 18h8M12 14h5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>PDF Resume</div>
                <div className={styles.flowSub}>frontend_resume.pdf · 420 KB</div>
              </div>
            </div>

            <div className={styles.arrowDown} />

            <div className={styles.flowStep}>
              <div className={styles.aiIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#F0FDF4" />
                  <circle cx="16" cy="16" r="8" fill="#DCFCE7" />
                  <circle cx="16" cy="16" r="3" fill="#16A34A" />
                  <circle cx="16" cy="8" r="1.5" fill="#16A34A" />
                  <circle cx="16" cy="24" r="1.5" fill="#16A34A" />
                  <circle cx="8" cy="16" r="1.5" fill="#16A34A" />
                  <circle cx="24" cy="16" r="1.5" fill="#16A34A" />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>AI Processing</div>
                <div className={styles.flowSub}>Analyzing resume + job description</div>
              </div>
              <div className={styles.processingDots}>
                <span className={styles.dot} style={{ animationDelay: '0ms' }} />
                <span className={styles.dot} style={{ animationDelay: '200ms' }} />
                <span className={styles.dot} style={{ animationDelay: '400ms' }} />
              </div>
            </div>

            <div className={styles.arrowDown} />

            <div className={styles.flowStep}>
              <div className={styles.scoreIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#FFF7ED" />
                  <path d="M8 22l4-5 4 3 4-8 4 10" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8" cy="22" r="1.5" fill="#EA580C" />
                  <circle cx="12" cy="17" r="1.5" fill="#EA580C" />
                  <circle cx="16" cy="20" r="1.5" fill="#EA580C" />
                  <circle cx="20" cy="12" r="1.5" fill="#EA580C" />
                  <circle cx="24" cy="22" r="1.5" fill="#EA580C" />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>Score Dashboard</div>
                <div className={styles.flowSub}>
                  <span className={styles.scoreTag}>92</span> Overall Match
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
