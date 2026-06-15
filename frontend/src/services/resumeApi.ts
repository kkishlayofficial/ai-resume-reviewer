import type {
  ResumeExtractionResponse,
  ResumeReviewRequest,
  ResumeReviewResponse,
  ParseResumeResponse,
  Resume,
} from "../types/resume";

// ─── Toggle between mock and real API ────────────────────────────────────────
export const MOCK_MODE = false;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EXTRACTED_TEXT = `John Smith
Senior Frontend Engineer
john.smith@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith

PROFESSIONAL SUMMARY
Experienced Frontend Engineer with 6+ years building high-performance React applications. Strong expertise in React, TypeScript, Next.js, and GraphQL. Led frontend architecture for SaaS products serving 100k+ users. Passionate about accessibility and performance optimization.

WORK EXPERIENCE

Senior Frontend Engineer | TechCorp Inc. | 2021 – Present
• Architected and led development of a component library used across 5 product teams, reducing UI development time by 40%
• Optimized Core Web Vitals achieving 95+ Lighthouse scores across all pages
• Mentored 4 junior developers and established frontend coding standards
• Built real-time dashboard using WebSockets serving 50k concurrent users

Frontend Engineer | StartupXYZ | 2019 – 2021
• Developed React-based SPA with TypeScript and GraphQL, improving data load time by 60%
• Implemented comprehensive testing strategy with Jest and React Testing Library (85% coverage)
• Collaborated with design team to implement accessible UI components (WCAG 2.1 AA compliant)

Junior Frontend Developer | WebAgency | 2018 – 2019
• Built responsive landing pages and interactive UI components for 15+ client projects
• Introduced React to the team's tech stack and conducted internal knowledge-sharing sessions

SKILLS
React, Next.js, TypeScript, JavaScript (ES2022+), GraphQL, Apollo Client, Storybook, Accessibility (WCAG 2.1), CSS-in-JS, Tailwind CSS, Webpack, Vite, Jest, React Testing Library, REST APIs, WebSockets, Node.js, Git

EDUCATION
B.S. Computer Science | State University | 2018`;

const MOCK_RESUME: Resume = {
  contact: {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    location: "",
    linkedin: "linkedin.com/in/johnsmith",
    github: "github.com/johnsmith",
  },
  summary:
    "Experienced Frontend Engineer with 6+ years building high-performance React applications. Strong expertise in React, TypeScript, Next.js, and GraphQL. Led frontend architecture for SaaS products serving 100k+ users. Passionate about accessibility and performance optimization.",
  experience: [
    {
      company: "TechCorp Inc.",
      role: "Senior Frontend Engineer",
      duration: "2021 – Present",
      bullets: [
        "Architected and led development of a component library used across 5 product teams, reducing UI development time by 40%",
        "Optimized Core Web Vitals achieving 95+ Lighthouse scores across all pages",
        "Mentored 4 junior developers and established frontend coding standards",
        "Built real-time dashboard using WebSockets serving 50k concurrent users",
      ],
    },
    {
      company: "StartupXYZ",
      role: "Frontend Engineer",
      duration: "2019 – 2021",
      bullets: [
        "Developed React-based SPA with TypeScript and GraphQL, improving data load time by 60%",
        "Implemented comprehensive testing strategy with Jest and React Testing Library (85% coverage)",
        "Collaborated with design team to implement accessible UI components (WCAG 2.1 AA compliant)",
      ],
    },
    {
      company: "WebAgency",
      role: "Junior Frontend Developer",
      duration: "2018 – 2019",
      bullets: [
        "Built responsive landing pages and interactive UI components for 15+ client projects",
        "Introduced React to the team's tech stack and conducted internal knowledge-sharing sessions",
      ],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. Computer Science",
      duration: "2018",
      details: [],
    },
  ],
  skills: [
    "React", "Next.js", "TypeScript", "JavaScript (ES2022+)", "GraphQL",
    "Apollo Client", "Storybook", "Accessibility (WCAG 2.1)", "CSS-in-JS",
    "Tailwind CSS", "Webpack", "Vite", "Jest", "React Testing Library",
    "REST APIs", "WebSockets", "Node.js", "Git",
  ],
  projects: [],
  certifications: [],
};

const MOCK_REVIEW_RESPONSE: ResumeReviewResponse = {
  overall_score: 92,
  ats_score: {
    score: 84,
    reasoning:
      "Good keyword alignment with the job description. React, TypeScript, and Next.js are well represented. Missing CI/CD pipeline experience and Docker containerization references which are listed as requirements.",
  },
  technical_score: {
    score: 91,
    reasoning:
      "Strong React ecosystem expertise with production-scale experience. GraphQL, TypeScript, and testing practices are explicitly mentioned with measurable outcomes. Node.js experience adds versatility.",
  },
  communication_score: {
    score: 87,
    reasoning:
      'Clear resume structure with well-quantified achievements. Metrics like "40% reduction" and "50k concurrent users" demonstrate impact. Summary is concise and role-appropriate.',
  },
  summary:
    "This candidate demonstrates strong frontend engineering capabilities with 6+ years of experience matching the senior-level role requirements. The React/TypeScript stack expertise aligns closely with the job description. There are minor gaps around DevOps and CI/CD tooling that could be addressed. Overall, this is a highly competitive application for the role.",
  skills: [
    "React", "Next.js", "TypeScript", "JavaScript", "GraphQL", "Apollo Client",
    "Storybook", "Accessibility", "Tailwind CSS", "Jest", "React Testing Library",
    "Node.js", "WebSockets", "Webpack", "Vite", "REST APIs",
  ],
  strengths: [
    "Strong React ecosystem expertise with 6+ years of production experience",
    "Demonstrated quantifiable impact (40% development time reduction, 95+ Lighthouse scores)",
    "Accessibility-first mindset (WCAG 2.1 AA compliance)",
    "Full-stack capability with Node.js and GraphQL",
    "Leadership and mentoring experience aligns with senior role expectations",
    "Component library architecture experience at scale",
  ],
  weaknesses: [
    "No mention of CI/CD pipeline configuration (GitHub Actions, Jenkins, CircleCI)",
    "Docker and containerization skills not referenced",
    "No cloud platform experience mentioned (AWS, GCP, Azure)",
    "Micro-frontend architecture experience absent",
    "Limited backend depth beyond Node.js",
  ],
  missing_keywords: ["Docker", "CI/CD", "GitHub Actions", "Micro Frontends", "AWS", "Kubernetes", "Redis"],
  recommendations: [
    {
      priority: "high",
      title: "Add CI/CD Pipeline Experience",
      section: "experience",
      operation: "append",
      content: "Configured GitHub Actions pipelines for automated testing, linting, and deployment across 3 microservices, reducing release cycle time by 35%.",
      target: null,
      item_name: "TechCorp Inc.",
      reasoning: "The job description explicitly lists CI/CD pipeline experience as a requirement. Adding a concrete example directly addresses this gap.",
    },
    {
      priority: "high",
      title: "Include Docker in Skills",
      section: "skills",
      operation: "append",
      content: "Docker",
      target: null,
      item_name: null,
      reasoning: "Docker is listed as a required skill in the job description and is currently absent from your skills section.",
    },
    {
      priority: "medium",
      title: "Add Micro-Frontend Architecture Experience",
      section: "experience",
      operation: "append",
      content: "Evaluated and prototyped Webpack Module Federation for independent team deployments, enabling parallel feature releases across 3 product squads.",
      target: null,
      item_name: "TechCorp Inc.",
      reasoning: "The role mentions micro-frontend architecture. Adding an experience bullet referencing Module Federation strengthens technical alignment.",
    },
    {
      priority: "medium",
      title: "Quantify Component Library Scale",
      section: "experience",
      operation: "replace",
      content: "Architected and led development of a 60+ component design system adopted across 5 product teams (200+ engineers), reducing UI development time by 40% and cutting design-to-production cycle from 2 weeks to 3 days.",
      target: "Architected and led development of a component library used across 5 product teams, reducing UI development time by 40%",
      item_name: "TechCorp Inc.",
      reasoning: "Quantifying the scale of the component library makes the achievement more compelling for a senior engineering role.",
    },
    {
      priority: "low",
      title: "Add Cloud Platform Skills",
      section: "skills",
      operation: "append",
      content: "AWS (S3, CloudFront), Vercel",
      target: null,
      item_name: null,
      reasoning: "Basic cloud deployment experience rounds out the full-stack deployment lifecycle picture expected of a senior engineer.",
    },
  ],
  job_fit: {
    fit: true,
    explanation:
      "The candidate demonstrates strong frontend engineering experience with 6+ years in the React/TypeScript ecosystem, making them a strong match for this senior role. The quantified achievements and accessibility expertise stand out. The primary gap is DevOps and CI/CD tooling, which can be addressed. Overall, this is a good fit for the position.",
  },
};

// ─── API Helpers ──────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── extractResume ────────────────────────────────────────────────────────────
export async function extractResume(
  file: File,
): Promise<ResumeExtractionResponse> {
  if (MOCK_MODE) {
    await sleep(2200);
    return {
      extracted_text: MOCK_EXTRACTED_TEXT,
      extraction_warnings: [],
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/resume/extract`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Extraction failed" }));
    throw new Error(error.detail ?? "Failed to extract resume");
  }

  return response.json() as Promise<ResumeExtractionResponse>;
}

// ─── parseResume ──────────────────────────────────────────────────────────────
export async function parseResume(
  extractedText: string,
): Promise<ParseResumeResponse> {
  if (MOCK_MODE) {
    await sleep(1800);
    return { structured_resume: MOCK_RESUME, parse_warnings: [] };
  }

  const response = await fetch(`${API_BASE}/resume/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_text: extractedText }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Parse failed" }));
    throw new Error(error.detail ?? "Failed to parse resume structure");
  }

  return response.json() as Promise<ParseResumeResponse>;
}

// ─── reviewResume ─────────────────────────────────────────────────────────────
export async function reviewResume(
  payload: ResumeReviewRequest,
): Promise<ResumeReviewResponse> {
  if (MOCK_MODE) {
    await sleep(3500);
    return MOCK_REVIEW_RESPONSE;
  }

  const response = await fetch(`${API_BASE}/resume/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Review failed" }));
    throw new Error(error.detail ?? "Failed to review resume");
  }

  return response.json() as Promise<ResumeReviewResponse>;
}

export async function getReport(reviewResult: ResumeReviewResponse): Promise<Response> {
  const response = await fetch(`${API_BASE}/resume/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewResult),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Report generation failed" }));
    throw new Error(error.detail ?? "Failed to generate report");
  }

  return response;
}

// ─── downloadResume ───────────────────────────────────────────────────────────
export async function downloadResume(
  resume: Resume,
  format: "pdf" | "docx",
): Promise<void> {
  if (MOCK_MODE) {
    await sleep(1000);
    console.log("Mock: would download resume as", format);
    return;
  }

  const response = await fetch(`${API_BASE}/resume/download?format=${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Download failed" }));
    throw new Error(error.detail ?? "Failed to download resume");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = format === "docx" ? "resume-updated.docx" : "resume-updated.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
}
