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
} from 'lucide-react';

export default function BulkProcessingPage() {
  const [parsedData, setParsedData] = useState<ParsedBatchInput | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [operation, setOperation] = useState<BatchOperationType>('qr');
  const [batchSize, setBatchSize] = useState<number>(50);

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

      const row = parsedData.rows[i]!;
      const val = row[selectedColumn] ?? '';
      const result = await processSingleBatchItem(val, i, operation);

      if (result.status === 'success') successful++;
      else if (result.status === 'error') failed++;
      else if (result.status === 'skipped') skipped++;

      initialResults.push(result);

      if (i % 5 === 0 || i === total - 1) {
        setResults([...initialResults]);
        setProgress({
          total,
          processed: i + 1,
          successful,
          failed,
          skipped,
          percent: Math.round(((i + 1) / total) * 100),
        });
      }

      // Yield event loop
      if (i % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    setIsProcessing(false);
  };

  const handlePauseResume = () => {
    if (!isPaused) {
      isPausedRef.current = true;
      setIsPaused(true);
    } else {
      isPausedRef.current = false;
      setIsPaused(false);
    }
  };

  const handleCancel = () => {
    cancelRequestedRef.current = true;
    isPausedRef.current = false;
    setIsProcessing(false);
    setIsPaused(false);
  };

  const downloadZip = async () => {
    const blob = await createBatchZipArchive(results);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `universal_batch_${operation}_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSVReport = () => {
    const csv = exportBatchCSV(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXLSXReport = () => {
    const blob = exportBatchXLSX(results);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_report_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageTemplate
      title="Bulk Processing & Automation Studio"
      description="Convert and generate thousands of codes and payloads from CSV, Excel (XLSX), JSON, or TXT in a single batch. Zero cloud uploads — 100% client-side memory execution."
      status="available"
    >
      <div className="space-y-6">
        {/* Step 1: Input Data */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              1. Import Records & Source Data
            </span>
            {parsedData && (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                {parsedData.totalRecords.toLocaleString()} records loaded
              </span>
            )}
          </div>

          {!parsedData ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-slate-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-400 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-800">
                Select or drag a CSV, XLSX, JSON, or TXT dataset
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Automatic column, header, and delimiter detection with zero server uploads.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 shadow-xs transition-all"
              >
                Browse File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Data Column
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    {parsedData.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Batch Operation
                  </label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as BatchOperationType)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="qr">Generate QR Codes (PNG ZIP)</option>
                    <option value="datamatrix">Generate Data Matrix ECC 200 (SVG ZIP)</option>
                    <option value="barcode_code128">Generate Code 128 (SVG ZIP)</option>
                    <option value="barcode_ean13">Validate & Generate EAN-13 (SVG ZIP)</option>
                    <option value="encode_base64">Encode to Base64 (Text Reports)</option>
                    <option value="encode_hex">Convert to Hexadecimal (Text Reports)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Yield Size
                  </label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value={20}>20 records / cycle</option>
                    <option value={50}>50 records / cycle (Default)</option>
                    <option value={100}>100 records / cycle (High Throughput)</option>
                  </select>
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Preview (First 5 Rows)
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {parsedData.headers.map((h) => (
                          <th
                            key={h}
                            className={`px-3 py-2 text-left font-semibold ${
                              h === selectedColumn ? 'text-sky-700 bg-sky-50/70' : 'text-slate-600'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {parsedData.headers.map((h) => (
                            <td
                              key={h}
                              className={`px-3 py-2 font-mono truncate max-w-xs ${
                                h === selectedColumn ? 'bg-sky-50/30 font-bold text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              {row[h] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setParsedData(null)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear &amp; Load New File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Processing Controls & Real-Time Dashboard */}
        {parsedData && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                2. Processing Controls &amp; Status
              </span>
              <div className="flex gap-2">
                {!isProcessing ? (
                  <button
                    type="button"
                    onClick={handleStartProcessing}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 shadow-xs transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Start Batch Conversion
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handlePauseResume}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Progress: {progress.percent}%</span>
                <span>
                  {progress.processed} of {progress.total} Records
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
                <div
                  className="h-full bg-sky-600 transition-all duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-3">
                <span className="text-[11px] font-medium text-emerald-700 block">Successful</span>
                <span className="text-lg font-bold text-emerald-900">{progress.successful}</span>
              </div>
              <div className="rounded-xl bg-rose-50 border border-rose-200/60 p-3">
                <span className="text-[11px] font-medium text-rose-700 block">Failed</span>
                <span className="text-lg font-bold text-rose-900">{progress.failed}</span>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200/60 p-3">
                <span className="text-[11px] font-medium text-slate-600 block">Skipped / Empty</span>
                <span className="text-lg font-bold text-slate-800">{progress.skipped}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Export & Result Inspection */}
        {results.length > 0 && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                3. Download Artifacts &amp; Reports
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {(operation === 'qr' || operation === 'datamatrix' || operation === 'barcode_code128' || operation === 'barcode_ean13') && (
                <button
                  type="button"
                  onClick={downloadZip}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 shadow-xs transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Complete ZIP Archive ({progress.successful} Files)
                </button>
              )}

              <button
                type="button"
                onClick={downloadCSVReport}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                Export CSV Report
              </button>

              <button
                type="button"
                onClick={downloadXLSXReport}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                Export Excel XLSX Report
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  );
}
