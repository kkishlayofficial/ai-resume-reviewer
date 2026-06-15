import pytest
from unittest.mock import Mock, patch, MagicMock
from services.llm_service import (
    make_strict_schema,
    is_valid_resume,
    _AUTH_ERROR_CODES,
    GROQ_MODELS,
)


class TestMakeStrictSchema:
    """Test JSON schema transformation for strict mode."""
    
    def test_adds_required_fields(self):
        """Test that required array is added."""
        schema = {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"},
            },
        }
        result = make_strict_schema(schema)
        assert "required" in result
        assert set(result["required"]) == {"name", "age"}
    
    def test_removes_default_values(self):
        """Test that default values are removed."""
        schema = {
            "type": "object",
            "properties": {
                "name": {"type": "string", "default": "John"},
            },
            "default": "test",
        }
        result = make_strict_schema(schema)
        assert "default" not in result
        assert "default" not in result.get("properties", {}).get("name", {})
    
    def test_sets_additional_properties_false(self):
        """Test that additionalProperties is set to false."""
        schema = {
            "type": "object",
            "properties": {"name": {"type": "string"}},
        }
        result = make_strict_schema(schema)
        assert result.get("additionalProperties") is False
    
    def test_nested_object_processing(self):
        """Test that nested objects are processed."""
        schema = {
            "type": "object",
            "properties": {
                "contact": {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                    },
                }
            },
        }
        result = make_strict_schema(schema)
        contact = result["properties"]["contact"]
        assert "required" in contact
        assert set(contact["required"]) == {"email", "phone"}
    
    def test_does_not_mutate_original(self):
        """Test that original schema is not mutated."""
        schema = {
            "type": "object",
            "properties": {"name": {"type": "string", "default": "John"}},
        }
        original = str(schema)
        make_strict_schema(schema)
        assert str(schema) == original


class TestIsValidResume:
    """Test heuristic resume validation."""
    
    def test_valid_resume_with_keywords(self):
        """Test text with resume keywords."""
        text = "John Smith\nExperience: 5 years\nEducation: B.S. Computer Science\nSkills: Python, JavaScript"
        result = is_valid_resume(text)
        assert result.is_resume is True
        assert result.confidence > 0.3
    
    def test_invalid_resume_no_keywords(self):
        """Test text without resume keywords."""
        text = "This is just some random text about cooking recipes and gardening tips."
        result = is_valid_resume(text)
        assert result.is_resume is False
        assert result.confidence < 0.34
    
    def test_single_keyword_match(self):
        """Test with exactly one keyword is not enough."""
        text = "I have extensive experience in my field."
        result = is_valid_resume(text)
        # 1 keyword gives confidence 1/3 = 0.333 < 0.34, so is_resume is False
        assert result.is_resume is False
        assert result.confidence < 0.34
    
    def test_multiple_keywords(self):
        """Test with multiple keywords."""
        text = "Experience: 10 years. Education: MBA. Skills: Leadership. Certifications: PMP"
        result = is_valid_resume(text)
        assert result.is_resume is True
        assert result.confidence >= 0.34
    
    def test_confidence_score(self):
        """Test confidence scoring."""
        text_low = "I have experience skills."  # 2 keywords
        text_high = "EXPERIENCE Education SKILLS PROJECTS SUMMARY EMPLOYMENT CERTIFICATIONS"  # 7 keywords
        
        result_low = is_valid_resume(text_low)
        result_high = is_valid_resume(text_high)
        
        assert result_low.confidence <= result_high.confidence
        assert result_low.confidence > 0  # 2 keywords should give > 0.34
        assert result_low.is_resume is True  # 2 keywords is enough
    
    def test_validation_message_for_invalid(self):
        """Test validation message for invalid resume."""
        text = "Not a resume"
        result = is_valid_resume(text)
        assert "does not appear to be a resume" in result.validation_message
    
    def test_validation_message_for_valid(self):
        """Test validation message for valid resume."""
        text = "Experience and Education are important. Skills too."  # 3+ keywords
        result = is_valid_resume(text)
        assert "valid resume" in result.validation_message or result.is_resume is True
    
    def test_case_insensitive_matching(self):
        """Test that keyword matching is case-insensitive."""
        text_upper = "EXPERIENCE EDUCATION SKILLS"
        text_lower = "experience education skills"
        
        result_upper = is_valid_resume(text_upper)
        result_lower = is_valid_resume(text_lower)
        
        assert result_upper.is_resume == result_lower.is_resume
    
    def test_auth_error_codes(self):
        """Test AUTH_ERROR_CODES constant."""
        assert 401 in _AUTH_ERROR_CODES
        assert 403 in _AUTH_ERROR_CODES


class TestGroqModels:
    """Test Groq model list."""
    
    def test_groq_models_list_exists(self):
        """Test GROQ_MODELS list is defined."""
        assert isinstance(GROQ_MODELS, list)
        assert len(GROQ_MODELS) > 0
    
    def test_groq_models_first_is_primary(self):
        """Test first model is the primary."""
        assert "openai/gpt-oss-120b" in GROQ_MODELS[0]
    
    def test_groq_models_all_strings(self):
        """Test all models are strings."""
        for model in GROQ_MODELS:
            assert isinstance(model, str)
            assert len(model) > 0
