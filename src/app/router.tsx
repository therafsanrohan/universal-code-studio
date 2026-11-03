import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';

/* Lazy-loaded page modules */
const HomePage = lazy(() => import('@/modules/home/HomePage'));
const QRGeneratorPage = lazy(() => import('@/modules/qr/pages/QRGeneratorPage'));
const BarcodeGeneratorPage = lazy(() => import('@/modules/barcode/pages/BarcodeGeneratorPage'));
const TwoDimensionalPage = lazy(() => import('@/modules/two-dimensional/pages/TwoDimensionalPage'));
const ScanPage = lazy(() => import('@/modules/scan/pages/ScanPage'));
const DecodePage = lazy(() => import('@/modules/decode/pages/DecodePage'));
const NfcPage = lazy(() => import('@/modules/nfc/pages/NfcPage'));
const RfidPage = lazy(() => import('@/modules/rfid/pages/RfidPage'));
const SmartCardPage = lazy(() => import('@/modules/smart-card/pages/SmartCardPage'));
const GS1Page = lazy(() => import('@/modules/gs1/pages/GS1Page'));
const BulkProcessingPage = lazy(() => import('@/modules/batch/pages/BulkProcessingPage'));
const ConvertPage = lazy(() => import('@/modules/encoding/pages/ConvertPage'));
const ValidatePage = lazy(() => import('@/modules/encoding/pages/ValidatePage'));
const SettingsPage = lazy(() => import('@/modules/settings/pages/SettingsPage'));
const DevelopersPage = lazy(() => import('@/modules/developers/pages/DevelopersPage'));
const AboutPage = lazy(() => import('@/modules/about/pages/AboutPage'));
const NotFoundPage = lazy(() => import('@/modules/not-found/NotFoundPage'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  );
}

function SuspenseOutlet({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<SuspenseOutlet><HomePage /></SuspenseOutlet>} />

          {/* Create */}
          <Route path="generate/qr" element={<SuspenseOutlet><QRGeneratorPage /></SuspenseOutlet>} />
          <Route path="generate/barcode" element={<SuspenseOutlet><BarcodeGeneratorPage /></SuspenseOutlet>} />
          <Route path="generate/2d" element={<SuspenseOutlet><TwoDimensionalPage /></SuspenseOutlet>} />

          {/* Read */}
          <Route path="scan" element={<SuspenseOutlet><ScanPage /></SuspenseOutlet>} />
          <Route path="decode" element={<SuspenseOutlet><DecodePage /></SuspenseOutlet>} />

          {/* Data */}
          <Route path="nfc" element={<SuspenseOutlet><NfcPage /></SuspenseOutlet>} />
          <Route path="rfid" element={<SuspenseOutlet><RfidPage /></SuspenseOutlet>} />
          <Route path="smart-card" element={<SuspenseOutlet><SmartCardPage /></SuspenseOutlet>} />
          <Route path="gs1" element={<SuspenseOutlet><GS1Page /></SuspenseOutlet>} />

          {/* Tools */}
          <Route path="batch" element={<SuspenseOutlet><BulkProcessingPage /></SuspenseOutlet>} />
          <Route path="convert" element={<SuspenseOutlet><ConvertPage /></SuspenseOutlet>} />
          <Route path="validate" element={<SuspenseOutlet><ValidatePage /></SuspenseOutlet>} />

          {/* App */}
          <Route path="settings" element={<SuspenseOutlet><SettingsPage /></SuspenseOutlet>} />
          <Route path="developers" element={<SuspenseOutlet><DevelopersPage /></SuspenseOutlet>} />
          <Route path="about" element={<SuspenseOutlet><AboutPage /></SuspenseOutlet>} />

          {/* Fallback */}
          <Route path="*" element={<SuspenseOutlet><NotFoundPage /></SuspenseOutlet>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

