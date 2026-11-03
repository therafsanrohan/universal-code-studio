import { NavLink } from 'react-router-dom';
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
  Settings,
  Info,
  Binary,
  Terminal,
} from 'lucide-react';
import type { ComponentType } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Generate',
    items: [
      { to: '/generate/qr', label: 'QR Code', icon: QrCode },
      { to: '/generate/barcode', label: '1D Barcodes', icon: Barcode },
      { to: '/generate/2d', label: '2D Symbologies', icon: Grid3x3 },
    ],
  },
  {
    label: 'Scan & Inspect',
    items: [
      { to: '/scan', label: 'Camera / Image Scan', icon: ScanLine },
      { to: '/decode', label: 'Payload Inspector', icon: FileSearch },
    ],
  },
  {
    label: 'Data & Formats',
    items: [
      { to: '/convert', label: 'Radix & Encoding', icon: ArrowLeftRight },
      { to: '/validate', label: 'Checksum Validator', icon: ShieldCheck },
      { to: '/nfc', label: 'NFC / NDEF', icon: Nfc },
      { to: '/rfid', label: 'RFID / EPC', icon: Radio },
      { to: '/smart-card', label: 'Smart Card', icon: CreditCard },
      { to: '/gs1', label: 'GS1 Standards', icon: Package },
    ],
  },
];

const FOOTER_ITEMS: NavItem[] = [
  { to: '/developers', label: 'Developer Hub', icon: Terminal },
  { to: '/settings', label: 'Device Capabilities', icon: Settings },
  { to: '/about', label: 'About & Privacy', icon: Info },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 select-none';
  return isActive
    ? `${base} bg-sky-50 text-sky-700 font-semibold shadow-xs`
    : `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]`;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <aside
      className={`flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white ${className ?? ''}`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs group-hover:bg-slate-800 transition-colors">
            <Binary className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-slate-800 transition-colors">
              Code Studio
            </div>
            <div className="text-[10px] text-slate-600 font-medium tracking-wide">
              Universal Platform
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {group.label}
            </h3>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} onClick={onNavigate} className={navLinkClass}>
                    <item.icon className="h-4 w-4 shrink-0 opacity-75" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200/80 p-3 bg-slate-50/50">
        <ul className="space-y-0.5">
          {FOOTER_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} onClick={onNavigate} className={navLinkClass}>
                <item.icon className="h-4 w-4 shrink-0 opacity-70" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
