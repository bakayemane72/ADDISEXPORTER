import streamlit as st
import pandas as pd
from utils.qr_generator import QRGenerator
import base64

def render_traceability(data):
    """Render the traceability and QR code generation page"""
    
    st.markdown('<h2>🔍 Lot Traceability & QR Codes</h2>', unsafe_allow_html=True)
    st.markdown("""
    <div style="background: linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 100%); padding: 1.25rem 1.75rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #E2E8F0;">
        <p style="color: #64748B; margin: 0; font-size: 0.9375rem; line-height: 1.6;">
            Generate QR codes for export-ready batches and create comprehensive traceability reports for your customers
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Initialize QR generator
    qr_gen = QRGenerator()
    
    # Lot selection
    st.markdown("### 📋 Select Coffee Lot")
    st.markdown('<p style="color: #64748B; font-size: 0.9375rem; margin-bottom: 1rem; font-weight: 500;">Choose a lot to view detailed traceability information and generate QR codes</p>', unsafe_allow_html=True)
    
    # Filter for export-ready lots by default
    export_ready_data = data[data['status'] == 'Export Ready'] if 'status' in data.columns else data
    
    if len(export_ready_data) == 0:
        st.warning("No export-ready lots found. Showing all lots.")
        available_data = data
    else:
        available_data = export_ready_data
    
    # Lot selection dropdown
    lot_options = available_data['lot_id'].tolist() if 'lot_id' in available_data.columns else []
    
    if not lot_options:
        st.error("No lots available for traceability.")
        return
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        selected_lot = st.selectbox(
            "Choose a coffee lot:",
            lot_options,
            help="Select a lot to view its traceability information and generate QR code"
        )
    
    with col2:
        show_all_lots = st.checkbox("Show all lots", help="Include lots that are not export-ready")
        if show_all_lots:
            available_data = data
            lot_options = data['lot_id'].tolist() if 'lot_id' in data.columns else []
    
    # Get selected lot data
    if selected_lot:
        lot_data = available_data[available_data['lot_id'] == selected_lot].iloc[0].to_dict()
        
        st.markdown("---")
        
        # Display lot information in organized sections
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📋 Batch Information")
            st.write(f"**Lot ID:** {lot_data.get('lot_id', 'N/A')}")
            st.write(f"**Batch ID:** {lot_data.get('batch_id', lot_data.get('lot_id', 'N/A'))}")
            st.write(f"**Status:** {lot_data.get('status', 'Unknown')}")
            st.write(f"**Date Added:** {lot_data.get('date_added', 'Unknown')}")
            
            st.subheader("📍 Origin Information")
            st.write(f"**Region:** {lot_data.get('region_category', lot_data.get('region', 'Unknown'))}")
            st.write(f"**Farm/Station:** {lot_data.get('farm_station', 'Unknown')}")
            st.write(f"**Altitude:** {lot_data.get('altitude', 0):,} meters")
            st.write(f"**Altitude Range:** {lot_data.get('altitude_range', 'Unknown')}")
        
        with col2:
            st.subheader("⚙️ Processing Information")
            st.write(f"**Method:** {lot_data.get('processing_category', lot_data.get('processing_method', 'Unknown'))}")
            st.write(f"**Quality Score:** {lot_data.get('quality_score', 0)}/10")
            
            st.subheader("📦 Volume & Pricing")
            st.write(f"**Volume:** {lot_data.get('volume', 0):,.0f} kg")
            st.write(f"**Price per kg:** ${lot_data.get('price_per_kg', 0):.2f}")
            st.write(f"**Total Cost:** ${lot_data.get('total_cost', 0):,.2f}")
            st.write(f"**Price Tier:** {lot_data.get('price_tier', 'Unknown')}")
            
            st.subheader("👥 Farmer Information")
            estimated_farmers = lot_data.get('estimated_farmers', 0)
            st.write(f"**Estimated Smallholder Farmers:** {estimated_farmers}")
        
        # Progress tracker
        st.markdown("---")
        st.subheader("📈 Processing Progress")
        
        # Create progress visualization
        stages = ["Farm", "Processing", "Warehouse", "Export Ready"]
        current_status = lot_data.get('status', 'Unknown')
        
        if current_status == 'Farm':
            progress = 1
        elif current_status == 'Processing':
            progress = 2
        elif current_status == 'Warehouse':
            progress = 3
        elif current_status == 'Export Ready':
            progress = 4
        else:
            progress = 0
        
        # Display progress
        cols = st.columns(4)
        for i, stage in enumerate(stages):
            with cols[i]:
                if i < progress:
                    st.success(f"✅ {stage}")
                elif i == progress:
                    st.warning(f"🔄 {stage}")
                else:
                    st.info(f"⏳ {stage}")
        
        # QR Code Generation Section
        st.markdown("---")
        st.subheader("🔲 QR Code Generation")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            if st.button("Generate QR Code", type="primary"):
                try:
                    with st.spinner("Generating QR code..."):
                        qr_result = qr_gen.generate_batch_qr(lot_data)
                        
                        # Store in session state
                        st.session_state.current_qr = qr_result
                        st.success("QR Code generated successfully!")
                
                except Exception as e:
                    st.error(f"Error generating QR code: {str(e)}")
        
        with col2:
            if st.button("Generate All Export-Ready QRs"):
                try:
                    with st.spinner("Generating QR codes for all export-ready lots..."):
                        export_ready_lots = data[data['status'] == 'Export Ready'] if 'status' in data.columns else data
                        qr_results = qr_gen.generate_multiple_qrs(export_ready_lots.to_dict('records'))
                        
                        st.session_state.all_qrs = qr_results
                        st.success(f"Generated {len(qr_results)} QR codes!")
                
                except Exception as e:
                    st.error(f"Error generating QR codes: {str(e)}")
        
        # Display QR Code if generated
        if 'current_qr' in st.session_state:
            st.markdown("---")
            st.subheader("Generated QR Code")
            
            qr_result = st.session_state.current_qr
            
            col1, col2 = st.columns([1, 2])
            
            with col1:
                # Display QR code image
                qr_image_data = base64.b64decode(qr_result['qr_image'])
                st.image(qr_image_data, caption=f"QR Code for {qr_result['batch_id']}", width=250)
                
                # Download button for QR image
                st.download_button(
                    label="Download QR Code PNG",
                    data=qr_image_data,
                    file_name=f"qr_code_{qr_result['batch_id']}.png",
                    mime="image/png"
                )
            
            with col2:
                st.subheader("QR Code Data")
                st.write("**When scanned, this QR code will show:**")
                
                qr_data = qr_result['qr_data']
                st.write(f"• **Batch ID:** {qr_data['batch_id']}")
                st.write(f"• **Region:** {qr_data['region']}")
                st.write(f"• **Altitude:** {qr_data['altitude']}m")
                st.write(f"• **Farm/Station:** {qr_data['farm_station']}")
                st.write(f"• **Processing:** {qr_data['processing_method']}")
                st.write(f"• **Volume:** {qr_data['volume']:,.0f} kg")
                st.write(f"• **Farmers:** {qr_data['estimated_farmers']} smallholders")
                st.write(f"• **Quality Score:** {qr_data['quality_score']}/10")
        
        # Traceability Landing Page Preview
        st.markdown("---")
        st.subheader("🌐 Traceability Landing Page Preview")
        
        try:
            trace_page_data = qr_gen.create_traceability_page_data(lot_data)
            
            st.write("**This is what customers will see when they scan the QR code:**")
            
            # Simulate landing page layout
            with st.container():
                st.markdown("### ☕ Ethiopian Coffee Traceability")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("#### 📍 Origin Details")
                    st.write(f"**Region:** {trace_page_data['origin_info']['region']}")
                    st.write(f"**Farm/Station:** {trace_page_data['origin_info']['farm_station']}")
                    st.write(f"**Altitude:** {trace_page_data['origin_info']['altitude']}")
                    
                    st.markdown("#### 👥 Farmer Information")
                    st.write(f"**Smallholder Farmers:** {trace_page_data['volume_info']['estimated_farmers']}")
                    st.write(f"**Total Volume:** {trace_page_data['volume_info']['total_volume']}")
                
                with col2:
                    st.markdown("#### ⚙️ Processing")
                    st.write(f"**Method:** {trace_page_data['processing_info']['method']}")
                    st.write(f"**Quality Score:** {trace_page_data['processing_info']['quality_score']}")
                    
                    st.markdown("#### ☕ Roaster Notes")
                    st.write(f"**Flavor Profile:** {trace_page_data['roaster_notes']['flavor_profile']}")
                    st.write(f"**Brewing:** {trace_page_data['roaster_notes']['brewing_recommendations']}")
                    st.write(f"**Cupping Score:** {trace_page_data['roaster_notes']['cupping_score']}/100")
        
        except Exception as e:
            st.error(f"Error creating traceability preview: {str(e)}")
    
    # Batch QR Management
    if 'all_qrs' in st.session_state:
        st.markdown("---")
        st.subheader("📦 Batch QR Code Management")
        
        all_qrs = st.session_state.all_qrs
        st.write(f"**Generated QR codes for {len(all_qrs)} export-ready lots**")
        
        # Display QR codes in a grid
        for i, qr_result in enumerate(all_qrs):
            if i % 3 == 0:  # Create new row every 3 QR codes
                cols = st.columns(3)
            
            with cols[i % 3]:
                qr_image_data = base64.b64decode(qr_result['qr_image'])
                st.image(qr_image_data, caption=qr_result['batch_id'], width=150)
                
                # Individual download button
                st.download_button(
                    label=f"Download {qr_result['batch_id'][:8]}...",
                    data=qr_image_data,
                    file_name=f"qr_{qr_result['batch_id']}.png",
                    mime="image/png",
                    key=f"download_{qr_result['batch_id']}"
                )
        
        # Bulk download option (would need zip functionality in real implementation)
        st.info("💡 **Tip:** Use these QR codes on your coffee bags for full traceability!")
