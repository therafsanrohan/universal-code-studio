# Contributing to Universal Code Studio

Thank you for your interest in contributing to Universal Code Studio.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/therafsanrohan/universal-code-studio.git
   cd universal-code-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Engineering Standards

- **TypeScript Strict Mode**: Avoid using `any`. Write explicit interfaces and types.
- **Pure Domain Logic**: Keep encoding, decoding, check-digit calculation, and bit-level parsers separated from React UI components.
- **Client-Side Privacy**: Do not add remote telemetry, analytics, accounts, or mandatory network dependencies for core functions.
- **Hardware Isolation**: Browser APIs (Camera, Web NFC, Bluetooth, USB, Serial) must feature-detect before use and only prompt for permissions after explicit user interaction.
- **Testing**: Maintain high test coverage using Vitest. Add unit tests with known vectors and boundary inputs before submitting pull requests.

## Submitting Pull Requests

1. Create a feature branch (`git checkout -b feature/my-feature`).
2. Run test suites and lint checks (`npm test && npm run lint`).
3. Ensure the production build passes (`npm run build`).
4. Commit your changes with clear, semantic commit messages.
5. Push to the branch and open a Pull Request.
