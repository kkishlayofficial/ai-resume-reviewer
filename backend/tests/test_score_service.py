import pytest
from services.score_service import generate_overall_score, ATS_WEIGHT, TECH_WEIGHT, COMM_WEIGHT


class TestGenerateOverallScore:
    """Test score calculation."""
    
    def test_weights_sum_to_one(self):
        """Verify weights sum to 1.0."""
        total = ATS_WEIGHT + TECH_WEIGHT + COMM_WEIGHT
        assert abs(total - 1.0) < 0.001
    
    def test_all_scores_100(self):
        """Test when all sub-scores are 100."""
        result = generate_overall_score(100, 100, 100)
        assert result == 100
    
    def test_all_scores_0(self):
        """Test when all sub-scores are 0."""
        result = generate_overall_score(0, 0, 0)
        assert result == 0
    
    def test_weighted_calculation(self):
        """Test weighted average calculation."""
        # ATS=80, TECH=90, COMM=70
        # Expected: 80*0.3 + 90*0.5 + 70*0.2 = 24 + 45 + 14 = 83
        result = generate_overall_score(80, 90, 70)
        assert result == 83
    
    def test_rounding_up(self):
        """Test rounding behavior."""
        # Test case that should round up
        result = generate_overall_score(85, 85, 85)
        assert result == 85
    
    def test_rounding_down(self):
        """Test rounding behavior."""
        # Test case that should round down
        result = generate_overall_score(84, 84, 84)
        assert result == 84
    
    def test_mixed_scores(self):
        """Test with various score combinations."""
        result = generate_overall_score(50, 75, 60)
        # 50*0.3 + 75*0.5 + 60*0.2 = 15 + 37.5 + 12 = 64.5 → 65 (rounded)
        assert 64 <= result <= 65
    
    def test_high_ats_low_others(self):
        """Test high ATS, low technical and communication."""
        result = generate_overall_score(100, 20, 30)
        # 100*0.3 + 20*0.5 + 30*0.2 = 30 + 10 + 6 = 46
        assert result == 46
    
    def test_low_ats_high_technical(self):
        """Test low ATS but high technical."""
        result = generate_overall_score(30, 100, 50)
        # 30*0.3 + 100*0.5 + 50*0.2 = 9 + 50 + 10 = 69
        assert result == 69
    
    def test_score_range_boundaries(self):
        """Test various boundary scores."""
        for ats in [0, 25, 50, 75, 100]:
            for tech in [0, 25, 50, 75, 100]:
                for comm in [0, 25, 50, 75, 100]:
                    result = generate_overall_score(ats, tech, comm)
                    assert 0 <= result <= 100
