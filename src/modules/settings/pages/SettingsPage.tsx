import { Laptop, Smartphone } from 'lucide-react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { useCapabilities } from '@/hooks/useCapability';
import {
  CAPABILITY_LABELS,
  CAPABILITY_DESCRIPTIONS,
  type CapabilityKey,
} from '@/core/capabilities';

export default function SettingsPage() {
  const capabilities = useCapabilities();

  return (
    <ToolPageTemplate
      title="Environment & Hardware Diagnostics"
      description="Real-time detection of browser capabilities, Web APIs, and hardware peripherals."
      status="available"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Browser API & Hardware Support Matrix</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluated at runtime using standard W3C feature detection.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              {window.isSecureContext ? 'Secure Context (HTTPS)' : 'Insecure Context'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700">
                  <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-[10px]">API / Capability</th>
                  <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="hidden px-4 py-2.5 text-left font-bold uppercase tracking-wider text-[10px] sm:table-cell">
                    Specification & Compatibility
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(capabilities) as CapabilityKey[]).map((key) => {
                  const isAvailable = capabilities[key];
                  return (
                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {CAPABILITY_LABELS[key]}
                      </td>
                      <td className="px-4 py-3">
                        {isAvailable ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            Available
                          </span>
                        ) : key === 'webNfc' ? (
                          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-200">
                            Virtual Emulator Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                            Unavailable in Browser
                          </span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 sm:table-cell leading-relaxed">
                        {CAPABILITY_DESCRIPTIONS[key]}
                        {key === 'webNfc' && !isAvailable && (
                          <span className="block mt-0.5 text-[11px] text-sky-700 font-medium">
                            • Desktop Tag Emulator is enabled for NDEF payload testing.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Operating Systems Guidance */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Smartphone className="h-4 w-4 text-slate-700" />
              <span>Android Smartphone Requirements</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native Web NFC hardware reading and writing works out of the box in Google Chrome on Android devices with an integrated NFC controller enabled.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Laptop className="h-4 w-4 text-slate-700" />
              <span>Desktop & Apple iOS Devices</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Desktop browsers and iOS Safari currently restrict Web NFC access. Universal Code Studio automatically engages the virtual tag memory simulator so you can construct and verify NDEF byte sequences.
            </p>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
