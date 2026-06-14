from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.pdfbase.pdfmetrics import stringWidth
import datetime
from schemas.resume import ResumeReviewResponse


PRIMARY = colors.HexColor("#2563EB")
SUCCESS = colors.HexColor("#16A34A")
WARNING = colors.HexColor("#F59E0B")
DANGER = colors.HexColor("#DC2626")
LIGHT = colors.HexColor("#F3F4F6")
TEXT = colors.HexColor("#111827")


styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "TitleStyle",
    parent=styles["Title"],
    fontSize=24,
    textColor=PRIMARY,
    spaceAfter=20,
)

heading_style = ParagraphStyle(
    "Heading",
    parent=styles["Heading2"],
    fontSize=16,
    textColor=TEXT,
    spaceAfter=10,
)

body_style = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontSize=10,
    leading=18,
)

small_style = ParagraphStyle(
    "Small",
    parent=styles["BodyText"],
    fontSize=9,
    textColor=colors.grey,
)

card_title = ParagraphStyle(
    "CardTitle",
    parent=styles["BodyText"],
    alignment=1,
    fontSize=11,
    textColor=colors.grey,
)

card_score = ParagraphStyle(
    "CardScore",
    parent=styles["Heading1"],
    alignment=1,
    fontSize=24,
    textColor=PRIMARY,
)

bullet_style = ParagraphStyle(
    "Bullet",
    parent=styles["BodyText"],
    fontSize=10,
    leading=18,
    leftIndent=16,
    firstLineIndent=-10,
)


# Unicode characters outside Latin-1 that Helvetica cannot render
_UNICODE_REPLACEMENTS = str.maketrans({
    "\u2013": "-",   # en dash
    "\u2014": "-",   # em dash
    "\u2012": "-",   # figure dash
    "\u2011": "-",   # non-breaking hyphen
    "\u2010": "-",   # hyphen
    "\u2018": "'",   # left single quotation mark
    "\u2019": "'",   # right single quotation mark
    "\u201c": '"',   # left double quotation mark
    "\u201d": '"',   # right double quotation mark
    "\u2026": "...", # ellipsis
    "\u00b7": "-",   # middle dot
    "\u2022": "-",   # bullet
})


def sanitize(text: str) -> str:
    """Replace characters outside Helvetica's Latin-1 range with ASCII equivalents."""
    return text.translate(_UNICODE_REPLACEMENTS)


def score_bar(score):
    """
    Creates a horizontal score bar.
    """

    width = 320
    height = 10

    drawing = Drawing(width, height)

    drawing.add(
        Rect(
            0,
            0,
            width,
            height,
            fillColor=LIGHT,
            strokeColor=LIGHT,
        )
    )

    drawing.add(
        Rect(
            0,
            0,
            width * score / 100,
            height,
            fillColor=SUCCESS,
            strokeColor=SUCCESS,
        )
    )

    return drawing


def bullet_section(title, items, elements):
    elements.append(Paragraph(title, heading_style))
    for item in items:
        elements.append(Paragraph(f"- {sanitize(item)}", bullet_style))
    elements.append(Spacer(1, 12))


def generate_pdf(data: ResumeReviewResponse, output_path="resume-analysis.pdf"):

    doc = SimpleDocTemplate(
        output_path,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )

    elements = []

    # -------------------------
    # Header
    # -------------------------

    elements.append(
        Paragraph(
            "Resume Analysis Report",
            title_style,
        )
    )

    elements.append(
        Paragraph(
            f"Generated on {datetime.datetime.now().strftime('%d %b %Y %I:%M %p')}",
            small_style,
        )
    )

    elements.append(Spacer(1, 20))

    # -------------------------
    # Overall Score
    # -------------------------

    overall = data["overall_score"]

    elements.append(
        Paragraph(
            f"<b>Overall Score: {overall}/100</b>",
            heading_style,
        )
    )

    elements.append(score_bar(overall))
    elements.append(Spacer(1, 20))

    # -------------------------
    # Score Cards
    # -------------------------

    cards = [
        [
            Paragraph("ATS", card_title),
            Paragraph("Technical", card_title),
            Paragraph("Communication", card_title),
        ],
        [
            Paragraph(str(data["ats_score"]["score"]), card_score),
            Paragraph(str(data["technical_score"]["score"]), card_score),
            Paragraph(str(data["communication_score"]["score"]), card_score),
        ],
    ]

    table = Table(cards, colWidths=[2.1 * inch] * 3)

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 1, colors.white),
                ("GRID", (0, 0), (-1, -1), 8, colors.white),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
                ("TOPPADDING", (0, 0), (-1, -1), 16),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )

    elements.append(table)
    elements.append(Spacer(1, 25))

    # -------------------------
    # Executive Summary
    # -------------------------

    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Paragraph(sanitize(data["summary"]), body_style))
    elements.append(Spacer(1, 20))

    # -------------------------
    # Detailed Scores
    # -------------------------

    for title, section in [
        ("ATS Analysis", data["ats_score"]),
        ("Technical Analysis", data["technical_score"]),
        ("Communication Analysis", data["communication_score"]),
    ]:
        elements.append(Paragraph(title, heading_style))
        elements.append(
            Paragraph(
                f"<b>Score:</b> {section['score']}/100",
                body_style,
            )
        )
        elements.append(
            Paragraph(
                sanitize(section["reasoning"]),
                body_style,
            )
        )
        elements.append(Spacer(1, 15))

    # -------------------------
    # Skills
    # -------------------------

    elements.append(Paragraph("Skills", heading_style))
    elements.append(Paragraph(sanitize(", ".join(data["skills"])), body_style))
    elements.append(Spacer(1, 12))

    # -------------------------
    # Strengths
    # -------------------------

    bullet_section("Strengths", data["strengths"], elements)

    # -------------------------
    # Weaknesses
    # -------------------------

    bullet_section("Weaknesses", data["weaknesses"], elements)

    # -------------------------
    # Missing Keywords
    # -------------------------

    bullet_section(
        "Missing Keywords",
        data["missing_keywords"],
        elements,
    )

    # -------------------------
    # Recommendations
    # -------------------------

    elements.append(Paragraph("Recommendations", heading_style))

    recommendation_rows = [
        [
            Paragraph("<b>Priority</b>", body_style),
            Paragraph("<b>Title</b>", body_style),
            Paragraph("<b>Recommendation</b>", body_style),
        ]
    ]

    for rec in data["recommendations"]:
        priority = rec["priority"].lower()

        if priority == "high":
            color = DANGER

        elif priority == "medium":
            color = WARNING

        else:
            color = SUCCESS

        recommendation_rows.append(
            [
                Paragraph(
                    f'<font color="{color}"><b>{priority.upper()}</b></font>',
                    body_style,
                ),
                Paragraph(sanitize(rec["title"]), body_style),
                Paragraph(sanitize(rec["recommendation"]), body_style),
            ]
        )

    rec_table = Table(
        recommendation_rows,
        colWidths=[
            1 * inch,
            2.2 * inch,
            3.3 * inch,
        ],
    )

    rec_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 10),
                ("TOPPADDING", (0, 1), (-1, -1), 10),
            ]
        )
    )

    elements.append(rec_table)
    elements.append(Spacer(1, 20))

    # -------------------------
    # Job Fit
    # -------------------------

    elements.append(Paragraph("Job Fit", heading_style))

    fit = "Good Fit [YES]" if data["job_fit"]["fit"] else "Not a Good Fit [NO]"

    elements.append(
        Paragraph(
            f"<b>{fit}</b>",
            body_style,
        )
    )

    elements.append(
        Paragraph(
            sanitize(data["job_fit"]["explanation"]),
            body_style,
        )
    )

    elements.append(Spacer(1, 20))

    # -------------------------
    # Footer
    # -------------------------

    elements.append(
        Paragraph(
            "This report was automatically generated using AI analysis.",
            small_style,
        )
    )

    doc.build(elements)

    return output_path


# Example usage
if __name__ == "__main__":
    import json

    with open("resume_analysis.json", "r") as f:
        analysis = json.load(f)

    generate_pdf(analysis)

    print("PDF generated successfully!")
