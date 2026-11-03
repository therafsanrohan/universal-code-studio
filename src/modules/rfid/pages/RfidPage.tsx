import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Copy, Check, Cpu } from 'lucide-react';

export default function RfidPage() {
  const [hexInput, setHexInput] = useState('3074257BF7194E4000001A85');
  const [copied, setCopied] = useState(false);

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

      // SGTIN Partition table
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
      const companyPrefixBits = binary96.slice(14, 14 + partRule.m);
      const itemRefBits = binary96.slice(14 + partRule.m, 14 + partRule.m + partRule.l);
      const serialBits = binary96.slice(14 + partRule.m + partRule.l, 96);

      const companyPrefix = BigInt('0b' + companyPrefixBits).toString();
      const itemRef = BigInt('0b' + itemRefBits).toString();
      const serial = BigInt('0b' + serialBits).toString();

      return {
        valid: true,
        headerHex: parseInt(header, 2).toString(16).toUpperCase(),
        filter,
        partition,
        companyPrefix,
        itemRef,
        serial,
        binary: binary96.match(/.{1,8}/g)?.join(' '),
      };
    } catch {
      return null;
    }
  };

  const parsed = parseEpc(hexInput);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hexInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="RFID / EPC Studio"
      description="Decode and encode GS1 EPC Gen2 SGTIN-96 tags with BigInt bit-precision and partition tables. Works 100% offline."
      status="available"
      requirements={[
        'Pure EPC decoding & bit inspection runs locally without external hardware.',
        'Physical UHF RFID inventory scanning requires a connected UHF USB/Serial reader.',
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Input */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              SGTIN-96 Hexadecimal Value (24 Hex Characters)
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="3074257BF7194E4000001A85"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 uppercase"
            />

            <div className="mt-3 flex gap-2">
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
            </div>
          </div>

          {/* Physical Reader Hardware Guidance */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
              <Cpu className="h-4 w-4 text-slate-600" />
              <span>Physical UHF RFID Hardware Layer</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Desktop web browsers cannot directly emit UHF 860-960 MHz radio frequencies.
              To interface physical tags, attach an LLRP or USB-Serial UHF reader (e.g. ThingMagic, Zebra FX).
            </p>
          </div>
        </div>

        {/* Right Column: Bit-level breakdown */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
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
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy EPC String'}
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
