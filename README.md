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

## Production deployment

Whether you share the analytics workspace with a stakeholder or host it for a team, deploy the compiled Next.js app instead of the development server.

### Manual Node.js host

1. Build the production bundle (this automatically runs `prisma generate`):

   ```bash
   cd AddisAnalytics
   npm install
   npm run build
   ```

2. Apply the Prisma schema and, optionally, seed demo data. The SQLite database is created automatically at `prisma/dev.db`; store this file on persistent storage so data survives restarts.

   ```bash
   npx prisma db push
   # Optional: populate with demo content
   npm run prisma:seed
   ```

3. Launch the production server on your target host (defaults to port `3000`, override with the `PORT` env var as needed):

   ```bash
   npm run start
   ```

### Docker container

Build and run the self-contained image to distribute the app without installing Node.js on the host.

1. Build the container image:

   ```bash
   docker build -t addis-analytics-prod ./AddisAnalytics
   ```

2. Start the container, mounting a volume to persist the SQLite database. Set `SEED_DB=true` the first time you run it if you want the sample data.

   ```bash
   docker run -d \
     -p 3000:3000 \
     -v addis-data:/app/prisma \
     -e SEED_DB=true \
     --name addis-analytics \
     addis-analytics-prod
   ```

   Subsequent restarts can omit `SEED_DB=true`. The entrypoint automatically applies Prisma migrations on boot.

3. Visit `http://localhost:3000` (or the mapped host/port) to access the production UI.

### Share a temporary public link

Follow these steps to generate a link you can send to stakeholders:

1. (Optional) Run `npm run build` if you want to precompile the production bundle yourself. Otherwise, the sharing script will perform this step the first time you invoke it.

2. From the `AddisAnalytics` directory, start the sharing workflow. The script ensures a production build exists, synchronizes the SQLite schema with `npx prisma db push`, then launches the production server and opens a tunnel via [`npx localtunnel`](https://github.com/localtunnel/localtunnel), so no global installs are required. The sync runs with `--accept-data-loss` by default to avoid interactive prompts; set `SHARE_ACCEPT_DATA_LOSS=false` beforehand if you prefer to review Prisma warnings manually.

   ```bash
   npm run share
   ```

3. Wait for the terminal to print a URL similar to `https://radiant-espresso.loca.lt`. This is the public link you can share. Leave the command running to keep the tunnel and server alive.

4. When you are finished sharing access, press `Ctrl+C` to shut down both the tunnel and the Next.js server.

   - Optional: set `SHARE_SUBDOMAIN=my-demo` before running the script if you want a predictable subdomain (subject to availability).
   - Optional: set `SHARE_TUNNEL_HOST=https://<your-localtunnel-host>` to use a self-hosted LocalTunnel relay instead of the default `loca.lt` service.

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
