import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Copy, Check, Code2, Globe, Cpu } from 'lucide-react';

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'sdk' | 'api' | 'embed'>('sdk');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sdkInstallCode = `npm install @universal-code-studio/sdk`;

  const sdkUsageCode = `import { UniversalCodeStudio } from '@universal-code-studio/sdk';

const ucs = new UniversalCodeStudio();

// 1. Generate QR Code SVG string
const { svg } = await ucs.qr.generate({
  text: 'https://universalcode.studio',
  errorCorrectionLevel: 'H',
  margin: 4
});

// 2. Validate Modulo-10 Check Digits
const isValid = ucs.validation.validateEan13('5901234123457');

// 3. Decode RFID SGTIN-96
const epc = ucs.rfid.decodeSgtin96('3074257BF7194E4000001A85');
console.log(epc.companyPrefix, epc.serial);`;

  const apiCurlCode = `# Generate QR Vector via Serverless REST API
curl -X POST https://api.universalcode.studio/v1/qr/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": "https://universalcode.studio",
    "format": "svg",
    "errorCorrectionLevel": "M"
  }'`;

  const embedCode = `<!-- Drop-in Web Component -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@universal-code-studio/embed/dist/index.js"></script>

<!-- Standalone QR Element -->
<ucs-qr 
  value="https://mywebsite.com" 
  size="240" 
  ec-level="M">
</ucs-qr>`;

  return (
    <ToolPageTemplate
      title="Developer Platform & API"
      description="Integrate Universal Code Studio's open-source processing engines directly into your applications, websites, and serverless workflows."
      status="available"
    >
      <div className="space-y-8 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200/80 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('sdk')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sdk'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="h-4 w-4" />
            JavaScript / TypeScript SDK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'api'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            REST API Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'embed'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cpu className="h-4 w-4" />
            Embeddable Components
          </button>
        </div>

        {/* SDK Tab */}
        {activeTab === 'sdk' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Headless TypeScript SDK</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The SDK runs completely client-side in the browser, inside Node.js, Deno, Bun, or serverless edge workers without UI dependencies or API keys.
              </p>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Installation
                </span>
                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-200 shadow-inner">
                  <code>{sdkInstallCode}</code>
                  <button
                    type="button"
                    onClick={() => copyCode(sdkInstallCode, 'install')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'install' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Example Usage
                </span>
                <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
                  <pre>{sdkUsageCode}</pre>
                  <button
                    type="button"
                    onClick={() => copyCode(sdkUsageCode, 'usage')}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'usage' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REST API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">REST API Specifications (OpenAPI 3.1)</h2>
                <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                  Versioned Contract (v1)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for server-to-server microservices (Python, Go, Rust, Ruby) when in-process JavaScript execution is not an option.
              </p>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  cURL Example
                </span>
                <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
                  <pre>{apiCurlCode}</pre>
                  <button
                    type="button"
                    onClick={() => copyCode(apiCurlCode, 'curl')}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'curl' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <div className="font-semibold text-slate-800">Endpoint Contracts:</div>
                <div className="font-mono text-[11px] text-slate-600 space-y-1">
                  <div>POST /api/v1/qr/generate — Generate QR vectors</div>
                  <div>POST /api/v1/barcode/generate — Linear barcode generation</div>
                  <div>POST /api/v1/validate/checksum — Modulo-10 validation</div>
                  <div>POST /api/v1/rfid/sgtin96/decode — SGTIN-96 bit parsing</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Embeddable Tab */}
        {activeTab === 'embed' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Drop-in Web Components</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add barcodes and QR codes directly into any HTML page without configuring build tools or bundling dependencies.
              </p>

              <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
                <pre>{embedCode}</pre>
                <button
                  type="button"
                  onClick={() => copyCode(embedCode, 'embed')}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white"
                >
                  {copiedKey === 'embed' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  );
}
