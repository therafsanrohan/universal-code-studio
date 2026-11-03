import JsBarcode from 'jsbarcode';
import type { FormatAdapter, ValidationResult } from '@/core/types';
import { validResult, invalidResult, issue } from '@/core/validation';
import { validateEan13, validateEan8, validateUpcA } from './checkDigits';

export type BarcodeFormatId = 'EAN13' | 'EAN8' | 'UPC' | 'CODE128' | 'CODE39' | 'ITF';

export interface BarcodeGenerateOptions {
  format: BarcodeFormatId;
  text: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  background?: string;
  lineColor?: string;
  margin?: number;
}

export function validateBarcodeData(format: BarcodeFormatId, text: string): ValidationResult {
  const clean = text.trim();
  if (!clean) {
    return invalidResult(issue('EMPTY_INPUT', 'Barcode value cannot be empty.', 'text'));
  }

  switch (format) {
    case 'EAN13': {
      if (!/^\d{12,13}$/.test(clean)) {
        return invalidResult(issue('INVALID_CHARS', 'EAN-13 requires 12 or 13 digits.', 'text'));
      }
      if (clean.length === 13 && !validateEan13(clean)) {
        return invalidResult(issue('INVALID_CHECK_DIGIT', 'Invalid EAN-13 check digit.', 'text'));
      }
      break;
    }
    case 'EAN8': {
      if (!/^\d{7,8}$/.test(clean)) {
        return invalidResult(issue('INVALID_CHARS', 'EAN-8 requires 7 or 8 digits.', 'text'));
      }
      if (clean.length === 8 && !validateEan8(clean)) {
        return invalidResult(issue('INVALID_CHECK_DIGIT', 'Invalid EAN-8 check digit.', 'text'));
      }
      break;
    }
    case 'UPC': {
      if (!/^\d{11,12}$/.test(clean)) {
        return invalidResult(issue('INVALID_CHARS', 'UPC-A requires 11 or 12 digits.', 'text'));
      }
      if (clean.length === 12 && !validateUpcA(clean)) {
        return invalidResult(issue('INVALID_CHECK_DIGIT', 'Invalid UPC-A check digit.', 'text'));
      }
      break;
    }
    case 'CODE39': {
      if (!/^[0-9A-Z\-. $/+%]+$/i.test(clean)) {
        return invalidResult(issue('INVALID_CHARS', 'Code 39 only supports uppercase alphanumeric and - . $ / + % characters.', 'text'));
      }
      break;
    }
    case 'ITF': {
      if (!/^\d+$/.test(clean) || clean.length % 2 !== 0) {
        return invalidResult(issue('INVALID_CHARS', 'ITF requires an even number of numeric digits.', 'text'));
      }
      break;
    }
    case 'CODE128': {
      // standard ASCII allowed
      break;
    }
  }

  return validResult();
}

export async function generateBarcodeSvg(options: BarcodeGenerateOptions): Promise<string> {
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svgNode, options.text, {
    format: options.format,
    width: options.width || 2,
    height: options.height || 100,
    displayValue: options.displayValue ?? true,
    background: options.background || '#ffffff',
    lineColor: options.lineColor || '#000000',
    margin: options.margin ?? 10,
  });
  return new XMLSerializer().serializeToString(svgNode);
}

export const barcodeAdapter: FormatAdapter<BarcodeGenerateOptions, string> = {
  capability: {
    id: 'barcode-linear',
    label: 'Linear Barcode',
    category: 'barcode',
    operations: ['generate', 'validate'],
    support: 'browser',
    description: '1D barcode generator for EAN-13, EAN-8, UPC-A, Code 128, Code 39, and ITF.',
  },
  generate: generateBarcodeSvg,
  validate: async (input) => validateBarcodeData(input.format, input.text),
};

