# Feature and Capability Matrix

This document is the source of truth for what each module is allowed to claim. A format may support one operation without supporting the others.

Legend:
- **Local**: can be implemented in browser software without special hardware.
- **Hardware**: requires a compatible reader, tag, radio or operating-system API.
- **Limited**: browser and device support varies; feature detection is mandatory.
- **Research**: do not expose as a working feature until a tested implementation exists.

## 1. Optical codes

| Format | Generate | Decode | Validate | Notes |
|---|---:|---:|---:|---|
| QR Code | Local | Local | Local | Include error-correction and quiet-zone controls |
| Micro QR | Research | Research | Research | Do not label standard QR output as Micro QR |
| rMQR | Research | Research | Research | Separate format implementation required |
| Data Matrix | Local/library | Local/library | Local | ECC 200 support should be stated precisely |
| Aztec | Library-dependent | Library-dependent | Partial | Test image and camera paths separately |
| PDF417 | Library-dependent | Library-dependent | Partial | Include compact PDF417 only if library supports it |
| MicroPDF417 | Research | Research | Research | Explicitly separate from PDF417 |
| MaxiCode | Research | Library-dependent | Partial | Specialist logistics format |
| Han Xin | Research | Research | Research | Do not imply broad support without fixtures |
| JAB Code | Research | Research | Research | Colour code handling requires colour-safe image processing |
| DotCode | Research | Research | Research | Specialist marking format |

## 2. Linear barcodes

| Format | Generate | Decode | Validate | Notes |
|---|---:|---:|---:|---|
| EAN-13 / EAN-8 | Local/library | Local/library | Local | Check-digit validation |
| UPC-A / UPC-E | Local/library | Local/library | Local | Include conversion rules only when valid |
| Code 128 | Local/library | Local/library | Partial | Support code-set handling |
| GS1-128 | Local/library | Local/library | Local/partial | Parse Application Identifiers separately |
| Code 39 | Local/library | Local/library | Partial | Optional modulo-43 check digit |
| Code 93 | Library-dependent | Library-dependent | Partial | Test extended mode |
| Codabar | Local/library | Library-dependent | Partial | Validate allowed start/stop characters |
| ITF / ITF-14 | Local/library | Local/library | Local | ITF-14 has fixed data/check-digit rules |
| GS1 DataBar | Library-dependent | Library-dependent | Partial | Specify supported variants |
| MSI Plessey | Library-dependent | Library-dependent | Partial | Check-digit variants differ |
| Pharmacode | Library-dependent | Library-dependent | Partial | Do not treat as a general retail barcode |

## 3. NFC and NDEF

| Capability | Operation | Level | Notes |
|---|---|---|---|
| NDEF URI record | Create / parse | Local | Pure data formatting |
| NDEF text record | Create / parse | Local | Handle language code and UTF encoding |
| NDEF MIME record | Create / parse | Local | Validate MIME type and payload |
| NDEF smart poster | Create / parse | Local | Nested records and action/title handling |
| Multi-record NDEF | Create / parse | Local | Preserve record order |
| NDEF byte inspector | Inspect | Local | Hex and decoded view |
| Physical NFC scan | Read | Limited / hardware | Web NFC support is browser/platform dependent |
| Physical NFC write | Write | Limited / hardware | Require explicit confirmation before writing |
| Tag capacity / technology | Inspect | Limited | Expose only data actually supplied by API |
| Tag locking / password operations | Not in scope | N/A | Avoid destructive or security-sensitive operations |

Web NFC is not universally available. Feature-detect `NDEFReader`; explain that support is commonly limited to compatible Chromium-based Android environments and secure contexts. Do not claim iOS Safari support.

## 4. RFID and EPC

| Capability | Operation | Level | Notes |
|---|---|---|---|
| EPC URI / binary parsing | Parse | Local | Start with EPC Gen2 SGTIN-96 |
| SGTIN-96 | Encode / decode | Local | Implement bit-level tests |
| SSCC-96 | Encode / decode | Local | Only after specification and fixtures are reviewed |
| GRAI-96 / GIAI-96 | Encode / decode | Local | Later phase |
| GDTI-96 | Encode / decode | Local | Later phase |
| TID inspection | Parse | Local | Requires raw bytes from a reader |
| RFID inventory scan | Read | Hardware | External UHF reader required |
| RFID write | Write | Hardware | Require reader support and confirmation |
| LF/HF/UHF raw tag read | Read | Hardware | Reader-specific; no universal browser API |
| UID inspection | Parse | Local | UID bytes must be supplied by reader |
| Memory bank inspection | Parse | Local | Requires reader response and access rights |

RFID is a family of radio technologies, not one universal browser API. Do not claim that a phone can read every LF, HF or UHF tag.

## 5. Smart-card structures

| Tool | Operation | Level | Notes |
|---|---|---|---|
| TLV parser | Parse | Local | Support BER-TLV length forms with bounds checks |
| APDU builder | Build | Local | Educational command construction only |
| APDU response parser | Parse | Local | Status word and data separation |
| ATR parser | Parse | Local | Validate interface-byte structure |
| ISO 7816 utilities | Inspect | Local | Raw data input only in browser-only mode |
| Physical smart-card access | Read | Hardware | External reader and OS integration required |
| Protected credential extraction | Not in scope | N/A | Never implement |

## 6. Other data and wireless formats

| Area | Scope | Level |
|---|---|---|
| GS1 Digital Link | URI builder/parser and validation | Local |
| ISBN / ISSN / ISMN | Format and check-digit validation | Local |
| UUID / ULID | Generate / parse | Local |
| Binary / decimal / hex / octal | Convert | Local |
| Base16 / 32 / 36 / 58 / 64 | Convert | Local |
| URL / HTML entity encoding | Convert | Local |
| CRC-8 / CRC-16 / CRC-32 | Calculate | Local |
| SHA-256 / SHA-512 | Hash | Local, Web Crypto |
| MRZ | OCR-assisted extraction and parser | Limited |
| BLE advertising payload | Parse / build data | Local |
| BLE device scan | Scan | Limited / hardware |
| iBeacon payload | Parse / build | Local |
| Eddystone UID / URL / TLM | Parse / build | Local |
| UWB | Data inspection only | Research / hardware |
| IR protocols | Payload inspection | Local |
| IR transmission / capture | Hardware operation | Hardware |

## 7. UI status vocabulary

Use only these labels:
- Available: tested in the current browser environment.
- Limited support: feature exists but browser/device support varies.
- Requires hardware: compatible external device is needed.
- Planned: not implemented yet.
- Unsupported here: cannot be performed in this environment.

A module must not be promoted from Planned to Available until its acceptance tests pass.
