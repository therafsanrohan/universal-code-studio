import { Settings } from 'lucide-react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { EmptyState } from '@/components/feedback/EmptyState';
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
      title="Settings"
      description="View browser capabilities and application information."
    >
      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-900">Browser Capabilities</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-2 text-left font-medium text-gray-600">API</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                <th className="hidden px-4 py-2 text-left font-medium text-gray-600 sm:table-cell">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(Object.keys(capabilities) as CapabilityKey[]).map((key) => (
                <tr key={key}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {CAPABILITY_LABELS[key]}
                  </td>
                  <td className="px-4 py-2">
                    {capabilities[key] ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-2 text-gray-500 sm:table-cell">
                    {CAPABILITY_DESCRIPTIONS[key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          API availability does not guarantee a device is connected. Hardware features
          require a compatible device and explicit permission.
        </p>
      </section>

      <EmptyState
        icon={Settings}
        title="Additional settings coming soon"
        description="User preferences, history management and theme options will be available in a future release."
      />
    </ToolPageTemplate>
  );
}

