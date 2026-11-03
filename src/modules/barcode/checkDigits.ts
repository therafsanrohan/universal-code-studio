export function calculateEanUpcCheckDigit(digits: string): number {
  let sum = 0;
  const len = digits.length;
  for (let i = len - 1; i >= 0; i--) {
    const d = parseInt(digits[i]!, 10);
    const weight = (len - i) % 2 === 1 ? 3 : 1;
    sum += d * weight;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

export function validateEan13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const data = code.slice(0, 12);
  const check = parseInt(code[12]!, 10);
  return calculateEanUpcCheckDigit(data) === check;
}

export function validateEan8(code: string): boolean {
  if (!/^\d{8}$/.test(code)) return false;
  const data = code.slice(0, 7);
  const check = parseInt(code[7]!, 10);
  return calculateEanUpcCheckDigit(data) === check;
}

export function validateUpcA(code: string): boolean {
  if (!/^\d{12}$/.test(code)) return false;
  const data = code.slice(0, 11);
  const check = parseInt(code[11]!, 10);
  return calculateEanUpcCheckDigit(data) === check;
}

export function calculateCode39CheckDigit(text: string): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
  let sum = 0;
  for (const c of text.toUpperCase()) {
    const idx = chars.indexOf(c);
    if (idx === -1) return '';
    sum += idx;
  }
  return chars[sum % 43]!;
}

