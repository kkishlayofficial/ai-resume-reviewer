from pydantic import BaseModel, ConfigDict, Field
from enum import Enum


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ExperienceLevel(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"


class Recommendation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    priority: Priority
    title: str
    recommendation: str


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


class ResumeExtractionValidation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    is_resume: bool
    confidence: float
    validation_message: str


class ResumeVersion(BaseModel):
    model_config = ConfigDict(extra="forbid")
    original_extracted_text: str
    user_edited_text: str


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
    recommendations: list[Recommendation]
    job_fit: JobFit


class ResumeRequest(BaseModel):
    resume_text: str = Field(min_length=200)
    job_description: str = Field(min_length=50)
    experience_level: ExperienceLevel


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
    recommendations: list[Recommendation]
    job_fit: JobFit
