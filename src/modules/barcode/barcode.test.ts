import { describe, it, expect } from 'vitest';
import {
  calculateEanUpcCheckDigit,
  validateEan13,
  validateEan8,
  validateUpcA,
  calculateCode39CheckDigit,
} from './checkDigits';

describe('Barcode Check Digit Calculations', () => {
  it('correctly calculates EAN-13 check digits', () => {
    // 590123412345 -> last digit 7
    expect(calculateEanUpcCheckDigit('590123412345')).toBe(7);
    expect(validateEan13('5901234123457')).toBe(true);
    expect(validateEan13('5901234123450')).toBe(false);
  });

  it('correctly calculates EAN-8 check digits', () => {
    // 9638507 -> 4
    expect(calculateEanUpcCheckDigit('9638507')).toBe(4);
    expect(validateEan8('96385074')).toBe(true);
    expect(validateEan8('96385079')).toBe(false);
  });

  it('correctly calculates UPC-A check digits', () => {
    // 01234567890 -> 5
    expect(calculateEanUpcCheckDigit('01234567890')).toBe(5);
    expect(validateUpcA('012345678905')).toBe(true);
    expect(validateUpcA('012345678901')).toBe(false);
  });

  it('correctly calculates Code 39 modulo-43 check digits', () => {
    expect(calculateCode39CheckDigit('CODE39')).toBe('W');
  });
});
