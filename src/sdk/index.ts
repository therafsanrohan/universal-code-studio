import { generateQRCode, type QRCodeErrorCorrectionLevel } from '@/modules/qr/adapter';
import {
  buildWifiString,
  buildVCardString,
  buildGeoString,
  type WifiPayload,
  type VCardPayload,
  type GeoPayload,
} from '@/modules/qr/payloads';
import {
  calculateEanUpcCheckDigit,
  validateEan13,
  validateEan8,
  validateUpcA,
  calculateCode39CheckDigit,
} from '@/modules/barcode/checkDigits';
import { generate2DSymbolSvg, type TwoDimSymbology } from '@/modules/two-dimensional/adapter';

export interface QRGenerateSDKOptions {
  text: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface BarcodeGenerateSDKOptions {
  symbology: 'EAN13' | 'EAN8' | 'UPC' | 'CODE128' | 'CODE39' | 'ITF';
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export interface TwoDimSDKOptions {
  symbology: TwoDimSymbology;
  value: string;
  scale?: number;
  padding?: number;
}

/**
 * Universal Code Studio Client SDK.
 * Headless, client-side & isomorphic developer engine.
 */
export class UniversalCodeStudio {
  /** QR Code methods */
  public readonly qr = {
    generate: async (options: QRGenerateSDKOptions) => {
      return generateQRCode(options);
    },
  };

  /** Structured Payload builders */
  public readonly payloads = {
    wifi: (payload: WifiPayload) => buildWifiString(payload),
    vcard: (payload: VCardPayload) => buildVCardString(payload),
    geo: (payload: GeoPayload) => buildGeoString(payload),
  };

  /** 2D Symbology methods (Data Matrix, PDF417, Aztec, MaxiCode) */
  public readonly twoDimensional = {
    generateSvg: (options: TwoDimSDKOptions) => {
      return generate2DSymbolSvg({
        bcid: options.symbology,
        text: options.value,
        scale: options.scale,
        padding: options.padding,
      });
    },
  };

  /** Verification and check digit calculations */
  public readonly validation = {
    calculateEanUpcCheckDigit: (digits: string) => calculateEanUpcCheckDigit(digits),
    validateEan13: (code: string) => validateEan13(code),
    validateEan8: (code: string) => validateEan8(code),
    validateUpcA: (code: string) => validateUpcA(code),
    calculateCode39CheckDigit: (text: string) => calculateCode39CheckDigit(text),
  };

  /** RFID EPC SGTIN-96 parser */
  public readonly rfid = {
    decodeSgtin96: (hex: string) => {
      const cleanHex = hex.trim().replace(/^0x/i, '');
      if (!/^[0-9A-Fa-f]{24}$/.test(cleanHex)) {
        throw new Error('Invalid EPC SGTIN-96 format. Expected exactly 24 hexadecimal characters.');
      }
      const epcBigInt = BigInt('0x' + cleanHex);
      const binary96 = epcBigInt.toString(2).padStart(96, '0');
      const header = binary96.slice(0, 8);
      const filter = parseInt(binary96.slice(8, 11), 2);
      const partition = parseInt(binary96.slice(11, 14), 2);

      const partitionMap: Record<number, { m: number; l: number }> = {
        0: { m: 40, l: 4 },
        1: { m: 37, l: 7 },
        2: { m: 34, l: 10 },
        3: { m: 30, l: 14 },
        4: { m: 27, l: 17 },
        5: { m: 24, l: 20 },
        6: { m: 20, l: 24 },
      };

      const partRule = partitionMap[partition] || { m: 24, l: 20 };
      const companyPrefix = BigInt('0b' + binary96.slice(14, 14 + partRule.m)).toString();
      const itemRef = BigInt('0b' + binary96.slice(14 + partRule.m, 14 + partRule.m + partRule.l)).toString();
      const serial = BigInt('0b' + binary96.slice(14 + partRule.m + partRule.l, 96)).toString();

      return {
        headerHex: parseInt(header, 2).toString(16).toUpperCase(),
        filter,
        partition,
        companyPrefix,
        itemRef,
        serial,
        binary: binary96,
      };
    },
  };

  /** GS1 Digital Link builder */
  public readonly gs1 = {
    buildDigitalLink: (options: {
      domain?: string;
      gtin: string;
      lot?: string;
      serial?: string;
    }) => {
      const base = (options.domain || 'https://id.gs1.org').replace(/\/$/, '');
      let uri = `${base}/01/${options.gtin}`;
      const params: string[] = [];
      if (options.lot) params.push(`10=${encodeURIComponent(options.lot)}`);
      if (options.serial) params.push(`21=${encodeURIComponent(options.serial)}`);
      if (params.length > 0) uri += `?${params.join('&')}`;
      return uri;
    },
  };
}

export const ucs = new UniversalCodeStudio();

