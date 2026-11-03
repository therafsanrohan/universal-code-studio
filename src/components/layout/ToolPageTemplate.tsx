import type { ReactNode } from 'react';
import type { StatusLabel } from '@/core/types';
import { StatusBadge } from '@/components/feedback/StatusBadge';

interface ToolPageTemplateProps {
  title: string;
  description: string;
  status?: StatusLabel;
  requirements?: string[];
  children: ReactNode;
}

export function ToolPageTemplate({
  title,
  description,
  status,
  requirements,
  children,
}: ToolPageTemplateProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Status Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {status && <StatusBadge status={status} />}
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {description}
        </p>

        {requirements && requirements.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] text-slate-700">
            {requirements.map((req) => (
              <span
                key={req}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 border border-slate-200/60 font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                {req}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Tool Content */}
      <div>{children}</div>
    </div>
  );
}
