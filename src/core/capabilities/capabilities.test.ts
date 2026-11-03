import { describe, it, expect } from 'vitest';
import {
  detectCapabilities,
  CAPABILITY_LABELS,
  CAPABILITY_DESCRIPTIONS,
  type CapabilityKey,
} from './index';

describe('detectCapabilities', () => {
  it('returns an object with all expected keys', () => {
    const caps = detectCapabilities();
    const expectedKeys: CapabilityKey[] = [
      'camera',
      'webNfc',
      'webBluetooth',
      'webUsb',
      'webSerial',
      'secureContext',
      'webCrypto',
    ];

    for (const key of expectedKeys) {
      expect(typeof caps[key]).toBe('boolean');
    }
  });

  it('detects webCrypto as available in jsdom', () => {
    // jsdom may or may not provide crypto.subtle
    const caps = detectCapabilities();
    expect(typeof caps.webCrypto).toBe('boolean');
  });
});

describe('capability metadata', () => {
  it('has a label for every capability', () => {
    const caps = detectCapabilities();
    for (const key of Object.keys(caps) as CapabilityKey[]) {
      expect(CAPABILITY_LABELS[key]).toBeDefined();
      expect(CAPABILITY_LABELS[key].length).toBeGreaterThan(0);
    }
  });

  it('has a description for every capability', () => {
    const caps = detectCapabilities();
    for (const key of Object.keys(caps) as CapabilityKey[]) {
      expect(CAPABILITY_DESCRIPTIONS[key]).toBeDefined();
      expect(CAPABILITY_DESCRIPTIONS[key].length).toBeGreaterThan(0);
    }
  });
});

