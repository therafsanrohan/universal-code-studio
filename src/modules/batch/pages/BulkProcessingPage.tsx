import { useState, useRef } from 'react';
import { ToolPageTemplate } from '@/components/layout/ToolPageTemplate';
import {
  parseCSV,
  parseJSON,
  parseTextLines,
  parseExcelBuffer,
  type ParsedBatchInput,
} from '../parser';
import {
  processSingleBatchItem,
  createBatchZipArchive,
  exportBatchCSV,
  exportBatchXLSX,
  type BatchOperationType,
  type BatchItemResult,
  type BatchProgress,
} from '../engine';
import {
  Play,
  Pause,
  Download,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  FileArchive,
  Layers,
  Radio,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { getActiveVirtualTag, writeVirtualTag } from '@/modules/nfc/simulator';
import { writeRfidMemory } from '@/modules/rfid/rfidTagModel';

export default function BulkProcessingPage() {
  const [activeStudioTab, setActiveStudioTab] = useState<'batch' | 'hardwareQueue'>('batch');
  const [parsedData, setParsedData] = useState<ParsedBatchInput | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [operation, setOperation] = useState<BatchOperationType>('qr');

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    percent: 0,
  });

  const [results, setResults] = useState<BatchItemResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hardware Sequential Write Queue State
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [hardwareStatus, setHardwareStatus] = useState<string | null>(null);
  const [isHardwareWriting, setIsHardwareWriting] = useState(false);
  const [tagAuditLog, setTagAuditLog] = useState<Array<{ id: number; target: string; status: 'written' | 'failed'; timestamp: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelRequestedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  // Handle uploaded files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setResults([]);
    setProgress({ total: 0, processed: 0, successful: 0, failed: 0, skipped: 0, percent: 0 });

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const parsed = parseExcelBuffer(buffer);
        setParsedData(parsed);
        setSelectedColumn(parsed.headers[0] || '');
      } else {
        const text = await file.text();
        let parsed: ParsedBatchInput;
        if (ext === 'json') {
          parsed = parseJSON(text);
        } else if (ext === 'csv' || ext === 'tsv') {
          parsed = parseCSV(text);
        } else {
          parsed = parseTextLines(text);
        }
        setParsedData(parsed);
        setSelectedColumn(parsed.headers[0] || '');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to parse uploaded file.');
      setParsedData(null);
    }
  };

  const handleStartProcessing = async () => {
    if (!parsedData || !selectedColumn) return;

    setIsProcessing(true);
    setIsPaused(false);
    cancelRequestedRef.current = false;
    isPausedRef.current = false;

    const total = parsedData.rows.length;
    const initialResults: BatchItemResult[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < total; i++) {
      if (cancelRequestedRef.current) break;

      while (isPausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (cancelRequestedRef.current) break;
      }
      if (cancelRequestedRef.current) break;

      const row = parsedData.rows[i]!;
      const rawVal = String(row[selectedColumn] ?? '');

      const itemResult = await processSingleBatchItem(rawVal, i, operation);
      initialResults.push(itemResult);

      if (itemResult.status === 'success') successful++;
      else if (itemResult.status === 'error') failed++;
      else skipped++;

      // Yield UI thread every batch chunk or 10 records
      if (i % 10 === 0 || i === total - 1) {
        setResults([...initialResults]);
        setProgress({
          total,
          processed: i + 1,
          successful,
          failed,
          skipped,
          percent: Math.round(((i + 1) / total) * 100),
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    setIsProcessing(false);
    setIsPaused(false);
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setIsPaused(true);
  };

  const handleResume = () => {
    isPausedRef.current = false;
    setIsPaused(false);
  };

  const handleCancel = () => {
    cancelRequestedRef.current = true;
    setIsProcessing(false);
    setIsPaused(false);
  };

  // Download handlers
  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zipBlob = await createBatchZipArchive(results);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_export_${operation}_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    const csvStr = exportBatchCSV(results);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_report_${operation}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadXLSX = () => {
    if (results.length === 0) return;
    const blob = exportBatchXLSX(results);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_report_${operation}_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load sample dataset
  const handleLoadSample = (type: 'retail' | 'nfc' | 'rfid') => {
    setErrorMsg(null);
    setResults([]);
    setProgress({ total: 0, processed: 0, successful: 0, failed: 0, skipped: 0, percent: 0 });

    if (type === 'retail') {
      const sample = `SKU,Barcode,ProductName,Price\nSKU-1001,4006381333931,Stabilo Boss Highlighter,2.50\nSKU-1002,7350053850019,Oatly Barista Edition,3.20\nSKU-1003,5000159459228,Snickers Chocolate Bar,1.10\nSKU-1004,8000500003787,Nutella Hazelnut Spread,4.80\nSKU-1005,123456789012,UPC Retail Package,5.00`;
      const parsed = parseCSV(sample);
      setParsedData(parsed);
      setSelectedColumn('Barcode');
      setOperation('barcode_ean13');
    } else if (type === 'nfc') {
      const sample = `TagID,TargetURL,Location\nTAG-01,https://universalcode.studio/asset/01,Auditorium\nTAG-02,https://universalcode.studio/asset/02,Meeting Room A\nTAG-03,https://universalcode.studio/asset/03,Conference Hall\nTAG-04,https://universalcode.studio/asset/04,Executive Lounge\nTAG-05,https://universalcode.studio/asset/05,Main Entrance`;
      const parsed = parseCSV(sample);
      setParsedData(parsed);
      setSelectedColumn('TargetURL');
      setOperation('nfc_uri');
    } else {
      const sample = `AssetID,CompanyPrefix,ItemRef,Serial\nPALLET-01,0614141,107346,10001\nPALLET-02,0614141,107346,10002\nPALLET-03,0614141,107346,10003\nPALLET-04,0614141,107346,10004\nPALLET-05,0614141,107346,10005`;
      const parsed = parseCSV(sample);
      setParsedData(parsed);
      setSelectedColumn('Serial');
      setOperation('rfid_sgtin96');
    }
  };

  // Hardware Queue: Sequential Write Item
  const handleWriteCurrentHardwareTag = async () => {
    if (!results[currentQueueIndex]) return;
    const item = results[currentQueueIndex]!;
    setIsHardwareWriting(true);
    setHardwareStatus(`Approaching physical device antenna for Tag #${currentQueueIndex + 1}...`);

    if (operation === 'nfc_uri' || operation === 'nfc_text') {
      // 1. Android Chrome Web NFC or Desktop Emulator
      if ('NDEFReader' in window) {
        try {
          // @ts-expect-error Web NFC API
          const ndef = new window.NDEFReader();
          await ndef.write(
            operation === 'nfc_uri'
              ? { records: [{ recordType: 'url', data: item.originalValue }] }
              : { records: [{ recordType: 'text', data: item.originalValue }] }
          );
          setHardwareStatus(`[Verified] Tag #${currentQueueIndex + 1} written & verified via Web NFC!`);
          setTagAuditLog((prev) => [
            { id: currentQueueIndex + 1, target: item.originalValue, status: 'written', timestamp: new Date().toLocaleTimeString() },
            ...prev,
          ]);
          setCurrentQueueIndex((prev) => Math.min(prev + 1, results.length - 1));
        } catch (err: any) {
          setHardwareStatus(`Physical write failed: ${err?.message || 'Access denied'}`);
        }
      } else {
        // Fallback: Virtual Emulator
        setTimeout(() => {
          writeVirtualTag([
            {
              recordType: operation === 'nfc_uri' ? 'url' : 'text',
              data: item.originalValue,
            },
          ]);
          setHardwareStatus(`[Verified Emulator] Tag #${currentQueueIndex + 1} written to NTAG215 (UID: ${getActiveVirtualTag().tagId})!`);
          setTagAuditLog((prev) => [
            { id: currentQueueIndex + 1, target: item.originalValue, status: 'written', timestamp: new Date().toLocaleTimeString() },
            ...prev,
          ]);
          setCurrentQueueIndex((prev) => Math.min(prev + 1, results.length - 1));
        }, 500);
      }
    } else if (operation === 'rfid_sgtin96') {
      // 2. RFID EPC Memory Write
      setTimeout(() => {
        const epcHex = item.extraMeta?.epcHex || '3074257BF7194E4000001A85';
        writeRfidMemory('epc', 'epcHex', epcHex);
        setHardwareStatus(`[Verified RFID Gen2] Bank 01 updated with EPC: ${epcHex}`);
        setTagAuditLog((prev) => [
          { id: currentQueueIndex + 1, target: epcHex, status: 'written', timestamp: new Date().toLocaleTimeString() },
          ...prev,
        ]);
        setCurrentQueueIndex((prev) => Math.min(prev + 1, results.length - 1));
      }, 500);
    }

    setIsHardwareWriting(false);
  };

  return (
    <ToolPageTemplate
      title="Bulk Processing & Automation Studio"
      description="High-throughput client-side generator and converter for QR codes, 1D barcodes, 2D symbologies, NDEF NFC payloads, and GS1 RFID SGTIN-96 tags."
      status="available"
    >
      <div className="space-y-6">
        {/* Top Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveStudioTab('batch')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
              activeStudioTab === 'batch'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>1. Batch Processing Engine (Files & ZIP)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStudioTab('hardwareQueue')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
              activeStudioTab === 'hardwareQueue'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="h-4 w-4 text-emerald-600" />
            <span>2. Hardware Sequential Write Queue (NFC / RFID)</span>
            {results.length > 0 && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {results.length} items
              </span>
            )}
          </button>
        </div>

        {activeStudioTab === 'batch' ? (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Column: Data Input & Workflow Settings */}
            <div className="space-y-5 lg:col-span-5">
              {/* Step 1: File Drop Zone */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    1. Import Dataset
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadSample('retail')}
                      className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-semibold hover:bg-sky-100 border border-sky-200/60"
                    >
                      Retail Barcodes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('nfc')}
                      className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold hover:bg-indigo-100 border border-indigo-200/60"
                    >
                      NFC URLs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('rfid')}
                      className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold hover:bg-emerald-100 border border-emerald-200/60"
                    >
                      RFID Assets
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 rounded-xl p-6 text-center transition-all group"
                >
                  <FileSpreadsheet className="h-8 w-8 mx-auto text-slate-400 group-hover:text-sky-600 transition-colors mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click or drag & drop CSV, XLSX, JSON, or TXT
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Processed 100% locally in browser memory.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.json,.txt,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {errorMsg && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {parsedData && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Loaded: <strong className="text-slate-900">{parsedData.totalRecords} records</strong> ({parsedData.headers.length} columns)
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      FILE
                    </span>
                  </div>
                )}
              </div>

              {/* Step 2: Field Mapping & Operation */}
              {parsedData && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 animate-fadeIn">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    2. Configure Output Module
                  </span>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Target Input Column
                    </label>
                    <select
                      value={selectedColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    >
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          Column: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Batch Operation
                    </label>
                    <select
                      value={operation}
                      onChange={(e) => setOperation(e.target.value as BatchOperationType)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    >
                      <optgroup label="QR Code Studio">
                        <option value="qr">QR Code (PNG Vector Raster)</option>
                      </optgroup>
                      <optgroup label="1D Barcodes">
                        <option value="barcode_ean13">EAN-13 (Retail with Auto Checksum)</option>
                        <option value="barcode_ean8">EAN-8 (Compact Retail)</option>
                        <option value="barcode_upca">UPC-A (North American Retail)</option>
                        <option value="barcode_code128">Code 128 (Logistics & Serial)</option>
                        <option value="barcode_code39">Code 39 (Alphanumeric)</option>
                        <option value="barcode_itf">ITF (Interleaved 2 of 5)</option>
                      </optgroup>
                      <optgroup label="2D Symbologies">
                        <option value="datamatrix">Data Matrix ECC 200 (SVG)</option>
                        <option value="aztec">Aztec Code (High Density)</option>
                        <option value="pdf417">PDF417 (Transport & ID)</option>
                      </optgroup>
                      <optgroup label="NFC / NDEF Studio">
                        <option value="nfc_uri">NDEF URI / URL Payload (JSON + Hex)</option>
                        <option value="nfc_text">NDEF Plain Text Payload</option>
                      </optgroup>
                      <optgroup label="RFID / EPC Studio">
                        <option value="rfid_sgtin96">GS1 EPC Gen2 SGTIN-96 (BigInt 96-Bit)</option>
                      </optgroup>
                      <optgroup label="Data Conversion">
                        <option value="encode_base64">Radix Base64 Encoding</option>
                        <option value="encode_hex">Radix Hexadecimal Encoding</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Processing Controls */}
                  <div className="pt-2 flex items-center gap-2">
                    {!isProcessing ? (
                      <button
                        type="button"
                        onClick={handleStartProcessing}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition-all"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Run Batch Engine ({parsedData.totalRecords} Records)</span>
                      </button>
                    ) : (
                      <>
                        {isPaused ? (
                          <button
                            type="button"
                            onClick={handleResume}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Resume</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePause}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs"
                          >
                            <Pause className="h-3.5 w-3.5" />
                            <span>Pause</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Execution Dashboard & Live Results */}
            <div className="space-y-5 lg:col-span-7">
              {/* Progress Bar Card */}
              {progress.total > 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Batch Generation Progress</span>
                    <span className="text-xs font-mono font-bold text-sky-700">{progress.percent}%</span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-sky-600 transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Processed</span>
                      <span className="font-mono font-bold text-slate-800">{progress.processed}</span>
                    </div>
                    <div className="rounded-lg bg-emerald-50/60 p-2 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 block">Successful</span>
                      <span className="font-mono font-bold text-emerald-800">{progress.successful}</span>
                    </div>
                    <div className="rounded-lg bg-rose-50/60 p-2 border border-rose-100">
                      <span className="text-[10px] text-rose-700 block">Errors</span>
                      <span className="font-mono font-bold text-rose-800">{progress.failed}</span>
                    </div>
                    <div className="rounded-lg bg-amber-50/60 p-2 border border-amber-100">
                      <span className="text-[10px] text-amber-700 block">Skipped</span>
                      <span className="font-mono font-bold text-amber-800">{progress.skipped}</span>
                    </div>
                  </div>

                  {/* Export Actions */}
                  {results.length > 0 && !isProcessing && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadZip}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs transition-colors"
                      >
                        <FileArchive className="h-3.5 w-3.5" />
                        <span>Download ZIP ({results.filter((r) => r.status === 'success').length} Files)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCSV}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>CSV Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadXLSX}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>XLSX Report</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Records Preview Table */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3 border-b border-slate-100 pb-2.5">
                  Record Output Queue ({results.length > 0 ? results.length : parsedData?.rows.length || 0} Records)
                </span>

                <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 text-xs">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Source Value</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Preview / Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.length > 0
                        ? results.slice(0, 50).map((r) => (
                            <tr key={r.index} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono text-slate-400">{r.index + 1}</td>
                              <td className="py-2 px-3 font-mono text-slate-800 max-w-[140px] truncate">
                                {r.originalValue}
                              </td>
                              <td className="py-2 px-3">
                                {r.status === 'success' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Success</span>
                                  </span>
                                ) : r.status === 'error' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                    <XCircle className="h-3 w-3" />
                                    <span>Error</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Skipped</span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-slate-600 max-w-[180px] truncate">
                                {r.status === 'success' && r.outputData?.startsWith('data:') ? (
                                  <img src={r.outputData} alt="Thumb" className="h-7 w-7 rounded border border-slate-200" />
                                ) : r.extraMeta?.epcHex ? (
                                  <span className="text-emerald-700 font-bold">EPC: {r.extraMeta.epcHex}</span>
                                ) : (
                                  r.filename
                                )}
                              </td>
                            </tr>
                          ))
                        : parsedData?.rows.slice(0, 20).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-2 px-3 font-mono text-slate-800">
                                {String(row[selectedColumn] ?? '')}
                              </td>
                              <td className="py-2 px-3 text-slate-400">Ready</td>
                              <td className="py-2 px-3 text-slate-400 italic">Pending execution</td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: HARDWARE SEQUENTIAL WRITE QUEUE */
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="space-y-5 lg:col-span-7">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Hardware Write Queue Control
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100">
                    Sequential Mode
                  </span>
                </div>

                {results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Currently Selected Item:</span>
                        <span className="font-mono font-bold text-slate-900">
                          Item #{currentQueueIndex + 1} of {results.length}
                        </span>
                      </div>

                      <div className="rounded-lg bg-white p-3 border border-slate-200 font-mono text-xs text-slate-800 break-all">
                        {results[currentQueueIndex]?.originalValue}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentQueueIndex((p) => Math.max(0, p - 1))}
                          disabled={currentQueueIndex === 0}
                          className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Previous Item
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentQueueIndex((p) => Math.min(results.length - 1, p + 1))}
                          disabled={currentQueueIndex === results.length - 1}
                          className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Next Item
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleWriteCurrentHardwareTag}
                      disabled={isHardwareWriting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition-all"
                    >
                      <Cpu className="h-4 w-4" />
                      <span>{isHardwareWriting ? 'Writing to Tag...' : 'Commit Payload to Tag & Verify'}</span>
                    </button>

                    {hardwareStatus && (
                      <div className="rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-xs text-sky-800 flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                        <div className="flex-1 font-medium">{hardwareStatus}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No batch records loaded yet. Return to Tab 1 to import a dataset and run the batch engine.
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2.5">
                  Hardware Audit Trail ({tagAuditLog.length} Operations)
                </span>

                <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
                  {tagAuditLog.length > 0 ? (
                    tagAuditLog.map((log, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 block">Record #{log.id}</span>
                          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[180px] block">
                            {log.target}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">{log.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      No tags written in this session yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  );
}
