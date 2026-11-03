# Unified Bulk Processing & Hardware Studio Specification

## Executive Summary
This document defines the extended architecture of the **Universal Code Studio Bulk Processing Engine**.
It expands the initial QR batch generator into a unified, modular, and hardware-aware studio covering:
1. **QR Codes** (already implemented & integrated)
2. **1D Linear Barcodes** (EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF, Codabar)
3. **2D Symbologies** (Data Matrix, Aztec, PDF417, MaxiCode)
4. **NFC / NDEF Studio** (URI, Text, MIME, Smart Poster records with batch payload generation & hardware write queue)
5. **RFID / EPC Studio** (GS1 SGTIN-96 BigInt bitstream generation, partition mapping, EPC validation & serial programming)
6. **Multi-Output Workflows** (e.g. 1 CSV $\rightarrow$ Barcode + QR + NDEF + EPC)

---

## 1. Architecture & Pipeline

```
+-----------------------------------------------------------------------------------+
|                            A. Unified Data Ingestion                              |
|   CSV / TSV   |   Excel XLSX   |   JSON Arrays   |   Raw TXT   |   Direct Paste   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        B. Detection, Mapping & Validation                         |
|   - Auto-detect headers, delimiters, and encoding                                 |
|   - Multi-column mapping (Payload, ID, GTIN, Serial, Prefix, etc.)                |
|   - Duplicate & missing value detection                                          |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            C. Output Module Dispatch                              |
|   +---------------+  +---------------+  +---------------+  +------------------+   |
|   |   QR Studio   |  |   1D Barcodes |  |  NFC Payload  |  |   RFID SGTIN-96  |   |
|   |  (PNG / SVG)  |  |  (EAN/128/ITF)|  |  (NDEF URI/Txt|  | (BigInt 96-bit)  |   |
|   +---------------+  +---------------+  +---------------+  +------------------+   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        D. Execution & Processing Engine                           |
|   - Chunked batch processing with zero-blocking UI yielding                       |
|   - Pause, resume, and cancel safely                                              |
|   - Detailed per-record status tracking (Success, Skipped, Error)                  |
+-----------------------------------------------------------------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
+---------------------------------------+   +---------------------------------------+
|        E. Pure File/ZIP Export        |   |    F. Hardware Device Queue & Write   |
|  - Multi-file ZIP archive             |   |  - Android Chrome Web NFC Reader      |
|  - Consolidated CSV / XLSX mapping    |   |  - Desktop Virtual NTAG215 Emulator   |
|  - Error & audit report               |   |  - UHF RFID Gen2 Reader/Writer queue  |
+---------------------------------------+   +---------------------------------------+
```

---

## 2. Module Implementations & Capabilities

### B. Barcode Bulk Processing
- **Supported Formats**: EAN-13 (with automatic Modulo-10 checksum calculation and validation), EAN-8, UPC-A, Code 128, Code 39, and ITF.
- **Output Formats**: High-resolution Vector SVG, PNG raster, and consolidated data tables.
- **Checksum Rules**: If an EAN-13 input has 12 digits, the 13th check digit is automatically generated; if 13 digits are provided, the check digit is verified.

### C. NFC Bulk Processing
- **NDEF Records**:
  - `url`: Web URLs formatted with standard NDEF URI prefixes.
  - `text`: UTF-8 localized text payloads.
  - `mime`: Application-specific MIME types (e.g. `application/json`, vCard).
- **Tag Capacity Checking**: Calculates the exact NDEF byte footprint and warns if it exceeds typical tag capacities (e.g. NTAG213: 144 bytes, NTAG215: 504 bytes, NTAG216: 888 bytes).
- **Physical Tag Writing**: Sequential tag writing queue with user confirmation per tag, verification read-back, and error audit trail.

### D. RFID / EPC Bulk Processing
- **Standards**: GS1 EPC Gen2 SGTIN-96 (Class 1 Gen 2 / ISO/IEC 18000-6C).
- **BigInt Safe**: All 96-bit integer conversions utilize JavaScript native `BigInt` to eliminate numeric overflow and IEEE 754 precision loss.
- **Partition Rules**: Full implementation of Partition 0 through 6 partition tables, allocating bit widths between Company Prefix (20–40 bits) and Item Reference (4–24 bits).
- **Sequential Tag Programming**: Queue system for programming EPC memory bank 01 with read-back verification.

---

## 3. Hardware Safety & Compliance
- **No silent/automatic writes**: Hardware writing is strictly gated by deliberate user action.
- **Never claim unverified hardware writes**: Writes are marked successful only after the hardware confirms the air-interface write transaction.
- **Security & Privacy**: Zero server transmission; all CSV/Excel parsing, image generation, and bitstream synthesis run 100% client-side in the browser.

