import { useState, useEffect } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { generate2DSymbolSvg, type TwoDimSymbology } from '../adapter';
import { Download, AlertCircle, Copy, Check, Eye, Sliders } from 'lucide-react';

const TWO_D_FORMATS: { id: TwoDimSymbology; label: string; desc: string; sample: string }[] = [
  { id: 'datamatrix', label: 'Data Matrix (ECC 200)', desc: 'Industrial, Electronics & Healthcare', sample: 'UCS-DM-9948201' },
  { id: 'pdf417', label: 'PDF417', desc: 'ID Cards, Boarding Passes & Transport', sample: 'A1B2C3D4E5F6G7H8I9J0' },
  { id: 'azteccode', label: 'Aztec Code', desc: 'Railway & Aviation Tickets', sample: 'TK-849204820' },
  { id: 'maxicode', label: 'MaxiCode', desc: 'Logistics, Package Sorting & UPS', sample: '[)>019633602920484000000000100' },
];

export default function TwoDimensionalPage() {
  const [symbology, setSymbology] = useState<TwoDimSymbology>('datamatrix');
  const [text, setText] = useState('UCS-DM-9948201');
  const [scale, setScale] = useState(3);
  const [padding, setPadding] = useState(10);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentMeta = TWO_D_FORMATS.find((f) => f.id === symbology) || TWO_D_FORMATS[0]!;

  useEffect(() => {
    if (!text.trim()) {
      setSvgString(null);
      setError(null);
      return;
    }

    try {
      const svg = generate2DSymbolSvg({
        bcid: symbology,
        text,
        scale,
        padding,
      });
      setSvgString(svg);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate 2D symbol');
      setSvgString(null);
    }
  }, [symbology, text, scale, padding]);

  const downloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbology}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="2D Symbology Studio"
      description="Generate standard industrial 2D matrix codes: Data Matrix ECC 200, PDF417, Aztec Code, and MaxiCode with vector SVG rendering."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Controls Column */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Choose 2D Symbology
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TWO_D_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSymbology(f.id);
                    setText(f.sample);
                  }}
                  className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
                    symbology === f.id
                      ? 'border-2 border-slate-900 bg-slate-50/80 shadow-xs'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{f.label}</div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              2. Data Content / Payload
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or raw data..."
              className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <p className="mt-2 text-[11px] text-slate-600">
              Sample input: <span className="font-mono text-slate-700">{currentMeta.sample}</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="h-4 w-4 text-slate-500" />
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Dimension & Density
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Scale Factor</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quiet Zone Padding</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-600" />
                Live 2D Preview
              </span>
              <span className="text-[11px] font-medium text-slate-600">
                {currentMeta.label}
              </span>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-rose-600">
                <AlertCircle className="h-10 w-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            ) : svgString ? (
              <div
                className="rounded-xl p-4 bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center shadow-inner overflow-x-auto max-w-full w-full"
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            ) : (
              <div className="py-20 text-center text-xs text-slate-600">
                Enter payload above to generate 2D code preview
              </div>
            )}

            {svgString && !error && (
              <div className="mt-6 flex gap-2.5 w-full">
                <button
                  type="button"
                  onClick={downloadSVG}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  Download Vector SVG
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
