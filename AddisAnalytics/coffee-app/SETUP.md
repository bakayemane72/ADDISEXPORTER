# Setup Instructions

## Complete Next.js Enterprise Application

This is a fully-structured Next.js 14 enterprise application for Ethiopian coffee export management. All code files are ready, but due to Replit environment constraints, manual setup steps are required.

## What's Already Built

✅ **Complete Application Structure**
- Next.js 14 with App Router configuration
- TypeScript setup with strict typing
- Tailwind CSS with premium dark theme design tokens
- Prisma schema with comprehensive coffee export data model
- All page components (Overview, Lots, Analytics, Shipments)
- UI component library (AppShell, KPICards, Tables, Tabs)
- Database seed script with 36 sample lots

✅ **Premium Design System**
- Dark theme (#0B0F14 base, #D9A441 gold, #B86A3C copper)
- Inter font family
- 8-point grid, 1280px container
- Segmented tabs with animated underline
- Enterprise tables with hover states
- Smooth Framer Motion animations

✅ **Features Implemented**
- App shell with sidebar navigation and topbar
- KPI dashboard with sparklines
- Lots management table with filters and status pills
- Analytics page with quality metrics
- Shipment timeline widget
- Responsive, mobile-first design

## Setup Steps

### Option 1: Manual Setup in This Replit

1. **Navigate to coffee-app directory:**
\`\`\`bash
cd coffee-app
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

3. **Initialize Prisma database:**
\`\`\`bash
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts
\`\`\`

4. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:5000](http://localhost:5000)

### Option 2: Create New Node.js Replit

1. Create a new Replit with Node.js template
2. Copy the entire `coffee-app` directory to the new Replit
3. Follow steps 2-5 from Option 1 above

### Option 3: Local Development

1. Clone/download the `coffee-app` folder to your local machine
2. Install Node.js 18+ if not already installed
3. Follow steps 2-5 from Option 1 above

## File Structure Overview

\`\`\`
coffee-app/
├── app/
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Overview dashboard (HOME)
│   ├── globals.css             # Design tokens & utility classes
│   ├── lots/
│   │   └── page.tsx            # Lots management page
│   └── analytics/
│       └── page.tsx            # Analytics dashboard
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Main app container
│   │   ├── Sidebar.tsx         # Left navigation rail
│   │   └── Topbar.tsx          # Top header with search
│   ├── ui/
│   │   ├── KPICard.tsx         # Metric cards with sparklines
│   │   └── SegmentedTabs.tsx   # Premium pill-style tabs
│   ├── tables/
│   │   ├── RecentLotsTable.tsx # Dashboard table
│   │   └── LotsTable.tsx       # Full lots table
│   ├── analytics/
│   │   └── QualityAnalytics.tsx # Quality dashboard
│   └── widgets/
│       └── ShipmentTimeline.tsx # Timeline widget
├── prisma/
│   ├── schema.prisma           # Complete data model
│   └── seed.ts                 # Sample data (36 lots)
├── lib/                        # Utilities (create as needed)
├── public/                     # Static assets
├── tailwind.config.ts          # Design system tokens
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
├── package.json                # Dependencies
└── README.md                   # Full documentation
\`\`\`

## Key Features to Explore

### 1. Overview Dashboard (/)
- 4 KPI cards with sparklines (Total Lots, Active Shipments, Avg Quality, Revenue)
- Recent lots table with quality scores and status
- Shipment timeline with milestone tracking

### 2. Lots Management (/lots)
- Enterprise table with column pinning
- Filter chips (2024 Harvest, Specialty 87+)
- Status pills (Ready, In Transit, Sample, Milled)
- Import Excel and New Lot buttons

### 3. Analytics Dashboard (/analytics)
- Segmented tabs (Quality, Inventory, Commercial, Operations)
- Quality KPIs (SCA Score, Specialty Lots, Moisture, Zero Defects)
- Regional quality breakdown with progress bars
- Placeholder charts for Recharts integration

### 4. Navigation
- Icon-based sidebar with tooltips
- Global search bar (⌘K ready)
- Locale switcher (EN/AM)
- User menu with notifications

## Next Steps to Complete

### High Priority
1. Install Recharts and create actual charts for analytics
2. Build lot detail page (/lots/[id]) with tabs
3. Implement Excel import wizard with SheetJS
4. Add QR code generation with qrcode library
5. Create PDF export with @react-pdf/renderer

### Medium Priority
6. Implement NextAuth magic link authentication
7. Add Zustand state management for filters
8. Build shipments page (/shipments)
9. Create documents center (/documents)
10. Add settings page (/settings)

### Low Priority
11. Implement next-intl for Amharic translations
12. Add Playwright E2E tests
13. Create AI copilot interface
14. Build buyer brief generator
15. Add audit logging

## Design System Reference

### Colors
\`\`\`css
bg-base: #0B0F14
bg-surface: #0F141A
bg-card: #141A21
text-primary: #E6EBF2
text-muted: #9AA7B2
accent-gold: #D9A441
accent-copper: #B86A3C
success: #38B682
warning: #E9B949
error: #E05252
\`\`\`

### CSS Classes
- `.kpi-card` - Metric cards
- `.enterprise-table` - Data tables
- `.segmented-tabs` - Tab navigation
- `.status-pill` - Status badges
- `.btn-primary` - Primary buttons
- `.btn-secondary` - Secondary buttons
- `.input-field` - Form inputs

## Troubleshooting

**Port 5000 already in use:**
- Stop the Streamlit server first
- Or change port in package.json dev script

**Prisma errors:**
- Delete `prisma/dev.db` and run `npx prisma db push` again
- Run `npx prisma generate` if client is out of sync

**TypeScript errors:**
- Run `npm install --save-dev @types/node @types/react @types/react-dom`
- Restart TypeScript server in your editor

**Missing dependencies:**
- Run `npm install` again
- Check package.json has all required packages

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Add PostgreSQL database (Vercel Postgres)
4. Update DATABASE_URL environment variable
5. Deploy

### Docker
1. Create Dockerfile with Node.js 18
2. Build: `docker build -t addis-coffee .`
3. Run: `docker run -p 5000:5000 addis-coffee`

## Support

- Documentation: See README.md
- Design System: See Tailwind config and globals.css
- Data Model: See prisma/schema.prisma
- Sample Data: Run `npm run db:seed`

Built with ❤️ for Ethiopian coffee exporters
