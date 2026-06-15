import os
import copy
from groq import Groq, APITimeoutError, APIStatusError, APIConnectionError
from schemas.resume import ResumeReviewAIOutput, ResumeExtractionValidation, Resume
from prompts.resume import SYSTEM_PROMPT_FOR_RESUME_PARSING
from dotenv import load_dotenv
import json
from fastapi import HTTPException, status

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def make_strict_schema(schema: dict) -> dict:
    """
    Make a Pydantic-generated JSON schema compatible with OpenAI strict mode.
    - Adds a `required` array listing every key in `properties` for each object.
    - Sets `additionalProperties: false` on every object.
    - Removes `default` values (not allowed in strict mode).
    """
    schema = copy.deepcopy(schema)

    def process(node: dict) -> None:
        if not isinstance(node, dict):
            return

        node.pop("default", None)

        if "properties" in node:
            node["required"] = list(node["properties"].keys())
            node.setdefault("additionalProperties", False)
            for child in node["properties"].values():
                process(child)

        for key in ("$defs", "definitions"):
            if key in node:
                for defn in node[key].values():
                    process(defn)

        if "items" in node:
            process(node["items"])

        for combiner in ("anyOf", "allOf", "oneOf"):
            if combiner in node:
                for item in node[combiner]:
                    process(item)

    process(schema)
    return schema


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
                    "schema": make_strict_schema(ResumeReviewAIOutput.model_json_schema()),
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
    except APIConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach the AI service. Check your network connection and API key.",
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=e.message or "LLM service error. Please try again.",
        )


def parse_resume(extracted_text: str) -> Resume:
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT_FOR_RESUME_PARSING},
            {"role": "user", "content": extracted_text},
        ]

        response = client.chat.completions.create(
            messages=messages,
            model="openai/gpt-oss-120b",
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "Resume",
                    "strict": True,
                    "schema": make_strict_schema(Resume.model_json_schema()),
                },
            },
            temperature=0,
            max_completion_tokens=4000,
        )

        results = json.loads(response.choices[0].message.content)
        return Resume.model_validate(results)
    except APITimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="LLM request timed out. Please try again.",
        )
    except APIConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach the AI service. Check your network connection and API key.",
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=e.message or "LLM service error. Please try again.",
        )


_RESUME_KEYWORDS = [
    "experience", "education", "skills", "projects", "summary",
    "employment", "work experience", "certifications", "objective",
    "achievements", "volunteer", "internship",
]


def is_valid_resume(resume_text: str) -> ResumeExtractionValidation:
    """Heuristic-based resume validation — no LLM call required."""
    text_lower = resume_text.lower()
    matched = [kw for kw in _RESUME_KEYWORDS if kw in text_lower]
    confidence = min(len(matched) / 3, 1.0)  # 3+ matches → full confidence
    is_resume = confidence >= 0.34           # at least 1 keyword match
    if is_resume:
        message = "Document appears to be a valid resume."
    else:
        message = (
            "The uploaded document does not appear to be a resume. "
            "Please upload a CV or resume file."
        )
    return ResumeExtractionValidation(
        is_resume=is_resume,
        confidence=round(confidence, 2),
        validation_message=message,
    )
