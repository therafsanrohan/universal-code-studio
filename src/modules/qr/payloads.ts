export interface WifiPayload {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardPayload {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  note?: string;
}

export interface GeoPayload {
  latitude: number;
  longitude: number;
}

export function buildWifiString(payload: WifiPayload): string {
  const enc = payload.encryption || 'WPA';
  const pass = payload.password ? payload.password.replace(/([\\;,":])/g, '\\$1') : '';
  const ssid = payload.ssid.replace(/([\\;,":])/g, '\\$1');
  const hidden = payload.hidden ? 'H:true;' : '';
  return `WIFI:T:${enc};S:${ssid};P:${pass};${hidden};`;
}

export function buildVCardString(payload: VCardPayload): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${payload.lastName || ''};${payload.firstName || ''};;;`,
    `FN:${[payload.firstName, payload.lastName].filter(Boolean).join(' ')}`,
  ];

  if (payload.organization) lines.push(`ORG:${payload.organization}`);
  if (payload.title) lines.push(`TITLE:${payload.title}`);
  if (payload.phone) lines.push(`TEL;TYPE=CELL:${payload.phone}`);
  if (payload.email) lines.push(`EMAIL;TYPE=INTERNET:${payload.email}`);
  if (payload.url) lines.push(`URL:${payload.url}`);
  if (payload.note) lines.push(`NOTE:${payload.note}`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

export function buildGeoString(payload: GeoPayload): string {
  return `geo:${payload.latitude},${payload.longitude}`;
}

