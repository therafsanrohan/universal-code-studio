/**
 * RFID / EPC Gen2 Tag Simulator & Memory Bank Model.
 * Represents standard EPC Class 1 Gen 2 (ISO/IEC 18000-6C) memory banks:
 * - Bank 00: Reserved (Kill & Access Passwords)
 * - Bank 01: EPC (CRC, PC, EPC Data)
 * - Bank 10: TID (Factory Tag Identification, Model, Chip vendor)
 * - Bank 11: User Memory (Optional extended user payload)
 */

export interface RfidMemoryBanks {
  reserved: {
    killPassword: string; // 8 hex chars (32 bits)
    accessPassword: string; // 8 hex chars (32 bits)
  };
  epc: {
    pc: string; // 4 hex chars (Protocol Control bits)
    epcHex: string; // 24 hex chars (96 bits) or custom length
  };
  tid: {
    tidHex: string; // Typically 24-32 hex chars (unique chip ID)
    chipModel: string;
  };
  user: {
    userHex: string; // User data memory bank
  };
}

export interface RfidTagRecord {
  tagId: string; // EPC Hex representation
  rssi: number; // Signal strength in dBm (-30 to -85 dBm)
  frequency: string; // e.g. "915.25 MHz"
  antenna: number;
  readCount: number;
  lastSeen: string;
  memory: RfidMemoryBanks;
}

// Partition lookup table for GS1 SGTIN-96
export const SGTIN96_PARTITION_TABLE: Record<number, { m: number; l: number; companyDigits: number; itemDigits: number }> = {
  0: { m: 40, l: 4, companyDigits: 12, itemDigits: 1 },
  1: { m: 37, l: 7, companyDigits: 11, itemDigits: 2 },
  2: { m: 34, l: 10, companyDigits: 10, itemDigits: 3 },
  3: { m: 30, l: 14, companyDigits: 9, itemDigits: 4 },
  4: { m: 27, l: 17, companyDigits: 8, itemDigits: 5 },
  5: { m: 24, l: 20, companyDigits: 7, itemDigits: 6 },
  6: { m: 20, l: 24, companyDigits: 6, itemDigits: 7 },
};

/**
 * Encode Company Prefix, Item Reference, Serial, Filter, and Partition into SGTIN-96 Hex.
 */
export function encodeSgtin96(params: {
  filter: number;
  partition: number;
  companyPrefix: string;
  itemRef: string;
  serial: string;
}): string {
  const { filter, partition, companyPrefix, itemRef, serial } = params;

  const header = (0x30).toString(2).padStart(8, '0'); // SGTIN-96 header is 0x30 (00110000)
  const filterBits = (filter & 0b111).toString(2).padStart(3, '0');
  const partRule = SGTIN96_PARTITION_TABLE[partition] ?? SGTIN96_PARTITION_TABLE[5]!;
  const partitionBits = (partition & 0b111).toString(2).padStart(3, '0');

  const compBig = BigInt(companyPrefix.replace(/\D/g, '') || '0');
  const compBits = compBig.toString(2).padStart(partRule.m, '0').slice(-partRule.m);

  const itemBig = BigInt(itemRef.replace(/\D/g, '') || '0');
  const itemBits = itemBig.toString(2).padStart(partRule.l, '0').slice(-partRule.l);

  const serialBig = BigInt(serial.replace(/\D/g, '') || '0');
  const serialBits = serialBig.toString(2).padStart(38, '0').slice(-38);

  const fullBitstring = header + filterBits + partitionBits + compBits + itemBits + serialBits;
  if (fullBitstring.length !== 96) {
    throw new Error(`Invalid SGTIN-96 bit length: expected 96, got ${fullBitstring.length}`);
  }

  // Convert 96 bits to 24 hex characters
  let hexResult = '';
  for (let i = 0; i < 96; i += 4) {
    const nibble = parseInt(fullBitstring.slice(i, i + 4), 2);
    hexResult += nibble.toString(16).toUpperCase();
  }

  return hexResult;
}

// Global Virtual Active Tag in the RFID Field
let activeRfidTag: RfidTagRecord = {
  tagId: '3074257BF7194E4000001A85',
  rssi: -42,
  frequency: '915.25 MHz (UHF Gen2)',
  antenna: 1,
  readCount: 14,
  lastSeen: new Date().toLocaleTimeString(),
  memory: {
    reserved: {
      killPassword: '00000000',
      accessPassword: '00000000',
    },
    epc: {
      pc: '3000',
      epcHex: '3074257BF7194E4000001A85',
    },
    tid: {
      tidHex: 'E28011602000700412345678',
      chipModel: 'Impinj Monza R6 / Alien Higgs-EC',
    },
    user: {
      userHex: '0000000000000000',
    },
  },
};

export function getActiveRfidTag(): RfidTagRecord {
  return activeRfidTag;
}

export function writeActiveRfidTag(updates: Partial<RfidTagRecord>): RfidTagRecord {
  activeRfidTag = {
    ...activeRfidTag,
    ...updates,
    lastSeen: new Date().toLocaleTimeString(),
    readCount: activeRfidTag.readCount + 1,
  };
  return activeRfidTag;
}

export function writeRfidMemory(bank: 'epc' | 'reserved' | 'user', field: string, hexVal: string): RfidTagRecord {
  const currentMem = { ...activeRfidTag.memory };

  if (bank === 'epc' && field === 'epcHex') {
    currentMem.epc = { ...currentMem.epc, epcHex: hexVal.toUpperCase().replace(/\s/g, '') };
    activeRfidTag.tagId = hexVal.toUpperCase().replace(/\s/g, '');
  } else if (bank === 'reserved') {
    if (field === 'killPassword') currentMem.reserved.killPassword = hexVal.toUpperCase();
    if (field === 'accessPassword') currentMem.reserved.accessPassword = hexVal.toUpperCase();
  } else if (bank === 'user') {
    currentMem.user.userHex = hexVal.toUpperCase();
  }

  activeRfidTag = {
    ...activeRfidTag,
    memory: currentMem,
    lastSeen: new Date().toLocaleTimeString(),
    readCount: activeRfidTag.readCount + 1,
  };
  return activeRfidTag;
}
