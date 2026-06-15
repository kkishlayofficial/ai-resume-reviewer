import { useState, useRef } from 'react';
import type { ExperienceLevel, Resume, Experience, Education, Project } from '../../../types/resume';
import styles from './Step2Verify.module.css';
import { Button } from '../../../components/ui/Button/Button';

interface Step2VerifyProps {
  parsedResume: Resume;
  editedResume: Resume;
  extractionWarnings: string[];
  jobDescription: string;
  experienceLevel: ExperienceLevel;
  onResumeChange: (resume: Resume) => void;
  onJobDescriptionChange: (jd: string) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
  onReview: (resume: Resume, jobDescription: string, level: ExperienceLevel) => void;
  onBack: () => void;
  onResetResume: () => void;
  recommendationAddedContents: string[];
}

// ─── Small section components ─────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.sectionCard}>
      <h3 className={styles.sectionCardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function ChipListEditor({
  items,
  placeholder,
  onChange,
  aiAddedContents,
}: {
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
  aiAddedContents?: string[];
}) {
  const [inputVal, setInputVal] = useState('');

  const addItem = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInputVal('');
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.chipListEditor}>
      <div className={styles.chipList} role="list" aria-label={placeholder}>
        {items.map((item, i) => {
          const isAi = aiAddedContents?.includes(item) ?? false;
          return (
            <span key={i} className={`${styles.chip} ${isAi ? styles.chipAi : ''}`} role="listitem">
              {isAi && <span className={styles.aiChipIcon} aria-label="Added by AI">✦</span>}
              {item}
              <button
                className={styles.chipRemove}
                onClick={() => removeItem(i)}
                aria-label={`Remove ${item}`}
                title={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <div className={styles.chipAddRow}>
        <input
          className={styles.chipInput}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addItem(); }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <button className={styles.chipAddBtn} onClick={addItem} aria-label="Add item">+</button>
      </div>
    </div>
  );
}

function BulletListEditor({
  bullets,
  onChange,
  addPlaceholder,
  aiAddedContents,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  addPlaceholder: string;
  aiAddedContents?: string[];
}) {
  const [addVal, setAddVal] = useState('');
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateBullet = (i: number, val: string) => {
    const next = [...bullets];
    next[i] = val;
    onChange(next);
  };

  const removeBullet = (i: number) => {
    onChange(bullets.filter((_, idx) => idx !== i));
  };

  const addBullet = () => {
    const trimmed = addVal.trim();
    if (trimmed) {
      onChange([...bullets, trimmed]);
      setAddVal('');
    }
  };

  const handleDragStart = (i: number) => {
    dragIndexRef.current = i;
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    const next = [...bullets];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    onChange(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className={styles.bulletList}>
      {bullets.map((b, i) => {
        const isAi = aiAddedContents?.includes(b) ?? false;
        const isDragOver = dragOverIndex === i;
        return (
          <div
            key={i}
            className={`${styles.bulletItem} ${isAi ? styles.bulletItemAi : ''} ${isDragOver ? styles.bulletItemDragOver : ''}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
          >
            <span className={styles.dragHandle} aria-hidden="true" title="Drag to reorder">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                <circle cx="4" cy="3" r="1.2" fill="currentColor" />
                <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                <circle cx="4" cy="8" r="1.2" fill="currentColor" />
                <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                <circle cx="4" cy="13" r="1.2" fill="currentColor" />
                <circle cx="8" cy="13" r="1.2" fill="currentColor" />
              </svg>
            </span>
            <span className={styles.bulletDot} aria-hidden="true">•</span>
            <textarea
              className={styles.bulletTextarea}
              value={b}
              onChange={(e) => updateBullet(i, e.target.value)}
              rows={2}
              aria-label={`Bullet ${i + 1}`}
            />
            {isAi && <span className={styles.aiBadge} title="Added from AI recommendation">✦ AI</span>}
            <button
              className={styles.bulletRemove}
              onClick={() => removeBullet(i)}
              aria-label="Remove bullet"
              title="Remove bullet"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
      <div className={styles.addBulletRow}>
        <input
          className={styles.addBulletInput}
          value={addVal}
          onChange={(e) => setAddVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addBullet(); }
          }}
          placeholder={addPlaceholder}
          aria-label={addPlaceholder}
        />
        <button className={styles.addBulletBtn} onClick={addBullet} aria-label="Add bullet">
          + Add bullet
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step2Verify({
  parsedResume: _parsedResume,
  editedResume,
  extractionWarnings,
  jobDescription,
  experienceLevel,
  onResumeChange,
  onJobDescriptionChange,
  onExperienceLevelChange,
  onReview,
  onBack,
  onResetResume,
  recommendationAddedContents,
}: Step2VerifyProps) {
  const resume = editedResume;

  const summaryIsAiModified = recommendationAddedContents.some(
    (c) => resume.summary === c || resume.summary.includes(c),
  );

  const update = (partial: Partial<Resume>) => {
    onResumeChange({ ...resume, ...partial });
  };

  const updateContact = (field: keyof Resume['contact'], value: string) => {
    update({ contact: { ...resume.contact, [field]: value } });
  };

  const updateExperience = (idx: number, exp: Experience) => {
    const next = [...resume.experience];
    next[idx] = exp;
    update({ experience: next });
  };

  const addExperience = () => {
    update({
      experience: [
        ...resume.experience,
        { company: '', role: '', duration: '', bullets: [] },
      ],
    });
  };

  const removeExperience = (idx: number) => {
    update({ experience: resume.experience.filter((_, i) => i !== idx) });
  };

  const updateEducation = (idx: number, edu: Education) => {
    const next = [...resume.education];
    next[idx] = edu;
    update({ education: next });
  };

  const addEducation = () => {
    update({
      education: [
        ...resume.education,
        { institution: '', degree: '', duration: '', details: [] },
      ],
    });
  };

  const removeEducation = (idx: number) => {
    update({ education: resume.education.filter((_, i) => i !== idx) });
  };

  const updateProject = (idx: number, proj: Project) => {
    const next = [...resume.projects];
    next[idx] = proj;
    update({ projects: next });
  };

  const addProject = () => {
    update({
      projects: [
        ...resume.projects,
        { name: '', description: '', bullets: [], technologies: [] },
      ],
    });
  };

  const removeProject = (idx: number) => {
    update({ projects: resume.projects.filter((_, i) => i !== idx) });
  };

  const canReview = jobDescription.trim().length >= 50;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* ── Left: Structured Editor ──────────────────────────────── */}
        <div className={styles.leftCol}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Edit Resume</h2>
            <button className={styles.resetBtn} onClick={onResetResume} aria-label="Reset to original parsed content">
              Reset to Original
            </button>
          </div>

          <div className={styles.infoBanner} role="note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Review and edit all sections before analysis. Changes here are applied directly to the AI review and to your downloaded resume.
          </div>

          {extractionWarnings.length > 0 && (
            <ul className={styles.warningList} role="list" aria-label="Extraction warnings">
              {extractionWarnings.map((w, i) => (
                <li key={i} className={styles.warningItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {w}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.editorContent}>
            {/* Contact Info */}
            <SectionCard title="Contact Info">
              <div className={styles.contactGrid}>
                {(
                  [
                    ['name', 'Full Name', 'text'],
                    ['email', 'Email', 'email'],
                    ['phone', 'Phone', 'tel'],
                    ['location', 'Location', 'text'],
                    ['linkedin', 'LinkedIn URL', 'url'],
                    ['github', 'GitHub URL', 'url'],
                  ] as [keyof Resume['contact'], string, string][]
                ).map(([field, label, type]) => (
                  <div key={field} className={styles.contactField}>
                    <label className={styles.fieldLabel} htmlFor={`contact-${field}`}>{label}</label>
                    <input
                      id={`contact-${field}`}
                      className={styles.fieldInput}
                      type={type}
                      value={resume.contact[field]}
                      onChange={(e) => updateContact(field, e.target.value)}
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Summary */}
            <SectionCard title="Professional Summary">
              {summaryIsAiModified && (
                <div className={styles.summaryAiBanner} role="note">
                  <span className={styles.summaryAiIcon} aria-hidden="true">✦</span>
                  AI recommendation applied
                </div>
              )}
              <textarea
                className={styles.summaryTextarea}
                value={resume.summary}
                onChange={(e) => update({ summary: e.target.value })}
                placeholder="Write a short professional summary..."
                rows={4}
                aria-label="Professional summary"
              />
              <span className={styles.wordCount}>
                {resume.summary.trim() ? resume.summary.trim().split(/\s+/).length : 0} words
              </span>
            </SectionCard>

            {/* Experience */}
            <SectionCard title="Work Experience">
              {resume.experience.map((exp, i) => (
                <div key={i} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <span className={styles.itemCardNum}>#{i + 1}</span>
                    <button
                      className={styles.removeItemBtn}
                      onClick={() => removeExperience(i)}
                      aria-label={`Remove experience ${i + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.itemFields}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Role</label>
                      <input
                        className={styles.fieldInput}
                        value={exp.role}
                        onChange={(e) => updateExperience(i, { ...exp, role: e.target.value })}
                        placeholder="Job Title"
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Company</label>
                      <input
                        className={styles.fieldInput}
                        value={exp.company}
                        onChange={(e) => updateExperience(i, { ...exp, company: e.target.value })}
                        placeholder="Company Name"
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Duration</label>
                      <input
                        className={styles.fieldInput}
                        value={exp.duration}
                        onChange={(e) => updateExperience(i, { ...exp, duration: e.target.value })}
                        placeholder="e.g. 2021 – Present"
                      />
                    </div>
                  </div>
                  <label className={styles.fieldLabel}>Bullets</label>
                  <BulletListEditor
                    bullets={exp.bullets}
                    onChange={(bullets) => updateExperience(i, { ...exp, bullets })}
                    addPlaceholder="Add a bullet point..."
                    aiAddedContents={recommendationAddedContents}
                  />
                </div>
              ))}
              <button className={styles.addItemBtn} onClick={addExperience}>
                + Add Experience
              </button>
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education">
              {resume.education.map((edu, i) => (
                <div key={i} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <span className={styles.itemCardNum}>#{i + 1}</span>
                    <button
                      className={styles.removeItemBtn}
                      onClick={() => removeEducation(i)}
                      aria-label={`Remove education ${i + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.itemFields}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Degree</label>
                      <input
                        className={styles.fieldInput}
                        value={edu.degree}
                        onChange={(e) => updateEducation(i, { ...edu, degree: e.target.value })}
                        placeholder="Degree / Program"
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Institution</label>
                      <input
                        className={styles.fieldInput}
                        value={edu.institution}
                        onChange={(e) => updateEducation(i, { ...edu, institution: e.target.value })}
                        placeholder="University / College"
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Duration</label>
                      <input
                        className={styles.fieldInput}
                        value={edu.duration}
                        onChange={(e) => updateEducation(i, { ...edu, duration: e.target.value })}
                        placeholder="e.g. 2016 – 2020"
                      />
                    </div>
                  </div>
                  <label className={styles.fieldLabel}>Details (honors, GPA, courses)</label>
                  <BulletListEditor
                    bullets={edu.details}
                    onChange={(details) => updateEducation(i, { ...edu, details })}
                    addPlaceholder="Add a detail..."
                    aiAddedContents={recommendationAddedContents}
                  />
                </div>
              ))}
              <button className={styles.addItemBtn} onClick={addEducation}>
                + Add Education
              </button>
            </SectionCard>

            {/* Skills */}
            <SectionCard title="Skills">
              <ChipListEditor
                items={resume.skills}
                placeholder="Add a skill (press Enter)"
                onChange={(skills) => update({ skills })}
                aiAddedContents={recommendationAddedContents}
              />
            </SectionCard>

            {/* Projects */}
            <SectionCard title="Projects">
              {resume.projects.map((proj, i) => (
                <div key={i} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <span className={styles.itemCardNum}>#{i + 1}</span>
                    <button
                      className={styles.removeItemBtn}
                      onClick={() => removeProject(i)}
                      aria-label={`Remove project ${i + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.itemFields}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Project Name</label>
                      <input
                        className={styles.fieldInput}
                        value={proj.name}
                        onChange={(e) => updateProject(i, { ...proj, name: e.target.value })}
                        placeholder="Project Name"
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Description</label>
                      <input
                        className={styles.fieldInput}
                        value={proj.description}
                        onChange={(e) => updateProject(i, { ...proj, description: e.target.value })}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                  <label className={styles.fieldLabel}>Bullets</label>
                  <BulletListEditor
                    bullets={proj.bullets}
                    onChange={(bullets) => updateProject(i, { ...proj, bullets })}
                    addPlaceholder="Add a bullet point..."
                    aiAddedContents={recommendationAddedContents}
                  />
                  <label className={styles.fieldLabel} style={{ marginTop: 'var(--space-3)' }}>Technologies</label>
                  <ChipListEditor
                    items={proj.technologies}
                    placeholder="Add technology"
                    onChange={(technologies) => updateProject(i, { ...proj, technologies })}
                    aiAddedContents={recommendationAddedContents}
                  />
                </div>
              ))}
              <button className={styles.addItemBtn} onClick={addProject}>
                + Add Project
              </button>
            </SectionCard>

            {/* Certifications */}
            <SectionCard title="Certifications">
              <ChipListEditor
                items={resume.certifications}
                placeholder="Add a certification"
                onChange={(certifications) => update({ certifications })}
                aiAddedContents={recommendationAddedContents}
              />
            </SectionCard>
          </div>
        </div>

        {/* ── Right: JD + Level + Actions ────────────────────────────── */}
        <div className={styles.rightCol}>
          {/* Job Description */}
          <div className={`${styles.rightCard} ${styles.rightCardGrow}`}>
            <label htmlFor="jd-input" className={styles.rightCardTitle}>
              Job Description
            </label>
            <textarea
              id="jd-input"
              className={`${styles.textarea} ${styles.textareaShort}`}
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
            />
            {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
              <p className={styles.fieldHint}>Minimum 50 characters required</p>
            )}
          </div>

          {/* Experience Level */}
          <div className={styles.rightCard}>
            <label htmlFor="level-select" className={styles.rightCardTitle}>
              Experience Level
            </label>
            <select
              id="level-select"
              className={styles.select}
              value={experienceLevel}
              onChange={(e) => onExperienceLevelChange(e.target.value as ExperienceLevel)}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!canReview}
              onClick={() => onReview(resume, jobDescription, experienceLevel)}
              title={!canReview ? 'Job description (50+ chars) is required' : undefined}
            >
              Review Resume
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
