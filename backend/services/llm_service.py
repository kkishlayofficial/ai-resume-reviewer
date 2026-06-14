import os
from groq import Groq, APITimeoutError, APIStatusError
from schemas.resume import ResumeReviewAIOutput, ResumeExtractionValidation
from prompts.resume import SYSTEM_PROMPT_FOR_RESUME_VALIDATION
from dotenv import load_dotenv
import json
from fastapi import HTTPException, status

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def generate_resume_review(
    system_prompt: str, user_prompt: str
) -> ResumeReviewAIOutput:

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        response = client.chat.completions.create(
            messages=messages,
            model="openai/gpt-oss-120b",
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "ResumeReviewAIOutput",
                    "strict": True,
                    "schema": ResumeReviewAIOutput.model_json_schema(),
                },
            },
            temperature=0,
            max_completion_tokens=3000,
        )

        

        results = json.loads(response.choices[0].message.content)
        return ResumeReviewAIOutput.model_validate(results)
    except APITimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="LLM request timed out. Please try again.",
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=e.message or "LLM service error. Please try again.",
        )


def is_valid_resume(resume_text: str) -> ResumeExtractionValidation:
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT_FOR_RESUME_VALIDATION},
            {"role": "user", "content": resume_text},
        ]

        response = client.chat.completions.create(
            messages=messages,
            model="openai/gpt-oss-120b",
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "ResumeExtractionValidation",
                    "strict": True,
                    "schema": ResumeExtractionValidation.model_json_schema(),
                },
            },
            temperature=0,
            max_completion_tokens=800,
        )

        results = json.loads(response.choices[0].message.content)
        return ResumeExtractionValidation.model_validate(results)

    except APITimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="LLM request timed out. Please try again.",
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=e.message or "LLM service error. Please try again.",
        )
