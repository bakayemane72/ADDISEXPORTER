# Addis Enterprise Analytics

Addis Enterprise Analytics consolidates ingestion, interactive dashboards, shipments, and an on-platform AI analyst into a single Next.js application. The product is optimized for data files from Ethiopian coffee exporters but works with any tabular dataset that can be expressed as Excel, CSV, or JSON.

## Features

- **Unified Next.js 14 application** with Tailwind CSS and a corporate-grade theme—no more split Streamlit/Next projects.
- **Document ingestion** via `/api/upload` with Excel, CSV, and JSON support (2,000 row safeguard per upload).
- **SQLite + Prisma data model** for organizations, imports, flexible rows, and shipments.
- **Interactive analytics workspace** (`/analytics`) featuring pivotable charts, AI-generated insights, and dataset profiling.
- **Operations cockpit** (`/`) with KPIs, shipment telemetry, and an embedded AI agent that answers portfolio questions without an external API key.
- **Shipment management** (`/shipments`) for linking logistics milestones to imported data rows.

## Getting started

1. Install dependencies and generate the Prisma client:

   ```bash
   cd AddisAnalytics
   npm install
   npm run prisma:generate
   ```

2. Create the SQLite database and seed sample data:

   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to explore the dashboards, upload flows, and AI agent.

## Environment notes

- The AI assistant runs locally—no `OPENAI_API_KEY` is required. It analyses the ingested dataset using deterministic heuristics.
- Seed data lives in `prisma/seed.ts` and can be customized to match your operational reality.
- Production builds are network-independent; no fonts or APIs are fetched at build time.

## Available scripts

- `npm run dev` – start the Next.js development server.
- `npm run build` – generate an optimized production build (runs `prisma generate` automatically).
- `npm run start` – launch the production server after `npm run build`.
- `npm run lint` – lint the project with the Next.js ESLint preset.
- `npm run prisma:generate` – regenerate the Prisma client.
- `npm run prisma:seed` – populate the SQLite database with rich demo data.

## Testing the experience

After seeding, navigate to the Analytics tab to interact with AI-driven dashboards. Use the AI chat sidebar on the overview page to interrogate the dataset—for example: “Top regions by volume” or “Show me shipment status counts.”
