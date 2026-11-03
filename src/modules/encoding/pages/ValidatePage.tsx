import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { validateEan13, validateEan8, validateUpcA, calculateEanUpcCheckDigit } from '@/modules/barcode/checkDigits';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ValidatePage() {
  const [valType, setValType] = useState<'EAN13' | 'EAN8' | 'UPC' | 'ISBN'>('EAN13');
  const [inputVal, setInputVal] = useState('5901234123457');

  const checkValidation = () => {
    const clean = inputVal.trim();
    if (!clean) return null;

    if (valType === 'EAN13') {
      const isValid = validateEan13(clean);
      const expected = clean.length >= 12 ? calculateEanUpcCheckDigit(clean.slice(0, 12)) : null;
      return {
        valid: isValid,
        expected,
        actual: clean.length === 13 ? clean[12] : null,
        message: isValid
          ? 'Check digit matches standard modulo-10 weighting (3x/1x).'
          : 'Check digit does not match calculated value.',
      };
    }

    if (valType === 'UPC') {
      const isValid = validateUpcA(clean);
      const expected = clean.length >= 11 ? calculateEanUpcCheckDigit(clean.slice(0, 11)) : null;
      return {
        valid: isValid,
        expected,
        actual: clean.length === 12 ? clean[11] : null,
        message: isValid
          ? 'UPC-A check digit successfully validated.'
          : 'Invalid UPC-A checksum.',
      };
    }

    if (valType === 'EAN8') {
      const isValid = validateEan8(clean);
      const expected = clean.length >= 7 ? calculateEanUpcCheckDigit(clean.slice(0, 7)) : null;
      return {
        valid: isValid,
        expected,
        actual: clean.length === 8 ? clean[7] : null,
        message: isValid
          ? 'EAN-8 check digit valid.'
          : 'Invalid EAN-8 check digit.',
      };
    }

    if (valType === 'ISBN') {
      const cleanDigits = clean.replace(/[-\s]/g, '');
      const isValid = cleanDigits.length === 13 && validateEan13(cleanDigits) && (cleanDigits.startsWith('978') || cleanDigits.startsWith('979'));
      return {
        valid: isValid,
        expected: null,
        actual: null,
        message: isValid
          ? 'Valid Bookland ISBN-13 barcode standard.'
          : 'Invalid ISBN-13 format (must start with 978/979 and pass EAN check digit).',
      };
    }

    return null;
  };

  const res = checkValidation();

  return (
    <ToolPageTemplate
      title="Identifier & Checksum Validator"
      description="Verify check-digits and formatting compliance for international barcodes (EAN, UPC) and ISBN numbers."
      status="available"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="flex gap-2">
            {(['EAN13', 'UPC', 'EAN8', 'ISBN'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setValType(t);
                  if (t === 'EAN13') setInputVal('5901234123457');
                  if (t === 'UPC') setInputVal('012345678905');
                  if (t === 'EAN8') setInputVal('96385074');
                  if (t === 'ISBN') setInputVal('978-0-306-40615-7');
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  valType === t
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Identifier Value to Verify
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2.5 font-mono text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Validation Result
            </h3>

            {res ? (
              <div
                className={`rounded-lg border p-4 shadow-xs ${
                  res.valid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {res.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm font-semibold">
                    {res.valid ? 'Valid Checksum' : 'Invalid Identifier'}
                  </span>
                </div>
                <p className="text-xs">{res.message}</p>

                {res.expected !== null && (
                  <div className="mt-3 text-xs font-mono border-t border-black/10 pt-2 space-y-1">
                    <div>Calculated Check Digit: {res.expected}</div>
                    <div>Provided Digit: {res.actual}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-gray-400">
                Enter an identifier value to test check digits
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
