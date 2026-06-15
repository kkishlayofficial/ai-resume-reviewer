import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractResume, parseResume, reviewResume, getReport, downloadResume, friendlyError, STATUS_MESSAGES } from '../resumeApi';

describe('friendlyError', () => {
  it('should map 429 to rate limit message', () => {
    const error = friendlyError(429, 'fallback');
    expect(error.message).toContain('currently busy');
  });

  it('should map 503 to service unavailable message', () => {
    const error = friendlyError(503, 'fallback');
    expect(error.message).toContain('temporarily unavailable');
  });

  it('should map 504 to timeout message', () => {
    const error = friendlyError(504, 'fallback');
    expect(error.message).toContain('took too long');
  });

  it('should map 502 to bad gateway message', () => {
    const error = friendlyError(502, 'fallback');
    expect(error.message).toContain('unexpected response');
  });

  it('should map 422 to unprocessable entity message', () => {
    const error = friendlyError(422, 'fallback');
    expect(error.message).toContain('could not be processed');
  });

  it('should use fallback for unmapped status codes', () => {
    const error = friendlyError(999, 'custom fallback message');
    expect(error.message).toBe('custom fallback message');
  });

  it('should return Error instance', () => {
    const error = friendlyError(500, 'fallback');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('STATUS_MESSAGES', () => {
  it('should have mapping for 400', () => {
    expect(STATUS_MESSAGES[400]).toBeDefined();
    expect(STATUS_MESSAGES[400]).toContain('invalid');
  });

  it('should have mapping for 413', () => {
    expect(STATUS_MESSAGES[413]).toBeDefined();
    expect(STATUS_MESSAGES[413]).toContain('too large');
  });

  it('should have mapping for 429', () => {
    expect(STATUS_MESSAGES[429]).toBeDefined();
    expect(STATUS_MESSAGES[429]).toContain('busy');
  });

  it('should have all documented status codes', () => {
    const codes = [400, 401, 403, 413, 422, 429, 500, 502, 503, 504];
    codes.forEach(code => {
      expect(STATUS_MESSAGES[code]).toBeDefined();
    });
  });
});

describe('extractResume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract resume from valid file', async () => {
    const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        extracted_text: 'Extracted text',
        extraction_warnings: [],
      }),
    });

    const result = await extractResume(mockFile);
    expect(result.extracted_text).toBe('Extracted text');
    expect(result.extraction_warnings).toEqual([]);
  });

  it('should throw friendly error on extraction failure', async () => {
    const mockFile = new File(['content'], 'resume.pdf');
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
    });

    await expect(extractResume(mockFile)).rejects.toThrow();
  });

  it('should handle 413 file too large', async () => {
    const mockFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.pdf');
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 413,
    });

    try {
      await extractResume(mockFile);
    } catch (e: any) {
      expect(e.message).toContain('too large');
    }
  });
});

describe('parseResume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse extracted text', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        structured_resume: {
          contact: { name: 'John', email: 'john@test.com', phone: '', location: '', linkedin: '', github: '' },
          summary: 'Summary',
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
        },
        parse_warnings: [],
      }),
    });

    const result = await parseResume('Some resume text');
    expect(result.structured_resume.contact.name).toBe('John');
  });

  it('should throw on parse failure', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    await expect(parseResume('text')).rejects.toThrow();
  });
});

describe('reviewResume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit resume for review', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        overall_score: 85,
        ats_score: { score: 80, reasoning: 'Good' },
        technical_score: { score: 88, reasoning: 'Strong' },
        communication_score: { score: 85, reasoning: 'Clear' },
        summary: 'Summary',
        skills: [],
        strengths: [],
        weaknesses: [],
        missing_keywords: [],
        recommendations: [],
        job_fit: { fit: true, explanation: 'Good fit' },
      }),
    });

    const result = await reviewResume({
      resume_text: 'Resume text',
      job_description: 'Job description',
      experience_level: 'mid',
    });

    expect(result.overall_score).toBe(85);
  });

  it('should handle 504 timeout', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 504,
    });

    try {
      await reviewResume({
        resume_text: 'text',
        job_description: 'jd',
        experience_level: 'mid',
      });
    } catch (e: any) {
      expect(e.message).toContain('took too long');
    }
  });
});

describe('getReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch report', async () => {
    const mockReview = {
      overall_score: 85,
      ats_score: { score: 80, reasoning: '' },
      technical_score: { score: 88, reasoning: '' },
      communication_score: { score: 85, reasoning: '' },
      summary: '',
      skills: [],
      strengths: [],
      weaknesses: [],
      missing_keywords: [],
      recommendations: [],
      job_fit: { fit: true, explanation: '' },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['pdf content'], { type: 'application/pdf' }),
    });

    const result = await getReport(mockReview);
    expect(result).toBeDefined();
  });
});
