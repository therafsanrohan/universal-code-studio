import { Link } from 'react-router-dom';
import type { ComponentType } from 'react';
import type { StatusLabel } from '@/core/types';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import {
  QrCode,
  Barcode,
  Grid3x3,
  ScanLine,
  FileSearch,
  Nfc,
  Radio,
  CreditCard,
  Package,
  ArrowLeftRight,
  ShieldCheck,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

interface ToolEntry {
  label: string;
  description: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  status: StatusLabel;
  badge?: string;
}

interface ToolGroup {
  heading: string;
  subheading: string;
  tools: ToolEntry[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    heading: 'Core Generators',
    subheading: 'Generate standard compliant machine-readable codes ready for screen and high-resolution print.',
    tools: [
      {
        label: 'QR Code Studio',
        description: 'Generate standard QR codes for URLs, Wi-Fi networks, and vCard contact cards with vector SVG and PNG downloads.',
        to: '/generate/qr',
        icon: QrCode,
        status: 'available',
        badge: 'Popular',
      },
      {
        label: '1D Barcode Studio',
        description: 'Generate retail, POS, and logistics barcodes: EAN-13, EAN-8, UPC-A, Code 128, Code 39, and ITF.',
        to: '/generate/barcode',
        icon: Barcode,
        status: 'available',
      },
      {
        label: '2D Symbologies',
        description: 'Data Matrix ECC 200, Aztec Code, and PDF417 format specifications and generators.',
        to: '/generate/2d',
        icon: Grid3x3,
        status: 'planned',
      },
    ],
  },
  {
    heading: 'Optical Reading & Inspection',
    subheading: 'Decode and extract raw structured payload fields with client-side privacy.',
    tools: [
      {
        label: 'Optical Scanner',
        description: 'Real-time live device camera stream and drag-and-drop image file scanner for QR codes and linear barcodes.',
        to: '/scan',
        icon: ScanLine,
        status: 'available',
      },
      {
        label: 'Payload Inspector',
        description: 'Break down raw barcode strings into structured Wi-Fi parameters, vCard details, URL queries, and metrics.',
        to: '/decode',
        icon: FileSearch,
        status: 'available',
      },
    ],
  },
  {
    heading: 'Data Conversion & Validation',
    subheading: 'Format transformers, radix converters, and check digit integrity checkers.',
    tools: [
      {
        label: 'Radix & Encoding Converter',
        description: 'Convert between UTF-8 text strings, Hexadecimal, 8-bit Binary bytes, and Base64 without data loss.',
        to: '/convert',
        icon: ArrowLeftRight,
        status: 'available',
      },
      {
        label: 'Checksum Validator',
        description: 'Validate standard Modulo-10 check digits for EAN-13, EAN-8, UPC-A, and Bookland ISBN-13.',
        to: '/validate',
        icon: ShieldCheck,
        status: 'available',
      },
    ],
  },
  {
    heading: 'Hardware & Radio Protocols',
    subheading: 'Wireless communication protocols, contactless cards, and industrial RFID.',
    tools: [
      {
        label: 'NFC / NDEF Studio',
        description: 'Build and inspect NDEF records (URI, Text, MIME). Web NFC tag reading and writing on supported Android devices.',
        to: '/nfc',
        icon: Nfc,
        status: 'requires-hardware',
      },
      {
        label: 'RFID / EPC Tools',
        description: 'Encode and inspect GS1 EPC Gen2 SGTIN-96 bit allocations with BigInt-safe numeric precision.',
        to: '/rfid',
        icon: Radio,
        status: 'requires-hardware',
      },
      {
        label: 'Smart Card APDU & TLV',
        description: 'Parse ISO 7816 BER-TLV structures, inspect ATR responses, and assemble APDU command packets.',
        to: '/smart-card',
        icon: CreditCard,
        status: 'planned',
      },
      {
        label: 'GS1 Digital Link',
        description: 'Parse application identifiers (AI) and construct modern URI web-syntax GS1 Digital Links.',
        to: '/gs1',
        icon: Package,
        status: 'planned',
      },
    ],
  },
];

function ToolCard({ label, description, to, icon: Icon, status, badge }: ToolEntry) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 transition-colors group-hover:bg-sky-50 group-hover:text-sky-600 group-hover:border-sky-200">
            <Icon className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/60">
                {badge}
              </span>
            )}
            <StatusBadge status={status} />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
          {label}
        </h3>
        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-sky-600 transition-colors pt-2 border-t border-slate-100">
        <span>Open Utility</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-10 pb-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 sm:p-9 text-white border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            Client-Side Utility Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Universal Code Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            A free, browser-based workspace for creating, reading, decoding, validating
            and inspecting machine-readable codes and data formats. All computations
            run entirely in your browser.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Offline & Local Processing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Standard Vector SVG & PNG Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Groups */}
      <div className="space-y-10">
        {TOOL_GROUPS.map((group) => (
          <section key={group.heading} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                {group.heading}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">{group.subheading}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <ToolCard key={tool.to} {...tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
