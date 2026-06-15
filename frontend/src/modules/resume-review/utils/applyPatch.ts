import type { Resume, PatchOperation } from '../../../types/resume';

/**
 * Apply a PatchOperation to a structured Resume model.
 * Returns a new Resume (structuredClone) — never mutates the original.
 */
export function applyPatch(resume: Resume, patch: PatchOperation): Resume {
  const next = structuredClone(resume);

  switch (patch.section) {
    case 'skills':
      return applySkillsPatch(next, patch);

    case 'certifications':
      return applyCertificationsPatch(next, patch);

    case 'summary':
      return applySummaryPatch(next, patch);

    case 'experience':
      return applyExperiencePatch(next, patch);

    case 'projects':
      return applyProjectsPatch(next, patch);

    case 'education':
      return applyEducationPatch(next, patch);

    default:
      return next;
  }
}

// ─── Section handlers ─────────────────────────────────────────────────────────

function applySkillsPatch(resume: Resume, patch: PatchOperation): Resume {
  if (patch.operation === 'append') {
    if (!resume.skills.includes(patch.content)) {
      resume.skills = [...resume.skills, patch.content];
    }
  } else if (patch.operation === 'replace' && patch.target) {
    resume.skills = resume.skills.map((s) =>
      s === patch.target ? patch.content : s,
    );
  }
  return resume;
}

function applyCertificationsPatch(resume: Resume, patch: PatchOperation): Resume {
  if (patch.operation === 'append') {
    if (!resume.certifications.includes(patch.content)) {
      resume.certifications = [...resume.certifications, patch.content];
    }
  } else if (patch.operation === 'replace' && patch.target) {
    resume.certifications = resume.certifications.map((c) =>
      c === patch.target ? patch.content : c,
    );
  }
  return resume;
}

function applySummaryPatch(resume: Resume, patch: PatchOperation): Resume {
  if (patch.operation === 'append') {
    resume.summary = resume.summary
      ? `${resume.summary}\n${patch.content}`
      : patch.content;
  } else if (patch.operation === 'replace') {
    // Replace specific text if target provided; otherwise replace the whole summary
    if (patch.target && resume.summary.includes(patch.target)) {
      resume.summary = resume.summary.replace(patch.target, patch.content);
    } else {
      resume.summary = patch.content;
    }
  }
  return resume;
}

function applyExperiencePatch(resume: Resume, patch: PatchOperation): Resume {
  if (!patch.item_name) {
    // No item_name — append bullet to the most recent experience entry
    if (resume.experience.length > 0 && patch.operation === 'append') {
      resume.experience[0] = {
        ...resume.experience[0],
        bullets: [...resume.experience[0].bullets, patch.content],
      };
    }
    return resume;
  }

  const idx = findExperienceIndex(resume, patch.item_name);
  if (idx === -1) return resume;

  const exp = { ...resume.experience[idx] };

  if (patch.operation === 'append') {
    exp.bullets = [...exp.bullets, patch.content];
  } else if (patch.operation === 'replace' && patch.target) {
    exp.bullets = exp.bullets.map((b) =>
      b === patch.target || b.includes(patch.target!) ? patch.content : b,
    );
  }

  resume.experience = [
    ...resume.experience.slice(0, idx),
    exp,
    ...resume.experience.slice(idx + 1),
  ];
  return resume;
}

function applyProjectsPatch(resume: Resume, patch: PatchOperation): Resume {
  if (!patch.item_name) {
    if (resume.projects.length > 0 && patch.operation === 'append') {
      resume.projects[0] = {
        ...resume.projects[0],
        bullets: [...resume.projects[0].bullets, patch.content],
      };
    }
    return resume;
  }

  const idx = resume.projects.findIndex((p) =>
    p.name.toLowerCase().includes(patch.item_name!.toLowerCase()) ||
    patch.item_name!.toLowerCase().includes(p.name.toLowerCase()),
  );
  if (idx === -1) return resume;

  const proj = { ...resume.projects[idx] };

  if (patch.operation === 'append') {
    proj.bullets = [...proj.bullets, patch.content];
  } else if (patch.operation === 'replace' && patch.target) {
    proj.bullets = proj.bullets.map((b) =>
      b === patch.target || b.includes(patch.target!) ? patch.content : b,
    );
  }

  resume.projects = [
    ...resume.projects.slice(0, idx),
    proj,
    ...resume.projects.slice(idx + 1),
  ];
  return resume;
}

function applyEducationPatch(resume: Resume, patch: PatchOperation): Resume {
  if (patch.operation === 'append') {
    if (resume.education.length > 0) {
      resume.education[0] = {
        ...resume.education[0],
        details: [...resume.education[0].details, patch.content],
      };
    }
  }
  return resume;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findExperienceIndex(resume: Resume, itemName: string): number {
  // First try exact match, then partial match
  const lower = itemName.toLowerCase();
  let idx = resume.experience.findIndex(
    (e) => e.company.toLowerCase() === lower,
  );
  if (idx === -1) {
    idx = resume.experience.findIndex(
      (e) =>
        e.company.toLowerCase().includes(lower) ||
        lower.includes(e.company.toLowerCase()),
    );
  }
  return idx;
}
