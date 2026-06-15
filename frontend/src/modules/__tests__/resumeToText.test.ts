import { describe, it, expect } from 'vitest';
import type { Resume } from '../../types/resume';
import { resumeToText } from '../../modules/resume-review/utils/resumeToText';

describe('resumeToText', () => {
  const sampleResume: Resume = {
    contact: {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-1234',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/johnsmith',
      github: 'github.com/johnsmith',
    },
    summary: 'Experienced software engineer with 5+ years of experience in full-stack development.',
    experience: [
      {
        company: 'TechCorp',
        role: 'Senior Engineer',
        duration: '2021-2023',
        bullets: ['Led team of 5 engineers', 'Improved performance by 40%'],
      },
      {
        company: 'StartupXYZ',
        role: 'Software Engineer',
        duration: '2019-2021',
        bullets: ['Built authentication system', 'Mentored junior developers'],
      },
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'B.S. Computer Science',
        duration: '2019',
        details: ['GPA: 3.8', 'Dean\'s List'],
      },
    ],
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL'],
    projects: [
      {
        name: 'AI Resume Reviewer',
        description: 'A tool to analyze and improve resumes using AI',
        bullets: ['Built with React and FastAPI', 'Integrated Groq LLM API'],
        technologies: ['React', 'Python', 'TypeScript'],
      },
    ],
    certifications: ['AWS Solutions Architect', 'Certified Kubernetes Administrator'],
  };

  it('should include contact information', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('John Smith');
    expect(text).toContain('john@example.com');
    expect(text).toContain('555-1234');
    expect(text).toContain('New York, NY');
  });

  it('should include summary', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('Experienced software engineer with 5+ years');
  });

  it('should include all experiences', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('TechCorp');
    expect(text).toContain('Senior Engineer');
    expect(text).toContain('Led team of 5 engineers');
    expect(text).toContain('StartupXYZ');
    expect(text).toContain('Improved performance by 40%');
  });

  it('should include education', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('University of Technology');
    expect(text).toContain('B.S. Computer Science');
    expect(text).toContain('2019');
    expect(text).toContain('GPA: 3.8');
  });

  it('should include skills', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('JavaScript');
    expect(text).toContain('Python');
    expect(text).toContain('React');
    expect(text).toContain('Node.js');
  });

  it('should include projects', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('AI Resume Reviewer');
    expect(text).toContain('A tool to analyze and improve resumes using AI');
  });

  it('should include certifications', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('AWS Solutions Architect');
    expect(text).toContain('Certified Kubernetes Administrator');
  });

  it('should handle empty sections gracefully', () => {
    const emptyResume: Resume = {
      contact: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    };

    const text = resumeToText(emptyResume);
    expect(typeof text).toBe('string');
  });

  it('should handle experience with no bullets', () => {
    const resume: Resume = {
      ...sampleResume,
      experience: [
        {
          company: 'Company',
          role: 'Role',
          duration: 'Duration',
          bullets: [],
        },
      ],
    };

    const text = resumeToText(resume);
    expect(text).toContain('Company');
    expect(text).toContain('Role');
  });

  it('should handle education with no details', () => {
    const resume: Resume = {
      ...sampleResume,
      education: [
        {
          institution: 'University',
          degree: 'Degree',
          duration: '2020',
          details: [],
        },
      ],
    };

    const text = resumeToText(resume);
    expect(text).toContain('University');
    expect(text).toContain('Degree');
  });

  it('should maintain readable formatting', () => {
    const text = resumeToText(sampleResume);
    // Check that text has reasonable line breaks and structure
    const lines = text.split('\n');
    expect(lines.length > 1).toBe(true);
  });

  it('should handle special characters in content', () => {
    const resume: Resume = {
      ...sampleResume,
      summary: 'Improved efficiency by 50% & reduced costs',
      skills: ['C#', 'C++', 'F#'],
    };

    const text = resumeToText(resume);
    expect(text).toContain('50%');
    expect(text).toContain('&');
  });

  it('should include linkedin and github links when present', () => {
    const text = resumeToText(sampleResume);
    expect(text).toContain('linkedin.com/in/johnsmith');
    expect(text).toContain('github.com/johnsmith');
  });

  it('should handle multiple bullets in experience', () => {
    const text = resumeToText(sampleResume);
    const techCorpCount = (text.match(/TechCorp/g) || []).length;
    expect(techCorpCount).toBeGreaterThan(0);
  });
});
