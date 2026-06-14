from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from schemas.resume import (
    ResumeExtractionResponse,
    ResumeRequest,
    ExperienceLevel,
    ResumeReviewResponse,
)
from services.resume_service import review, validate_resume, preprocess_text
from services.extraction_service import extract_text_from_pdf, extract_text_from_docx
import os
import tempfile
from services.report_service import generate_pdf

route = APIRouter()


@route.post("/resume/extract")
async def extract_resume_text(file: UploadFile = File(...)) -> ResumeExtractionResponse:

    contents = await file.read()
    ext = os.path.splitext(file.filename)[1].lower()

    if ext == ".pdf":
        text = extract_text_from_pdf(contents)
    elif ext == ".docx":
        text = extract_text_from_docx(contents)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    resume_text = preprocess_text(text)
    validation = validate_resume(resume_text)
    if not validation.is_resume:
        raise HTTPException(status_code=400, detail=validation.validation_message)
    return ResumeExtractionResponse(extracted_text=resume_text, extraction_warnings=[])


@route.post("/resume/report")
async def generate_resume_report(request: ResumeReviewResponse):
    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf",
    )

    generate_pdf(
        request.model_dump(),
        temp_file.name,
    )

    return FileResponse(
        path=temp_file.name,
        filename="Resume-Analysis-Report.pdf",
        media_type="application/pdf",
    )


@route.post("/resume/review")
async def review_resume(request: ResumeRequest):
    return await review(request)


@route.get("/resume/experience-level")
async def get_experience_levels() -> list[str]:
    return [level.value for level in ExperienceLevel]
