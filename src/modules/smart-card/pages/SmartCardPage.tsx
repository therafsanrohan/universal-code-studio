import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Copy, Check, CreditCard } from 'lucide-react';

interface TLVNode {
  tag: string;
  length: number;
  value: string;
}

export default function SmartCardPage() {
  const [hexInput, setHexInput] = useState('6F1A840E315041592E5359532E4444463031A5088801025F2D02656E');
  const [copied, setCopied] = useState(false);

  // ISO 7816 BER-TLV Parser
  const parseTLV = (hex: string): TLVNode[] => {
    const clean = hex.trim().replace(/\s+/g, '');
    const nodes: TLVNode[] = [];
    let i = 0;

    try {
      while (i < clean.length) {
        // Tag (supports 1 or 2 bytes)
        let tag = clean.substring(i, i + 2);
        i += 2;
        if ((parseInt(tag, 16) & 0x1f) === 0x1f) {
          tag += clean.substring(i, i + 2);
          i += 2;
        }

        // Length
        if (i >= clean.length) break;
        let len = parseInt(clean.substring(i, i + 2), 16);
        i += 2;

        if (len > 0x7f) {
          const numBytes = len & 0x7f;
          len = parseInt(clean.substring(i, i + numBytes * 2), 16);
          i += numBytes * 2;
        }

        // Value
        const val = clean.substring(i, i + len * 2);
        i += len * 2;

        nodes.push({ tag: tag.toUpperCase(), length: len, value: val.toUpperCase() });
      }
    } catch {
      // Incomplete or trailing bytes
    }
    return nodes;
  };

  const parsed = parseTLV(hexInput);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hexInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="Smart Card APDU & TLV Studio"
      description="Inspect ISO 7816 BER-TLV smart card records, EMV payment application files, and assemble command APDUs."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              BER-TLV Hexadecimal Stream
            </label>
            <textarea
              rows={4}
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="Paste raw BER-TLV hexadecimal stream..."
              className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 uppercase"
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setHexInput('6F1A840E315041592E5359532E4444463031A5088801025F2D02656E')}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                EMV Select PSE Response (1PAY.SYS.DDF01)
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
              <CreditCard className="h-4 w-4 text-slate-600" />
              <span>APDU Structure Reference (ISO 7816-4)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard Command APDU: <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">CLA | INS | P1 | P2 | [Lc | Data] | [Le]</code>.
              Response APDU: <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">[Data] | SW1 | SW2</code> (e.g. 0x90 0x00 for Success).
            </p>
          </div>
        </div>

        {/* Right Column: Parsed TLV Tree */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-4 border-b border-slate-100 pb-3">
              Parsed BER-TLV Records
            </span>

            {parsed.length > 0 ? (
              <div className="space-y-3">
                {parsed.map((node, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="font-mono font-bold text-slate-900">Tag 0x{node.tag}</span>
                      <span className="text-slate-500 text-[11px]">Length: {node.length} bytes</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-600 block mb-0.5">Value (Hex):</span>
                      <div className="font-mono text-[11px] text-slate-800 break-all bg-white p-1.5 rounded border border-slate-200">
                        {node.value || '(Empty)'}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy Original Hex'}
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-600">
                Enter a valid BER-TLV hex sequence to decompose records
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
