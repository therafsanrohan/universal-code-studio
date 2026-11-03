import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Radio } from 'lucide-react';

export default function RfidPage() {
  return (
    <ToolPageTemplate
      title="RFID / EPC Tools"
      description="Decode and encode EPC values. Inspect SGTIN-96 and other tag data formats."
      status="planned"
      requirements={[
        'EPC decoding and encoding works in any browser.',
        'Physical tag reading requires a compatible UHF RFID reader.',
      ]}
    >
      <EmptyState
        icon={Radio}
        title="RFID tools are not yet implemented"
        description="This tool will decode SGTIN-96 and other EPC formats from hex or binary input, with BigInt-safe bit operations."
      />
    </ToolPageTemplate>
  );
}

