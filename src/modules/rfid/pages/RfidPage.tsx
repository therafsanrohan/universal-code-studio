import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import {
  Copy,
  Check,
  Radio,
  Upload,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Lock,
  Database,
  RefreshCw,
} from 'lucide-react';
import {
  encodeSgtin96,
  getActiveRfidTag,
  writeActiveRfidTag,
  writeRfidMemory,
  SGTIN96_PARTITION_TABLE,
  type RfidTagRecord,
} from '../rfidTagModel';

export default function RfidPage() {
  const [activeTab, setActiveTab] = useState<'read' | 'write' | 'banks'>('read');
  const [hexInput, setHexInput] = useState('3074257BF7194E4000001A85');
  const [copied, setCopied] = useState(false);
  const [tagRecord, setTagRecord] = useState<RfidTagRecord>(getActiveRfidTag());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  // Encoder Form State
  const [filterVal, setFilterVal] = useState<number>(3); // 3 = Item level retail
  const [partitionVal, setPartitionVal] = useState<number>(5); // default GS1 partition 5 (7 digits company, 6 digits item)
  const [companyPrefix, setCompanyPrefix] = useState<string>('0614141');
  const [itemRef, setItemRef] = useState<string>('107346');
  const [serialNum, setSerialNum] = useState<string>('6789');

  // Memory Banks Form State
  const [killPassword, setKillPassword] = useState('00000000');
  const [accessPassword, setAccessPassword] = useState('00000000');
  const [userMemoryHex, setUserMemoryHex] = useState('0000000000000000');

  // BigInt-safe EPC SGTIN-96 Decoder
  const parseEpc = (hex: string) => {
    const cleanHex = hex.trim().replace(/^0x/i, '');
    if (!/^[0-9A-Fa-f]{24}$/.test(cleanHex)) {
      return null;
    }

    try {
      const epcBigInt = BigInt('0x' + cleanHex);
      const binary96 = epcBigInt.toString(2).padStart(96, '0');

      const header = binary96.slice(0, 8);
      const filter = parseInt(binary96.slice(8, 11), 2);
      const partition = parseInt(binary96.slice(11, 14), 2);

      const partRule = SGTIN96_PARTITION_TABLE[partition] || { m: 24, l: 20, companyDigits: 7, itemDigits: 6 };
      const companyPrefixBits = binary96.slice(14, 14 + partRule.m);
      const itemRefBits = binary96.slice(14 + partRule.m, 14 + partRule.m + partRule.l);
      const serialBits = binary96.slice(14 + partRule.m + partRule.l, 96);

      const companyPrefixParsed = BigInt('0b' + companyPrefixBits).toString();
      const itemRefParsed = BigInt('0b' + itemRefBits).toString();
      const serialParsed = BigInt('0b' + serialBits).toString();

      return {
        valid: true,
        headerHex: parseInt(header, 2).toString(16).toUpperCase(),
        filter,
        partition,
        companyPrefix: companyPrefixParsed,
        itemRef: itemRefParsed,
        serial: serialParsed,
        binary: binary96.match(/.{1,8}/g)?.join(' '),
      };
    } catch {
      return null;
    }
  };

  const parsed = parseEpc(hexInput);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Read Action (Trigger antenna discovery & parse active RFID field tag)
  const handleReadTag = () => {
    setIsScanning(true);
    setStatusMessage('Transmitting continuous carrier wave (865–928 MHz)... Interrogating tags.');

    setTimeout(() => {
      const current = getActiveRfidTag();
      // Add slight jitter to simulate live RF capture
      const updated = writeActiveRfidTag({
        rssi: Math.floor(Math.random() * 15) - 55, // e.g. -40 to -55 dBm
        readCount: current.readCount + 1,
      });
      setTagRecord(updated);
      setHexInput(updated.tagId);
      setIsScanning(false);
      setStatusMessage(
        `[Inventory Captured] Discovered tag EPC: 0x${updated.tagId} (RSSI: ${updated.rssi} dBm, Freq: ${updated.frequency}).`
      );
    }, 500);
  };

  // 2. Write Action from Encoder Form
  const handleEncodeAndWrite = () => {
    setIsWriting(true);
    setStatusMessage('Generating SGTIN-96 bitstream & formatting EPC Bank 01...');

    try {
      const generatedHex = encodeSgtin96({
        filter: filterVal,
        partition: partitionVal,
        companyPrefix,
        itemRef,
        serial: serialNum,
      });

      setTimeout(() => {
        const updated = writeRfidMemory('epc', 'epcHex', generatedHex);
        setTagRecord(updated);
        setHexInput(generatedHex);
        setIsWriting(false);
        setStatusMessage(
          `Tag successfully encoded! Written EPC Bank (24 Hex bytes): ${generatedHex}`
        );
      }, 500);
    } catch (err) {
      setIsWriting(false);
      setStatusMessage(err instanceof Error ? err.message : 'Encoding failed.');
    }
  };

  // 3. Write Custom Raw Hex directly to Tag
  const handleDirectHexWrite = () => {
    if (!parsed) {
      setStatusMessage('Error: Please enter a valid 24-character hexadecimal EPC value before writing.');
      return;
    }
    setIsWriting(true);
    setStatusMessage('Writing EPC memory bank via UHF air interface...');
    setTimeout(() => {
      const updated = writeRfidMemory('epc', 'epcHex', hexInput);
      setTagRecord(updated);
      setIsWriting(false);
      setStatusMessage(`Tag memory Bank 01 updated with EPC: ${hexInput.toUpperCase()}`);
    }, 450);
  };

  // 4. Update Memory Banks (Reserved passwords, User Memory)
  const handleSaveMemoryBanks = () => {
    setIsWriting(true);
    setStatusMessage('Writing Reserved & User memory banks with Block-Write commands...');
    setTimeout(() => {
      writeRfidMemory('reserved', 'killPassword', killPassword);
      writeRfidMemory('reserved', 'accessPassword', accessPassword);
      const updated = writeRfidMemory('user', 'userHex', userMemoryHex);
      setTagRecord(updated);
      setIsWriting(false);
      setStatusMessage('Reserved passwords & User data blocks successfully committed to tag EEPROM.');
    }, 500);
  };

  return (
    <ToolPageTemplate
      title="RFID / EPC Studio"
      description="Read, write, encode, and inspect GS1 EPC Gen2 SGTIN-96 UHF RFID tags. Features live air-interface memory bank simulation (Reserved, EPC, TID, User) with BigInt bit-precision."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Operation Modes */}
        <div className="space-y-5 lg:col-span-7">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('read')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'read'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="h-4 w-4 text-sky-600" />
              <span>1. Read & Inspect</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'write'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>2. SGTIN-96 Encoder</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banks')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'banks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>3. Memory Banks</span>
            </button>
          </div>

          {/* TAB 1: READ & INSPECT */}
          {activeTab === 'read' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    SGTIN-96 Hexadecimal EPC Value (24 Hex Characters)
                  </label>
                  <button
                    type="button"
                    onClick={handleReadTag}
                    disabled={isScanning}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 border border-sky-200/80 hover:bg-sky-100 transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Reading Tag...' : 'Read Active Tag'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder="3074257BF7194E4000001A85"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 uppercase tracking-wider"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setHexInput('3074257BF7194E4000001A85')}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Sample 1 (SGTIN-96)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHexInput('301400000000000000000001')}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Sample 2 (Low Serial)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHexInput('3034257BF7194E4000009999')}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Sample 3 (Logistics Case)
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Write entered hex directly to the tag:</span>
                  <button
                    type="button"
                    onClick={handleDirectHexWrite}
                    disabled={isWriting || !parsed}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isWriting ? 'Writing...' : 'Write EPC to Tag'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SGTIN-96 ENCODER FORM (WRITE) */}
          {activeTab === 'write' && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Compose & Encode GS1 SGTIN-96 Tag
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  GS1 EPC Gen2
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Filter Value (3 bits)
                  </label>
                  <select
                    value={filterVal}
                    onChange={(e) => setFilterVal(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value={0}>0: All Others (Default)</option>
                    <option value={1}>1: Point of Sale (POS) Item</option>
                    <option value={2}>2: Full Case for Transport</option>
                    <option value={3}>3: Reserved (Item Level Retail)</option>
                    <option value={4}>4: Inner Pack</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Partition Value (3 bits)
                  </label>
                  <select
                    value={partitionVal}
                    onChange={(e) => setPartitionVal(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value={0}>Partition 0 (12 digits Company, 1 digit Item)</option>
                    <option value={1}>Partition 1 (11 digits Company, 2 digits Item)</option>
                    <option value={2}>Partition 2 (10 digits Company, 3 digits Item)</option>
                    <option value={3}>Partition 3 (9 digits Company, 4 digits Item)</option>
                    <option value={4}>Partition 4 (8 digits Company, 5 digits Item)</option>
                    <option value={5}>Partition 5 (7 digits Company, 6 digits Item)</option>
                    <option value={6}>Partition 6 (6 digits Company, 7 digits Item)</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    GS1 Company Prefix
                  </label>
                  <input
                    type="text"
                    value={companyPrefix}
                    onChange={(e) => setCompanyPrefix(e.target.value)}
                    placeholder="0614141"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Item Reference / Product Code
                  </label>
                  <input
                    type="text"
                    value={itemRef}
                    onChange={(e) => setItemRef(e.target.value)}
                    placeholder="107346"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Serial Number (Up to 38-bit integer)
                </label>
                <input
                  type="text"
                  value={serialNum}
                  onChange={(e) => setSerialNum(e.target.value)}
                  placeholder="6789"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={handleEncodeAndWrite}
                disabled={isWriting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
              >
                <Zap className="h-4 w-4" />
                <span>{isWriting ? 'Encoding & Writing to Tag...' : 'Encode & Write SGTIN-96 to Tag'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: FULL MEMORY BANKS (Reserved, TID, User) */}
          {activeTab === 'banks' && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Gen2 4-Bank Memory Architecture
                </span>
                <span className="text-[11px] text-slate-500 font-mono">ISO/IEC 18000-6C</span>
              </div>

              {/* Bank 00: Reserved */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Bank 00: Reserved (Access & Kill Passwords)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase block">Kill Password (32-bit):</span>
                    <input
                      type="text"
                      value={killPassword}
                      maxLength={8}
                      onChange={(e) => setKillPassword(e.target.value)}
                      className="w-full mt-1 rounded border border-amber-300 bg-white px-2 py-1 uppercase text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase block">Access Password (32-bit):</span>
                    <input
                      type="text"
                      value={accessPassword}
                      maxLength={8}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      className="w-full mt-1 rounded border border-amber-300 bg-white px-2 py-1 uppercase text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bank 10: TID (Read Only Factory) */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                    <Database className="h-3.5 w-3.5 text-slate-600" />
                    <span>Bank 10: TID (Factory Silicon Identification - Read Only)</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">Locked</span>
                </div>
                <div className="font-mono text-xs text-slate-700 break-all bg-white p-2 rounded border border-slate-200">
                  {tagRecord.memory.tid.tidHex}
                </div>
                <p className="text-[11px] text-slate-500">
                  Silicon model: <span className="font-semibold text-slate-700">{tagRecord.memory.tid.chipModel}</span>
                </p>
              </div>

              {/* Bank 11: User Memory */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Bank 11: User Memory Bank</span>
                </div>
                <input
                  type="text"
                  value={userMemoryHex}
                  onChange={(e) => setUserMemoryHex(e.target.value)}
                  placeholder="0000000000000000"
                  className="w-full rounded border border-emerald-300 bg-white px-2.5 py-1.5 font-mono uppercase text-xs text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveMemoryBanks}
                disabled={isWriting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Save Memory Bank Changes</span>
              </button>
            </div>
          )}

          {/* Real-time Status / Feedback Notice */}
          {statusMessage && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-xs text-sky-800 flex items-start gap-2.5 animate-fadeIn">
              <Zap className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{statusMessage}</div>
            </div>
          )}

          {/* Hardware Connection Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
              <Cpu className="h-4 w-4 text-slate-600" />
              <span>Physical UHF RFID Hardware Layer & Web Serial API</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Desktop browsers do not have internal UHF radio antennas (860–960 MHz). Connect an external UHF USB/Serial RFID reader (such as ThingMagic, Zebra FX, or Impinj Speedway via Web Serial/LLRP) or use the live interactive tag engine above.
            </p>
          </div>
        </div>

        {/* Right Column: Active Tag Signal & Bit-level breakdown */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          {/* Active Tag Telemetry Header */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">Tag In Interrogation Zone</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{tagRecord.frequency}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                <span className="text-[10px] text-slate-500 block">Signal RSSI</span>
                <span className="font-mono font-bold text-slate-800">{tagRecord.rssi} dBm</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                <span className="text-[10px] text-slate-500 block">Read Count</span>
                <span className="font-mono font-bold text-sky-700">{tagRecord.readCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                <span className="text-[10px] text-slate-500 block">Antenna</span>
                <span className="font-mono font-bold text-slate-800">Port {tagRecord.antenna}</span>
              </div>
            </div>
          </div>

          {/* Bit-level Decomposition */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-4 border-b border-slate-100 pb-3">
              EPC Gen2 SGTIN-96 Bit Decomposition
            </span>

            {parsed ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Header (8 bits):</span>
                    <span className="font-mono font-bold text-slate-900">0x{parsed.headerHex} (SGTIN-96)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Filter Value:</span>
                    <span className="font-mono text-slate-900">{parsed.filter}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Partition:</span>
                    <span className="font-mono text-slate-900">{parsed.partition}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">GS1 Company Prefix:</span>
                    <span className="font-mono font-bold text-sky-700">{parsed.companyPrefix}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Item Reference:</span>
                    <span className="font-mono font-bold text-sky-700">{parsed.itemRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Serial Number:</span>
                    <span className="font-mono font-bold text-slate-900">{parsed.serial}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Raw 96-Bit Binary Stream
                  </span>
                  <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 break-all leading-relaxed shadow-inner">
                    {parsed.binary}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(hexInput)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied to Clipboard' : 'Copy EPC String'}
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-rose-600 font-medium">
                Invalid EPC Hex format. Expected exactly 24 hexadecimal characters (96 bits).
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
