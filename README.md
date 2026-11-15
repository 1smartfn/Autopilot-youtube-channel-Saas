# TubePilot AI — Autopilot YouTube Channel Studio

Multi-tenant YouTube automation dashboard and pipeline studio built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite**, and an **Express** backend integrating the **Google Gemini SDK** (`@google/genai`) and **Wan 2.1 Open Video AI** workflows.

## Features

- **Autopilot Studio**: End-to-end 5-stage pipeline from trend analysis and channel cloning to script generation, Wan 2.1 prompt synthesis, thumbnail SVG rendering, and scheduled publishing.
- **Customizable Workspace**: Drag-and-drop resizable dashboard cards (`react-resizable`), adaptable bottom/second-line navigation, component ID inspector, and Eye Comfort theme presets.
- **Pipeline & Operations Views**:
  - **Overview Dashboard** with KPI strip, channel breakdowns, top videos, and activity feed
  - **Google Sheets Queue Viewer** with batch operations (re-render, reassign channel, delete)
  - **Scheduling Calendar** with drag-and-drop priority reordering
  - **Worker Cluster Telemetry** and **AWS S3 Vault** views
  - **Pioneer Billing** tier management and **Roadmap DOCX Export** (`/api/download-roadmap-docx`)
- **Graceful AI Fallback**: Uses `GEMINI_API_KEY` when configured on the server and automatically falls back to curated structured responses when running offline or without an API key.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Recharts, `react-resizable`, `motion`
- **Backend**: Node.js (`>=20`, recommended `22 LTS`), Express 4, `@google/genai`, `docx`, `dotenv`

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd tubepilot-ai
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and set any desired values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for live AI generation (falls back gracefully if omitted) |
| `PORT` | Optional | `3000` | HTTP server port |
| `NODE_ENV` | Optional | `development` | Set to `production` when serving the built `dist/` bundle |
| `APP_URL` | Optional | `http://localhost:3000` | Public base URL of the app |
| `DISABLE_HMR` | Optional | `false` | Set to `true` to disable Vite HMR watching |

### 3. Run in Development

Starts the Express API server with Vite middleware on `http://localhost:3000`:

```bash
npm run dev
```

### 4. Build & Run in Production

```bash
npm run build
NODE_ENV=production npm start
```

> On Node.js 20 LTS (without native TypeScript execution), run `NODE_ENV=production npm run start:tsx`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run full-stack Express + Vite dev server via `tsx` |
| `npm run dev:client` | Run Vite frontend dev server standalone |
| `npm run build` | Build production frontend bundle to `dist/` |
| `npm start` | Start production/full-stack server with `node server.ts` (Node 22+) |
| `npm run start:tsx` | Start server using `tsx` (Node 20+) |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `npm run typecheck` | Alias for `tsc --noEmit` |
| `npm run preview` | Preview built Vite bundle |
| `npm run clean` | Cross-platform cleanup of `dist/` |
| `npm run generate:docs` | Regenerate `public/TubePilot_Roadmap_and_Pipelines_Presentation.docx` |

## API Endpoints

- `GET /api/health` — Service health & Gemini configuration status
- `GET /api/channels` / `POST /api/channels` — List or register YouTube channels
- `POST /api/channels/analyze-target` — Reverse-engineer a target YouTube channel
- `POST /api/trends/analyze` — Generate viral trend opportunities
- `POST /api/video/prompt` (`POST /api/veo/prompt`) — Generate Wan 2.1 prompts & storyboards
- `POST /api/youtube/seo` — Generate titles, descriptions, tags, and thumbnail prompts
- `POST /api/thumbnails/generate` — Generate hermetic 16:9 SVG thumbnails
- `GET /api/sheets/rows` / `POST /api/sheets/rows` / `PATCH /api/sheets/rows/:id` — Pipeline queue CRUD & batch endpoints
- `GET /api/workers/status`, `GET /api/s3/vault`, `GET /api/billing/pioneer`, `GET /api/activity/events`
- `GET /api/download-roadmap-docx` — Download executive roadmap presentation `.docx`

## License

Licensed under the [Apache License 2.0](./LICENSE).
