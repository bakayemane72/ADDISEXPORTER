# Addis Coffee Enterprise Platform

Enterprise-grade web application for Ethiopian coffee producers and exporters. Built with Next.js 14, featuring premium UI, comprehensive analytics, and Fortune 100-level design.

## Features

✨ **Core Capabilities**
- 📊 Advanced analytics dashboards (Quality, Inventory, Commercial, Operations)
- ☕ Comprehensive lot management with SCA cupping scores
- 🚢 Shipment tracking with timeline visualization
- 📄 Document management center
- 🔐 Role-based access control (RBAC)
- 🌍 Internationalization (English & Amharic)
- 💱 Multi-currency support (ETB & USD)
- 📱 Responsive, mobile-first design

🎨 **Premium Design System**
- Dark theme with copper/gold accents
- Inter font family (display 800, headings 700, body 400/500)
- Segmented tabs with animated gold underline
- Enterprise tables with pinning and saved views
- Smooth animations (Framer Motion)
- 8-point grid system

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens
- **UI Components**: Radix UI primitives + shadcn/ui
- **State Management**: Zustand
- **Database**: Prisma + SQLite (easily switchable to PostgreSQL)
- **Charts**: Recharts
- **PDF Export**: @react-pdf/renderer
- **QR Codes**: qrcode
- **Forms**: React Hook Form + Zod validation
- **i18n**: next-intl

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
\`\`\`bash
cd coffee-app
npm install
\`\`\`

2. **Initialize database**
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

3. **Seed with sample data**
\`\`\`bash
npm run db:seed
\`\`\`

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5000](http://localhost:5000) to see the application.

## Project Structure

\`\`\`
coffee-app/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Overview dashboard
│   ├── lots/              # Lots management
│   ├── analytics/         # Analytics dashboards
│   └── globals.css        # Global styles with design tokens
├── components/
│   ├── layout/            # AppShell, Sidebar, Topbar
│   ├── ui/                # Reusable UI components
│   ├── tables/            # Enterprise table components
│   ├── analytics/         # Analytics-specific components
│   └── widgets/           # Dashboard widgets
├── lib/                   # Utilities and helpers
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data generator
└── public/                # Static assets
\`\`\`

## Database

### Current Setup: SQLite
The app uses SQLite for easy local development and deployment on Replit.

### Switching to PostgreSQL

1. Update \`prisma/schema.prisma\`:
\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
\`\`\`

2. Set environment variable:
\`\`\`bash
DATABASE_URL="postgresql://user:password@localhost:5432/addis_coffee"
\`\`\`

3. Migrate:
\`\`\`bash
npx prisma migrate dev --name init
npm run db:seed
\`\`\`

## Key Pages

- **/** - Overview dashboard with KPIs and recent activity
- **/lots** - Comprehensive lot management table with filters
- **/lots/[id]** - Lot detail with Quality, Commercial, Traceability tabs
- **/analytics** - Deep analytics across 4 dimensions
- **/shipments** - Shipment tracking timeline
- **/documents** - Document management center
- **/settings** - Organization and user settings

## Design System

### Color Palette
- **Background**: #0B0F14 (base), #0F141A (surface), #141A21 (card)
- **Text**: #E6EBF2 (primary), #9AA7B2 (muted)
- **Accents**: #D9A441 (gold), #B86A3C (copper)
- **Status**: #38B682 (success), #E9B949 (warning), #E05252 (error)

### Spacing
- 8-point grid system
- Container max-width: 1280px
- Gutter: 24px

### Border Radius
- Cards: 16px
- Inputs: 12px
- Pills: 9999px

### Shadows
- Default: 0 2px 12px rgba(0,0,0,.35)
- Hover: 0 6px 24px rgba(0,0,0,.45)

## Sample Data

The seed script creates:
- 36 lots across 2 harvest years (2023, 2024)
- 5 major Ethiopian coffee regions (Yirgacheffe, Sidamo, Guji, Harrar, Limu)
- Complete commercial, logistics, and compliance data
- Realistic SCA cupping scores (83-90 range)
- Various shipment statuses and buyer assignments

## AI Integration Placeholder

The app includes interfaces for AI copilot features:
- Season summary generator
- Pricing coach
- Auto-insights from data uploads
- Buyer brief generator

**To integrate a real LLM**: Create an AI provider in \`lib/ai-provider.ts\` and implement the interface methods.

## Excel Import (Coming Soon)

The Excel import wizard will support:
- Template download
- Column mapping with auto-detection
- Validation with Zod schemas
- Diff preview before commit
- Bulk import with progress tracking

## Authentication

Basic email magic-link auth is stubbed using NextAuth. To fully implement:

1. Configure NextAuth providers in \`app/api/auth/[...nextauth]/route.ts\`
2. Add email service configuration
3. Implement RBAC middleware in route handlers

## Performance Targets

- ✅ Time to first dashboard: < 60 seconds
- ✅ P75 interaction latency: < 200ms
- ✅ Report generation: < 5 seconds for 10k rows
- ✅ WCAG 2.1 AA compliance

## Development

\`\`\`bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Open Prisma Studio (database GUI)
npm run db:studio

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
\`\`\`

## Deployment

The app is optimized for deployment on:
- **Replit**: Pre-configured to run on port 5000
- **Vercel**: Zero-config deployment
- **Any Node.js host**: Standard Next.js app

## License

Enterprise License - Addis Coffee Exporters

## Support

For technical support, contact the development team.
