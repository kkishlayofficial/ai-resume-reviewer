export type ExperienceLevel = 'junior' | 'mid' | 'senior';
export type Priority = 'high' | 'medium' | 'low';

export interface ScoredAssessment {
  score: number;
  reasoning: string;
}

export interface Recommendation {
  priority: Priority;
  title: string;
  section: 'summary' | 'experience' | 'skills' | 'projects' | 'education';
  action: 'append' | 'insert' | 'replace';
  suggested_content: string;
  reasoning: string;
}

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
  recommendations: Recommendation[];
  job_fit: JobFit;
}
