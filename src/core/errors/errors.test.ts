import { describe, it, expect } from 'vitest';
import { AppError, createAppError, isAppError, getUserMessage } from './index';

describe('AppError', () => {
  it('creates an error with code and user message', () => {
    const err = new AppError('INVALID_INPUT', 'Bad data');
    expect(err.code).toBe('INVALID_INPUT');
    expect(err.userMessage).toBe('Bad data');
    expect(err.message).toBe('Bad data');
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
  });

  it('stores optional details', () => {
    const details = { field: 'email' };
    const err = new AppError('INVALID_INPUT', 'Bad data', details);
    expect(err.details).toEqual(details);
  });
});

describe('createAppError', () => {
  it('creates errors with default user messages', () => {
    const err = createAppError('FILE_TOO_LARGE');
    expect(err.code).toBe('FILE_TOO_LARGE');
    expect(err.userMessage).toContain('too large');
  });

  it('passes details through', () => {
    const err = createAppError('DECODE_FAILED', { reason: 'timeout' });
    expect(err.details).toEqual({ reason: 'timeout' });
  });
});

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError('INVALID_INPUT', 'x'))).toBe(true);
  });

  it('returns false for plain errors', () => {
    expect(isAppError(new Error('x'))).toBe(false);
  });

  it('returns false for non-errors', () => {
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('getUserMessage', () => {
  it('returns a user-facing string for every error code', () => {
    const codes = [
      'INVALID_INPUT',
      'UNSUPPORTED_FORMAT',
      'DECODE_FAILED',
      'PERMISSION_DENIED',
      'API_UNAVAILABLE',
      'DEVICE_NOT_FOUND',
      'DEVICE_DISCONNECTED',
      'HARDWARE_OPERATION_FAILED',
      'EXPORT_FAILED',
      'FILE_TOO_LARGE',
    ] as const;

    for (const code of codes) {
      const msg = getUserMessage(code);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});

