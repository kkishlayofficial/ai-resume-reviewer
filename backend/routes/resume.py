from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from schemas.resume import (
    ResumeExtractionResponse,
    ResumeRequest,
    ExperienceLevel,
    ResumeReviewResponse,
    ParseResumeResponse,
    StructuredResumeRequest,
)
from services.resume_service import review, validate_resume, preprocess_text, parse
from services.extraction_service import extract_text_from_pdf, extract_text_from_docx
from services.report_service import generate_pdf
from services.docx_service import generate_docx, generate_resume_pdf
import os
import tempfile
from pydantic import BaseModel

route = APIRouter()


class ParseRequest(BaseModel):
    extracted_text: str


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


@route.post("/resume/parse")
async def parse_resume_endpoint(request: ParseRequest) -> ParseResumeResponse:
    return await parse(request.extracted_text)


@route.post("/resume/report")
async def generate_resume_report(request: ResumeReviewResponse):
    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf",
        dir="/tmp",
    )
    temp_path = temp_file.name
    temp_file.close()

    generate_pdf(
        request.model_dump(),
        temp_path,
    )

    return FileResponse(
        path=temp_path,
        filename="Resume-Analysis-Report.pdf",
        media_type="application/pdf",
        background=None,
    )


@route.post("/resume/download")
async def download_updated_resume(
    request: StructuredResumeRequest,
    format: str = Query(default="docx", pattern="^(docx|pdf)$"),
):
    if format == "docx":
        suffix = ".docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = "resume-updated.docx"
    else:
        suffix = ".pdf"
        media_type = "application/pdf"
        filename = "resume-updated.pdf"

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
        dir="/tmp",
    )
    temp_path = temp_file.name
    temp_file.close()

    if format == "docx":
        generate_docx(request.resume, temp_path)
    else:
        generate_resume_pdf(request.resume, temp_path)

    return FileResponse(
        path=temp_path,
        filename=filename,
        media_type=media_type,
        background=None,
    )


@route.post("/resume/review")
async def review_resume(request: ResumeRequest):
    return await review(request)


@route.get("/resume/experience-level")
async def get_experience_levels() -> list[str]:
    return [level.value for level in ExperienceLevel]
