from schemas.resume import (
    ResumeRequest,
    ResumeReviewAIOutput,
    ResumeReviewResponse,
    ResumeExtractionValidation,
    ParseResumeResponse,
)
from fastapi import HTTPException
from prompts.resume import build_resume_prompt, build_system_prompt
from services.llm_service import generate_resume_review, is_valid_resume, parse_resume
from services.score_service import generate_overall_score
import re

def map_to_response(
    ai_resume_review_output: ResumeReviewAIOutput, overall_score: int
) -> ResumeReviewResponse:
    return ResumeReviewResponse(
        overall_score=overall_score,
        ats_score=ai_resume_review_output.ats_score,
        technical_score=ai_resume_review_output.technical_score,
        communication_score=ai_resume_review_output.communication_score,
        summary=ai_resume_review_output.summary,
        skills=ai_resume_review_output.skills,
        strengths=ai_resume_review_output.strengths,
        weaknesses=ai_resume_review_output.weaknesses,
        missing_keywords=ai_resume_review_output.missing_keywords,
        recommendations=ai_resume_review_output.recommendations,
        job_fit=ai_resume_review_output.job_fit,
    )


async def review(request: ResumeRequest) -> ResumeReviewResponse:
    user_prompt = build_resume_prompt(
        request.resume_text, request.job_description, request.experience_level
    )
    system_prompt = build_system_prompt()

    ai_resume_review_output = generate_resume_review(
        user_prompt=preprocess_text(user_prompt),
        system_prompt=preprocess_text(system_prompt),
    )

    overall_score = generate_overall_score(
        ats_score=ai_resume_review_output.ats_score.score,
        technical_score=ai_resume_review_output.technical_score.score,
        communication_score=ai_resume_review_output.communication_score.score,
    )

    return map_to_response(ai_resume_review_output, overall_score)


def validate_resume(resume_text: str) -> ResumeExtractionValidation:
    if len(resume_text) < 200:
        raise HTTPException(status_code=400, detail="Resume is too short.")
    elif len(resume_text) > 5000:
        raise HTTPException(status_code=400, detail="Resume is too long.")
    else:
        return is_valid_resume(resume_text)


def preprocess_text(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


async def parse(extracted_text: str) -> ParseResumeResponse:
    try:
        structured_resume = parse_resume(extracted_text)
        return ParseResumeResponse(structured_resume=structured_resume, parse_warnings=[])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse resume structure.")
