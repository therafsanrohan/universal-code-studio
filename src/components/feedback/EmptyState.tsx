import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

/**
 * Empty state placeholder for tools that are planned or have no data yet.
 * Provides a clear message and optional action.
 */
export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-6 py-12 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-gray-300" />}
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
}

