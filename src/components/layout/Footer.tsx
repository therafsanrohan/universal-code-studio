import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const appVersion = 'v0.1.0';
  const repoUrl = 'https://github.com/therafsanrohan/universal-code-studio';

  return (
    <footer
      className={`mt-16 border-t border-slate-200/80 pt-10 pb-12 text-slate-600 ${className ?? ''}`}
      role="contentinfo"
      aria-label="Site Footer"
    >
      <div className="space-y-8">
        {/* Main Grid: Identity & Links */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Col 1: Project Identity & Summary (6 cols) */}
          <div className="space-y-3 md:col-span-6 lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Universal Code Studio
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200/80">
                {appVersion}
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/60">
                Free &amp; Open Source
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              A private, client-side workspace for creating, inspecting, reading, and
              validating machine-readable codes and data formats.
            </p>

            {/* Development Credits */}
            <div className="pt-2 text-xs text-slate-600 space-y-1">
              <div>
                <span className="text-slate-500">Created by </span>
                <a
                  href="https://www.rafsanrohan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Rafsan Rohan
                </a>
                <span className="text-slate-500"> (Creator &amp; Project Developer)</span>
              </div>
              <div>
                <span className="text-slate-500">Developed with </span>
                <a
                  href="https://www.creatiancy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Creatiancy
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation & Tools (3 cols) */}
          <div className="space-y-2.5 md:col-span-3 lg:col-span-3 md:pl-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Navigation
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  to="/generate/qr"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  QR Code Studio
                </Link>
              </li>
              <li>
                <Link
                  to="/generate/barcode"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  1D Barcodes
                </Link>
              </li>
              <li>
                <Link
                  to="/generate/2d"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  2D Symbologies
                </Link>
              </li>
              <li>
                <Link
                  to="/scan"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Scanner
                </Link>
              </li>
              <li>
                <Link
                  to="/decode"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Payload Inspector
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Source (3 cols) */}
          <div className="space-y-2.5 md:col-span-3 lg:col-span-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Open Source
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href={`${repoUrl}#readme`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href={`${repoUrl}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a
                  href={`${repoUrl}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Contribute
                </a>
              </li>
              <li>
                <a
                  href={`${repoUrl}/blob/main/LICENSE`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & License */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500">
          <p>© {currentYear} Universal Code Studio. Open source under the MIT License.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link
              to="/about"
              className="text-slate-500 hover:text-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
            >
              About &amp; Privacy
            </Link>
            <Link
              to="/settings"
              className="text-slate-500 hover:text-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
            >
              Device Capabilities
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
