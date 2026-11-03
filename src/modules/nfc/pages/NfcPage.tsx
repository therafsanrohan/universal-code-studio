import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { useCapability } from '@/hooks/useCapability';
import { getActiveVirtualTag, writeVirtualTag, type VirtualNFCTag } from '../simulator';
import { Nfc, Radio, Copy, Check, Smartphone, Laptop } from 'lucide-react';

export default function NfcPage() {
  const isWebNfcSupported = useCapability('webNfc');
  const [recordType, setRecordType] = useState<'url' | 'text'>('url');
  const [urlVal, setUrlVal] = useState('https://universalcode.studio');
  const [textVal, setTextVal] = useState('Universal Code Studio NFC Payload');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Virtual Tag State for desktop testing
  const [virtualTag, setVirtualTag] = useState<VirtualNFCTag>(getActiveVirtualTag());

  const getRecordBytes = () => {
    const payload = recordType === 'url' ? urlVal : textVal;
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(payload))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  };

  const handleReadTag = async () => {
    setStatusMessage(null);

    // If hardware Web NFC is supported (Android Chrome)
    if ('NDEFReader' in window) {
      try {
        setIsReading(true);
        setStatusMessage('Approaching physical tag... Tap an NFC card/tag against your device.');
        // @ts-expect-error browser experimental
        const ndef = new window.NDEFReader();
        await ndef.scan();
        ndef.onreading = (event: any) => {
          const decoder = new TextDecoder();
          for (const record of event.message.records) {
            setStatusMessage(`Read physical record [${record.recordType}]: ${decoder.decode(record.data)}`);
          }
          setIsReading(false);
        };
      } catch (err) {
        setStatusMessage(err instanceof Error ? err.message : 'NFC reading failed or permission was denied.');
        setIsReading(false);
      }
      return;
    }

    // Fallback: Virtual Emulator for Desktop & non-supported browsers
    setIsReading(true);
    setStatusMessage('Reading simulated NFC tag memory...');
    setTimeout(() => {
      const tag = getActiveVirtualTag();
      setVirtualTag(tag);
      const rec = tag.records[0];
      setStatusMessage(
        `[Emulator] Discovered ${tag.technology} (UID: ${tag.tagId}). Record: "${rec?.data}" (${tag.capacityBytes} bytes free).`
      );
      setIsReading(false);
    }, 600);
  };

  const handleWriteTag = async () => {
    setStatusMessage(null);
    const payload = recordType === 'url' ? urlVal : textVal;

    // If hardware Web NFC is supported (Android Chrome)
    if ('NDEFReader' in window) {
      try {
        setIsWriting(true);
        setStatusMessage('Bring NFC tag close to antenna to commit payload...');
        // @ts-expect-error browser experimental
        const ndef = new window.NDEFReader();
        await ndef.write(
          recordType === 'url'
            ? { records: [{ recordType: 'url', data: payload }] }
            : { records: [{ recordType: 'text', data: payload }] }
        );
        setStatusMessage('Physical NFC tag successfully formatted and written!');
        setIsWriting(false);
      } catch (err) {
        setStatusMessage(err instanceof Error ? err.message : 'Write operation failed.');
        setIsWriting(false);
      }
      return;
    }

    // Fallback: Virtual Emulator
    setIsWriting(true);
    setStatusMessage('Writing payload to tag buffer...');
    setTimeout(() => {
      const updated = writeVirtualTag([
        {
          recordType,
          data: payload,
        },
      ]);
      setVirtualTag(updated);
      setStatusMessage(`[Emulator] Successfully written to simulated NTAG215 tag (UID: ${updated.tagId})!`);
      setIsWriting(false);
    }, 600);
  };

  return (
    <ToolPageTemplate
      title="NFC / NDEF Studio"
      description="Assemble standard NDEF records, inspect byte streams, and interact with contactless tags. Features full hardware Web NFC support on Android Chrome and built-in Tag Emulation on Desktop."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Record Builder */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Choose NDEF Record Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecordType('url')}
                className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  recordType === 'url'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                URI / Web URL (0x55)
              </button>
              <button
                type="button"
                onClick={() => setRecordType('text')}
                className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  recordType === 'text'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Well-Known Text (0x54)
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              2. Payload Value
            </label>
            {recordType === 'url' ? (
              <input
                type="url"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                placeholder="https://example.com"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            ) : (
              <textarea
                rows={3}
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            )}
          </div>

          {/* Tag Read/Write Controls */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Physical Tag & Emulator Operations
              </label>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                {isWebNfcSupported ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Smartphone className="h-3.5 w-3.5" /> Hardware Web NFC Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sky-700 font-semibold">
                    <Laptop className="h-3.5 w-3.5" /> Desktop Tag Emulator Active
                  </span>
                )}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleReadTag}
                disabled={isReading || isWriting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs"
              >
                <Nfc className="h-4 w-4" />
                {isReading ? 'Scanning...' : 'Scan / Read Tag'}
              </button>
              <button
                type="button"
                onClick={handleWriteTag}
                disabled={isReading || isWriting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-800 py-2.5 px-4 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                <Radio className="h-4 w-4 text-slate-600" />
                {isWriting ? 'Writing...' : 'Write Payload to Tag'}
              </button>
            </div>

            {statusMessage && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-800 border border-slate-200 leading-relaxed">
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Virtual Tag & Hex Byte Inspector */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          {/* Active Tag Memory Status */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3 border-b border-slate-100 pb-2">
              Current NFC Tag Memory State
            </span>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">UID:</span>
                <span className="font-mono font-bold text-slate-900">{virtualTag.tagId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">IC Technology:</span>
                <span className="font-medium text-slate-800">{virtualTag.technology}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">User Memory:</span>
                <span className="font-mono text-slate-800">{virtualTag.capacityBytes} Bytes</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-0.5">Stored Payload:</span>
                <span className="font-mono text-sky-700 font-semibold break-all">
                  {virtualTag.records[0]?.data}
                </span>
              </div>
            </div>
          </div>

          {/* Hex Stream Inspector */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3 border-b border-slate-100 pb-2">
              Raw NDEF Byte Stream
            </span>

            <div className="space-y-3">
              <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-emerald-400 break-all leading-relaxed shadow-inner">
                {getRecordBytes()}
              </div>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(getRecordBytes());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied Bytes' : 'Copy Hex Bytes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
