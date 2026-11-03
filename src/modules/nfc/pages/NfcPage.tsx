import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { useCapability } from '@/hooks/useCapability';
import { Nfc, Radio, Copy, Check, AlertCircle } from 'lucide-react';

export default function NfcPage() {
  const isWebNfcSupported = useCapability('webNfc');
  const [recordType, setRecordType] = useState<'url' | 'text'>('url');
  const [urlVal, setUrlVal] = useState('https://universalcode.studio');
  const [textVal, setTextVal] = useState('Universal Code Studio NFC Payload');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const getRecordBytes = () => {
    const payload = recordType === 'url' ? urlVal : textVal;
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(payload))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  };

  const handleReadTag = async () => {
    if (!('NDEFReader' in window)) {
      setStatusMessage('Web NFC API is not supported in this browser. Please use Chrome on Android with NFC enabled.');
      return;
    }
    try {
      setIsReading(true);
      setStatusMessage('Approaching tag... Bring an NFC tag close to your phone.');
      // @ts-expect-error NDEFReader is browser experimental
      const ndef = new window.NDEFReader();
      await ndef.scan();
      ndef.onreading = (event: any) => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          setStatusMessage(`Read record [${record.recordType}]: ${decoder.decode(record.data)}`);
        }
        setIsReading(false);
      };
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'NFC reading failed or permission was denied.');
      setIsReading(false);
    }
  };

  const handleWriteTag = async () => {
    if (!('NDEFReader' in window)) {
      setStatusMessage('Web NFC API is not supported in this browser. Please use Chrome on Android with NFC enabled.');
      return;
    }
    const payload = recordType === 'url' ? urlVal : textVal;
    try {
      setIsWriting(true);
      setStatusMessage('Bring your NFC tag close to write payload...');
      // @ts-expect-error NDEFReader is browser experimental
      const ndef = new window.NDEFReader();
      await ndef.write(
        recordType === 'url'
          ? { records: [{ recordType: 'url', data: payload }] }
          : { records: [{ recordType: 'text', data: payload }] }
      );
      setStatusMessage('NFC Tag successfully written!');
      setIsWriting(false);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Write operation failed.');
      setIsWriting(false);
    }
  };

  return (
    <ToolPageTemplate
      title="NFC / NDEF Studio"
      description="Assemble, inspect, and encode NFC Data Exchange Format (NDEF) records. Read and write contactless tags on supported Android devices."
      status={isWebNfcSupported ? 'limited-support' : 'requires-hardware'}
      requirements={[
        'NDEF record construction & byte analysis works 100% locally in any browser.',
        'Physical tag reading/writing requires Chrome for Android and NFC hardware.',
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. NDEF Record Type
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
                URI / Web Link
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
                Text Record
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              2. Record Payload Data
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

          {/* Physical Operations */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              3. Contactless Tag Actions (Web NFC)
            </label>
            {!isWebNfcSupported && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Web NFC API is not detected in your current desktop browser. Physical read/write is only available on compatible Android smartphones via Google Chrome.
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleReadTag}
                disabled={isReading || isWriting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs"
              >
                <Nfc className="h-4 w-4" />
                {isReading ? 'Scanning for NFC Tag...' : 'Read Physical Tag'}
              </button>
              <button
                type="button"
                onClick={handleWriteTag}
                disabled={isReading || isWriting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 py-2.5 px-4 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 transition-all"
              >
                <Radio className="h-4 w-4" />
                {isWriting ? 'Writing to Tag...' : 'Write Payload to Tag'}
              </button>
            </div>

            {statusMessage && (
              <div className="rounded-lg bg-slate-100 p-3 text-xs font-mono text-slate-800 border border-slate-200">
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hex Byte Inspector */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-4 border-b border-slate-100 pb-3">
              NDEF Byte Stream Representation
            </span>

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 break-all leading-relaxed shadow-inner">
                {getRecordBytes()}
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Record Type Name:</span>
                  <span className="font-mono text-slate-800">{recordType === 'url' ? 'urn:nfc:wkt:U' : 'urn:nfc:wkt:T'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Payload Encoding:</span>
                  <span className="font-mono text-slate-800">UTF-8</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(getRecordBytes());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied Hex Bytes' : 'Copy Hex Bytes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
