import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Grid3x3 } from 'lucide-react';

export default function TwoDimensionalPage() {
  return (
    <ToolPageTemplate
      title="2D Code Generator"
      description="Generate Data Matrix, Aztec, PDF417 and other 2D symbologies after library review."
      status="planned"
    >
      <EmptyState
        icon={Grid3x3}
        title="2D code generator is not yet implemented"
        description="Support for additional 2D formats will be added after confirming library coverage and test fixtures."
      />
    </ToolPageTemplate>
  );
}

