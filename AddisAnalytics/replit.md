# Addis Coffee Platform - Dual Implementation

## Overview

This repository contains TWO complete implementations of an enterprise-grade platform for Ethiopian coffee producers and exporters:

1. **Streamlit Application** (Python-based) - Currently running, feature-rich analytics platform
2. **Next.js Application** (Node-based) - New Fortune 100-grade enterprise web app in `coffee-app/` directory

**Last Updated**: October 19, 2025

## Next.js Enterprise Application (NEW)

**Location**: `coffee-app/` directory

A complete, production-ready Next.js 14 application with:
- Premium dark theme design system (gold #D9A441, copper #B86A3C)
- Comprehensive Prisma data model (Lot, Commercial, Logistics, Compliance)
- Enterprise UI components (AppShell, KPI cards, segmented tabs, tables)
- Sample data (36 lots across 2024/2023 harvests, 5 regions)
- Pages: Overview dashboard, Lots management, Analytics
- TypeScript, Tailwind CSS, Radix UI components
- See `coffee-app/README.md` and `ENTERPRISE_APP_SUMMARY.md` for full details

## Streamlit Application (EXISTING)

Python-based analytics platform with quality dashboards, AI copilot, and traceability features.

### Platform Capabilities

**Core Features**:
- Enterprise data model with 80+ fields covering lot details, commercials, logistics, and compliance
- Multi-sheet Excel ingestion with intelligent column mapping and validation
- Advanced quality analytics with SCA cupping scores, moisture tracking, and defect analysis
- Commercial intelligence: margin analysis, cost stacks, FX impact tracking, pricing waterfalls
- Inventory management: warehouse aging, status tracking, OTIF performance
- AI copilot: season summaries, pricing recommendations, auto-generated insights
- QR code traceability with branded micro-sites
- Bilingual support (Amharic/English)
- Multi-format exports (Excel, CSV, PDF)

**Performance Targets**:
- Time to dashboard: <60 seconds
- Interaction latency: <200ms on 3G
- Data validation coverage: ≥95%

## User Preferences

Preferred communication style: Simple, everyday language.
Design aesthetic: Fortune 100 premium minimalism (Apple, Notion, Linear-inspired)

## System Architecture

### Frontend Architecture

**Framework**: Streamlit-based web application
- **Rationale**: Streamlit enables rapid development of data-centric applications with minimal frontend code, perfect for analytics dashboards
- **Multi-page architecture**: Modular page structure with separate files for dashboard, traceability, and batch management
- **Design System**: Premium minimalist aesthetic inspired by Notion, Linear, and Apple design systems
- **Responsive layout**: Wide layout configuration with expandable sidebar for navigation

**Premium Minimalist Design System** (Updated October 2025):
- **Color Palette**: Refined neutral tones with deep accents
  - Primary Accent: Indigo #6366F1 (replacing previous bright blue)
  - Secondary Accent: Violet #8B5CF6
  - Background: Off-white #FAFAFA (not stark white)
  - Card Backgrounds: Pure white #FFFFFF
  - Text Hierarchy: Slate #0F172A (primary), Gray #64748B (secondary), Light gray #94A3B8 (tertiary)
  - Borders: Very light gray #E2E8F0
  - Status Colors: Emerald #10B981 (success), Amber #F59E0B (warning), Red #EF4444 (error)

- **Typography System**: 
  - Font Family: Inter (loaded from Google Fonts), with fallback to system sans-serif
  - Weight Hierarchy: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  - Letter Spacing: Tight for headings (-0.025em h1, -0.02em h2, -0.01em h3)
  - Line Heights: Generous for readability (1.6 for body text, 1.2 for headings)

- **Design Elements**:
  - Border Radius: 12px for cards, 10px for buttons, 16px for file uploader
  - Shadows: Soft with proper blur (0 4px 6px rgba for depth)
  - Spacing: Generous padding (1.5-3rem) and consistent margins
  - Transitions: Smooth cubic-bezier easing (0.2s duration)
  - Hover States: Subtle lift effects with shadow expansion

- **Component Styling**:
  - Buttons: Indigo-violet gradient backgrounds with hover lift (-2px translate)
  - Input Fields: Focus states with indigo ring and border color change
  - Cards: White background with light borders and subtle shadows
  - Tables: Clean headers with uppercase labels and refined typography
  - Tabs: Pill-style with active state highlighting
  - Alert Boxes: Muted colors with left border accents

**Visualization Strategy**: Plotly for interactive charts
- **Choice rationale**: Plotly provides rich, interactive visualizations with export capabilities and professional aesthetics
- **Chart types**: Line charts, bar charts, scatter plots, sunburst diagrams, and custom subplots for multi-dimensional analysis

### Backend Architecture

**Processing Pipeline**: Enterprise modular architecture with service-oriented design
- **EnterpriseDataModel** (`utils/enterprise_data_model.py`): Comprehensive data schema with 80+ fields, validation rules, and field definitions for lot details, cupping scores, certifications, commercials, logistics, compliance, and traceability
- **DataProcessor** (`utils/data_processor.py`): Multi-sheet Excel ingestion, column normalization, intelligent mapping, data cleaning, and standardization
- **EnterpriseAnalytics** (`utils/enterprise_analytics.py`): Advanced analytics engine providing quality dashboards, inventory tracking, commercial intelligence, and operational metrics
- **AICopilot** (`utils/ai_copilot.py`): AI-powered features for season summaries, pricing recommendations, auto-insights, outlier detection, and buyer brief generation
- **CoffeeClassifier**: Domain-specific classification for Ethiopian coffee regions, processing methods, price tiers, and quality scoring
- **QRGenerator**: QR code generation with embedded traceability and branded micro-site support
- **ReportGenerator**: Multi-format export (PDF, Excel, CSV) with automated analytics

**Enterprise Data Model**:
- **Lot Details**: lot_id, harvest_year, region, zone, woreda, kebele, farm_name, farmer_names, altitude_m, variety, processing_method, moisture_pct, screen_size, defects_count
- **Cupping Scores**: aroma_score, acidity_score, body_score, aftertaste_score, uniformity_score, overall_score, sca_total_score, cupping_date, cupper_name, cupping_notes
- **Certifications**: organic_cert, fairtrade_cert, rainforest_cert, specialty_cert, cert_expiry_date, cert_documents
- **Commercials**: farmgate_price_etb_kg, fob_price_usd_lb, processing_cost_etb, milling_cost_etb, transport_cost_etb, sale_price_usd_lb, contracted_qty_bags, contracted_qty_kg, shipped_qty_bags, shipped_qty_kg, buyer_name, roaster_name, incoterms, payment_terms, fx_rate_etb_usd
- **Logistics**: mill_name, milling_date, warehouse_location, warehouse_entry_date, bag_type, bags_count, seal_ids, container_number, bill_of_lading, vessel_name, etd_date, eta_date, port_of_loading, port_of_discharge, shipment_status
- **Compliance**: coa_reference, ico_marks, phytosanitary_cert, invoice_number, packing_list_ref, export_permit, customs_declaration
- **Traceability**: qr_code_id, public_url, story_text, producer_message, photos_urls, transparency_level, farm_coordinates

**Design Pattern**: Service-oriented architecture with clear separation of concerns
- Each utility module handles a specific domain responsibility
- Validation at field, row, and dataset levels with comprehensive error reporting
- Derived metrics automatically calculated: margins, fulfillment rates, warehouse aging, document completeness
- Stateless processing with session state management via Streamlit
- Data flows: upload → validation → enrichment → analytics → visualization/export

### Data Processing & Classification

**Coffee Domain Logic**: Ethiopian coffee-specific business rules
- **Region classification**: Pattern matching for 10+ Ethiopian coffee regions (Sidamo, Guji, Yirgacheffe, etc.)
- **Processing method taxonomy**: Categorization into Washed, Natural, Honey, and Experimental processing
- **Quality scoring algorithm**: Combines region reputation, altitude, and processing method into normalized scores
- **Price tier stratification**: Automatic segmentation into Low/Mid/Premium tiers based on distribution

**Data enrichment pipeline**:
1. Column normalization and mapping
2. Missing value handling with intelligent defaults
3. Automatic lot ID generation using UUID
4. Derived metric calculation (quality scores, farmer estimates, cost totals)
5. Status assignment based on business rules

### AI Integration

**Conversational Analytics**: OpenAI GPT-5 integration
- **Model**: GPT-5 (latest as of August 2025) - explicitly configured and should not be changed without user request
- **Context management**: Dynamic data summary generation for each query
- **Query processing**: Natural language questions converted to data-driven insights
- **Suggested questions**: Pre-generated relevant queries based on current dataset

**Implementation approach**:
- System prompt includes data schema and Ethiopian coffee domain knowledge
- User queries enhanced with statistical context from current inventory
- Responses formatted for business users with specific numbers and actionable insights

### Traceability & QR System

**QR Code Generation**: Batch-level traceability
- **Payload structure**: JSON-encoded batch metadata including origin, processing, quality metrics
- **URL scheme**: Designed for future web-based trace lookup (currently placeholder)
- **Image generation**: PIL and qrcode library with configurable error correction
- **Base64 encoding**: In-memory image handling for web display and download

**Traceability data model**:
- Batch ID (UUID-based unique identifier)
- Origin information (region, farm/station, altitude)
- Processing details and quality metrics
- Volume and pricing information
- Farmer count estimates
- Processing timestamps and status

### Reporting & Export

**Multi-format export system**:
- **Excel**: Multi-sheet workbooks with raw data, summaries, and analytical pivots using openpyxl
- **CSV**: Simplified single-table exports for external systems
- **PDF**: Professional reports with FPDF library (planned implementation)

**Report components**:
- Executive summary with KPIs
- Regional and processing method aggregations
- Quality and pricing analytics
- Export-ready inventory lists

## External Dependencies

### Third-party Services

**OpenAI API**:
- **Purpose**: Powers AI chat assistant for natural language data querying
- **Model**: GPT-5 (August 2025 release)
- **Authentication**: API key stored in environment variables (`OPENAI_API_KEY`)
- **Usage pattern**: Synchronous request-response for each user query

### Core Python Libraries

**Data Processing**:
- `pandas`: DataFrame operations, data cleaning, aggregations
- `numpy`: Numerical computations and statistical operations

**Visualization**:
- `plotly.express` & `plotly.graph_objects`: Interactive charts and dashboards
- `streamlit`: Web framework and UI components

**File Handling & Export**:
- `openpyxl`: Excel file reading/writing (via pandas)
- `fpdf`: PDF report generation
- `qrcode`: QR code generation
- `PIL (Pillow)`: Image processing for QR codes

**Utilities**:
- `uuid`: Unique identifier generation for lots and batches
- `datetime`: Timestamp management and date formatting
- `base64`: Binary data encoding for image embedding
- `json`: Data serialization for QR payloads

### Data Storage

**Current implementation**: In-memory session state
- File uploads processed and stored in Streamlit session state
- No persistent database (stateless application)
- Data lifecycle limited to user session duration

**File format support**:
- Excel (.xlsx, .xls) for data upload
- CSV for lightweight imports/exports
- JSON for QR code data payloads

### Configuration

**Environment Variables**:
- `OPENAI_API_KEY`: Required for AI assistant functionality

**Application Settings**:
- Page configuration in `app.py` (title, icon, layout)
- Custom CSS styling embedded in main application
- Company name and branding in report generator