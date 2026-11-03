import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const currentYear = new Date().getFullYear();
  const repoUrl = 'https://github.com/therafsanrohan/universal-code-studio';

  return (
    <ToolPageTemplate
      title="About & Privacy"
      description="Universal Code Studio — a free, open-source, client-side engineering platform for machine-readable codes."
      status="available"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Project Identity Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Universal Code Studio
            </h2>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700 border border-slate-200">
              v0.1.0
            </span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
              Free &amp; Open Source
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            A private, client-side workspace for creating, inspecting, reading, and
            validating machine-readable codes and structured data formats.
          </p>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-slate-700">
            <div>
              <span className="text-slate-500">Created by: </span>
              <a
                href="https://www.rafsanrohan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                Rafsan Rohan
              </a>
              <span className="text-slate-500"> (Creator &amp; Project Developer)</span>
            </div>
            <div className="hidden sm:block text-slate-300">•</div>
            <div>
              <span className="text-slate-500">Developed with: </span>
              <a
                href="https://www.creatiancy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                Creatiancy
              </a>
            </div>
          </div>
        </div>

        {/* Core Principles & Privacy */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">100% Client-Side Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your codes, images, payloads, and files are processed strictly inside your
              browser using standard JavaScript, WebAssembly, and Canvas APIs. No cloud
              upload, no remote analytics, and no accounts required.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Hardware & Permissions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Camera, Web NFC, and hardware APIs are queried via non-intrusive feature
              detection. Permissions are strictly requested only after direct, explicit user interaction.
            </p>
          </section>
        </div>

        {/* Quick Directory Grid */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Platform Navigation &amp; Open Source
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 text-xs">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Workspace Tools</h4>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/generate/qr" className="text-slate-600 hover:text-slate-900 hover:underline">
                    QR Code Studio (URL, Wi-Fi, vCard)
                  </Link>
                </li>
                <li>
                  <Link to="/generate/barcode" className="text-slate-600 hover:text-slate-900 hover:underline">
                    1D Barcodes (EAN-13, UPC-A, Code 128, ITF)
                  </Link>
                </li>
                <li>
                  <Link to="/generate/2d" className="text-slate-600 hover:text-slate-900 hover:underline">
                    2D Symbologies (Data Matrix, PDF417, Aztec)
                  </Link>
                </li>
                <li>
                  <Link to="/scan" className="text-slate-600 hover:text-slate-900 hover:underline">
                    Scanner (Camera &amp; File Upload)
                  </Link>
                </li>
                <li>
                  <Link to="/decode" className="text-slate-600 hover:text-slate-900 hover:underline">
                    Payload Inspector &amp; Decoder
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Open Source Resources</h4>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href={`${repoUrl}#readme`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Documentation &amp; Specifications
                  </a>
                </li>
                <li>
                  <a
                    href={`${repoUrl}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Report an Issue
                  </a>
                </li>
                <li>
                  <a
                    href={`${repoUrl}/blob/main/CONTRIBUTING.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Contribute Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href={`${repoUrl}/blob/main/LICENSE`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="text-xs text-slate-500 pt-2">
          © {currentYear} Universal Code Studio. Open source under the MIT License.
        </div>
      </div>
    </ToolPageTemplate>
  );
}
