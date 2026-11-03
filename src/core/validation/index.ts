/**
 * Validation helpers.
 * See docs/DOMAIN_LOGIC.md §1.
 */

import type { ValidationIssue, ValidationResult } from '../types';

/** Create a valid result with no issues. */
export function validResult(): ValidationResult {
  return { valid: true, issues: [] };
}

/** Create an invalid result with the given issues. */
export function invalidResult(...issues: ValidationIssue[]): ValidationResult {
  return { valid: false, issues };
}

/** Create a validation issue. */
export function issue(code: string, message: string, field?: string): ValidationIssue {
  return { code, message, field };
}

/** Merge multiple validation results into one. */
export function mergeResults(...results: ValidationResult[]): ValidationResult {
  const allIssues = results.flatMap((r) => r.issues);
  return {
    valid: allIssues.length === 0,
    issues: allIssues,
  };
}

/** Maximum file size: 10 MB. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum QR data length (bytes, version 40, low EC). */
export const MAX_QR_DATA_LENGTH = 4296;

/** Validate that a string is not empty after trimming. */
export function requireNonEmpty(value: string, fieldName: string): ValidationResult {
  if (value.trim().length === 0) {
    return invalidResult(issue('REQUIRED', `${fieldName} is required.`, fieldName));
  }
  return validResult();
}

/** Validate file size against a maximum. */
export function validateFileSize(
  size: number,
  maxBytes: number = MAX_FILE_SIZE,
): ValidationResult {
  if (size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(1);
    return invalidResult(issue('FILE_TOO_LARGE', `File exceeds the ${maxMB} MB limit.`));
  }
  return validResult();
}

