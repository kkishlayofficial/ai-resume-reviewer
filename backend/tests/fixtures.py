import pytest
from pytest_cov.plugin import CovPlugin

# This file can be used for shared fixtures and configuration


@pytest.fixture
def sample_resume_text():
    """Provide sample resume text for testing."""
    return """John Smith
john@example.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years building production systems.

WORK EXPERIENCE

Senior Engineer | TechCorp Inc. | 2021 – Present
• Led team of 5 engineers
• Improved performance by 40%
• Mentored junior developers

Software Engineer | StartupXYZ | 2019 – 2021
• Built authentication system
• Implemented microservices architecture
• Reduced API latency by 30%

EDUCATION
B.S. Computer Science | University of Technology | 2019

SKILLS
Python, JavaScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes
"""


@pytest.fixture
def sample_job_description():
    """Provide sample job description for testing."""
    return """Senior Software Engineer

Requirements:
- 5+ years of software development experience
- Strong Python and JavaScript skills
- Experience with React and Node.js
- AWS or cloud platform experience
- Docker and container orchestration
- Excellent communication skills

Responsibilities:
- Design and implement scalable systems
- Mentor junior engineers
- Collaborate with product team
- Conduct code reviews
- Participate in architecture decisions
"""


# Run tests with: pytest backend/tests/ --cov
