export interface ApplyResult {
  newText: string;
  insertedStart: number;
  insertedEnd: number;
}

// Map each canonical section name to the header variants it may appear as in a resume
const SECTION_HEADERS: Record<string, string[]> = {
  summary: [
    'summary',
    'professional summary',
    'profile',
    'objective',
    'career objective',
    'professional profile',
    'about',
    'about me',
  ],
  experience: [
    'experience',
    'work experience',
    'employment',
    'work history',
    'professional experience',
    'employment history',
    'career history',
  ],
  skills: [
    'skills',
    'technical skills',
    'core competencies',
    'technologies',
    'tools',
    'expertise',
    'technical expertise',
    'key skills',
  ],
  projects: [
    'projects',
    'personal projects',
    'side projects',
    'portfolio',
    'key projects',
    'notable projects',
  ],
  education: [
    'education',
    'academic background',
    'qualifications',
    'academic qualifications',
    'educational background',
  ],
};

const ALL_HEADER_VARIANTS = Object.values(SECTION_HEADERS).flat();

/** Normalise a line for header comparison: trim, lowercase, strip trailing punctuation */
function normaliseLine(line: string): string {
  return line.trim().toLowerCase().replace(/[:\-–—]+$/, '').trim();
}

function isSectionHeader(line: string, section: string): boolean {
  const norm = normaliseLine(line);
  const variants = SECTION_HEADERS[section] ?? [];
  return variants.some((v) => norm === v);
}

function isAnyKnownHeader(line: string): boolean {
  const norm = normaliseLine(line);
  return ALL_HEADER_VARIANTS.some((v) => norm === v);
}

/**
 * Apply an `append` or `insert` recommendation to the resume text.
 *
 * `append` — inserts `suggestedContent` after the last non-empty line of the target section
 * (i.e. before the next section header, or at the end of the document).
 *
 * `insert` — inserts `suggestedContent` immediately after the section header line.
 *
 * Returns the modified text together with the character range `[insertedStart, insertedEnd)`
 * of the newly inserted content, so the caller can highlight it.
 *
 * If the section header cannot be found the content is appended at the very end.
 */
export function applyRecommendationToText(
  text: string,
  section: string,
  action: 'append' | 'insert',
  suggestedContent: string,
): ApplyResult {
  const lines = text.split('\n');

  // ── Locate the section header ────────────────────────────────────────────
  let sectionLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isSectionHeader(lines[i], section)) {
      sectionLineIdx = i;
      break;
    }
  }

  // ── Fallback: section not found — append at document end ────────────────
  if (sectionLineIdx === -1) {
    const sep = text.endsWith('\n') ? '' : '\n';
    const prefix = `\n${section.toUpperCase()}\n`;
    const insertedStart = text.length + sep.length + prefix.length;
    const toInsert = suggestedContent;
    const newText = text + sep + prefix + toInsert + '\n';
    return { newText, insertedStart, insertedEnd: insertedStart + toInsert.length };
  }

  // ── Find where the section ends (next known section header) ─────────────
  let nextSectionLineIdx = lines.length;
  for (let i = sectionLineIdx + 1; i < lines.length; i++) {
    if (isAnyKnownHeader(lines[i])) {
      nextSectionLineIdx = i;
      break;
    }
  }

  // ── Compute character position for insertion ─────────────────────────────
  let insertCharPos: number;

  if (action === 'insert') {
    // insert: add at the end of the section (same as append)
    let lastNonEmptyIdx = sectionLineIdx;
    for (let i = sectionLineIdx + 1; i < nextSectionLineIdx; i++) {
      if (lines[i].trim() !== '') {
        lastNonEmptyIdx = i;
      }
    }
    insertCharPos = 0;
    for (let i = 0; i <= lastNonEmptyIdx; i++) {
      insertCharPos += lines[i].length + 1;
    }
  } else {
    // append: find the last non-empty line inside the section
    let lastNonEmptyIdx = sectionLineIdx;
    for (let i = sectionLineIdx + 1; i < nextSectionLineIdx; i++) {
      if (lines[i].trim() !== '') {
        lastNonEmptyIdx = i;
      }
    }
    insertCharPos = 0;
    for (let i = 0; i <= lastNonEmptyIdx; i++) {
      insertCharPos += lines[i].length + 1;
    }
  }

  const toInsert = suggestedContent + '\n';
  const newText = text.slice(0, insertCharPos) + toInsert + text.slice(insertCharPos);

  return {
    newText,
    insertedStart: insertCharPos,
    insertedEnd: insertCharPos + suggestedContent.length,
  };
}
