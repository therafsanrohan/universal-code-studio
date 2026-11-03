# Instructions for AI Coding Agents

You are working on Universal Code Studio, a public, free, static web application. Read `README.md` and the relevant files in `docs/` before changing code.

## Working style

- Write code that a developer can maintain without needing the original prompt.
- Prefer clear names and small modules over clever abstractions.
- Keep UI copy direct and natural. Avoid generic AI-sounding claims, inflated marketing language and filler.
- Do not add decorative features that do not help the task.
- Do not claim a protocol is supported until the implementation and tests prove it.
- Do not use mock data in production tool results.
- Do not hide technical limitations from users.

## Before coding

1. Inspect the repository, package scripts and existing code.
2. Identify the exact feature and its dependencies.
3. Check library maintenance, browser support, licence and bundle size.
4. Write a short implementation plan.
5. Identify tests and acceptance criteria.
6. Avoid unrelated refactors.

## During coding

- TypeScript strict mode. Avoid `any`.
- Keep format logic separate from React components.
- Use the registry and capability metadata.
- Use BigInt for wide integer formats such as 96-bit EPC values.
- Validate all external input.
- Handle errors explicitly.
- Request hardware permissions only after a user action.
- Stop camera tracks and hardware sessions when finished.
- Keep data local by default.
- Lazy-load large libraries.
- Add tests with known vectors and malformed inputs.

## Before finishing

- Run tests, lint and production build.
- Check the GitHub Pages base path.
- Summarize files changed and behaviour added.
- State what was tested and what was not.
- List remaining limitations.
- Do not say “complete” if only the UI exists or hardware was not tested.

## Prohibited shortcuts

- No backend or account system without explicit approval.
- No paid API dependency for core functions.
- No hardcoded fake scan results.
- No silent fallback that changes the meaning of data.
- No automatic tag writes.
- No card cloning, credential theft, access-control bypass or protected-memory extraction.
- No claims of universal iOS/Android NFC, RFID or BLE support.
- No replacing a working module with a placeholder to make a build pass.
