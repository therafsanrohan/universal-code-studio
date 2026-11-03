import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Nfc } from 'lucide-react';

export default function NfcPage() {
  return (
    <ToolPageTemplate
      title="NFC / NDEF Studio"
      description="Build, parse and inspect NDEF records. Read and write NFC tags on supported devices."
      status="planned"
      requirements={[
        'NDEF building and parsing works in any browser.',
        'Physical tag reading/writing requires Web NFC (Chrome on compatible Android).',
      ]}
    >
      <EmptyState
        icon={Nfc}
        title="NFC tools are not yet implemented"
        description="This tool will support URI, text, MIME and smart poster NDEF records, plus physical tag reading and writing where the browser supports it."
      />
    </ToolPageTemplate>
  );
}

