
import './index.css';
import './App.css';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import { ResumeReview } from './modules/resume-review/ResumeReview';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { Features } from './components/Features/Features';
import { Footer } from './components/Footer/Footer';

function App() {
  const { theme, toggle } = useTheme();

  const scrollToReview = () => {
    document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar onReviewClick={scrollToReview} theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero onReviewClick={scrollToReview} />
        <ResumeReview />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </>
  );
}

export default App;