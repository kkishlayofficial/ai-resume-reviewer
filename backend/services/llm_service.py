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

# Ordered list of models to try for structured JSON output tasks.
# The first model is the primary; subsequent models are fallbacks.
GROQ_MODELS: list[str] = [
    "openai/gpt-oss-120b",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-safeguard-20b"
]

# Auth errors mean the API key is invalid — no point trying other models.
_AUTH_ERROR_CODES = {401, 403}


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


def _chat_with_fallback(
    messages: list[dict],
    schema_name: str,
    schema: dict,
    max_tokens: int,
):
    """
    Attempt a structured-output chat completion using each model in GROQ_MODELS.
    Falls through to the next model on rate-limit (429), overload (503), timeout,
    or unsupported-feature (400) errors. Auth errors (401/403) are re-raised
    immediately. Raises the last encountered exception if all models fail.
    """
    last_exc: Exception | None = None
    for model in GROQ_MODELS:
        try:
            return client.chat.completions.create(
                messages=messages,
                model=model,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name,
                        "strict": True,
                        "schema": schema,
                    },
                },
                temperature=0,
                max_completion_tokens=max_tokens,
            )
        except APIConnectionError:
            raise  # Network is down — no point trying other models
        except APIStatusError as e:
            if e.status_code in _AUTH_ERROR_CODES:
                raise  # Invalid API key — fail fast
            last_exc = e
        except APITimeoutError as e:
            last_exc = e
    raise last_exc  # type: ignore[misc]


def generate_resume_review(
    system_prompt: str, user_prompt: str
) -> ResumeReviewAIOutput:

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        response = _chat_with_fallback(
            messages=messages,
            schema_name="ResumeReviewAIOutput",
            schema=make_strict_schema(ResumeReviewAIOutput.model_json_schema()),
            max_tokens=3000,
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

        response = _chat_with_fallback(
            messages=messages,
            schema_name="Resume",
            schema=make_strict_schema(Resume.model_json_schema()),
            max_tokens=4000,
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
