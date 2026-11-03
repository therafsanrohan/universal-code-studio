import type { StatusLabel } from '@/core/types';

const STATUS_CONFIG: Record<StatusLabel, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  'limited-support': {
    label: 'Limited support',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  'requires-hardware': {
    label: 'Requires hardware',
    className: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  },
  planned: {
    label: 'Planned',
    className: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  },
  unsupported: {
    label: 'Unsupported here',
    className: 'bg-red-50 text-red-700 ring-red-600/20',
  },
};

interface StatusBadgeProps {
  status: StatusLabel;
  className?: string;
}

/**
 * Renders a colour-coded badge for a feature's support status.
 * Uses the vocabulary from docs/FEATURE_MATRIX.md §7.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className} ${className ?? ''}`}
    >
      {config.label}
    </span>
  );
}

