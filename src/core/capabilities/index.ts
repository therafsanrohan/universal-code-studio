/**
 * Hardware capability detection.
 * Checks API availability without requesting permissions.
 * See docs/ARCHITECTURE.md §7.
 */

export interface HardwareCapabilities {
  camera: boolean;
  webNfc: boolean;
  webBluetooth: boolean;
  webUsb: boolean;
  webSerial: boolean;
  secureContext: boolean;
  webCrypto: boolean;
}

/** Detect available browser APIs without requesting access. */
export function detectCapabilities(): HardwareCapabilities {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      camera: false,
      webNfc: false,
      webBluetooth: false,
      webUsb: false,
      webSerial: false,
      secureContext: false,
      webCrypto: false,
    };
  }

  return {
    camera:
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices?.getUserMedia === 'function',
    webNfc: 'NDEFReader' in window,
    webBluetooth: 'bluetooth' in navigator,
    webUsb: 'usb' in navigator,
    webSerial: 'serial' in navigator,
    secureContext: Boolean(typeof window !== 'undefined' && window.isSecureContext),
    webCrypto: typeof crypto?.subtle !== 'undefined',
  };
}

export type CapabilityKey = keyof HardwareCapabilities;

export const CAPABILITY_LABELS: Record<CapabilityKey, string> = {
  camera: 'Camera',
  webNfc: 'Web NFC',
  webBluetooth: 'Web Bluetooth',
  webUsb: 'WebUSB',
  webSerial: 'Web Serial',
  secureContext: 'Secure Context (HTTPS)',
  webCrypto: 'Web Crypto API',
};

export const CAPABILITY_DESCRIPTIONS: Record<CapabilityKey, string> = {
  camera: 'Camera access for scanning codes.',
  webNfc: 'Read and write NFC tags. Requires compatible Android device and Chrome.',
  webBluetooth: 'Connect to Bluetooth Low Energy devices.',
  webUsb: 'Connect to USB devices directly from the browser.',
  webSerial: 'Connect to serial port devices.',
  secureContext: 'HTTPS connection required for hardware APIs.',
  webCrypto: 'Browser cryptography for hashing and checksums.',
};

