from pydantic import BaseModel, ConfigDict, Field
from enum import Enum
from typing import Literal, Optional


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ExperienceLevel(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"


# ─── Resume domain model ──────────────────────────────────────────────────────

class ContactInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""


class Experience(BaseModel):
    model_config = ConfigDict(extra="forbid")
    company: str = ""
    role: str = ""
    duration: str = ""
    bullets: list[str] = Field(default_factory=list)


class Education(BaseModel):
    model_config = ConfigDict(extra="forbid")
    institution: str = ""
    degree: str = ""
    duration: str = ""
    details: list[str] = Field(default_factory=list)


class Project(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = ""
    description: str = ""
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)


class Resume(BaseModel):
    model_config = ConfigDict(extra="forbid")
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    experience: list[Experience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)


# ─── Patch operations ─────────────────────────────────────────────────────────

class PatchOperation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    priority: Priority
    title: str
    section: Literal["summary", "experience", "skills", "projects", "education", "certifications"]
    operation: Literal["append", "replace"]
    content: str
    target: Optional[str] = None   # for replace: the exact existing text to replace
    item_name: Optional[str] = None  # company name / project name to locate the right item
    reasoning: str


# ─── API response/request models ─────────────────────────────────────────────

class JobFit(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fit: bool
    explanation: str


class ScoredAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")
    score: int = Field(ge=0, le=100)
    reasoning: str = Field(max_length=1000)


class ResumeExtractionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    extracted_text: str
    extraction_warnings: list[str]


class ParseResumeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    structured_resume: Resume
    parse_warnings: list[str]


class ResumeExtractionValidation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    is_resume: bool
    confidence: float
    validation_message: str


class ResumeReviewAIOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ats_score: ScoredAssessment
    technical_score: ScoredAssessment
    communication_score: ScoredAssessment
    summary: str = Field(max_length=1000)
    skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    missing_keywords: list[str]
    recommendations: list[PatchOperation]
    job_fit: JobFit


class ResumeRequest(BaseModel):
    resume_text: str = Field(min_length=200)
    job_description: str = Field(min_length=50)
    experience_level: ExperienceLevel


class StructuredResumeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    resume: Resume


class ResumeReviewResponse(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    ats_score: ScoredAssessment
    technical_score: ScoredAssessment
    communication_score: ScoredAssessment
    summary: str
    skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    missing_keywords: list[str]
    recommendations: list[PatchOperation]
    job_fit: JobFit
