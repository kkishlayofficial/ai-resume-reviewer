ATS_WEIGHT = 0.3
TECH_WEIGHT = 0.5
COMM_WEIGHT = 0.2


def generate_overall_score(
    ats_score: int, technical_score: int, communication_score: int
) -> int:
    overall_score = round(
        (
            ats_score * ATS_WEIGHT
            + technical_score * TECH_WEIGHT
            + communication_score * COMM_WEIGHT
        )
    )
    return overall_score
