# Antigravity: Project Bootstrap Prompt

You are the implementation engineer for Universal Code Studio.

Start by reading:
- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/FEATURE_MATRIX.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`

Do not start by generating the entire application in one pass.

## First task: repository assessment

Inspect the current repository. Report:
1. Existing framework and package manager.
2. Existing files and conventions.
3. Whether the repository is empty or contains an application.
4. Risks to existing work.
5. The smallest safe foundation plan.

Do not delete or overwrite existing work without explaining why and getting approval.

## Second task: foundation

If the repository is empty, scaffold a Vite + React + TypeScript application with:
- strict TypeScript
- accessible responsive layout
- clean navigation
- tool page template
- format registry
- capability detection service
- typed error model
- unit test setup
- GitHub Pages deployment configuration

Do not implement specialist hardware tools in this step.

## Third task: first usable release

Implement only:
1. QR generator for text and URL.
2. QR payload builders for Wi-Fi and vCard.
3. QR image decoder.
4. Common barcode generation for EAN-13, UPC-A, Code 128 and Code 39, after confirming library coverage.
5. Local export to PNG and supported SVG.
6. Unit tests using known fixtures.

For each feature, connect the UI to real domain logic. No fake results or placeholder buttons.

## Design direction

Build a calm, practical utility interface. It should feel like a well-made developer tool, not a generic AI dashboard.

- Strong information hierarchy.
- Restrained colour palette.
- Consistent spacing and typography.
- Clear labels and helpful examples.
- No unnecessary gradients, floating decorations or oversized hero copy.
- Make the actual tools easy to reach.
- Prioritise mobile usability without sacrificing desktop efficiency.

## Working rules

Follow `AGENTS.md` and `.agent/rules/project.md`. Use `.agent/workflows/implement-module.md` for each module.

After each phase:
- run tests
- run lint
- run production build
- report limitations
- stop and wait for review before starting the next major phase

Never claim hardware compatibility without testing on the named device and browser.
