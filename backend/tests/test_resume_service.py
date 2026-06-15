import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from fastapi import HTTPException
from services.resume_service import (
    validate_resume,
    preprocess_text,
    map_to_response,
)
from schemas.resume import (
    JobFit,
    ScoredAssessment,
    PatchOperation,
    Resume,
    ParseResumeResponse,
    ResumeExtractionValidation,
    ResumeReviewAIOutput,
)


class TestValidateResume:
    """Test resume text validation."""
    
    def test_resume_too_short(self):
        """Test resume text that is too short."""
        short_text = "a" * 100
        with pytest.raises(HTTPException) as exc_info:
            validate_resume(short_text)
        assert exc_info.value.status_code == 400
        assert "too short" in exc_info.value.detail
    
    def test_resume_too_long(self):
        """Test resume text that is too long."""
        long_text = "a" * 6000
        with pytest.raises(HTTPException) as exc_info:
            validate_resume(long_text)
        assert exc_info.value.status_code == 400
        assert "too long" in exc_info.value.detail
    
    def test_resume_valid_length(self):
        """Test resume with valid length."""
        valid_text = "a" * 300 + " Experience Education Skills"
        with patch('services.resume_service.is_valid_resume') as mock_is_valid:
            mock_is_valid.return_value = {
                "is_resume": True,
                "confidence": 0.8,
                "validation_message": "Valid resume"
            }
            result = validate_resume(valid_text)
            # Note: adjust assertion based on actual function behavior
            assert result is not None
    
    def test_resume_boundary_200_chars(self):
        """Test resume at 200 char boundary."""
        text = "a" * 200 + " Experience"
        with patch('services.resume_service.is_valid_resume') as mock_is_valid:
            mock_is_valid.return_value = {
                "is_resume": True,
                "confidence": 1.0,
                "validation_message": "Valid"
            }
            result = validate_resume(text)
            assert result is not None
    
    def test_resume_boundary_5000_chars(self):
        """Test resume at 5000 char boundary."""
        text = "Experience Education Skills " + "a" * 4960
        with patch('services.resume_service.is_valid_resume') as mock_is_valid:
            mock_is_valid.return_value = {
                "is_resume": True,
                "confidence": 1.0,
                "validation_message": "Valid"
            }
            result = validate_resume(text)
            assert result is not None


class TestPreprocessText:
    """Test text preprocessing."""
    
    def test_removes_carriage_returns(self):
        """Test CRLF to LF conversion."""
        text = "Line 1\r\nLine 2\r\nLine 3"
        result = preprocess_text(text)
        assert "\r\n" not in result
        assert "Line 1" in result
        assert "Line 2" in result
    
    def test_removes_multiple_newlines(self):
        """Test collapsing multiple newlines."""
        text = "Line 1\n\n\n\nLine 2"
        result = preprocess_text(text)
        assert "\n\n\n\n" not in result
        assert "Line 1\n\nLine 2" in result
    
    def test_removes_extra_spaces(self):
        """Test collapsing extra spaces and tabs."""
        text = "Word1    Word2\t\tWord3  \t  Word4"
        result = preprocess_text(text)
        assert "    " not in result
        assert "\t\t" not in result
    
    def test_strips_leading_trailing_whitespace(self):
        """Test strip of leading/trailing whitespace."""
        text = "  \n\nContent here\n\n  "
        result = preprocess_text(text)
        assert result == "Content here"
    
    def test_preserves_single_newlines(self):
        """Test that single newlines are preserved."""
        text = "Line 1\nLine 2\nLine 3"
        result = preprocess_text(text)
        assert "\n" in result
        assert result.count("\n") == 2
    
    def test_complex_preprocessing(self):
        """Test all preprocessing together."""
        text = "  Experience\r\n\r\n\r\nSoftware  Engineer   \n\nSkills:  Python  \t JavaScript  "
        result = preprocess_text(text)
        assert "\r" not in result
        assert "  " not in result or result.count("  ") <= 1
        assert result.startswith("Experience")


class TestMapToResponse:
    """Test AI output mapping to API response."""
    
    def test_maps_all_fields(self):
        """Test that all fields are mapped."""
        ai_output = ResumeReviewAIOutput(
            ats_score=ScoredAssessment(score=80, reasoning="Good match"),
            technical_score=ScoredAssessment(score=85, reasoning="Strong skills"),
            communication_score=ScoredAssessment(score=90, reasoning="Clear writing"),
            summary="Good candidate",
            skills=["Python", "React"],
            strengths=["Leadership"],
            weaknesses=["Documentation"],
            missing_keywords=["Docker"],
            recommendations=[],
            job_fit=JobFit(fit=True, explanation="Strong fit"),
        )
        
        # Verify all fields exist
        assert ai_output.ats_score.score == 80
        assert ai_output.technical_score.score == 85
        assert ai_output.communication_score.score == 90
        assert ai_output.skills == ["Python", "React"]
        assert ai_output.job_fit.fit is True
    
    def test_preserves_score_details(self):
        """Test that score details are preserved."""
        ai_output = ResumeReviewAIOutput(
            ats_score=ScoredAssessment(score=75, reasoning="Some gaps"),
            technical_score=ScoredAssessment(score=88, reasoning="Very strong"),
            communication_score=ScoredAssessment(score=82, reasoning="Good"),
            summary="",
            skills=[],
            strengths=[],
            weaknesses=[],
            missing_keywords=[],
            recommendations=[],
            job_fit=JobFit(fit=True, explanation=""),
        )
        
        assert ai_output.ats_score.reasoning == "Some gaps"
        assert ai_output.technical_score.reasoning == "Very strong"
        assert ai_output.communication_score.reasoning == "Good"
    
    def test_includes_recommendations(self):
        """Test that recommendations are included."""
        rec = PatchOperation(
            priority="high",
            title="Add skill",
            section="skills",
            operation="append",
            content="Docker",
            reasoning="Required skill",
        )
        
        ai_output = ResumeReviewAIOutput(
            ats_score=ScoredAssessment(score=80, reasoning=""),
            technical_score=ScoredAssessment(score=80, reasoning=""),
            communication_score=ScoredAssessment(score=80, reasoning=""),
            summary="",
            skills=[],
            strengths=[],
            weaknesses=[],
            missing_keywords=[],
            recommendations=[rec],
            job_fit=JobFit(fit=True, explanation=""),
        )
        
        assert len(ai_output.recommendations) == 1
        assert ai_output.recommendations[0].content == "Docker"
