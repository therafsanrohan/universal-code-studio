import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedBatchInput {
  headers: string[];
  rows: Record<string, string>[];
  totalRecords: number;
}

/** Parse raw CSV or TSV string */
export function parseCSV(content: string): ParsedBatchInput {
  const result = Papa.parse<Record<string, string>>(content.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields || [];
  const rows = result.data.map((row) => {
    const cleanRow: Record<string, string> = {};
    for (const h of headers) {
      cleanRow[h] = String(row[h] ?? '').trim();
    }
    return cleanRow;
  });

  return {
    headers,
    rows,
    totalRecords: rows.length,
  };
}

/** Parse JSON array of objects or strings */
export function parseJSON(content: string): ParsedBatchInput {
  const parsed = JSON.parse(content.trim());
  if (!Array.isArray(parsed)) {
    throw new Error('JSON input must be an array of records.');
  }

  if (parsed.length === 0) {
    return { headers: ['value'], rows: [], totalRecords: 0 };
  }

  if (typeof parsed[0] === 'string' || typeof parsed[0] === 'number') {
    const rows = parsed.map((item) => ({ value: String(item).trim() }));
    return {
      headers: ['value'],
      rows,
      totalRecords: rows.length,
    };
  }

  const allKeys = Array.from(
    new Set(parsed.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : [])))
  );

  const rows = parsed.map((item) => {
    const cleanRow: Record<string, string> = {};
    for (const key of allKeys) {
      cleanRow[key] = String(item[key] ?? '').trim();
    }
    return cleanRow;
  });

  return {
    headers: allKeys,
    rows,
    totalRecords: rows.length,
  };
}

/** Parse plain text lines */
export function parseTextLines(content: string): ParsedBatchInput {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows = lines.map((l) => ({ value: l }));
  return {
    headers: ['value'],
    rows,
    totalRecords: rows.length,
  };
}

/** Parse Excel workbook array buffer */
export function parseExcelBuffer(buffer: ArrayBuffer): ParsedBatchInput {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Workbook contains no sheets.');
  }
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    throw new Error('Failed to load first sheet from workbook.');
  }

  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  if (json.length === 0) {
    return { headers: ['value'], rows: [], totalRecords: 0 };
  }

  const headers = Object.keys(json[0] || {});
  const rows = json.map((item) => {
    const cleanRow: Record<string, string> = {};
    for (const h of headers) {
      cleanRow[h] = String(item[h] ?? '').trim();
    }
    return cleanRow;
  });

  return {
    headers,
    rows,
    totalRecords: rows.length,
  };
}

