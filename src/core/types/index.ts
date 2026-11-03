/** Supported adapter operations. */
export type Operation = 'generate' | 'decode' | 'validate' | 'inspect';

/** How broadly a feature is supported. */
export type SupportLevel = 'browser' | 'limited' | 'hardware' | 'research';

/**
 * User-facing status vocabulary.
 * See docs/FEATURE_MATRIX.md §7.
 */
export type StatusLabel =
  | 'available'
  | 'limited-support'
  | 'requires-hardware'
  | 'planned'
  | 'unsupported';

/** Describes a format's capabilities and requirements. */
export interface FormatCapability {
  id: string;
  label: string;
  category: FormatCategory;
  operations: Operation[];
  support: SupportLevel;
  requirements?: string[];
  description?: string;
}

/** Adapter interface for every format module. */
export interface FormatAdapter<Input = unknown, Output = unknown> {
  capability: FormatCapability;
  generate?: (input: Input) => Promise<Output>;
  decode?: (input: Input) => Promise<Output>;
  validate?: (input: Input) => Promise<ValidationResult>;
  inspect?: (input: Input) => Promise<Output>;
}

/** A single validation issue. */
export interface ValidationIssue {
  code: string;
  message: string;
  field?: string;
}

/** Result of a validation operation. */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/** Top-level module categories. */
export type FormatCategory =
  | 'qr'
  | 'barcode'
  | '2d'
  | 'nfc'
  | 'rfid'
  | 'smart-card'
  | 'gs1'
  | 'encoding'
  | 'wireless'
  | 'document';

