import pytest

# This file allows running all backend tests with pytest


def test_all_services_importable():
    """Verify all services can be imported."""
    from services import extraction_service, score_service, llm_service, resume_service
    assert extraction_service is not None
    assert score_service is not None
    assert llm_service is not None
    assert resume_service is not None


def test_all_schemas_importable():
    """Verify all schemas can be imported."""
    from schemas import resume
    assert resume is not None


# Run tests with: pytest backend/tests/
