# Universal Code Studio

A free, browser-based workspace for creating, reading, decoding, validating and inspecting machine-readable codes and data formats.

The project is designed to run as a static web application. Core features should work without an account, backend, paid API or routine data upload. Hardware-dependent features must explain their browser and device requirements before asking for permission.

## Project principles

- Useful before impressive. Every screen should make the next action obvious.
- Be honest about support. Never show a feature as working when the browser, device or decoder cannot perform it.
- Keep user data on the device unless the user explicitly exports or shares it.
- Prefer small, well-maintained libraries with clear licences.
- Separate format logic from interface code.
- Build in tested increments. Do not implement every protocol in one pass.

## Documentation map

| File | Purpose |
|---|---|
| `docs/PRODUCT_SPEC.md` | Product goals, users, scope and acceptance criteria |
| `docs/FEATURE_MATRIX.md` | Formats, operations and hardware requirements |
| `docs/ARCHITECTURE.md` | Application structure and technical boundaries |
| `docs/DOMAIN_LOGIC.md` | Parsing, generation, validation and error-handling rules |
| `docs/USER_FLOWS.md` | Main journeys and interaction states |
| `docs/PRIVACY_SECURITY.md` | Privacy, permissions and security requirements |
| `docs/TEST_STRATEGY.md` | Unit, integration, browser and device testing |
| `docs/ROADMAP.md` | Phased development plan |
| `docs/DECISIONS.md` | Architecture decisions and open questions |

## Recommended first release

Start with a dependable browser-only foundation:
1. QR generation and image decoding.
2. Common 1D barcode generation and decoding.
3. Core data converters and validators.
4. Batch CSV generation and export.
5. Local history and offline-friendly behaviour.

NFC, RFID, BLE, smart-card and IR work should follow as separate capability modules. These features have meaningful browser, operating-system and hardware constraints.

## Development

The project is built as a modern Vite + React + TypeScript static application compatible with GitHub Pages.

Do not add a backend, authentication, analytics, remote database or paid API unless the product owner explicitly changes the requirement.
