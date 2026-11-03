import { ucs } from '@/sdk';
import { generateBarcodeSvg } from '@/modules/barcode/adapter';
import { encodeSgtin96 } from '@/modules/rfid/rfidTagModel';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export type BatchCategory = 'qr' | 'barcode' | '2d' | 'nfc' | 'rfid' | 'data';

export type BatchOperationType =
  // QR Codes
  | 'qr'
  // 1D Barcodes
  | 'barcode_ean13'
  | 'barcode_ean8'
  | 'barcode_upca'
  | 'barcode_code128'
  | 'barcode_code39'
  | 'barcode_itf'
  // 2D Symbologies
  | 'datamatrix'
  | 'aztec'
  | 'pdf417'
  // NFC / NDEF Payloads
  | 'nfc_uri'
  | 'nfc_text'
  // RFID / EPC
  | 'rfid_sgtin96'
  // Data Encoding
  | 'encode_base64'
  | 'encode_hex';

export interface BatchItemResult {
  index: number;
  originalValue: string;
  filename: string;
  status: 'success' | 'error' | 'skipped';
  outputData?: string; // Data URL or text/svg
  mimeType?: string;
  error?: string;
  extraMeta?: Record<string, any>;
}

export interface BatchProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  percent: number;
}

export function sanitizeFilename(input: string, fallbackIndex: number, ext = 'svg'): string {
  const clean = input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  return clean ? `${clean}.${ext}` : `record_${fallbackIndex + 1}.${ext}`;
}

/** Execute a single item conversion based on operation */
export async function processSingleBatchItem(
  val: string,
  index: number,
  operation: BatchOperationType
): Promise<BatchItemResult> {
  const trimmed = val.trim();
  const filename = sanitizeFilename(trimmed, index, 'svg');

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
      // 1. QR Code
      case 'qr': {
        const res = await ucs.qr.generate({ text: trimmed });
        return {
          index,
          originalValue: trimmed,
          filename: sanitizeFilename(trimmed, index, 'png'),
          status: 'success',
          outputData: res.dataUrl,
          mimeType: 'image/png',
        };
      }

      // 2. 1D Barcode: EAN-13
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
        const svg = await generateBarcodeSvg({
          format: 'EAN13',
          text: code,
        });
        return {
          index,
          originalValue: code,
          filename: sanitizeFilename(code, index, 'svg'),
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }

      // 3. 1D Barcode: EAN-8
      case 'barcode_ean8': {
        if (!/^\d{7,8}$/.test(trimmed)) {
          throw new Error('EAN-8 requires 7 or 8 numeric digits');
        }
        let code = trimmed;
        if (code.length === 7) {
          code += ucs.validation.calculateEanUpcCheckDigit(code);
        }
        if (!ucs.validation.validateEan8(code)) {
          throw new Error('Invalid EAN-8 check digit');
        }
        const svg = await generateBarcodeSvg({
          format: 'EAN8',
          text: code,
        });
        return {
          index,
          originalValue: code,
          filename: sanitizeFilename(code, index, 'svg'),
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }

      // 4. 1D Barcode: UPC-A
      case 'barcode_upca': {
        if (!/^\d{11,12}$/.test(trimmed)) {
          throw new Error('UPC-A requires 11 or 12 numeric digits');
        }
        let code = trimmed;
        if (code.length === 11) {
          code += ucs.validation.calculateEanUpcCheckDigit(code);
        }
        if (!ucs.validation.validateUpcA(code)) {
          throw new Error('Invalid UPC-A check digit');
        }
        const svg = await generateBarcodeSvg({
          format: 'UPC',
          text: code,
        });
        return {
          index,
          originalValue: code,
          filename: sanitizeFilename(code, index, 'svg'),
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }

      // 5. 1D Barcode: Code 128
      case 'barcode_code128': {
        const svg = await generateBarcodeSvg({
          format: 'CODE128',
          text: trimmed,
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

      // 6. 1D Barcode: Code 39
      case 'barcode_code39': {
        if (!/^[0-9A-Z\-. $/+%]+$/i.test(trimmed)) {
          throw new Error('Code 39 only supports uppercase alphanumeric and - . $ / + % characters');
        }
        const svg = await generateBarcodeSvg({
          format: 'CODE39',
          text: trimmed.toUpperCase(),
        });
        return {
          index,
          originalValue: trimmed.toUpperCase(),
          filename,
          status: 'success',
          outputData: svg,
          mimeType: 'image/svg+xml',
        };
      }

      // 7. 1D Barcode: ITF
      case 'barcode_itf': {
        if (!/^\d+$/.test(trimmed) || trimmed.length % 2 !== 0) {
          throw new Error('ITF requires an even number of numeric digits');
        }
        const svg = await generateBarcodeSvg({
          format: 'ITF',
          text: trimmed,
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

      // 8. 2D Symbology: Data Matrix
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

      // 9. 2D Symbology: Aztec Code
      case 'aztec': {
        const svg = ucs.twoDimensional.generateSvg({
          symbology: 'azteccode',
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

      // 10. 2D Symbology: PDF417
      case 'pdf417': {
        const svg = ucs.twoDimensional.generateSvg({
          symbology: 'pdf417',
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

      // 11. NFC NDEF URI Payload
      case 'nfc_uri': {
        const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const encoder = new TextEncoder();
        const payloadBytes = encoder.encode(urlStr);
        const hex = Array.from(payloadBytes)
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .join(' ');

        return {
          index,
          originalValue: urlStr,
          filename: sanitizeFilename(urlStr, index, 'json'),
          status: 'success',
          outputData: JSON.stringify(
            {
              recordType: 'url',
              uri: urlStr,
              byteLength: payloadBytes.length,
              hexDump: hex,
              recommendedTag: payloadBytes.length <= 137 ? 'NTAG213' : 'NTAG215',
            },
            null,
            2
          ),
          mimeType: 'application/json',
          extraMeta: {
            byteLength: payloadBytes.length,
            recordType: 'url',
          },
        };
      }

      // 12. NFC NDEF Text Payload
      case 'nfc_text': {
        const encoder = new TextEncoder();
        const payloadBytes = encoder.encode(trimmed);
        const hex = Array.from(payloadBytes)
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .join(' ');

        return {
          index,
          originalValue: trimmed,
          filename: sanitizeFilename(trimmed, index, 'json'),
          status: 'success',
          outputData: JSON.stringify(
            {
              recordType: 'text',
              text: trimmed,
              byteLength: payloadBytes.length,
              hexDump: hex,
              recommendedTag: payloadBytes.length <= 137 ? 'NTAG213' : 'NTAG215',
            },
            null,
            2
          ),
          mimeType: 'application/json',
          extraMeta: {
            byteLength: payloadBytes.length,
            recordType: 'text',
          },
        };
      }

      // 13. RFID / EPC SGTIN-96 Generation
      case 'rfid_sgtin96': {
        // Accepts either raw 24-hex EPC or comma/slash-separated parameters: companyPrefix,itemRef,serial
        let epcHex = '';
        if (/^[0-9A-Fa-f]{24}$/.test(trimmed)) {
          epcHex = trimmed.toUpperCase();
        } else {
          const parts = trimmed.split(/[,;\t|]/).map((p) => p.trim());
          const comp = parts[0] || '0614141';
          const item = parts[1] || '107346';
          const serial = parts[2] || String(index + 1);

          epcHex = encodeSgtin96({
            filter: 3,
            partition: 5,
            companyPrefix: comp,
            itemRef: item,
            serial,
          });
        }

        const decoded = ucs.rfid.decodeSgtin96(epcHex);

        return {
          index,
          originalValue: trimmed,
          filename: sanitizeFilename(epcHex, index, 'json'),
          status: 'success',
          outputData: JSON.stringify(
            {
              standard: 'GS1 EPC Gen2 SGTIN-96',
              epcHex,
              companyPrefix: decoded.companyPrefix,
              itemReference: decoded.itemRef,
              serial: decoded.serial,
              filter: decoded.filter,
              partition: decoded.partition,
              rawBinary: decoded.binary,
            },
            null,
            2
          ),
          mimeType: 'application/json',
          extraMeta: {
            epcHex,
            companyPrefix: decoded.companyPrefix,
            itemRef: decoded.itemRef,
            serial: decoded.serial,
          },
        };
      }

      // 14. Radix Base64
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

      // 15. Radix Hex
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
      EPC_Hex: r.extraMeta?.epcHex || '',
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
      Result:
        r.status === 'success'
          ? r.outputData?.startsWith('data:')
            ? '[IMAGE_DATA]'
            : r.outputData?.slice(0, 100)
          : '',
      EPC_Hex: r.extraMeta?.epcHex || '',
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
    Result:
      r.status === 'success'
        ? r.outputData?.startsWith('data:')
          ? '[IMAGE_DATA]'
          : r.outputData?.slice(0, 100)
        : '',
    EPC_Hex: r.extraMeta?.epcHex || '',
    Error: r.error || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
