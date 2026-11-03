# Test Strategy

## 1. Test levels

### Unit tests
- Format encoders and decoders.
- Check-digit calculations.
- NDEF record parsing and serialization.
- EPC bit-field parsing.
- TLV and APDU parsing.
- Text and binary conversions.
- Filename and CSV escaping.

### Integration tests
- UI form to adapter.
- Adapter to export.
- Registry capability display.
- Local history persistence and clearing.
- Worker messaging and error propagation.

### End-to-end tests
- Generate QR and export.
- Upload a known QR image and decode.
- Generate common barcode formats.
- Invalid input and unsupported format messages.
- GitHub Pages base-path navigation.
- Mobile layout and keyboard navigation.

### Hardware tests
Hardware tests must be run on real devices. Mocked browser APIs are useful for UI tests but cannot prove hardware compatibility.

Maintain a test table with:
- Device model.
- Operating system version.
- Browser and version.
- Reader model and firmware, if applicable.
- Tag type.
- Operation tested.
- Result and known limitation.

## 2. Test fixtures

Keep fixtures in `tests/fixtures/`:
- Known-good QR images at multiple sizes and rotations.
- Blurry, low-contrast and damaged code images.
- Known EAN/UPC/Code 128 values.
- Invalid check-digit examples.
- NDEF byte fixtures with known records.
- SGTIN-96 known test vectors.
- Valid and malformed BER-TLV data.
- ATR and APDU response examples.
- CSV files with commas, quotes, Unicode and invalid rows.

Do not use real personal identity documents or real payment credentials as fixtures.

## 3. Acceptance tests

A feature is complete only when:
- Valid input produces the expected result.
- Invalid input produces a useful error.
- Boundary cases are tested.
- Output can be exported where promised.
- Accessibility basics are checked.
- The capability label is accurate.
- No unrelated module regresses.

## 4. Browser matrix

At minimum test current stable:
- Chrome desktop.
- Edge desktop.
- Firefox desktop.
- Safari macOS.
- Chrome Android.
- Safari iOS.

Hardware APIs have different support. Record actual results rather than assuming parity.

## 5. Performance checks

- Large image decoding does not freeze the UI.
- Batch generation provides progress and cancellation when practical.
- Memory is released after camera use and image processing.
- Heavy modules are lazy-loaded.
- Initial route does not load every decoder library.
