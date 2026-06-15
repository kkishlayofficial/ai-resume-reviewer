import type { Resume } from '../../../types/resume';

/**
 * Serialize a structured Resume model into clean plain text for LLM review.
 * Produces a format that the review prompt expects.
 */
export function resumeToText(resume: Resume): string {
  const lines: string[] = [];

  const { contact, summary, experience, education, skills, projects, certifications } = resume;

  // ── Contact ──────────────────────────────────────────────────────────────
  if (contact.name) lines.push(contact.name);
  const contactDetails = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
  ].filter(Boolean);
  if (contactDetails.length > 0) lines.push(contactDetails.join(' | '));

  // ── Summary ───────────────────────────────────────────────────────────────
  if (summary) {
    lines.push('');
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(summary);
  }

  // ── Experience ────────────────────────────────────────────────────────────
  const validExp = experience.filter((e) => e.company || e.role);
  if (validExp.length > 0) {
    lines.push('');
    lines.push('WORK EXPERIENCE');
    for (const exp of validExp) {
      lines.push('');
      const header = [exp.role, exp.company, exp.duration].filter(Boolean).join(' | ');
      lines.push(header);
      for (const bullet of exp.bullets) {
        if (bullet.trim()) lines.push(`• ${bullet.replace(/^[•\-\s]+/, '')}`);
      }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  const validEdu = education.filter((e) => e.institution);
  if (validEdu.length > 0) {
    lines.push('');
    lines.push('EDUCATION');
    for (const edu of validEdu) {
      lines.push('');
      const header = [edu.degree, edu.institution, edu.duration].filter(Boolean).join(' | ');
      lines.push(header);
      for (const detail of edu.details) {
        if (detail.trim()) lines.push(`• ${detail}`);
      }
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const validSkills = skills.filter(Boolean);
  if (validSkills.length > 0) {
    lines.push('');
    lines.push('SKILLS');
    lines.push(validSkills.join(', '));
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  const validProjects = projects.filter((p) => p.name);
  if (validProjects.length > 0) {
    lines.push('');
    lines.push('PROJECTS');
    for (const proj of validProjects) {
      lines.push('');
      lines.push(proj.name);
      if (proj.description) lines.push(proj.description);
      for (const bullet of proj.bullets) {
        if (bullet.trim()) lines.push(`• ${bullet.replace(/^[•\-\s]+/, '')}`);
      }
      if (proj.technologies.length > 0) {
        lines.push(`Technologies: ${proj.technologies.filter(Boolean).join(', ')}`);
      }
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  const validCerts = certifications.filter(Boolean);
  if (validCerts.length > 0) {
    lines.push('');
    lines.push('CERTIFICATIONS');
    for (const cert of validCerts) {
      lines.push(`• ${cert}`);
    }
  }

  return lines.join('\n').trim();
}
