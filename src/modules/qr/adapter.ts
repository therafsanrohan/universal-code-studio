import QRCode from 'qrcode';
import type { FormatAdapter, ValidationResult } from '@/core/types';
import { validResult, invalidResult, issue } from '@/core/validation';

export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRGenerateOptions {
  text: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface QRGenerateResult {
  dataUrl: string;
  svg: string;
}

export async function generateQRCode(options: QRGenerateOptions): Promise<QRGenerateResult> {
  const ec = options.errorCorrectionLevel || 'M';
  const margin = options.margin !== undefined ? options.margin : 4;
  const width = options.width || 300;
  const dark = options.color?.dark || '#000000';
  const light = options.color?.light || '#ffffff';

  const dataUrl = await QRCode.toDataURL(options.text, {
    errorCorrectionLevel: ec,
    margin,
    width,
    color: { dark, light },
  });

  const svg = await QRCode.toString(options.text, {
    type: 'svg',
    errorCorrectionLevel: ec,
    margin,
    width,
    color: { dark, light },
  });

  return { dataUrl, svg };
}

export function validateQRInput(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return invalidResult(issue('EMPTY_INPUT', 'Payload cannot be empty.', 'text'));
  }
  if (text.length > 4296) {
    return invalidResult(issue('PAYLOAD_TOO_LARGE', 'Payload exceeds maximum capacity of 4296 bytes.', 'text'));
  }
  return validResult();
}

export const qrAdapter: FormatAdapter<QRGenerateOptions, QRGenerateResult> = {
  capability: {
    id: 'qr',
    label: 'QR Code',
    category: 'qr',
    operations: ['generate', 'decode', 'validate'],
    support: 'browser',
    description: 'ISO/IEC 18004 2D matrix code with configurable error correction and quiet zone.',
  },
  generate: generateQRCode,
  validate: async (input) => validateQRInput(input.text),
};

