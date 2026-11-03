# Workflow: Implement a Code Module

Use this workflow for one format or a closely related group of formats.

## 1. Define the scope
- Name the format and variant precisely.
- List operations: generate, decode, validate, inspect, read or write.
- Mark whether it is browser-only, limited, hardware-dependent or research.
- List input and output types.
- Identify relevant specification and known test vectors.

## 2. Review dependencies
- Search the repository for an existing implementation.
- Check library licence, maintenance, browser support and exact format coverage.
- Prefer a small adapter around a library over spreading library calls through the UI.
- Do not install a large dependency for a feature that can be implemented safely with a small pure function.

## 3. Implement domain logic
- Create typed input/output models.
- Implement normalization and validation.
- Implement the adapter.
- Preserve raw bytes where applicable.
- Return structured errors and warnings.
- Add tests before connecting the UI.

## 4. Register capability
- Add the module to the format registry.
- Declare only operations that work.
- Add runtime requirements.
- Keep planned operations disabled.

## 5. Build the interface
- Explain what the tool does.
- Show accepted input and examples.
- Include loading, success, empty, invalid and unsupported states.
- Add copy and export actions where relevant.
- Keep permission prompts behind explicit user actions.

## 6. Verify
- Run unit and integration tests.
- Test malformed and boundary inputs.
- Test mobile and desktop layouts.
- Test the production build.
- For hardware, record real device/browser/reader test details.

## 7. Report
Provide:
- What was implemented.
- Files changed.
- Supported operations and variants.
- Tests run and results.
- Known limitations.
- Any follow-up work.

Do not move on to the next module if the current one has unresolved correctness or safety issues.
