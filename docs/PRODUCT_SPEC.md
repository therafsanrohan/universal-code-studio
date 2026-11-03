# Product Specification

## 1. Product summary

Universal Code Studio is a free, public web application for working with machine-readable codes and structured data. It brings generators, scanners, decoders, validators and conversion utilities into one consistent interface.

It is not a promise that every physical technology can be operated by an ordinary browser. The application must distinguish browser-only operations from operations that need a compatible device, reader or companion application.

## 2. Product goals

- Give users one place to create and inspect common QR codes and barcodes.
- Make image-based scanning straightforward on desktop and mobile.
- Provide practical data tools for NFC NDEF, RFID/EPC, GS1, smart-card structures and common encodings.
- Keep core operations local to the browser.
- Deploy as a static site on GitHub Pages.
- Make the project maintainable by contributors who did not build the first version.

## 3. Non-goals

The first versions will not:
- Clone access cards, bypass authentication or defeat tag protections.
- Break encryption or extract protected credentials.
- Guarantee authenticity of passports, identity cards, payment cards or product labels.
- Replace specialist RFID/NFC reader software.
- Promise universal NFC writing support on iOS or desktop browsers.
- Transmit IR signals without compatible hardware.
- Provide cloud storage, user accounts or hosted dynamic QR redirects.

## 4. Target users

- General users creating QR codes for links, Wi-Fi, contact details and events.
- Designers and print teams preparing clean, exportable codes.
- Retail and e-commerce teams working with EAN, UPC, ISBN and GS1 data.
- Developers inspecting payloads, byte sequences, NDEF records and EPC values.
- Students and technicians learning how identification formats are structured.

## 5. Main product areas

### Generate
QR, supported 1D/2D barcodes, NDEF payloads, EPC values, UUIDs and batch output.

### Scan and read
Camera scanning, image upload decoding, supported NFC tag reading and compatible external reader workflows.

### Decode and convert
NDEF, EPC, GS1, TLV, APDU structures, hexadecimal, binary, Base64 and text conversions.

### Validate
Format validation, check digits, structured payload validation and clear diagnostics.

### Export
PNG, SVG where supported, PDF, CSV and ZIP. Export options must reflect the actual output format's limitations.

## 6. User experience requirements

- No account wall.
- Responsive layouts, including narrow mobile screens.
- Every tool has a short explanation, input area, result area and relevant examples.
- Show supported input types before the user selects a file or starts a scan.
- Keep primary actions visible without making the interface crowded.
- Errors must say what failed and how to fix it.
- Do not use fake progress indicators.
- Use consistent terminology: Generate, Scan, Decode, Validate, Export.
- Avoid decorative dashboards that hide the actual tools.

## 7. Quality requirements

- TypeScript strict mode.
- Keyboard-accessible controls and visible focus.
- No uncaught errors for malformed user input.
- Large files must not freeze the interface; use workers where justified.
- No secrets in the client bundle.
- No network request for local generation or decoding unless a user explicitly chooses a remote integration.
- Provide an understandable empty state and a useful unsupported-device state.

## 8. Release acceptance criteria

A release is acceptable only when:
- The production build succeeds.
- GitHub Pages base-path deployment is tested.
- Core tools pass automated tests using known-good and invalid fixtures.
- Permissions are requested only after a user action.
- User data is not sent to a server by default.
- The UI clearly labels hardware-dependent functions.
- No feature is marked complete merely because its screen exists.
