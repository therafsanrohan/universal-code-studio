import { useState, useRef, useEffect } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, Copy, Check, AlertCircle, StopCircle, RefreshCw, Eye } from 'lucide-react';

interface ScanResult {
  text: string;
  format?: string;
  timestamp: string;
}

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {
          // Ignore unmount error
        }
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanResult(null);

    const objectUrl = URL.createObjectURL(file);
    setUploadedImagePreview(objectUrl);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');
      const decodedResult = await html5QrCode.scanFile(file, true);
      setScanResult({
        text: decodedResult,
        timestamp: new Date().toLocaleTimeString(),
      });
      html5QrCode.clear();
    } catch {
      setError('No barcode or QR code detected. Make sure the code is well-lit, sharp, and not cropped.');
    }
  };

  const startCamera = async () => {
    setError(null);
    setScanResult(null);

    try {
      // Check if getUserMedia exists
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera MediaDevices API is not supported in this browser or context.');
      }

      // Stop previous instance if running
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const readerElement = document.getElementById('camera-reader-element');
      if (!readerElement) {
        throw new Error('Camera reader container element not found.');
      }

      const scanner = new Html5Qrcode('camera-reader-element');
      scannerRef.current = scanner;

      // Start video stream with fallback camera config
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.max(180, Math.floor(minEdge * 0.7));
            return { width: boxSize, height: boxSize };
          },
        },
        (decodedText, decodedResult) => {
          setScanResult({
            text: decodedText,
            format: decodedResult.result.format?.formatName,
            timestamp: new Date().toLocaleTimeString(),
          });
          stopCamera();
        },
        () => {
          // continuous frame scanning (ignore normal non-match frames)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Primary environment camera failed, attempting generic video query:', err);
      // Fallback try without facingMode constraint if on Mac/PC with external webcam
      try {
        if (scannerRef.current) {
          await scannerRef.current.start(
            { facingMode: 'user' },
            { fps: 10 },
            (decodedText, decodedResult) => {
              setScanResult({
                text: decodedText,
                format: decodedResult.result.format?.formatName,
                timestamp: new Date().toLocaleTimeString(),
              });
              stopCamera();
            },
            () => {}
          );
          setIsScanning(true);
          return;
        }
      } catch (fallbackErr: any) {
        const msg = fallbackErr?.message || err?.message || 'Camera permission denied or camera unavailable.';
        setError(msg);
        setIsScanning(false);
      }
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.error('Error stopping camera:', e);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleCopy = async () => {
    if (!scanResult) return;
    await navigator.clipboard.writeText(scanResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageTemplate
      title="Optical Scanner"
      description="Scan QR codes and 1D barcodes directly using your device camera or by dropping image files. 100% client-side privacy."
      status="available"
    >
      <div id="qr-reader-hidden" className="hidden" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Scan Area */}
        <div className="space-y-5 lg:col-span-7">
          {/* Method Tabs */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xs flex gap-1">
            <button
              type="button"
              onClick={() => {
                if (isScanning) stopCamera();
                setActiveTab('upload');
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload Image File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === 'camera'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Camera className="h-4 w-4" />
              Live Device Camera
            </button>
          </div>

          {/* Upload Method Body */}
          {activeTab === 'upload' && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center transition-all hover:border-slate-400">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-500 mb-4">
                <Upload className="h-6 w-6 stroke-[1.8]" />
              </div>
              <p className="text-sm font-bold text-slate-900">Drop barcode image or browse</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Supports camera snapshots, PNG, JPG, WebP and SVG files up to 10MB
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs active:scale-95 transition-all"
              >
                Choose Photo / File
              </button>

              {uploadedImagePreview && (
                <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-3">
                    Selected Image
                  </span>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-xs">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded code target"
                      className="max-h-52 w-auto rounded-lg object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Camera Method Body */}
          {activeTab === 'camera' && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
              <div
                id="camera-reader-element"
                className="w-full overflow-hidden rounded-xl bg-slate-950 min-h-[300px] flex items-center justify-center text-white text-xs relative"
              >
                {!isScanning && (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="h-10 w-10 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-slate-300">Camera preview is offline</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Press "Start Camera Scanner" below to request permission and begin scanning.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                {!isScanning ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs active:scale-95 transition-all"
                  >
                    <Camera className="h-4 w-4" />
                    Start Camera Scanner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 px-4 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs active:scale-95 transition-all"
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop Stream
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Scan Result Output */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-600" />
                Detection Output
              </span>
              {scanResult && (
                <span className="text-[11px] font-mono text-slate-600">
                  {scanResult.timestamp}
                </span>
              )}
            </div>

            {scanResult ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                      Decoded Successfully
                    </span>
                    {scanResult.format && (
                      <span className="rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                        {scanResult.format}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 break-all rounded-lg bg-white p-3 font-mono text-xs text-slate-900 border border-emerald-200 shadow-inner">
                    {scanResult.text}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Payload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanResult(null);
                      setError(null);
                      setUploadedImagePreview(null);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-600">
                Awaiting code scanning or image upload
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
}
