import { describe, it, expect } from 'vitest';
import {
  validResult,
  invalidResult,
  issue,
  mergeResults,
  requireNonEmpty,
  validateFileSize,
  MAX_FILE_SIZE,
} from './index';

describe('validResult', () => {
  it('returns a result with valid=true and no issues', () => {
    const result = validResult();
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });
});

describe('invalidResult', () => {
  it('returns a result with valid=false and the given issues', () => {
    const i = issue('ERR', 'Something went wrong', 'field');
    const result = invalidResult(i);
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.code).toBe('ERR');
    expect(result.issues[0]?.field).toBe('field');
  });
});

describe('mergeResults', () => {
  it('merges valid results into a valid result', () => {
    const merged = mergeResults(validResult(), validResult());
    expect(merged.valid).toBe(true);
    expect(merged.issues).toHaveLength(0);
  });

  it('merges invalid results into an invalid result', () => {
    const r1 = invalidResult(issue('A', 'error A'));
    const r2 = invalidResult(issue('B', 'error B'));
    const merged = mergeResults(r1, r2);
    expect(merged.valid).toBe(false);
    expect(merged.issues).toHaveLength(2);
  });

  it('treats mixed results as invalid', () => {
    const merged = mergeResults(validResult(), invalidResult(issue('X', 'fail')));
    expect(merged.valid).toBe(false);
    expect(merged.issues).toHaveLength(1);
  });
});

describe('requireNonEmpty', () => {
  it('accepts non-empty strings', () => {
    expect(requireNonEmpty('hello', 'name').valid).toBe(true);
  });

  it('rejects empty strings', () => {
    const result = requireNonEmpty('', 'name');
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.code).toBe('REQUIRED');
  });

  it('rejects whitespace-only strings', () => {
    expect(requireNonEmpty('   ', 'name').valid).toBe(false);
  });
});

describe('validateFileSize', () => {
  it('accepts files under the limit', () => {
    expect(validateFileSize(1024).valid).toBe(true);
  });

  it('rejects files over the default limit', () => {
    const result = validateFileSize(MAX_FILE_SIZE + 1);
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.code).toBe('FILE_TOO_LARGE');
  });

  it('accepts a custom limit', () => {
    expect(validateFileSize(500, 1000).valid).toBe(true);
    expect(validateFileSize(1500, 1000).valid).toBe(false);
  });
});

