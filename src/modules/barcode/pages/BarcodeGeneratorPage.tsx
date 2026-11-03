import { useState, useEffect, useRef } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { type BarcodeFormatId, validateBarcodeData } from '../adapter';
import { calculateEanUpcCheckDigit } from '../checkDigits';
import JsBarcode from 'jsbarcode';
import { Download, AlertCircle, Copy, Check, Eye, Sliders } from 'lucide-react';

const FORMATS: { id: BarcodeFormatId; label: string; desc: string; placeholder: string; example: string }[] = [
  { id: 'CODE128', label: 'Code 128', desc: 'Logistics & Universal', placeholder: 'UCS-PROD-2026', example: 'UCS-PROD-2026' },
  { id: 'EAN13', label: 'EAN-13', desc: 'Global Retail (13 digits)', placeholder: '5901234123457', example: '5901234123457' },
  { id: 'UPC', label: 'UPC-A', desc: 'North America (12 digits)', placeholder: '012345678905', example: '012345678905' },
  { id: 'EAN8', label: 'EAN-8', desc: 'Small Package Retail', placeholder: '96385074', example: '96385074' },
  { id: 'CODE39', label: 'Code 39', desc: 'Industrial Alphanumeric', placeholder: 'CODE-39', example: 'CODE-39' },
  { id: 'ITF', label: 'ITF (2 of 5)', desc: 'Packaging & Cartons', placeholder: '123456', example: '123456' },
];

export default function BarcodeGeneratorPage() {
  const [format, setFormat] = useState<BarcodeFormatId>('CODE128');
  const [text, setText] = useState('UCS-PROD-2026');
  const [displayValue, setDisplayValue] = useState(true);
  const [height, setHeight] = useState(85);
  const [width, setWidth] = useState(2);
  const [lineColor] = useState('#0f172a');
  const [background] = useState('#ffffff');
  const [margin, setMargin] = useState(12);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const currentFormatMeta = FORMATS.find((f) => f.id === format) || FORMATS[0]!;

  const autoAppendCheckDigit = () => {
    const clean = text.trim();
    if (format === 'EAN13' && clean.length === 12 && /^\d+$/.test(clean)) {
      setText(clean + calculateEanUpcCheckDigit(clean));
    } else if (format === 'UPC' && clean.length === 11 && /^\d+$/.test(clean)) {
      setText(clean + calculateEanUpcCheckDigit(clean));
    } else if (format === 'EAN8' && clean.length === 7 && /^\d+$/.test(clean)) {
      setText(clean + calculateEanUpcCheckDigit(clean));
    }
  };

  useEffect(() => {
    if (!text.trim()) {
      setError(null);
      if (svgRef.current) svgRef.current.innerHTML = '';
      return;
    }

    const val = validateBarcodeData(format, text);
    if (!val.valid) {
      setError(val.issues[0]?.message || 'Invalid barcode input');
      if (svgRef.current) svgRef.current.innerHTML = '';
      return;
    }

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, text, {
          format,
          width,
          height,
          displayValue,
          lineColor,
          background,
          margin,
          valid: (valid) => {
            if (!valid) {
              setError(`Unable to encode data in ${format} format`);
            } else {
              setError(null);
            }
          },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Barcode generation failed');
    }
  }, [format, text, width, height, displayValue, lineColor, background, margin]);

  const downloadSVG = () => {
    if (!svgRef.current || error) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format.toLowerCase()}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    if (!svgRef.current || error) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 420;
      canvas.height = img.height || 180;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `barcode-${format.toLowerCase()}-${Date.now()}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="1D Barcode Studio"
      description="Generate standard linear barcodes with check digit validation for retail POS, packaging, and logistics. Instant SVG & PNG exports."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Form Controls */}
        <div className="space-y-5 lg:col-span-7">
          {/* Format Selector */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Select Barcode Symbology
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFormat(f.id);
                    setText(f.example);
                  }}
                  className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
                    format === f.id
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

          {/* Value Input */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              2. Data Content
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={currentFormatMeta.placeholder}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              {((format === 'EAN13' && text.length === 12) ||
                (format === 'UPC' && text.length === 11) ||
                (format === 'EAN8' && text.length === 7)) && (
                <button
                  type="button"
                  onClick={autoAppendCheckDigit}
                  className="shrink-0 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all active:scale-95 whitespace-nowrap"
                >
                  + Add Check Digit
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-600">
              Valid format example: <span className="font-mono text-slate-700">{currentFormatMeta.example}</span>
            </p>
          </div>

          {/* Optics Options */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="h-4 w-4 text-slate-500" />
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Dimension & Appearance
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bar Width</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bar Height (px)</label>
                <input
                  type="number"
                  min={30}
                  max={200}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quiet Margin</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center pt-2 sm:pt-5">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={displayValue}
                    onChange={(e) => setDisplayValue(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  Human Readable
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-600" />
                Live Barcode Preview
              </span>
              <span className="text-[11px] font-medium text-slate-600">
                {format} · {height}px
              </span>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-rose-600">
                <AlertCircle className="h-10 w-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            ) : (
              <div className="rounded-xl p-4 bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center shadow-inner overflow-x-auto max-w-full w-full">
                <svg ref={svgRef} className="max-w-full h-auto drop-shadow-xs" />
              </div>
            )}

            {/* Export Actions */}
            {!error && text && (
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  type="button"
                  onClick={downloadPNG}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={downloadSVG}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all"
                >
                  <Download className="h-4 w-4" />
                  Vector SVG
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all"
                  title="Copy encoded value"
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
