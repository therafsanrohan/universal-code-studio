import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Copy, Check, FileCode, ExternalLink, Wifi, User } from 'lucide-react';

export default function DecodePage() {
  const [input, setInput] = useState('WIFI:T:WPA;S:StudioNetwork;P:SuperSecret123;;');
  const [copied, setCopied] = useState(false);

  // Auto-detect structured format
  const parsePayload = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('WIFI:')) {
      const typeMatch = trimmed.match(/T:([^;]+)/);
      const ssidMatch = trimmed.match(/S:([^;]+)/);
      const passMatch = trimmed.match(/P:([^;]+)/);
      const hiddenMatch = trimmed.match(/H:([^;]+)/);
      return {
        type: 'Wi-Fi Network Configuration',
        icon: Wifi,
        fields: [
          { label: 'SSID / Network Name', value: ssidMatch?.[1] || 'Unknown' },
          { label: 'Security Encryption', value: typeMatch?.[1] || 'None' },
          { label: 'Password', value: passMatch?.[1] || '(None / Open)' },
          { label: 'Hidden Network', value: hiddenMatch?.[1] === 'true' ? 'Yes' : 'No' },
        ],
      };
    }

    if (trimmed.startsWith('BEGIN:VCARD')) {
      const fnMatch = trimmed.match(/FN:([^\r\n]+)/);
      const orgMatch = trimmed.match(/ORG:([^\r\n]+)/);
      const telMatch = trimmed.match(/TEL[^:]*:([^\r\n]+)/);
      const emailMatch = trimmed.match(/EMAIL[^:]*:([^\r\n]+)/);
      return {
        type: 'vCard Electronic Business Card',
        icon: User,
        fields: [
          { label: 'Full Name', value: fnMatch?.[1] || 'Not specified' },
          { label: 'Organization', value: orgMatch?.[1] || 'None' },
          { label: 'Phone', value: telMatch?.[1] || 'None' },
          { label: 'Email', value: emailMatch?.[1] || 'None' },
        ],
      };
    }

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const u = new URL(trimmed);
        return {
          type: 'Web URL Address',
          icon: ExternalLink,
          fields: [
            { label: 'Protocol', value: u.protocol },
            { label: 'Host Domain', value: u.hostname },
            { label: 'Path', value: u.pathname || '/' },
            { label: 'Query Parameters', value: u.search || 'None' },
          ],
        };
      } catch {
        // Fall back to raw
      }
    }

    return {
      type: 'Raw Text / String Payload',
      icon: FileCode,
      fields: [
        { label: 'Byte Length', value: `${new TextEncoder().encode(trimmed).length} bytes` },
        { label: 'Character Count', value: `${trimmed.length} characters` },
        { label: 'Lines', value: `${trimmed.split('\n').length}` },
      ],
    };
  };

  const parsed = parsePayload(input);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="Payload Inspector & Decoder"
      description="Inspect and decode structured barcode payloads, vCard contacts, Wi-Fi strings, URLs, and binary representations."
      status="available"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Input Raw Code / Payload String
            </label>
            <textarea
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw scanned payload string here..."
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-xs focus:border-gray-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInput('WIFI:T:WPA;S:UniversalStudioGuest;P:CodeStudio2026;;')}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              Load Wi-Fi Sample
            </button>
            <button
              type="button"
              onClick={() => setInput('BEGIN:VCARD\nVERSION:3.0\nN:Smith;Jane;;;\nFN:Jane Smith\nORG:Universal Code Inc\nTEL;TYPE=CELL:+123456789\nEMAIL:jane@example.com\nEND:VCARD')}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              Load vCard Sample
            </button>
            <button
              type="button"
              onClick={() => setInput('https://github.com/universal-code-studio/blueprint?format=qr&version=1.0')}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              Load URL Sample
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Structural Breakdown
            </h3>

            {parsed ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
                    <parsed.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-900">{parsed.type}</span>
                  </div>

                  <div className="space-y-2">
                    {parsed.fields.map((f) => (
                      <div key={f.label} className="text-xs">
                        <span className="text-gray-400 font-medium block text-[11px] uppercase tracking-wider">{f.label}</span>
                        <span className="font-mono text-gray-800 break-all">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-gray-900 py-2 text-xs font-medium text-white hover:bg-gray-800"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy Original Payload'}
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-gray-400">
                Enter payload to inspect format fields
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
