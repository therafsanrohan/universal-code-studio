import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CreditCard } from 'lucide-react';

export default function SmartCardPage() {
  return (
    <ToolPageTemplate
      title="Smart Card Tools"
      description="Parse TLV structures, build APDU commands and inspect ATR responses."
      status="planned"
      requirements={[
        'TLV, APDU and ATR parsing works in any browser with raw data input.',
        'Physical smart card access requires an external reader and OS support.',
      ]}
    >
      <EmptyState
        icon={CreditCard}
        title="Smart card tools are not yet implemented"
        description="This tool will support BER-TLV parsing, APDU command building and ATR inspection for educational use."
      />
    </ToolPageTemplate>
  );
}

