import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Package } from 'lucide-react';

export default function GS1Page() {
  return (
    <ToolPageTemplate
      title="GS1 Tools"
      description="Parse and build GS1 application identifiers and Digital Link URIs."
      status="planned"
    >
      <EmptyState
        icon={Package}
        title="GS1 tools are not yet implemented"
        description="This tool will parse GS1-128 application identifiers and build GS1 Digital Link URIs with validation."
      />
    </ToolPageTemplate>
  );
}

