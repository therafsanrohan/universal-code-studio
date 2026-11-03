export type NDEFRecordType = 'url' | 'text' | 'mime' | 'raw';

export interface VirtualNDEFRecord {
  recordType: NDEFRecordType;
  mediaType?: string;
  data: string;
  id?: string;
}

export interface VirtualNFCTag {
  tagId: string;
  technology: string;
  capacityBytes: number;
  isReadOnly: boolean;
  records: VirtualNDEFRecord[];
  lastScannedAt: string;
}

// Global active simulated tag for desktop sandbox testing
let currentTag: VirtualNFCTag = {
  tagId: '04:8A:2F:E1:90:5B:80',
  technology: 'ISO/IEC 14443 Type A (NTAG215)',
  capacityBytes: 504,
  isReadOnly: false,
  records: [
    {
      recordType: 'url',
      data: 'https://universalcode.studio',
    },
  ],
  lastScannedAt: new Date().toLocaleTimeString(),
};

export function getActiveVirtualTag(): VirtualNFCTag {
  return currentTag;
}

export function writeVirtualTag(records: VirtualNDEFRecord[]): VirtualNFCTag {
  currentTag = {
    ...currentTag,
    records,
    lastScannedAt: new Date().toLocaleTimeString(),
  };
  return currentTag;
}
