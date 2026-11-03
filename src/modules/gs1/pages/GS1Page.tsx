import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Copy, Check } from 'lucide-react';

export default function GS1Page() {
  const [domain, setDomain] = useState('https://id.gs1.org');
  const [gtin, setGtin] = useState('09506000134352');
  const [lot, setLot] = useState('BAT1234');
  const [serial, setSerial] = useState('SN99482');
  const [copied, setCopied] = useState(false);

  // Construct standard GS1 Digital Link URI
  let digitalLinkUri = `${domain.replace(/\/$/, '')}/01/${gtin}`;
  const queryParams: string[] = [];
  if (lot.trim()) queryParams.push(`10=${encodeURIComponent(lot.trim())}`);
  if (serial.trim()) queryParams.push(`21=${encodeURIComponent(serial.trim())}`);
  if (queryParams.length > 0) {
    digitalLinkUri += `?${queryParams.join('&')}`;
  }

  // Construct GS1 Element String (GS1-128 barcode format)
  let elementString = `(01)${gtin}`;
  if (lot.trim()) elementString += `(10)${lot.trim()}`;
  if (serial.trim()) elementString += `(21)${serial.trim()}`;

  const handleCopy = async (val: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="GS1 Digital Link & AI Studio"
      description="Assemble standard GS1 Digital Link web URIs and GS1-128 Application Identifiers (GTIN, Batch/Lot, Serial Number)."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Form Controls */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              GS1 Application Identifiers (AI)
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Domain Resolver Base
              </label>
              <input
                type="url"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://id.gs1.org"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                GTIN - Global Trade Item Number (AI 01)
              </label>
              <input
                type="text"
                value={gtin}
                onChange={(e) => setGtin(e.target.value)}
                placeholder="09506000134352"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Batch / Lot Number (AI 10)
                </label>
                <input
                  type="text"
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  placeholder="BAT1234"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Serial Number (AI 21)
                </label>
                <input
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="SN99482"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Showcase */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 border-b border-slate-100 pb-2">
                GS1 Digital Link URI
              </span>
              <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-sky-400 break-all leading-relaxed shadow-inner">
                {digitalLinkUri}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(digitalLinkUri)}
                className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                Copy Digital Link URI
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 border-b border-slate-100 pb-2">
                GS1-128 Human Readable Format
              </span>
              <div className="rounded-xl bg-slate-100 p-3 font-mono text-xs text-slate-800 break-all border border-slate-200">
                {elementString}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
