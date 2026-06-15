# Backend Tests

Run backend tests with pytest:

```bash
cd backend
pip install pytest pytest-cov
pytest tests/ -v --cov=services --cov=schemas --cov=routes
```

## Test Files

- **test_extraction_service.py** — Text extraction from PDF and DOCX files
- **test_score_service.py** — Score calculation and weighting
- **test_llm_service.py** — LLM service, schema transformation, resume validation
- **test_resume_service.py** — Resume processing, validation, preprocessing
- **test_schemas.py** — Pydantic model validation
- **conftest.py** — Pytest configuration

## Coverage

Each test file targets 100% coverage of its corresponding service module.
