/**
 * Typed error model.
 * See docs/ARCHITECTURE.md §11.
 */

export type AppErrorCode =
  | 'INVALID_INPUT'
  | 'UNSUPPORTED_FORMAT'
  | 'DECODE_FAILED'
  | 'PERMISSION_DENIED'
  | 'API_UNAVAILABLE'
  | 'DEVICE_NOT_FOUND'
  | 'DEVICE_DISCONNECTED'
  | 'HARDWARE_OPERATION_FAILED'
  | 'EXPORT_FAILED'
  | 'FILE_TOO_LARGE';

const USER_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_INPUT: 'The input is not valid. Please check the format and try again.',
  UNSUPPORTED_FORMAT: 'This format is not supported in your current environment.',
  DECODE_FAILED:
    'Could not decode the input. The data may be corrupted or in an unsupported format.',
  PERMISSION_DENIED: 'Permission was denied. You can grant access in your browser settings.',
  API_UNAVAILABLE: 'This feature is not available in your browser.',
  DEVICE_NOT_FOUND: 'No compatible device was found. Please connect the required hardware.',
  DEVICE_DISCONNECTED: 'The device was disconnected during the operation.',
  HARDWARE_OPERATION_FAILED: 'The hardware operation failed. Please try again.',
  EXPORT_FAILED: 'Export failed. Please try a different format or check your settings.',
  FILE_TOO_LARGE: 'The file is too large. Please use a smaller file.',
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly details?: unknown;

  constructor(code: AppErrorCode, userMessage: string, details?: unknown) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;
  }
}

/** Create an AppError with a default user-friendly message for the given code. */
export function createAppError(code: AppErrorCode, details?: unknown): AppError {
  return new AppError(code, USER_MESSAGES[code], details);
}

/** Type guard for AppError instances. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Get the user-facing message for an error code. */
export function getUserMessage(code: AppErrorCode): string {
  return USER_MESSAGES[code];
}

