# Contributing to TubePilot AI

Thank you for contributing! Follow these steps to set up locally and prepare a clean pull request.

## Local Setup

1. Ensure Node.js `>=20.0.0` (Node `22` LTS recommended; see `.nvmrc`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` if you want to configure `GEMINI_API_KEY` or a custom `PORT`.
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Before Submitting a Pull Request

Run the same checks executed by GitHub Actions CI:

```bash
npm run lint
npm run build
```

Make sure:
- No `.env` files, API keys, or secrets are committed.
- TypeScript compiles cleanly with `npm run lint`.
- Production build succeeds with `npm run build`.
