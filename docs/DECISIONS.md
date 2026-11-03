# Architecture Decisions and Open Questions

## Confirmed decisions

### Static-first deployment
Use Vite + React + TypeScript and deploy to GitHub Pages. The product should not depend on server routes.

### Local-first processing
Generation, parsing, validation and conversion should run in the browser whenever practical.

### Capability-based modules
Every format declares supported operations and runtime requirements. The interface must not imply that all formats support every operation.

### Hardware isolation
NFC, RFID, BLE, USB, serial, smart-card and IR integrations live behind adapters. Pure format logic must remain testable without hardware.

### Progressive delivery
Ship QR and common barcodes first. Add specialist formats after library and specification review.

## Decisions to make before hardware implementation

1. Which exact NFC devices and browsers are in the first supported test matrix?
2. Which UHF RFID reader model and connection method will be supported first?
3. Is a companion desktop application acceptable for features browsers cannot access?
4. Which licence should be used for the application? MIT is a practical default, subject to dependency licence review.
5. Which specialist barcode formats are genuinely needed for the first public release?

## Dependency review checklist

Before adding a library:
- Does it implement the exact format variant required?
- Is it maintained?
- Does it have tests and known vectors?
- Is the licence compatible with the project?
- Does it run in browsers and static builds?
- What is its bundle-size cost?
- Does it require WASM, workers or native bindings?
- Are there security advisories?
- Can it be lazy-loaded?
- Can the module be replaced without rewriting the UI?
