# Development Roadmap

Build a small, reliable product first. Each phase should end with a deployable version.

## Phase 0: Repository and foundation
- Inspect repository and existing conventions.
- Confirm licence and project name.
- Scaffold Vite + React + TypeScript if needed.
- Configure strict TypeScript, linting, formatting and tests.
- Set GitHub Pages base path and deployment workflow.
- Build shared layout, navigation, tool page template and error states.

Exit criteria: static build deploys and deep links work.

## Phase 1: QR essentials
- QR text and URL.
- Wi-Fi, vCard, email, phone and geo payload builders.
- Live preview.
- PNG and SVG export where supported.
- Independent decode verification.
- Basic tests and documentation.

Exit criteria: QR output is valid and usable on desktop and mobile.

## Phase 2: Barcode essentials
- EAN-13, EAN-8, UPC-A, Code 128, Code 39 and ITF.
- Check-digit tools.
- Image decoding for supported formats.
- Print sizing and export.
- Explicit format support list.

Exit criteria: every listed format has fixtures and passing tests.

## Phase 3: Scanner and batch tools
- Image upload and drag/drop.
- Camera scanner.
- Multi-code results.
- CSV import and validation.
- Batch output and ZIP.
- PDF print sheets.

Exit criteria: scanner lifecycle, errors and export are tested.

## Phase 4: Data utilities
- Binary, decimal, hex and octal.
- Base32/Base58/Base64.
- UUID and ULID.
- CRC tools and Web Crypto hashes.
- ISBN/ISSN validators.
- GS1 Digital Link parser/builder.

Exit criteria: known vectors and malformed-input tests pass.

## Phase 5: NDEF and Web NFC
- NDEF data model.
- URI, text, MIME and Smart Poster records.
- Raw byte inspector.
- Web NFC capability detection.
- Physical read/write on verified compatible devices.
- Clear unsupported-device states.

Exit criteria: pure NDEF logic works independently of physical NFC.

## Phase 6: RFID and EPC
- EPC parser/encoder, starting with SGTIN-96.
- BigInt-safe bit utilities.
- EPC test vectors.
- Generic reader adapter interface.
- One hardware adapter only after a real reader is selected and tested.

Exit criteria: software decoding works without a reader; physical reader support is accurately documented.

## Phase 7: Smart-card and specialist formats
- BER-TLV parser.
- APDU builder and response parser.
- ATR parser.
- Additional 2D and postal formats after library review.
- MRZ extraction as a separate, carefully scoped module.

Exit criteria: each format has a precise support statement and fixtures.

## Phase 8: BLE and advanced hardware
- iBeacon/Eddystone payload parsers and builders.
- Browser BLE scanning where supported.
- WebUSB/WebSerial reader adapters.
- UWB and IR research only after hardware requirements are established.

Exit criteria: no simulated result is presented as a real scan.

## Phase 9: Hardening and community release
- Accessibility review.
- Dependency and licence audit.
- Performance review.
- Privacy verification.
- Documentation and contribution guide.
- GitHub issue templates and release notes.

## Priority rule

Do not start a later phase while the current phase has failing acceptance tests or unstable architecture. Keep the main branch deployable.
