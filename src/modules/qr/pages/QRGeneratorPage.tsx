import { useState, useEffect } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { generateQRCode, type QRCodeErrorCorrectionLevel } from '../adapter';
import {
  buildWifiString,
  buildVCardString,
  type WifiPayload,
  type VCardPayload,
} from '../payloads';
import {
  Copy,
  Download,
  Check,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  Wifi,
  Contact,
  Sliders,
  Eye,
} from 'lucide-react';

type PayloadMode = 'url' | 'text' | 'wifi' | 'vcard';

export default function QRGeneratorPage() {
  const [mode, setMode] = useState<PayloadMode>('url');
  const [rawText, setRawText] = useState('https://universalcode.studio');
  const [ecLevel, setEcLevel] = useState<QRCodeErrorCorrectionLevel>('M');
  const [margin, setMargin] = useState(4);
  const [size] = useState(320);
  const [darkColor, setDarkColor] = useState('#0f172a');
  const [lightColor, setLightColor] = useState('#ffffff');

  // Wi-Fi form state
  const [wifi, setWifi] = useState<WifiPayload>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });

  // vCard form state
  const [vcard, setVcard] = useState<VCardPayload>({
    firstName: '',
    lastName: '',
    organization: '',
    phone: '',
    email: '',
    url: '',
  });

  const [qrResult, setQrResult] = useState<{ dataUrl: string; svg: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive payload string
  let payloadString = rawText;
  if (mode === 'wifi') {
    payloadString = wifi.ssid ? buildWifiString(wifi) : '';
  } else if (mode === 'vcard') {
    payloadString = (vcard.firstName || vcard.lastName) ? buildVCardString(vcard) : '';
  }

  useEffect(() => {
    if (!payloadString.trim()) {
      setQrResult(null);
      setError(null);
      return;
    }

    let active = true;
    generateQRCode({
      text: payloadString,
      errorCorrectionLevel: ecLevel,
      margin,
      width: size,
      color: { dark: darkColor, light: lightColor },
    })
      .then((res) => {
        if (active) {
          setQrResult(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to generate QR code');
          setQrResult(null);
        }
      });

    return () => {
      active = false;
    };
  }, [payloadString, ecLevel, margin, size, darkColor, lightColor]);

  const handleCopy = async () => {
    if (!payloadString) return;
    await navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    if (!qrResult) return;
    const a = document.createElement('a');
    a.href = qrResult.dataUrl;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  };

  const downloadSVG = () => {
    if (!qrResult) return;
    const blob = new Blob([qrResult.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MODES: { id: PayloadMode; label: string; icon: any }[] = [
    { id: 'url', label: 'Web URL', icon: LinkIcon },
    { id: 'text', label: 'Plain Text', icon: FileText },
    { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
    { id: 'vcard', label: 'Contact Card', icon: Contact },
  ];

  return (
    <ToolPageTemplate
      title="QR Code Studio"
      description="Create standard ISO/IEC 18004 QR codes for links, text notes, Wi-Fi access, and vCard electronic business cards. Instant rendering with vector and raster export."
      status="available"
    >
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Form Controls */}
        <div className="space-y-5 lg:col-span-7">
          {/* Payload Type Selector */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Choose Payload Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`flex items-center justify-center gap-2 rounded-lg p-2.5 text-xs font-semibold transition-all active:scale-95 ${
                    mode === m.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              2. Payload Details
            </label>

            {mode === 'url' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Website URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="https://example.com"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>
            )}

            {mode === 'text' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Text Content</label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Enter raw text message, code or data string..."
                  className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                />
              </div>
            )}

            {mode === 'wifi' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Wi-Fi Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifi.ssid}
                    onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                    placeholder="Office_Guest_5G"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Wi-Fi Password</label>
                  <input
                    type="text"
                    value={wifi.password}
                    onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                    placeholder="SecretPass123"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Security Encryption</label>
                    <select
                      value={wifi.encryption}
                      onChange={(e) => setWifi({ ...wifi, encryption: e.target.value as any })}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-2 sm:pt-6">
                    <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wifi.hidden}
                        onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      Hidden SSID Broadcast
                    </label>
                  </div>
                </div>
              </div>
            )}

            {mode === 'vcard' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={vcard.firstName}
                      onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                      placeholder="Jane"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={vcard.lastName}
                      onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                      placeholder="Doe"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={vcard.phone}
                      onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                      placeholder="+1 (555) 000-1234"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={vcard.email}
                      onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Organization / Title</label>
                  <input
                    type="text"
                    value={vcard.organization}
                    onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                    placeholder="Senior Engineer, Universal Code Inc"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sizing & Error Correction Options */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="h-4 w-4 text-slate-500" />
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. QR Customisation & Optics
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Error Correction</label>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as QRCodeErrorCorrectionLevel)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="L">L - 7% loss</option>
                  <option value="M">M - 15% loss</option>
                  <option value="Q">Q - 25% loss</option>
                  <option value="H">H - 30% loss</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quiet Zone</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dark Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="h-7 w-7 rounded-md border border-slate-300 cursor-pointer p-0"
                  />
                  <span className="text-[11px] font-mono text-slate-600">{darkColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Light Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="h-7 w-7 rounded-md border border-slate-300 cursor-pointer p-0"
                  />
                  <span className="text-[11px] font-mono text-slate-600">{lightColor}</span>
                </div>
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
                Live QR Preview
              </span>
              <span className="text-[11px] font-medium text-slate-600">
                Level {ecLevel} · Quiet: {margin}
              </span>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-rose-600">
                <AlertCircle className="h-10 w-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            ) : qrResult ? (
              <div className="rounded-xl p-4 bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center shadow-inner">
                <img
                  src={qrResult.dataUrl}
                  alt="Generated QR code preview"
                  className="max-h-64 sm:max-h-72 w-auto object-contain rounded-lg drop-shadow-xs"
                />
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-600">
                Enter payload details above to generate QR code preview
              </div>
            )}

            {/* Quick Export Action Bar */}
            {qrResult && (
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
                  title="Copy encoded payload to clipboard"
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
