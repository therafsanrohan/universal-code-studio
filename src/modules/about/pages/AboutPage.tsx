import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';

export default function AboutPage() {
  return (
    <ToolPageTemplate
      title="About"
      description="Universal Code Studio — free browser-based tools for machine-readable codes."
    >
      <div className="prose prose-sm prose-gray max-w-none">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-900">What is this?</h2>
          <p className="text-sm text-gray-600">
            Universal Code Studio is a free, open-source web application for creating,
            reading, decoding, validating and inspecting machine-readable codes and
            structured data formats. It runs entirely in your browser.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Privacy</h2>
          <p className="text-sm text-gray-600">
            Your data is processed in this browser for the tools you use. The application
            does not require an account and does not upload your codes or files by default.
            If a feature needs a device permission or an external connection, we will
            explain that before you continue.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Hardware features</h2>
          <p className="text-sm text-gray-600">
            Some features depend on browser APIs and hardware that may not be available
            on your device. The application detects capabilities at runtime and clearly
            labels hardware-dependent features. Camera, NFC, Bluetooth, USB and serial
            permissions are requested only after you take an explicit action.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Open source</h2>
          <p className="text-sm text-gray-600">
            This project is open source. Contributions, bug reports and feature requests
            are welcome on GitHub.
          </p>
        </section>
      </div>
    </ToolPageTemplate>
  );
}

