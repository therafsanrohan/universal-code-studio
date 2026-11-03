import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { QrCode, Barcode, ScanLine, ArrowLeftRight, Settings } from 'lucide-react';

const BOTTOM_NAV = [
  { to: '/generate/qr', label: 'QR', icon: QrCode },
  { to: '/generate/barcode', label: 'Barcode', icon: Barcode },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/convert', label: 'Convert', icon: ArrowLeftRight },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-dvh w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile drawer with backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            className="relative z-50 h-full w-72 shadow-2xl animate-in slide-in-from-left duration-250 bg-white"
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          menuOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-10 pb-20 lg:pb-10" id="main-content">
          <div className="mx-auto max-w-6xl flex min-h-full flex-col justify-between">
            <div>
              <Outlet />
            </div>
            <Footer />
          </div>
        </main>

        {/* Mobile Quick Action Bottom Bar */}
        <nav
          className="fixed bottom-0 inset-x-0 z-30 flex lg:hidden items-center justify-around border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-lg shadow-slate-900/5"
          aria-label="Mobile navigation"
        >
          {BOTTOM_NAV.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 active:scale-95'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
