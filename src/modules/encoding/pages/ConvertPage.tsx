import { useState } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Copy, Check } from 'lucide-react';

export default function ConvertPage() {
  const [text, setText] = useState('Universal Code Studio');
  const [copied, setCopied] = useState<string | null>(null);

  const toHex = (str: string) => {
    return Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
  };

  const toBinary = (str: string) => {
    return Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(2).padStart(8, '0'))
      .join(' ');
  };

  const toBase64 = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return 'Encoding error';
    }
  };

  const hexVal = toHex(text);
  const binVal = toBinary(text);
  const b64Val = toBase64(text);

  const copyVal = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolPageTemplate
      title="Data Encoding & Radix Converter"
      description="Convert UTF-8 text between Binary, Hexadecimal, and Base64 representations without precision loss."
      status="available"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            UTF-8 Text String
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2.5 font-mono text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Hex */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Hexadecimal</span>
              <button
                type="button"
                onClick={() => copyVal(hexVal, 'hex')}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                {copied === 'hex' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2 font-mono text-xs text-gray-800 break-all border border-gray-100">
              {hexVal || '(empty)'}
            </div>
          </div>

          {/* Base64 */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Base64</span>
              <button
                type="button"
                onClick={() => copyVal(b64Val, 'b64')}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                {copied === 'b64' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2 font-mono text-xs text-gray-800 break-all border border-gray-100">
              {b64Val || '(empty)'}
            </div>
          </div>

          {/* Binary */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Binary (8-bit bytes)</span>
              <button
                type="button"
                onClick={() => copyVal(binVal, 'bin')}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                {copied === 'bin' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2 font-mono text-xs text-gray-800 break-all border border-gray-100">
              {binVal || '(empty)'}
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
