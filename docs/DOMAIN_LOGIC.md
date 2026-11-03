# Domain Logic and Processing Rules

## 1. General processing pipeline

Every tool should follow the same broad sequence:

1. Collect input.
2. Normalize input without silently changing its meaning.
3. Validate structural requirements.
4. Run the selected adapter.
5. Return structured output and warnings.
6. Let the user inspect, copy or export the result.

Do not combine parsing, validation and rendering into one component.

## 2. QR generation

Inputs:
- Data string or structured payload builder.
- Error correction level.
- Output size.
- Quiet-zone margin.
- Foreground and background colours.
- Optional logo, only if supported by the chosen encoder.

Rules:
- Validate empty input and maximum encoder capacity.
- Show the chosen error-correction level.
- Preserve a sufficient quiet zone.
- Warn when colour contrast is too low.
- Warn that a logo can reduce scan reliability.
- Re-test generated output with an independent decoder.
- Export vector output only when the library truly produces vector paths.

Structured builders should create standard payloads:
- URL
- Wi-Fi
- vCard
- Email
- Phone
- SMS
- Geo URI
- Calendar event

Do not invent a universal payment QR format. Payment payloads are provider- and scheme-specific.

## 3. Barcode generation and validation

- Validate the character set before encoding.
- Validate fixed or permitted lengths.
- Calculate check digits using the relevant format specification.
- Do not silently append a check digit unless the UI says it will do so.
- Show human-readable text below the symbol when appropriate.
- Keep quiet zones and minimum dimensions correct.
- Distinguish GS1-128 from ordinary Code 128.
- Parse GS1 Application Identifiers as structured fields, not as arbitrary text.

## 4. Image decoding

Input sources:
- File picker.
- Drag and drop.
- Camera stream.

Pipeline:
1. Check MIME type and file size.
2. Decode image metadata safely.
3. Apply orientation handling.
4. Resize only when needed, preserving enough resolution.
5. Run supported decoders.
6. Return every detected symbol with format and raw value.
7. Allow the user to select and copy individual results.

Handle:
- No code found.
- Multiple codes found.
- Unsupported image.
- Corrupt image.
- Decoder timeout.
- File too large.

Camera:
- Start only after user action.
- Explain permission use.
- Stop tracks when leaving the scanner or pressing Stop.
- Avoid repeatedly processing the same frame after a successful scan unless continuous mode is enabled.

## 5. NDEF data model

Represent records as structured objects:
- TNF (Type Name Format)
- Type bytes
- Identifier bytes
- Payload bytes
- Decoded interpretation, if known

Support parsing and creating:
- Well-known URI records.
- Well-known Text records.
- MIME records.
- Smart Poster records.
- External Type records.

Rules:
- Preserve raw bytes.
- Preserve record order.
- Handle UTF-8 and language-code fields correctly.
- Unknown records remain visible as raw data; do not discard them.
- Reject malformed lengths and truncated payloads.
- Do not claim a physical tag was written until the write promise resolves successfully.

Physical Web NFC flow:
1. Check API availability.
2. User selects Read or Write.
3. Explain browser/device requirement.
4. Request permission through the API.
5. Start scan or write operation.
6. Handle cancellation, timeout and errors.
7. Stop scanning when appropriate.
8. Show the exact records read or written.

## 6. RFID and EPC logic

Keep EPC parsing independent from physical reader integration.

Start with a tested SGTIN-96 implementation:
- Parse header.
- Parse filter value.
- Parse partition.
- Parse company prefix and item reference using partition table.
- Parse serial number.
- Convert between binary, hexadecimal and decimal representations without precision loss.

Use `BigInt` for 96-bit values. Never use JavaScript `Number` for the full EPC value.

For encoding:
- Validate company prefix and item reference lengths against the selected partition.
- Validate field ranges.
- Validate serial range.
- Build exactly 96 bits.
- Provide known test vectors from a reviewed specification.

Reader integration:
- Define a generic reader adapter interface.
- Keep vendor-specific command protocols in separate adapters.
- Treat reader output as untrusted input.
- Do not assume all readers expose the same memory banks or commands.
- Never attempt protected memory access or security bypass.

## 7. Smart-card data structures

TLV:
- Parse tag, length and value.
- Support short and long-form BER lengths.
- Detect truncated or impossible lengths.
- Preserve unknown tags.
- Avoid recursive parsing without depth and size limits.

APDU:
- Separate command APDU construction from response parsing.
- Validate CLA, INS, P1, P2 and data length.
- Parse SW1/SW2 separately from response data.
- Label examples as educational unless connected to a real card and reader.

ATR:
- Parse TS, T0, interface bytes and historical bytes with strict bounds checks.
- Report unsupported conventions clearly.

Do not implement card cloning, credential extraction, PIN guessing or access-control bypass.

## 8. Encoding and checksum tools

- Binary, decimal, octal and hexadecimal converters must preserve leading zeroes when the input representation requires them.
- Base64 must distinguish standard and URL-safe variants.
- UTF-8 decoding must report invalid byte sequences rather than silently replacing them without notice.
- CRC tools must name the exact polynomial, initial value, reflection and final XOR parameters.
- Hashing should use Web Crypto where supported.
- Explain that a checksum detects certain accidental changes; it does not prove authenticity.

## 9. Export rules

- PNG: raster output at user-selected dimensions.
- SVG: only for formats with a reliable vector renderer.
- PDF: include symbol, human-readable value, format name and optional metadata.
- CSV: escape fields correctly and include stable column headers.
- ZIP: use safe filenames; remove path separators and control characters.
- Never export hidden metadata or scan history unless the user asks.

## 10. Numeric and binary safety

- Use `BigInt` for values wider than 53 bits.
- Validate input length before allocating large buffers.
- Avoid unbounded loops and recursion.
- Set maximum payload and file sizes.
- Treat all imported files and decoded strings as untrusted data.
