# Privacy and Security Requirements

## 1. Default privacy model

The application should process data locally in the browser wherever possible.

- No mandatory account.
- No analytics by default.
- No remote upload of images, tag data, card data or generated payloads.
- No third-party tracking scripts.
- No hidden network calls from a generator or decoder.
- No server-side history.
- No persistence of raw scans unless the user explicitly enables history.

If an optional external service is introduced in the future, it must be clearly identified and opt-in.

## 2. Permission handling

- Request camera, NFC, Bluetooth, USB and serial permissions only after a user action.
- Explain why the permission is needed.
- Provide a visible Stop or Disconnect action.
- Stop media tracks and hardware sessions when the tool closes.
- Handle permission denial without breaking unrelated tools.
- Do not infer that an API being present means a device is connected.

## 3. Untrusted input

Treat uploaded images, CSV files, text payloads, tag bytes and reader responses as untrusted.

- Enforce file-size limits.
- Validate MIME type and actual file decoding.
- Escape user content in the UI.
- Never inject decoded strings as HTML.
- Sanitize filenames before export.
- Protect parsers against oversized lengths, malformed offsets and recursion attacks.
- Use timeouts for expensive decoding operations.

## 4. Hardware safety

- Writing to NFC or RFID tags must require a deliberate user action and a final confirmation.
- Show the exact payload before writing.
- Never write automatically on tag discovery.
- Do not implement access-control bypass, credential theft, PIN guessing or protected-memory extraction.
- Avoid destructive lock operations in the initial product.
- Keep hardware vendor protocols isolated and documented.

## 5. Web deployment

- Use HTTPS through GitHub Pages.
- Avoid storing secrets in environment variables that are bundled into the client.
- Add a restrictive Content Security Policy where practical and compatible.
- Keep dependencies updated.
- Review dependency licences and security advisories.
- Do not add arbitrary remote scripts.

## 6. Privacy copy

Suggested user-facing statement:

“Your data is processed in this browser for the tools you use. The application does not require an account and does not upload your codes or files by default. If a feature needs a device permission or an external connection, we will explain that before you continue.”

Only publish this statement after verifying the implementation matches it.
