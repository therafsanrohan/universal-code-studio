import { describe, it, expect } from 'vitest';
import { ucs, UniversalCodeStudio } from './index';

describe('UniversalCodeStudio SDK', () => {
  it('instantiates cleanly as a headless SDK', () => {
    const instance = new UniversalCodeStudio();
    expect(instance.qr).toBeDefined();
    expect(instance.validation).toBeDefined();
    expect(instance.payloads).toBeDefined();
    expect(instance.rfid).toBeDefined();
    expect(instance.gs1).toBeDefined();
  });

  it('generates QR codes via SDK instance', async () => {
    const result = await ucs.qr.generate({ text: 'https://example.com' });
    expect(result.dataUrl).toContain('data:image/png;base64');
    expect(result.svg).toContain('<svg');
  });

  it('builds Wi-Fi payload via SDK payloads helper', () => {
    const wifi = ucs.payloads.wifi({
      ssid: 'MyWiFi',
      password: 'secret',
      encryption: 'WPA',
    });
    expect(wifi).toBe('WIFI:T:WPA;S:MyWiFi;P:secret;;');
  });

  it('decodes RFID SGTIN-96 values via SDK', () => {
    const epc = ucs.rfid.decodeSgtin96('3074257BF7194E4000001A85');
    expect(epc.headerHex).toBe('30');
    expect(epc.filter).toBe(3);
    expect(epc.partition).toBe(5);
  });

  it('validates EAN-13 check digit via SDK', () => {
    expect(ucs.validation.validateEan13('5901234123457')).toBe(true);
    expect(ucs.validation.validateEan13('5901234123450')).toBe(false);
  });

  it('builds GS1 Digital Link URIs via SDK', () => {
    const link = ucs.gs1.buildDigitalLink({
      gtin: '09506000134352',
      lot: 'BATCH1',
    });
    expect(link).toBe('https://id.gs1.org/01/09506000134352?10=BATCH1');
  });
});
