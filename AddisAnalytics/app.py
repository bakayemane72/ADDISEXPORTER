import streamlit as st
import pandas as pd
from utils.data_processor import DataProcessor
from utils.coffee_classifier import CoffeeClassifier
from utils.qr_generator import QRGenerator
from utils.ai_assistant import AIAssistant
from utils.report_generator import ReportGenerator
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import os

# Configure page
st.set_page_config(
    page_title="Addis Exporter Analytics",
    page_icon="☕",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Premium Minimalist CSS - Notion/Linear/Apple Inspired
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Global font override */
    * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    }
    
    /* Main container styling */
    .main {
        background-color: #FAFAFA;
        padding: 2rem 3rem;
    }
    
    /* Premium header styling with refined typography */
    h1 {
        color: #0F172A;
        font-weight: 700;
        font-size: 2.25rem !important;
        margin-bottom: 0.5rem !important;
        letter-spacing: -0.025em;
        line-height: 1.2;
    }
    
    h2 {
        color: #1E293B;
        font-weight: 600;
        font-size: 1.5rem !important;
        margin-top: 2rem !important;
        margin-bottom: 1rem !important;
        letter-spacing: -0.02em;
    }
    
    h3 {
        color: #475569;
        font-weight: 600;
        font-size: 1.125rem !important;
        letter-spacing: -0.01em;
    }
    
    p {
        color: #64748B;
        line-height: 1.6;
    }
    
    /* Refined metric cards */
    [data-testid="stMetricValue"] {
        font-size: 2.25rem;
        font-weight: 700;
        color: #6366F1;
        letter-spacing: -0.02em;
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 0.8125rem;
        color: #64748B;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Ultra-premium button styling with advanced animations */
    .stButton>button {
        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        font-size: 0.9375rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.15);
        letter-spacing: -0.01em;
        position: relative;
        overflow: hidden;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 20px -3px rgba(99, 102, 241, 0.3), 0 6px 8px -2px rgba(99, 102, 241, 0.2);
        background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
    }
    
    .stButton>button:active {
        transform: translateY(0) scale(0.98);
        box-shadow: 0 2px 4px -1px rgba(99, 102, 241, 0.15);
    }
    
    /* Elegant sidebar */
    [data-testid="stSidebar"] {
        background-color: #FFFFFF;
        border-right: 1px solid #E2E8F0;
        padding: 1.5rem 1rem;
    }
    
    [data-testid="stSidebar"] h1 {
        color: #6366F1;
        font-size: 1.375rem !important;
        font-weight: 700;
        padding: 0.5rem 0 1rem 0;
        letter-spacing: -0.02em;
    }
    
    /* Refined input fields */
    .stSelectbox, .stTextInput, .stMultiSelect {
        border-radius: 10px;
    }
    
    .stSelectbox > div > div, .stTextInput > div > div {
        border-radius: 10px !important;
        border-color: #E2E8F0 !important;
        transition: all 0.2s ease;
    }
    
    .stSelectbox > div > div:hover, .stTextInput > div > div:hover {
        border-color: #CBD5E1 !important;
    }
    
    .stSelectbox > div > div:focus-within, .stTextInput > div > div:focus-within {
        border-color: #6366F1 !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    /* Premium cards and containers */
    div[data-testid="stExpander"] {
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        background-color: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
    }
    
    div[data-testid="stExpander"]:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    }
    
    /* Elegant file uploader */
    [data-testid="stFileUploader"] {
        border: 2px dashed #E2E8F0 !important;
        border-radius: 16px !important;
        padding: 3rem !important;
        background: linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%) !important;
        transition: all 0.2s ease;
    }
    
    [data-testid="stFileUploader"]:hover {
        border-color: #CBD5E1 !important;
        background: #FFFFFF !important;
    }
    
    [data-testid="stFileUploaderDropzone"] {
        border: 2px dashed #E2E8F0 !important;
        border-radius: 16px !important;
        background: linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%) !important;
    }
    
    [data-testid="stFileUploaderDropzone"]:hover {
        border-color: #CBD5E1 !important;
    }
    
    [data-testid="stFileUploaderDropzoneInstructions"] {
        color: #64748B !important;
    }
    
    /* Refined alert boxes */
    .stSuccess {
        background-color: #ECFDF5;
        color: #065F46;
        border-left: 4px solid #10B981;
        border-radius: 10px;
        padding: 1rem 1.25rem;
    }
    
    .stError {
        background-color: #FEF2F2;
        color: #991B1B;
        border-left: 4px solid #EF4444;
        border-radius: 10px;
        padding: 1rem 1.25rem;
    }
    
    .stWarning {
        background-color: #FFFBEB;
        color: #92400E;
        border-left: 4px solid #F59E0B;
        border-radius: 10px;
        padding: 1rem 1.25rem;
    }
    
    .stInfo {
        background-color: #EEF2FF;
        color: #3730A3;
        border-left: 4px solid #6366F1;
        border-radius: 10px;
        padding: 1rem 1.25rem;
    }
    
    /* Clean dataframe styling */
    .dataframe {
        border: 1px solid #E2E8F0 !important;
        border-radius: 12px;
        font-size: 0.875rem;
        overflow: hidden;
    }
    
    .dataframe th {
        background-color: #F8FAFC !important;
        color: #475569 !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        font-size: 0.6875rem;
        letter-spacing: 0.05em;
        padding: 0.875rem 1rem !important;
    }
    
    .dataframe td {
        padding: 0.75rem 1rem !important;
        border-color: #F1F5F9 !important;
    }
    
    /* Premium glass-morphism metric cards */
    [data-testid="stMetric"] {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border-radius: 12px;
        border: 1px solid rgba(226, 232, 240, 0.8);
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    [data-testid="stMetric"]:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 20px -4px rgba(99, 102, 241, 0.15), 0 4px 6px -2px rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.3);
        background: rgba(238, 242, 255, 0.8);
    }
    
    /* Elegant download button */
    .stDownloadButton>button {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 0.75rem 1.75rem;
        font-weight: 600;
        font-size: 0.9375rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
        letter-spacing: -0.01em;
    }
    
    .stDownloadButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.25);
    }
    
    /* Minimalist divider */
    hr {
        border: none;
        border-top: 1px solid #E2E8F0;
        margin: 2.5rem 0;
    }
    
    /* Refined radio buttons */
    [data-testid="stRadio"] > div {
        background-color: #FFFFFF;
        padding: 0.75rem;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
        gap: 0.5rem;
    }
    
    [data-testid="stRadio"] label {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    [data-testid="stRadio"] label:hover {
        background-color: #F8FAFC;
    }
    
    /* Clean tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
        background-color: #F8FAFC;
        padding: 6px;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
    }
    
    .stTabs [data-baseweb="tab"] {
        background-color: transparent;
        border-radius: 8px;
        color: #64748B;
        font-weight: 600;
        padding: 0.625rem 1.25rem;
        transition: all 0.2s ease;
        font-size: 0.875rem;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        color: #475569;
        background-color: #F1F5F9;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: #FFFFFF;
        color: #6366F1;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    
    /* Checkbox styling */
    [data-testid="stCheckbox"] {
        padding: 0.5rem 0;
    }
    
    /* Slider styling */
    .stSlider {
        padding: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'data' not in st.session_state:
    st.session_state.data = None
if 'processed_data' not in st.session_state:
    st.session_state.processed_data = None
if 'language' not in st.session_state:
    st.session_state.language = 'en'

# Language translations
TRANSLATIONS = {
    'en': {
        'title': 'Addis Exporter Analytics',
        'subtitle': 'Ethiopian Coffee Inventory & Traceability Platform',
        'upload_data': 'Upload Excel Data',
        'dashboard': 'Analytics Dashboard',
        'traceability': 'Lot Traceability',
        'ai_chat': 'AI Assistant',
        'batch_mgmt': 'Batch Management',
        'language': 'Language',
        'upload_file': 'Upload your coffee inventory Excel file',
        'file_uploaded': 'File uploaded successfully! Processing data...',
        'no_data': 'Please upload an Excel file to begin analysis.',
        'total_lots': 'Total Lots',
        'total_cost': 'Total Purchase Cost',
        'avg_price': 'Average Price/kg',
        'export_ready': 'Export Ready Volume'
    },
    'am': {
        'title': 'አዲስ ኤክስፖርተር አናሊቲክስ',
        'subtitle': 'የኢትዮጵያ ቡና ኢንቬንቶሪ እና ትሬሳብሊቲ መድረክ',
        'upload_data': 'ኤክሴል ዳታ ይጫኑ',
        'dashboard': 'አናሊቲክስ ዳሽቦርድ',
        'traceability': 'ሎት ትሬሳብሊቲ',
        'ai_chat': 'AI ረዳት',
        'batch_mgmt': 'ባች ማኔጅመንት',
        'language': 'ቋንቋ',
        'upload_file': 'የቡና ኢንቬንቶሪ ኤክሴል ፋይል ይጫኑ',
        'file_uploaded': 'ፋይል በተሳካ ሁኔታ ተጭኗል! ዳታን እያደረድን ነው...',
        'no_data': 'ትንተና ለማድረግ እባክዎ ኤክሴል ፋይል ይጫኑ።',
        'total_lots': 'አጠቃላይ ሎቶች',
        'total_cost': 'አጠቃላይ የግዢ ወጪ',
        'avg_price': 'አማካይ ዋጋ/ኪ.ግ',
        'export_ready': 'ለኤክስፖርት የተዘጋጀ መጠን'
    }
}

def t(key):
    """Get translation for current language"""
    return TRANSLATIONS[st.session_state.language].get(key, key)

# Sidebar navigation
st.sidebar.title(t('title'))

# Language selector
language_options = {'English': 'en', 'አማርኛ': 'am'}
selected_lang = st.sidebar.selectbox(
    t('language'),
    options=list(language_options.keys()),
    index=0 if st.session_state.language == 'en' else 1
)
st.session_state.language = language_options[selected_lang]

# Navigation - Enterprise Features
pages = {
    '📁 ' + t('upload_data'): 'upload',
    '📊 Analytics Dashboard': 'dashboard',
    '☕ Quality Intelligence': 'quality',
    '📦 Inventory & Operations': 'inventory',
    '💰 Commercial Analytics': 'commercial',
    '🤖 AI Copilot': 'ai_copilot',
    '🔍 ' + t('traceability'): 'traceability',
    '📋 ' + t('batch_mgmt'): 'batch_management'
}

selected_page = st.sidebar.radio("Navigation Menu", list(pages.keys()), label_visibility="collapsed")
current_page = pages[selected_page]

# Show data quality indicator in sidebar
if st.session_state.processed_data is not None:
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 📈 Data Status")
    
    data_count = len(st.session_state.processed_data)
    st.sidebar.metric("Total Lots", f"{data_count:,}")
    
    if 'sca_total_score' in st.session_state.processed_data.columns:
        avg_quality = st.session_state.processed_data['sca_total_score'].mean()
        st.sidebar.metric("Avg Quality", f"{avg_quality:.1f}")
    
    if 'doc_completeness_score' in st.session_state.processed_data.columns:
        doc_score = st.session_state.processed_data['doc_completeness_score'].mean()
        st.sidebar.metric("Doc Complete", f"{doc_score:.0f}%")

# Premium header with branding
col1, col2 = st.columns([3, 1])
with col1:
    st.markdown(f'<h1 style="margin-bottom: 0;">{t("title")}</h1>', unsafe_allow_html=True)
    st.markdown(f'<p style="color: #64748B; font-size: 1.0625rem; margin-top: 0.375rem; font-weight: 500;">{t("subtitle")}</p>', unsafe_allow_html=True)
with col2:
    if st.session_state.processed_data is not None:
        st.markdown(f'<div style="text-align: right; padding-top: 1rem;"><span style="background-color: #EEF2FF; color: #6366F1; padding: 0.625rem 1.25rem; border-radius: 24px; font-weight: 600; font-size: 0.8125rem; letter-spacing: -0.01em;">📊 {len(st.session_state.processed_data)} Lots Active</span></div>', unsafe_allow_html=True)

st.markdown("---")

# Page routing
if current_page == 'upload':
    st.markdown(f'<h2>📁 {t("upload_data")}</h2>', unsafe_allow_html=True)
    
    st.markdown("""
    <div style="background: linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 100%); padding: 1.5rem 1.75rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #E2E8F0;">
        <p style="color: #64748B; margin: 0; font-size: 0.9375rem; line-height: 1.6;">
            Upload your coffee inventory Excel file to begin analyzing your data. The system will automatically process and classify your coffee lots.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader(
        t('upload_file'),
        type=['xlsx', 'xls'],
        help="Upload Excel file containing coffee lot data with columns: Lot ID, Region, Farm/Station, Altitude, Processing Method, Volume, Price, etc."
    )
    
    if uploaded_file is not None:
        try:
            with st.spinner(t('file_uploaded')):
                # Process the uploaded file - Extract ALL sheets and columns
                processor = DataProcessor()
                
                # Use the robust processing method that extracts ALL data
                processed_data = processor.process_excel_file(uploaded_file)
                
                # Store raw data (first pass)
                st.session_state.data = processed_data.copy()
                
                # Classify and enrich data with coffee-specific insights
                classifier = CoffeeClassifier()
                classified_data = classifier.classify_lots(processed_data)
                
                # Store fully processed data
                st.session_state.processed_data = classified_data
                
                st.success("✅ Data processed successfully! All sheets and columns extracted.")
                
                # Show extraction summary
                st.markdown("### 📋 Data Extraction Summary")
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Rows Extracted", len(classified_data))
                with col2:
                    st.metric("Total Columns", len(classified_data.columns))
                with col3:
                    sheets = classified_data['source_sheet'].nunique() if 'source_sheet' in classified_data.columns else 1
                    st.metric("Sheets Processed", sheets)
                
                # Show data preview with scroll
                st.markdown("### 📊 Data Preview (First 15 Rows)")
                st.dataframe(classified_data.head(15), use_container_width=True, height=400)
                
                # Show column list
                with st.expander("📑 View All Extracted Columns"):
                    col_df = pd.DataFrame({
                        'Column Name': classified_data.columns,
                        'Data Type': classified_data.dtypes.astype(str),
                        'Non-Null Count': classified_data.count()
                    })
                    st.dataframe(col_df, use_container_width=True)
                
                # Show enhanced statistics
                st.markdown("### 📈 Quick Statistics")
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric(t('total_lots'), len(classified_data))
                
                with col2:
                    total_cost = classified_data['total_cost'].sum() if 'total_cost' in classified_data.columns else 0
                    st.metric(t('total_cost'), f"${total_cost:,.2f}")
                
                with col3:
                    avg_price = classified_data['price_per_kg'].mean() if 'price_per_kg' in classified_data.columns else 0
                    st.metric(t('avg_price'), f"${avg_price:.2f}")
                
                with col4:
                    export_ready = classified_data[classified_data['status'] == 'Export Ready']['volume'].sum() if 'volume' in classified_data.columns else 0
                    st.metric(t('export_ready'), f"{export_ready:,.0f} kg")
                
        except Exception as e:
            st.error(f"❌ Error processing file: {str(e)}")
            st.error("Please ensure your Excel file is properly formatted and not corrupted.")
            st.info("Tip: The system can process Excel files with any column names and multiple sheets.")

elif current_page == 'dashboard':
    if st.session_state.processed_data is not None:
        from pages.dashboard import render_dashboard
        render_dashboard(st.session_state.processed_data)
    else:
        st.warning(t('no_data'))

elif current_page == 'traceability':
    if st.session_state.processed_data is not None:
        from pages.traceability import render_traceability
        render_traceability(st.session_state.processed_data)
    else:
        st.warning(t('no_data'))

elif current_page == 'batch_management':
    if st.session_state.processed_data is not None:
        from pages.batch_management import render_batch_management
        render_batch_management(st.session_state.processed_data)
    else:
        st.warning(t('no_data'))

elif current_page == 'quality':
    if st.session_state.processed_data is not None:
        from pages.enterprise_quality import render_quality_dashboard
        render_quality_dashboard(st.session_state.processed_data)
    else:
        st.warning(t('no_data'))

elif current_page == 'inventory':
    if st.session_state.processed_data is not None:
        st.markdown('<h2>📦 Inventory & Operations Dashboard</h2>', unsafe_allow_html=True)
        from utils.enterprise_analytics import EnterpriseAnalytics
        
        analytics = EnterpriseAnalytics(st.session_state.processed_data)
        inv_data = analytics.inventory_dashboard_data()
        ops_data = analytics.operations_dashboard_data()
        
        # Show inventory metrics
        st.markdown("### 📊 Inventory Overview")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_qty = st.session_state.processed_data['contracted_qty_kg'].sum() if 'contracted_qty_kg' in st.session_state.processed_data.columns else 0
            st.metric("Total Volume", f"{total_qty:,.0f} kg")
        
        with col2:
            ready_to_ship = st.session_state.processed_data[st.session_state.processed_data['shipment_status'] == 'Ready to Ship']['contracted_qty_kg'].sum() if 'shipment_status' in st.session_state.processed_data.columns else 0
            st.metric("Ready to Ship", f"{ready_to_ship:,.0f} kg")
        
        with col3:
            in_warehouse = st.session_state.processed_data[st.session_state.processed_data['shipment_status'] == 'In Warehouse']['contracted_qty_kg'].sum() if 'shipment_status' in st.session_state.processed_data.columns else 0
            st.metric("In Warehouse", f"{in_warehouse:,.0f} kg")
        
        with col4:
            avg_days = st.session_state.processed_data['warehouse_days'].mean() if 'warehouse_days' in st.session_state.processed_data.columns else 0
            st.metric("Avg Warehouse Days", f"{avg_days:.0f}")
        
        st.info("💼 Full inventory analytics with aging analysis, OTIF tracking, and document completeness coming soon!")
    else:
        st.warning(t('no_data'))

elif current_page == 'commercial':
    if st.session_state.processed_data is not None:
        st.markdown('<h2>💰 Commercial Analytics Dashboard</h2>', unsafe_allow_html=True)
        from utils.enterprise_analytics import EnterpriseAnalytics
        
        analytics = EnterpriseAnalytics(st.session_state.processed_data)
        commercial_data = analytics.commercial_dashboard_data()
        
        st.markdown("### 💵 Financial Overview")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_value = st.session_state.processed_data['total_cost'].sum() if 'total_cost' in st.session_state.processed_data.columns else 0
            st.metric("Total Value", f"${total_value:,.0f}")
        
        with col2:
            avg_margin = st.session_state.processed_data['margin_pct'].mean() if 'margin_pct' in st.session_state.processed_data.columns else 0
            st.metric("Avg Margin", f"{avg_margin:.1f}%")
        
        with col3:
            avg_fob = st.session_state.processed_data['fob_price_usd_lb'].mean() if 'fob_price_usd_lb' in st.session_state.processed_data.columns else 0
            st.metric("Avg FOB Price", f"${avg_fob:.2f}/lb")
        
        with col4:
            top_buyer = st.session_state.processed_data['buyer_name'].mode()[0] if 'buyer_name' in st.session_state.processed_data.columns and len(st.session_state.processed_data) > 0 else 'N/A'
            st.metric("Top Buyer", top_buyer)
        
        st.info("📈 Full commercial analytics with cost stacks, FX impact analysis, and pricing waterfalls coming soon!")
    else:
        st.warning(t('no_data'))

elif current_page == 'ai_copilot':
    if st.session_state.processed_data is not None:
        st.markdown('<h2>🤖 AI Copilot</h2>', unsafe_allow_html=True)
        st.markdown("""
        <div style="background: linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 100%); padding: 1.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #E2E8F0;">
            <p style="color: #64748B; margin: 0; font-size: 0.9375rem; line-height: 1.6; font-weight: 500;">
                <strong style="color: #6366F1;">AI-Powered Insights:</strong> Get intelligent recommendations, pricing guidance, and automated analysis
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        from utils.ai_copilot import AICopilot
        
        copilot = AICopilot(st.session_state.processed_data)
        
        tab1, tab2, tab3 = st.tabs(["📊 Season Summary", "💰 Pricing Coach", "🔍 Auto Insights"])
        
        with tab1:
            st.markdown("### 📊 Season Summary")
            summary = copilot.season_summary()
            
            if summary['overview']:
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Lots", summary['overview']['total_lots'])
                with col2:
                    st.metric("Total Volume", f"{summary['overview']['total_volume_kg']:,.0f} kg")
                with col3:
                    st.metric("Avg Quality", f"{summary['overview']['avg_quality_score']:.1f}")
            
            if summary['standout_lots']:
                st.markdown("#### ⭐ Standout Lots (Top 10% Quality)")
                standout_df = pd.DataFrame(summary['standout_lots'])
                st.dataframe(standout_df, use_container_width=True)
            
            if summary['recommendations']:
                st.markdown("#### 💡 Recommendations")
                for rec in summary['recommendations']:
                    st.success(rec)
            
            if summary['risks']:
                st.markdown("#### ⚠️ Risk Alerts")
                for risk in summary['risks']:
                    st.warning(risk)
        
        with tab2:
            st.markdown("### 💰 Pricing Coach")
            st.info("Select a lot to get pricing recommendations")
            
            if 'lot_id' in st.session_state.processed_data.columns:
                lot_ids = st.session_state.processed_data['lot_id'].tolist()
                selected_lot = st.selectbox("Select Lot", lot_ids)
                
                if st.button("Get Pricing Recommendation"):
                    lot_data = st.session_state.processed_data[st.session_state.processed_data['lot_id'] == selected_lot].iloc[0]
                    pricing = copilot.pricing_coach(lot_data)
                    
                    st.markdown(f"#### Pricing Analysis for {selected_lot}")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric("Minimum Price", f"${pricing['recommendations']['minimum_acceptable_usd_lb']}/lb")
                        st.metric("Target Price", f"${pricing['recommendations']['target_price_usd_lb']}/lb")
                    with col2:
                        st.info(f"**Rationale:** {pricing['recommendations']['rationale']}")
                        st.success(f"**Optimal Range:** {pricing['recommendations']['optimal_range']}")
        
        with tab3:
            st.markdown("### 🔍 Auto-Generated Insights")
            insights = copilot.auto_insights(st.session_state.processed_data)
            
            if insights['outliers']:
                st.markdown("#### 📍 Outliers Detected")
                for outlier in insights['outliers']:
                    st.warning(f"**{outlier['type']}**: {outlier['message']}")
            
            if insights['patterns']:
                st.markdown("#### 📈 Patterns Identified")
                for pattern in insights['patterns']:
                    st.info(f"**{pattern['type']}**: {pattern['message']}")
            
            if insights['opportunities']:
                st.markdown("#### 💡 Opportunities")
                for opp in insights['opportunities']:
                    st.success(f"**{opp['type']}**: {opp['message']}")
    else:
        st.warning(t('no_data'))

# Premium Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; padding: 2.5rem 0 1.5rem 0;">
    <p style="color: #64748B; font-size: 0.875rem; margin: 0; font-weight: 500;">
        <strong style="color: #475569;">Addis Exporter Analytics</strong> | Ethiopian Coffee Traceability Platform
    </p>
    <p style="color: #94A3B8; font-size: 0.75rem; margin-top: 0.625rem; letter-spacing: 0.02em;">
        © 2024 Addis Exporter. All rights reserved. | Empowering Ethiopian Coffee Exports
    </p>
</div>
""", unsafe_allow_html=True)
