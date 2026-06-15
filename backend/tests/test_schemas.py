import pytest
from schemas.resume import (
    Priority,
    ExperienceLevel,
    ContactInfo,
    Experience,
    Education,
    Project,
    Resume,
    PatchOperation,
    JobFit,
    ScoredAssessment,
    ResumeExtractionResponse,
    ParseResumeResponse,
    ResumeExtractionValidation,
)


class TestEnums:
    """Test enum values."""
    
    def test_priority_enum(self):
        """Test Priority enum."""
        assert Priority.HIGH.value == "high"
        assert Priority.MEDIUM.value == "medium"
        assert Priority.LOW.value == "low"
    
    def test_experience_level_enum(self):
        """Test ExperienceLevel enum."""
        assert ExperienceLevel.JUNIOR.value == "junior"
        assert ExperienceLevel.MID.value == "mid"
        assert ExperienceLevel.SENIOR.value == "senior"


class TestContactInfo:
    """Test ContactInfo schema."""
    
    def test_contact_info_empty(self):
        """Test creating empty ContactInfo."""
        contact = ContactInfo()
        assert contact.name == ""
        assert contact.email == ""
        assert contact.phone == ""
    
    def test_contact_info_with_values(self):
        """Test ContactInfo with values."""
        contact = ContactInfo(
            name="John Doe",
            email="john@example.com",
            phone="555-1234",
            location="NYC",
            linkedin="linkedin.com/in/john",
            github="github.com/john",
        )
        assert contact.name == "John Doe"
        assert contact.email == "john@example.com"
        assert contact.phone == "555-1234"
    
    def test_contact_info_forbids_extra_fields(self):
        """Test that extra fields are forbidden."""
        with pytest.raises(ValueError):
            ContactInfo(name="John", invalid_field="test")


class TestExperience:
    """Test Experience schema."""
    
    def test_experience_empty(self):
        """Test creating empty Experience."""
        exp = Experience()
        assert exp.company == ""
        assert exp.role == ""
        assert exp.duration == ""
        assert exp.bullets == []
    
    def test_experience_with_bullets(self):
        """Test Experience with bullets."""
        exp = Experience(
            company="TechCorp",
            role="Engineer",
            duration="2020-2023",
            bullets=["Led project", "Mentored team"],
        )
        assert exp.company == "TechCorp"
        assert len(exp.bullets) == 2
    
    def test_experience_forbids_extra_fields(self):
        """Test that extra fields are forbidden."""
        with pytest.raises(ValueError):
            Experience(company="Test", invalid="field")


class TestEducation:
    """Test Education schema."""
    
    def test_education_empty(self):
        """Test creating empty Education."""
        edu = Education()
        assert edu.institution == ""
        assert edu.degree == ""
        assert edu.duration == ""
        assert edu.details == []
    
    def test_education_with_details(self):
        """Test Education with details."""
        edu = Education(
            institution="University",
            degree="B.S. Computer Science",
            duration="2016-2020",
            details=["GPA: 3.8", "Dean's List"],
        )
        assert edu.institution == "University"
        assert len(edu.details) == 2
    
    def test_education_forbids_extra_fields(self):
        """Test that extra fields are forbidden."""
        with pytest.raises(ValueError):
            Education(institution="Test", invalid_field="test")


class TestProject:
    """Test Project schema."""
    
    def test_project_empty(self):
        """Test creating empty Project."""
        proj = Project()
        assert proj.name == ""
        assert proj.description == ""
        assert proj.bullets == []
    
    def test_project_with_data(self):
        """Test Project with data."""
        proj = Project(
            name="Resume Reviewer",
            description="AI-powered resume analysis tool",
            bullets=["Built with React", "FastAPI backend"],
            technologies=["React", "Python"],
        )
        assert proj.name == "Resume Reviewer"
        assert len(proj.bullets) == 2
    
    def test_project_forbids_extra_fields(self):
        """Test that extra fields are forbidden."""
        with pytest.raises(ValueError):
            Project(name="Test", invalid="field")


class TestCertifications:
    """Test certifications in Resume schema."""
    
    def test_certifications_empty_list(self):
        """Test creating certifications as empty list."""
        certifications = []
        assert certifications == []
    
    def test_certifications_with_values(self):
        """Test certifications as list of strings."""
        certifications = ["AWS Certified Solutions Architect", "Azure Administrator"]
        assert len(certifications) == 2
        assert "AWS Certified Solutions Architect" in certifications


class TestResume:
    """Test Resume schema."""
    
    def test_resume_empty(self):
        """Test creating empty Resume."""
        resume = Resume()
        assert resume.contact.name == ""
        assert resume.summary == ""
        assert resume.experience == []
        assert resume.education == []
        assert resume.skills == []
        assert resume.projects == []
        assert resume.certifications == []
    
    def test_resume_full(self):
        """Test Resume with all fields."""
        resume = Resume(
            contact=ContactInfo(name="John", email="john@test.com"),
            summary="Experienced engineer",
            experience=[
                Experience(company="Company A", role="Engineer"),
                Experience(company="Company B", role="Senior Engineer"),
            ],
            education=[Education(institution="University", degree="B.S.")],
            skills=["Python", "JavaScript"],
            projects=[Project(name="Project A")],
            certifications=["AWS"],
        )
        assert resume.contact.name == "John"
        assert len(resume.experience) == 2
        assert len(resume.skills) == 2
    
    def test_resume_forbids_extra_fields(self):
        """Test that extra fields are forbidden."""
        with pytest.raises(ValueError):
            Resume(invalid_field="test")


class TestPatchOperation:
    """Test PatchOperation schema."""
    
    def test_patch_operation_append(self):
        """Test append patch operation."""
        patch = PatchOperation(
            priority="high",
            title="Add skill",
            section="skills",
            operation="append",
            content="Docker",
            target=None,
            item_name=None,
            reasoning="Required skill",
        )
        assert patch.operation == "append"
        assert patch.content == "Docker"
    
    def test_patch_operation_replace(self):
        """Test replace patch operation."""
        patch = PatchOperation(
            priority="medium",
            title="Update bullet",
            section="experience",
            operation="replace",
            content="New description",
            target="Old description",
            item_name="Company",
            reasoning="Better phrasing",
        )
        assert patch.operation == "replace"
        assert patch.target == "Old description"
    
    def test_patch_operation_validates_priority(self):
        """Test priority validation."""
        patch = PatchOperation(
            priority="high",
            title="Test",
            section="skills",
            operation="append",
            content="Test",
            target=None,
            item_name=None,
            reasoning="Test",
        )
        assert patch.priority in ["high", "medium", "low"]
    
    def test_patch_operation_validates_section(self):
        """Test section validation."""
        valid_sections = ["summary", "experience", "skills", "projects", "education", "certifications"]
        for section in valid_sections:
            patch = PatchOperation(
                priority="high",
                title="Test",
                section=section,
                operation="append",
                content="Test",
                target=None,
                item_name=None,
                reasoning="Test",
            )
            assert patch.section == section


class TestJobFitSchema:
    """Test JobFit schema."""
    
    def test_jobfit_valid(self):
        """Test valid JobFit creation."""
        job_fit = JobFit(
            fit=True,
            explanation="Excellent match for the role"
        )
        assert job_fit.fit is True
        assert "Excellent" in job_fit.explanation
    
    def test_jobfit_not_fit(self):
        """Test JobFit with fit=False."""
        job_fit = JobFit(
            fit=False,
            explanation="Does not match the requirements"
        )
        assert job_fit.fit is False
    
    def test_jobfit_explanation_required(self):
        """Test JobFit explanation is required."""
        # Verify that explanation is stored
        job_fit = JobFit(
            fit=True,
            explanation="Any explanation"
        )
        assert len(job_fit.explanation) > 0


class TestResumeExtractionValidation:
    """Test ResumeExtractionValidation schema."""
    
    def test_validation_valid_resume(self):
        """Test validation for valid resume."""
        validation = ResumeExtractionValidation(
            is_resume=True,
            confidence=0.95,
            validation_message="This is a valid resume",
        )
        assert validation.is_resume is True
        assert validation.confidence == 0.95
    
    def test_validation_invalid_resume(self):
        """Test validation for invalid resume."""
        validation = ResumeExtractionValidation(
            is_resume=False,
            confidence=0.1,
            validation_message="This does not appear to be a resume",
        )
        assert validation.is_resume is False
        assert validation.confidence == 0.1
    
    def test_validation_confidence_range(self):
        """Test confidence is within 0-1 range."""
        for confidence in [0, 0.25, 0.5, 0.75, 1.0]:
            validation = ResumeExtractionValidation(
                is_resume=confidence > 0.33,
                confidence=confidence,
                validation_message="Test",
            )
            assert 0 <= validation.confidence <= 1
