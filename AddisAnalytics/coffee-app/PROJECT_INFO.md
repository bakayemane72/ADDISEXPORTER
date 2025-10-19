# ADDIS Coffee Export Analytics Platform

## Project Information
**Created**: October 19, 2025
**GitHub Repository**: https://github.com/bakayemane72/ADDISEXPORTER
**Developer**: bakayemane72

## Application Overview
Enterprise-grade web application for Ethiopian coffee exporters built with Next.js 14, TypeScript, Prisma, and SQLite.

## Key Features
✅ **Dynamic File Upload** - Accepts Excel (.xlsx, .xls), CSV, TXT, JSON files with ANY column structure
✅ **AI Chat Assistant** - Powered by OpenAI GPT-4o for natural language data queries
✅ **Data Visualization** - Interactive charts and analytics using Recharts
✅ **Shipment Management** - Track and manage coffee exports
✅ **Data Browser** - View all imported data in sortable tables
✅ **Premium UI** - Fortune 100-grade dark theme with gold (#D9A441) and copper (#B86A3C) accents
✅ **Bilingual Support** - English and Amharic

## Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **UI Library**: Tailwind CSS + Radix UI components
- **Charts**: Recharts
- **AI**: OpenAI API (GPT-4o)
- **Deployment**: Replit (runs on port 5000)

## Application Structure
```
coffee-app/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard/Overview
│   ├── lots/              # Data Browser
│   ├── analytics/         # Charts & Visualizations
│   ├── shipments/         # Shipment Management
│   ├── documents/         # Document Tracking
│   ├── settings/          # Organization Settings
│   └── api/               # API routes
│       ├── upload/        # File upload endpoint
│       ├── data/          # Data retrieval endpoint
│       └── chat/          # AI chat endpoint
├── components/            # Reusable React components
│   ├── layout/           # AppShell, navigation
│   ├── ui/               # KPICard, buttons, forms
│   ├── chat/             # AI chat interface
│   └── visualizations/   # Data charts
├── prisma/               # Database schema
│   └── schema.prisma     # Data models
└── lib/                  # Utilities and helpers
```

## Database Schema
- **Org**: Organization settings (name, locale, currency)
- **DataImport**: File metadata (fileName, fileType, rowCount, columns as JSON)
- **DataRow**: Individual rows (data stored as JSON for flexibility)
- **Shipment**: Export shipment tracking

## Environment Variables Required
- `OPENAI_API_KEY` - For AI chat assistant
- `GITHUB_TOKEN` - For GitHub integration
- `SESSION_SECRET` - For session management

## File Upload Specifications
- **Supported Formats**: Excel (.xlsx, .xls), CSV, TXT, JSON
- **Maximum Rows**: 1000 per upload
- **Column Structure**: Completely flexible - accepts any column names
- **Processing**: Sequential batch processing (50 rows at a time) to prevent database timeouts

## AI Chat Features
- Natural language queries about imported data
- Analyzes first 100 rows for context
- Provides insights on quality, pricing, trends
- Suggests recommended actions

## Color Palette
- **Primary Accent**: Gold #D9A441
- **Secondary Accent**: Copper #B86A3C
- **Background**: Dark #1A1A1A
- **Card Background**: #252525
- **Text Primary**: #FFFFFF
- **Text Muted**: #9CA3AF
- **Success**: Emerald #10B981
- **Error**: Red #EF4444

## How to Run Locally
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Generate Prisma client: `npx prisma generate`
4. Push database schema: `npx prisma db push`
5. Run development server: `npm run dev`
6. Access at: http://localhost:5000

## Deployment
Currently deployed on Replit with automatic deployment on code changes.

## Future Enhancements
- Real-time collaboration features
- Advanced analytics with ML predictions
- Mobile app (React Native)
- Multi-user roles and permissions
- Integration with logistics APIs
- Automated reporting via email

## Support & Documentation
For questions or support, contact: bakayemane72@github.com
