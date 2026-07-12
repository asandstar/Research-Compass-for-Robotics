import { describe, it, expect } from 'vitest';
import { parseArxivUrl, mockFetchArxivPaper } from './mockAI';

describe('parseArxivUrl', () => {
  it('parses abs URL correctly', () => {
    const result = parseArxivUrl('https://arxiv.org/abs/2607.12345');
    expect(result.arxivId).toBe('2607.12345');
    expect(result.arxivUrl).toBe('https://arxiv.org/abs/2607.12345');
    expect(result.pdfUrl).toBe('https://arxiv.org/pdf/2607.12345');
  });

  it('parses pdf URL correctly', () => {
    const result = parseArxivUrl('https://arxiv.org/pdf/2607.12345');
    expect(result.arxivId).toBe('2607.12345');
    expect(result.arxivUrl).toBe('https://arxiv.org/abs/2607.12345');
    expect(result.pdfUrl).toBe('https://arxiv.org/pdf/2607.12345');
  });

  it('parses pdf URL with .pdf extension', () => {
    const result = parseArxivUrl('https://arxiv.org/pdf/2607.12345.pdf');
    expect(result.arxivId).toBe('2607.12345');
    expect(result.arxivUrl).toBe('https://arxiv.org/abs/2607.12345');
    expect(result.pdfUrl).toBe('https://arxiv.org/pdf/2607.12345');
  });

  it('returns empty object for non-arxiv URL', () => {
    const result = parseArxivUrl('https://example.com/paper');
    expect(result.arxivId).toBeUndefined();
  });

  it('handles old-style arxiv IDs with slashes', () => {
    const result = parseArxivUrl('https://arxiv.org/abs/cs.RO/0601001');
    expect(result.arxivId).toBe('cs.RO/0601001');
    expect(result.arxivUrl).toBe('https://arxiv.org/abs/cs.RO/0601001');
  });

  // ── Edge cases required by audit ──
  it('parses abs URL with version suffix (v2)', () => {
    const result = parseArxivUrl('https://arxiv.org/abs/2607.12345v2');
    expect(result.arxivId).toBe('2607.12345v2');
    expect(result.arxivUrl).toBe('https://arxiv.org/abs/2607.12345v2');
  });

  it('parses pdf URL with version suffix and .pdf extension', () => {
    const result = parseArxivUrl('https://arxiv.org/pdf/2607.12345v2.pdf');
    expect(result.arxivId).toBe('2607.12345v2');
    expect(result.arxivUrl).toBe('https://arxiv.org/abs/2607.12345v2');
    expect(result.pdfUrl).toBe('https://arxiv.org/pdf/2607.12345v2');
  });

  it('parses http (non-https) arxiv URL', () => {
    const result = parseArxivUrl('http://arxiv.org/abs/2607.12345');
    expect(result.arxivId).toBe('2607.12345');
  });

  it('parses URL without protocol', () => {
    const result = parseArxivUrl('arxiv.org/abs/2607.12345');
    expect(result.arxivId).toBe('2607.12345');
  });

  it('returns empty for non-arxiv URL with arxiv-like path', () => {
    const result = parseArxivUrl('https://example.com/2607.12345');
    expect(result.arxivId).toBeUndefined();
  });

  it('returns empty for empty string', () => {
    const result = parseArxivUrl('');
    expect(result.arxivId).toBeUndefined();
  });

  it('returns empty for random non-URL string', () => {
    const result = parseArxivUrl('not a url at all');
    expect(result.arxivId).toBeUndefined();
  });

  it('does not include .pdf in arxivId', () => {
    const result = parseArxivUrl('https://arxiv.org/pdf/2607.12345.pdf');
    expect(result.arxivId).not.toContain('.pdf');
  });

  it('does not throw on any input', () => {
    expect(() => parseArxivUrl('')).not.toThrow();
    expect(() => parseArxivUrl('null')).not.toThrow();
    expect(() => parseArxivUrl('https://')).not.toThrow();
    expect(() => parseArxivUrl('arxiv.org/')).not.toThrow();
  });
});

describe('mockFetchArxivPaper', () => {
  it('does not return fabricated title', async () => {
    const result = await mockFetchArxivPaper('https://arxiv.org/abs/2607.12345');
    expect(result).not.toBeNull();
    expect(result).toBeDefined();

    const typedResult = result as any;
    expect(typedResult.title).toBeUndefined();
    expect(typedResult.authors).toBeUndefined();
    expect(typedResult.venue).toBeUndefined();
    expect(typedResult.year).toBeUndefined();
    expect(typedResult.oneSentenceSummary).toBeUndefined();
    expect(typedResult.coreContribution).toBeUndefined();
    expect(typedResult.methodSketch).toBeUndefined();
    expect(typedResult.evidence).toBeUndefined();
    expect(typedResult.assumptions).toBeUndefined();
    expect(typedResult.limitations).toBeUndefined();
  });

  it('returns correct metadata status', async () => {
    const result = await mockFetchArxivPaper('https://arxiv.org/abs/2607.12345');
    expect(result).not.toBeNull();
    expect(result!.arxivId).toBe('2607.12345');
    expect(result!.metadataStatus).toBe('unavailable');
    expect(result!.verificationStatus).toBe('unverified');
  });

  it('returns normalized urls', async () => {
    const result = await mockFetchArxivPaper('https://arxiv.org/pdf/2607.12345.pdf');
    expect(result).not.toBeNull();
    expect(result!.arxivUrl).toBe('https://arxiv.org/abs/2607.12345');
    expect(result!.pdfUrl).toBe('https://arxiv.org/pdf/2607.12345');
  });

  it('returns null for invalid URL', async () => {
    const result = await mockFetchArxivPaper('https://example.com');
    expect(result).toBeNull();
  });

  it('never contains "性能提升" or fabricated results', async () => {
    const result = await mockFetchArxivPaper('https://arxiv.org/abs/2607.12345');
    const json = JSON.stringify(result);
    expect(json).not.toContain('性能提升');
    expect(json).not.toContain('速度提升');
    expect(json).not.toContain('泛化能力增强');
  });
});
