import styles from './Navbar.module.css';
import { Button } from '../ui/Button/Button';
import type { Theme } from '../../hooks/useTheme';

interface NavbarProps {
  onReviewClick?: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

export function Navbar({ onReviewClick, theme, onToggleTheme }: NavbarProps) {
  const handleScrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        {/* Logo */}
        <a href="/" className={styles.logo} aria-label="AI Resume Reviewer home">
          <span className={styles.logoIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#2563EB" />
              <path d="M8 9h8M8 13h12M8 17h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="21" cy="9" r="2.5" fill="#BFDBFE" />
            </svg>
          </span>
          <span className={styles.logoText}>AI Resume Studio</span>
        </a>

        {/* Center nav links */}
        <ul className={styles.navLinks} role="list">
          <li>
            <a href="#features" className={styles.navLink} onClick={handleScrollTo('features')}>
              Features
            </a>
          </li>
          <li>
            <a href="#how-it-works" className={styles.navLink} onClick={handleScrollTo('how-it-works')}>
              How It Works
            </a>
          </li>
        </ul>

        {/* Right actions */}
        <div className={styles.actions}>
          {onToggleTheme && (
            <button
              className={styles.themeToggle}
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                /* Sun icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                /* Moon icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onReviewClick ?? handleScrollTo('review')}
          >
            Review Resume
          </Button>
        </div>
      </nav>
    </header>
  );
}
