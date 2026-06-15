import styles from "./Hero.module.css";
import { Button } from "../ui/Button/Button";

interface HeroProps {
  onReviewClick?: () => void;
}

export function Hero({ onReviewClick }: HeroProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={styles.section} aria-label='Hero'>
      <div className={styles.container}>
        {/* Left: Headline + CTA */}
        <div className={styles.left}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden='true' />
            AI-Powered Resume Studio
          </div>

          <h1 className={styles.heading}>
            Build, Optimize, and Review Your Resume with AI.{" "}
            <span className={styles.accent}>
              Turn Your Resume Into Your Strongest Job Application
            </span>{" "}
            in Seconds.
          </h1>

          <p className={styles.subtext}>
            Upload your resume, let AI structure it into editable sections,
            optimize it for your target role, apply intelligent improvements
            with one click, and download an updated resume ready for your next
            application.
          </p>

          <div className={styles.ctas}>
            <Button
              variant='primary'
              size='lg'
              onClick={onReviewClick ?? scrollTo("review")}
            >
              Start Optimizing
            </Button>
            <Button
              variant='secondary'
              size='lg'
              onClick={scrollTo("how-it-works")}
            >
              See How It Works
            </Button>
          </div>

          <ul className={styles.trustBadges} role='list'>
            {[
              "AI Resume Optimization",
              "ATS-Friendly Suggestions",
              "Explainable Scoring",
              "Download Updated Resume",
            ].map((item) => (
              <li key={item} className={styles.trustItem}>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 14 14'
                  fill='none'
                  aria-hidden='true'
                >
                  <circle cx='7' cy='7' r='7' fill='#DCFCE7' />
                  <path
                    d='M4 7l2 2 4-4'
                    stroke='#16A34A'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.callout}>
            Apply AI-powered improvements with one click, re-evaluate your resume instantly, and download an optimized version ready for your next application.
          </div>
        </div>

        {/* Right: Visual flow */}
        <div className={styles.right} aria-hidden='true'>
          <div className={styles.flowCard}>
            <div className={styles.flowStep}>
              <div className={styles.fileIcon}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                  <rect width='32' height='32' rx='8' fill='#EFF6FF' />
                  <path
                    d='M10 6h8l6 6v16a2 2 0 01-2 2H10a2 2 0 01-2-2V8a2 2 0 012-2z'
                    fill='#BFDBFE'
                  />
                  <path d='M18 6l6 6h-4a2 2 0 01-2-2V6z' fill='#2563EB' />
                  <path
                    d='M12 18h8M12 14h5'
                    stroke='#2563EB'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>PDF Resume</div>
                <div className={styles.flowSub}>
                  frontend_resume.pdf · 420 KB
                </div>
              </div>
            </div>

            <div className={styles.arrowDown} />

            <div className={styles.flowStep}>
              <div className={styles.aiIcon}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                  <rect width='32' height='32' rx='8' fill='#F0FDF4' />
                  <rect x='8' y='8' width='7' height='2' rx='1' fill='#16A34A' />
                  <rect x='8' y='13' width='16' height='1.5' rx='0.75' fill='#86EFAC' />
                  <rect x='8' y='16.5' width='13' height='1.5' rx='0.75' fill='#86EFAC' />
                  <rect x='8' y='20' width='11' height='1.5' rx='0.75' fill='#86EFAC' />
                  <rect x='8' y='23.5' width='9' height='1.5' rx='0.75' fill='#86EFAC' />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>Structured Resume</div>
                <div className={styles.flowSub}>
                  Editable Sections
                </div>
              </div>
              <div className={styles.processingDots}>
                <span
                  className={styles.dot}
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className={styles.dot}
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className={styles.dot}
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            </div>

            <div className={styles.arrowDown} />

            <div className={styles.flowStep}>
              <div className={styles.aiIcon}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                  <rect width='32' height='32' rx='8' fill='#EFF6FF' />
                  <path d='M16 7l1.8 4.8H22l-3.9 2.8 1.5 4.8L16 17l-3.6 2.4 1.5-4.8L10 11.8h4.2z' fill='#2563EB' />
                  <circle cx='8.5' cy='23' r='1.5' fill='#BFDBFE' />
                  <circle cx='23.5' cy='23' r='1.5' fill='#BFDBFE' />
                  <circle cx='24' cy='8' r='1.2' fill='#BFDBFE' />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>AI Optimization</div>
                <div className={styles.flowSub}>
                  Applying Smart Improvements
                </div>
              </div>
              <div className={styles.processingDots}>
                <span
                  className={styles.dot}
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className={styles.dot}
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className={styles.dot}
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            </div>

            <div className={styles.arrowDown} />

            <div className={styles.flowStep}>
              <div className={styles.aiIcon}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                  <rect width='32' height='32' rx='8' fill='#F0FDF4' />
                  <path d='M11 6h7l6 6v13a1 1 0 01-1 1H11a1 1 0 01-1-1V7a1 1 0 011-1z' fill='#DCFCE7' />
                  <path d='M18 6v5a1 1 0 001 1h5' stroke='#16A34A' strokeWidth='1.5' />
                  <path d='M12 19l2.5 2.5 5-5' stroke='#16A34A' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowTitle}>Updated Resume</div>
                <div className={styles.flowSub}>
                  Ready for Download
                </div>
              </div>
              <div className={styles.processingDots}>
                <span
                  className={styles.dot}
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className={styles.dot}
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className={styles.dot}
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            </div>

            <div className={styles.arrowDown} />

            <div className={styles.flowStep}>
              <div className={styles.scoreIcon}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                  <rect width='32' height='32' rx='8' fill='#FFF7ED' />
                  <path
                    d='M8 22l4-5 4 3 4-8 4 10'
                    stroke='#EA580C'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <circle cx='8' cy='22' r='1.5' fill='#EA580C' />
                  <circle cx='12' cy='17' r='1.5' fill='#EA580C' />
                  <circle cx='16' cy='20' r='1.5' fill='#EA580C' />
                  <circle cx='20' cy='12' r='1.5' fill='#EA580C' />
                  <circle cx='24' cy='22' r='1.5' fill='#EA580C' />
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
