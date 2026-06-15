export type ExperienceLevel = 'junior' | 'mid' | 'senior';
export type Priority = 'high' | 'medium' | 'low';

export interface ScoredAssessment {
  score: number;
  reasoning: string;
}

// ─── Resume domain model ─────────────────────────────────────────────────────

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  details: string[];
}

export interface Project {
  name: string;
  description: string;
  bullets: string[];
  technologies: string[];
}

export interface Resume {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: string[];
}

export interface ParseResumeResponse {
  structured_resume: Resume;
  parse_warnings: string[];
}

// ─── Patch operations ─────────────────────────────────────────────────────────

export interface PatchOperation {
  priority: Priority;
  title: string;
  section: 'summary' | 'experience' | 'skills' | 'projects' | 'education' | 'certifications';
  operation: 'append' | 'replace';
  content: string;
  target: string | null;
  item_name: string | null;
  reasoning: string;
}

// ─── API models ───────────────────────────────────────────────────────────────

export interface JobFit {
  fit: boolean;
  explanation: string;
}

export interface ResumeExtractionResponse {
  extracted_text: string;
  extraction_warnings: string[];
}

export interface ResumeReviewRequest {
  resume_text: string;
  job_description: string;
  experience_level: ExperienceLevel;
}

export interface ResumeReviewResponse {
  overall_score: number;
  ats_score: ScoredAssessment;
  technical_score: ScoredAssessment;
  communication_score: ScoredAssessment;
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  recommendations: PatchOperation[];
  job_fit: JobFit;
}
