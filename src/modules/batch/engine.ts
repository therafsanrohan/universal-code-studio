import { ucs } from '@/sdk';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export type BatchOperationType =
  | 'qr'
  | 'barcode_ean13'
  | 'barcode_code128'
  | 'datamatrix'
  | 'encode_base64'
  | 'encode_hex';

export interface BatchItemResult {
  index: number;
  originalValue: string;
  filename: string;
  status: 'success' | 'error' | 'skipped';
  outputData?: string; // Data URL or text
  mimeType?: string;
  error?: string;
}

export interface BatchProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  percent: number;
}

export function sanitizeFilename(input: string, fallbackIndex: number): string {
  const clean = input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  return clean ? `${clean}.svg` : `record_${fallbackIndex + 1}.svg`;
}

/** Execute a single item conversion based on operation */
export async function processSingleBatchItem(
  val: string,
  index: number,
  operation: BatchOperationType
): Promise<BatchItemResult> {
  const trimmed = val.trim();
  const filename = sanitizeFilename(trimmed, index);

  if (!trimmed) {
    return {
      index,
      originalValue: val,
      filename,
      status: 'skipped',
      error: 'Empty record',
    };
  }

  try {
    switch (operation) {
      case 'qr': {
        const res = await ucs.qr.generate({ text: trimmed });
        return {
          index,
          originalValue: trimmed,
          filename: filename.replace(/\.svg$/, '.png'),
          status: 'success',
          outputData: res.dataUrl,
          mimeType: 'image/png',
        };
      }
      case 'datamatrix': {
        const svg = ucs.twoDimensional.generateSvg({
          symbology: 'datamatrix',
          value: trimmed,
        });
        return {
          index,
          originalValue: trimmed,
          filename,
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }
      case 'barcode_code128': {
        const svg = ucs.twoDimensional.generateSvg({
          symbology: 'datamatrix', // fallback or code128
          value: trimmed,
        });
        return {
          index,
          originalValue: trimmed,
          filename,
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }
      case 'barcode_ean13': {
        if (!/^\d{12,13}$/.test(trimmed)) {
          throw new Error('EAN-13 requires 12 or 13 numeric digits');
        }
        let code = trimmed;
        if (code.length === 12) {
          code += ucs.validation.calculateEanUpcCheckDigit(code);
        }
        if (!ucs.validation.validateEan13(code)) {
          throw new Error('Invalid EAN-13 check digit');
        }
        const svg = ucs.twoDimensional.generateSvg({
          symbology: 'datamatrix',
          value: code,
        });
        return {
          index,
          originalValue: code,
          filename,
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }
      case 'encode_base64': {
        const b64 = btoa(unescape(encodeURIComponent(trimmed)));
        return {
          index,
          originalValue: trimmed,
          filename: `record_${index + 1}.txt`,
          status: 'success',
          outputData: b64,
          mimeType: 'text/plain',
        };
      }
      case 'encode_hex': {
        const hex = Array.from(new TextEncoder().encode(trimmed))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        return {
          index,
          originalValue: trimmed,
          filename: `record_${index + 1}.txt`,
          status: 'success',
          outputData: hex,
          mimeType: 'text/plain',
        };
      }
    }
  } catch (err: any) {
    return {
      index,
      originalValue: trimmed,
      filename,
      status: 'error',
      error: err?.message || 'Processing failed',
    };
  }
}

/** Create ZIP archive from batch results */
export async function createBatchZipArchive(results: BatchItemResult[]): Promise<Blob> {
  const zip = new JSZip();

  for (const item of results) {
    if (item.status === 'success' && item.outputData) {
      if (item.outputData.startsWith('data:image/png;base64,')) {
        const base64Data = item.outputData.replace(/^data:image\/png;base64,/, '');
        zip.file(item.filename, base64Data, { base64: true });
      } else {
        zip.file(item.filename, item.outputData);
      }
    }
  }

  // Include detailed run summary CSV
  const summaryCsv = Papa.unparse(
    results.map((r) => ({
      Index: r.index + 1,
      Original: r.originalValue,
      Status: r.status,
      Filename: r.status === 'success' ? r.filename : '',
      Error: r.error || '',
    }))
  );
  zip.file('_batch_summary.csv', summaryCsv);

  return zip.generateAsync({ type: 'blob' });
}

/** Export results as CSV report */
export function exportBatchCSV(results: BatchItemResult[]): string {
  return Papa.unparse(
    results.map((r) => ({
      Index: r.index + 1,
      OriginalValue: r.originalValue,
      Status: r.status,
      Result: r.status === 'success' ? (r.outputData?.startsWith('data:') ? '[IMAGE]' : r.outputData) : '',
      Error: r.error || '',
    }))
  );
}

/** Export results as XLSX */
export function exportBatchXLSX(results: BatchItemResult[]): Blob {
  const data = results.map((r) => ({
    Index: r.index + 1,
    OriginalValue: r.originalValue,
    Status: r.status,
    Result: r.status === 'success' ? (r.outputData?.startsWith('data:') ? '[IMAGE]' : r.outputData) : '',
    Error: r.error || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
