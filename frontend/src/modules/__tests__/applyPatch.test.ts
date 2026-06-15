import { describe, it, expect } from 'vitest';
import type { Resume, PatchOperation } from '../../types/resume';
import { applyPatch } from '../../modules/resume-review/utils/applyPatch';

describe('applyPatch', () => {
  const baseResume: Resume = {
    contact: { name: 'John', email: 'john@test.com', phone: '', location: '', linkedin: '', github: '' },
    summary: 'Senior Engineer',
    experience: [
      {
        company: 'TechCorp',
        role: 'Engineer',
        duration: '2020-2023',
        bullets: ['Led project', 'Mentored team'],
      },
    ],
    education: [
      {
        institution: 'University',
        degree: 'B.S. Computer Science',
        duration: '2020',
        details: [],
      },
    ],
    skills: ['Python', 'JavaScript'],
    projects: [
      {
        name: 'Project A',
        description: 'Description',
        bullets: [],
        technologies: ['React'],
      },
    ],
    certifications: [],
  };

  describe('skills section', () => {
    it('should append skill', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add skill',
        section: 'skills',
        operation: 'append',
        content: 'TypeScript',
        target: null,
        item_name: null,
        reasoning: 'Required',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.skills).toContain('TypeScript');
      expect(result.skills.length).toBe(3);
    });

    it('should not duplicate skill on append', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add skill',
        section: 'skills',
        operation: 'append',
        content: 'Python',
        target: null,
        item_name: null,
        reasoning: 'Required',
      };

      const result = applyPatch(baseResume, patch);
      const pythonCount = result.skills.filter(s => s === 'Python').length;
      expect(pythonCount).toBe(1);
    });

    it('should replace skill', () => {
      const patch: PatchOperation = {
        priority: 'medium',
        title: 'Update skill',
        section: 'skills',
        operation: 'replace',
        content: 'TypeScript',
        target: 'JavaScript',
        item_name: null,
        reasoning: 'Better choice',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.skills).not.toContain('JavaScript');
      expect(result.skills).toContain('TypeScript');
    });

    it('should not mutate original resume', () => {
      const original = JSON.stringify(baseResume);
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add skill',
        section: 'skills',
        operation: 'append',
        content: 'Go',
        target: null,
        item_name: null,
        reasoning: 'Test',
      };

      applyPatch(baseResume, patch);
      expect(JSON.stringify(baseResume)).toBe(original);
    });
  });

  describe('summary section', () => {
    it('should append to summary', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Enhance summary',
        section: 'summary',
        operation: 'append',
        content: 'Expert in cloud architecture.',
        target: null,
        item_name: null,
        reasoning: 'Add expertise',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.summary).toContain('Senior Engineer');
      expect(result.summary).toContain('Expert in cloud architecture');
    });

    it('should replace summary text', () => {
      const patch: PatchOperation = {
        priority: 'medium',
        title: 'Update summary',
        section: 'summary',
        operation: 'replace',
        content: 'Experienced Senior Software Engineer',
        target: 'Senior Engineer',
        item_name: null,
        reasoning: 'Better phrasing',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.summary).toContain('Experienced Senior Software Engineer');
    });
  });

  describe('experience section', () => {
    it('should append bullet to specific company', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add achievement',
        section: 'experience',
        operation: 'append',
        content: 'Improved performance by 40%',
        target: null,
        item_name: 'TechCorp',
        reasoning: 'Key achievement',
      };

      const result = applyPatch(baseResume, patch);
      const techCorp = result.experience.find(e => e.company === 'TechCorp');
      expect(techCorp?.bullets).toContain('Improved performance by 40%');
    });

    it('should append bullet without item_name to first experience', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add bullet',
        section: 'experience',
        operation: 'append',
        content: 'New bullet point',
        target: null,
        item_name: null,
        reasoning: 'Test',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.experience[0].bullets).toContain('New bullet point');
    });

    it('should replace experience bullet', () => {
      const patch: PatchOperation = {
        priority: 'medium',
        title: 'Update bullet',
        section: 'experience',
        operation: 'replace',
        content: 'Architected microservices platform',
        target: 'Led project',
        item_name: 'TechCorp',
        reasoning: 'Better description',
      };

      const result = applyPatch(baseResume, patch);
      const techCorp = result.experience.find(e => e.company === 'TechCorp');
      expect(techCorp?.bullets).toContain('Architected microservices platform');
      expect(techCorp?.bullets).not.toContain('Led project');
    });
  });

  describe('education section', () => {
    it('should append education detail', () => {
      const patch: PatchOperation = {
        priority: 'low',
        title: 'Add detail',
        section: 'education',
        operation: 'append',
        content: 'GPA: 3.8',
        target: null,
        item_name: 'University',
        reasoning: 'Additional info',
      };

      const result = applyPatch(baseResume, patch);
      const uni = result.education.find(e => e.institution === 'University');
      expect(uni?.details).toContain('GPA: 3.8');
    });
  });

  describe('projects section', () => {
    it('should append project bullet', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add project detail',
        section: 'projects',
        operation: 'append',
        content: 'Achieved 10k+ downloads',
        target: null,
        item_name: 'Project A',
        reasoning: 'Key metric',
      };

      const result = applyPatch(baseResume, patch);
      const project = result.projects.find(p => p.name === 'Project A');
      expect(project?.bullets).toContain('Achieved 10k+ downloads');
    });
  });

  describe('certifications section', () => {
    it('should append certification', () => {
      const patch: PatchOperation = {
        priority: 'medium',
        title: 'Add cert',
        section: 'certifications',
        operation: 'append',
        content: 'AWS Solutions Architect',
        target: null,
        item_name: null,
        reasoning: 'Relevant cert',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.certifications).toContain('AWS Solutions Architect');
    });

    it('should not duplicate certification', () => {
      const patch: PatchOperation = {
        priority: 'medium',
        title: 'Add cert',
        section: 'certifications',
        operation: 'append',
        content: 'AWS Solutions Architect',
        target: null,
        item_name: null,
        reasoning: 'Test',
      };

      const resume = {
        ...baseResume,
        certifications: ['AWS Solutions Architect'],
      };

      const result = applyPatch(resume, patch);
      expect(result.certifications.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle unknown section gracefully', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Unknown',
        section: 'unknown' as any,
        operation: 'append',
        content: 'content',
        target: null,
        item_name: null,
        reasoning: 'Test',
      };

      const result = applyPatch(baseResume, patch);
      expect(result).toEqual(baseResume);
    });

    it('should handle non-existent company', () => {
      const patch: PatchOperation = {
        priority: 'high',
        title: 'Add bullet',
        section: 'experience',
        operation: 'append',
        content: 'Bullet',
        target: null,
        item_name: 'NonExistent Corp',
        reasoning: 'Test',
      };

      const result = applyPatch(baseResume, patch);
      expect(result.experience.length).toBe(1);
    });
  });
});
