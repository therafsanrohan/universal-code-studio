import { Menu, X, QrCode } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  menuOpen?: boolean;
}

export function Header({ onMenuToggle, menuOpen }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 lg:hidden sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-600 active:scale-95 transition-all"
          aria-label={menuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            Universal Code Studio
          </span>
        </NavLink>
      </div>
    </header>
  );
}
