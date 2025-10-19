import streamlit as st
import pandas as pd
from utils.qr_generator import QRGenerator
from utils.report_generator import ReportGenerator
import uuid

def render_batch_management(data):
    """Render the batch management page"""
    
    st.markdown('<h2>📦 Batch Management & Operations</h2>', unsafe_allow_html=True)
    st.markdown("""
    <div style="background: linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 100%); padding: 1.25rem 1.75rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #E2E8F0;">
        <p style="color: #64748B; margin: 0; font-size: 0.9375rem; line-height: 1.6;">
            Manage your coffee lots, perform bulk operations, and track processing status across your inventory
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Initialize generators
    qr_gen = QRGenerator()
    report_gen = ReportGenerator()
    
    # Management tabs
    tab1, tab2, tab3, tab4 = st.tabs(["🔍 Lot Explorer", "📊 Batch Operations", "📋 Status Management", "📈 Batch Analytics"])
    
    with tab1:
        render_lot_explorer(data)
    
    with tab2:
        render_batch_operations(data, qr_gen, report_gen)
    
    with tab3:
        render_status_management(data)
    
    with tab4:
        render_batch_analytics(data)

def render_lot_explorer(data):
    """Render detailed lot exploration interface"""
    
    st.subheader("🔍 Lot Explorer")
    
    # Search and filter interface
    col1, col2, col3 = st.columns(3)
    
    with col1:
        search_term = st.text_input("🔍 Search Lots", placeholder="Enter lot ID, farm name, or region...")
    
    with col2:
        if 'region_category' in data.columns:
            region_filter = st.multiselect("Filter by Region", data['region_category'].unique())
        else:
            region_filter = []
    
    with col3:
        if 'status' in data.columns:
            status_filter = st.multiselect("Filter by Status", data['status'].unique())
        else:
            status_filter = []
    
    # Apply filters
    filtered_data = data.copy()
    
    if search_term:
        # Search across multiple columns
        search_columns = ['lot_id', 'farm_station', 'region', 'region_category']
        search_mask = pd.Series([False] * len(filtered_data))
        
        for col in search_columns:
            if col in filtered_data.columns:
                search_mask |= filtered_data[col].astype(str).str.contains(search_term, case=False, na=False)
        
        filtered_data = filtered_data[search_mask]
    
    if region_filter:
        filtered_data = filtered_data[filtered_data['region_category'].isin(region_filter)]
    
    if status_filter:
        filtered_data = filtered_data[filtered_data['status'].isin(status_filter)]
    
    # Display results count
    st.write(f"📊 Showing {len(filtered_data)} of {len(data)} lots")
    
    if len(filtered_data) == 0:
        st.warning("No lots match your search criteria.")
        return
    
    # Lot details view
    st.subheader("📋 Lot Details")
    
    # Sortable table
    sort_options = ['lot_id', 'region_category', 'volume', 'price_per_kg', 'quality_score', 'status']
    available_sort_options = [col for col in sort_options if col in filtered_data.columns]
    
    col1, col2 = st.columns(2)
    
    with col1:
        sort_by = st.selectbox("Sort by:", available_sort_options, index=0)
    
    with col2:
        sort_ascending = st.checkbox("Ascending", value=True)
    
    # Sort data
    sorted_data = filtered_data.sort_values(by=sort_by, ascending=sort_ascending)
    
    # Display table with selection
    selected_lots = st.data_editor(
        sorted_data,
        use_container_width=True,
        column_config={
            "lot_id": "Lot ID",
            "region_category": "Region",
            "farm_station": "Farm/Station",
            "volume": st.column_config.NumberColumn("Volume (kg)", format="%.0f"),
            "price_per_kg": st.column_config.NumberColumn("Price/kg", format="$%.2f"),
            "quality_score": st.column_config.NumberColumn("Quality", format="%.1f"),
            "status": "Status",
            "altitude": st.column_config.NumberColumn("Altitude (m)", format="%.0f")
        },
        hide_index=True,
        num_rows="dynamic"
    )
    
    # Lot detail view for selected lot
    if len(selected_lots) > 0:
        st.markdown("---")
        st.subheader("📄 Selected Lot Details")
        
        selected_lot = selected_lots.iloc[0]  # Show first selected lot
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("**Basic Information**")
            st.write(f"**Lot ID:** {selected_lot.get('lot_id', 'N/A')}")
            st.write(f"**Region:** {selected_lot.get('region_category', 'N/A')}")
            st.write(f"**Farm/Station:** {selected_lot.get('farm_station', 'N/A')}")
            st.write(f"**Status:** {selected_lot.get('status', 'N/A')}")
        
        with col2:
            st.markdown("**Quality & Processing**")
            st.write(f"**Processing:** {selected_lot.get('processing_category', 'N/A')}")
            st.write(f"**Quality Score:** {selected_lot.get('quality_score', 0)}/10")
            st.write(f"**Altitude:** {selected_lot.get('altitude', 0):,}m")
            st.write(f"**Price Tier:** {selected_lot.get('price_tier', 'N/A')}")
        
        with col3:
            st.markdown("**Volume & Economics**")
            st.write(f"**Volume:** {selected_lot.get('volume', 0):,.0f} kg")
            st.write(f"**Price/kg:** ${selected_lot.get('price_per_kg', 0):.2f}")
            st.write(f"**Total Value:** ${selected_lot.get('total_cost', 0):,.2f}")
            st.write(f"**Farmers:** {selected_lot.get('estimated_farmers', 0)}")

def render_batch_operations(data, qr_gen, report_gen):
    """Render batch operations interface"""
    
    st.subheader("📊 Batch Operations")
    
    # Bulk operations
    st.markdown("### Bulk Operations")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**QR Code Generation**")
        
        # Export-ready lots
        export_ready_lots = data[data['status'] == 'Export Ready'] if 'status' in data.columns else pd.DataFrame()
        
        st.write(f"Export-ready lots: {len(export_ready_lots)}")
        
        if len(export_ready_lots) > 0:
            if st.button("Generate All Export QR Codes", type="primary"):
                with st.spinner("Generating QR codes..."):
                    try:
                        qr_results = qr_gen.generate_multiple_qrs(export_ready_lots.to_dict('records'))
                        st.session_state.bulk_qrs = qr_results
                        st.success(f"Generated {len(qr_results)} QR codes!")
                    except Exception as e:
                        st.error(f"Error generating QR codes: {str(e)}")
        else:
            st.info("No export-ready lots available")
    
    with col2:
        st.markdown("**Report Generation**")
        
        report_type = st.selectbox(
            "Select report type:",
            ["Full Inventory", "Export Ready Only", "Regional Summary", "Quality Analysis"]
        )
        
        if st.button("Generate Report", type="secondary"):
            with st.spinner("Generating report..."):
                try:
                    if report_type == "Export Ready Only":
                        report_data = data[data['status'] == 'Export Ready'] if 'status' in data.columns else data
                    else:
                        report_data = data
                    
                    # Generate Excel report
                    excel_data = report_gen.generate_excel_report(report_data)
                    
                    timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
                    st.download_button(
                        label="Download Excel Report",
                        data=excel_data,
                        file_name=f"batch_report_{report_type.lower().replace(' ', '_')}_{timestamp}.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
                    
                except Exception as e:
                    st.error(f"Error generating report: {str(e)}")
    
    # Batch creation tool
    st.markdown("---")
    st.markdown("### 🆕 Create New Batch")
    
    with st.expander("Create Custom Batch", expanded=False):
        col1, col2 = st.columns(2)
        
        with col1:
            new_lot_id = st.text_input("Lot ID", value=f"LOT_{str(uuid.uuid4())[:8].upper()}")
            new_region = st.selectbox("Region", data['region_category'].unique() if 'region_category' in data.columns else ['Unknown'])
            new_farm = st.text_input("Farm/Station Name")
            new_altitude = st.number_input("Altitude (m)", min_value=0, max_value=3000, value=1500)
        
        with col2:
            new_processing = st.selectbox("Processing Method", ['Washed', 'Natural', 'Honey', 'Experimental'])
            new_volume = st.number_input("Volume (kg)", min_value=0.0, value=100.0)
            new_price = st.number_input("Price per kg ($)", min_value=0.0, value=5.0, step=0.1)
            new_status = st.selectbox("Status", ['Farm', 'Processing', 'Warehouse', 'Export Ready'])
        
        if st.button("Add New Batch"):
            # Create new batch (in a real app, this would update the database)
            st.success(f"New batch {new_lot_id} created successfully!")
            st.info("Note: In production, this would be added to your inventory database.")
    
    # Display bulk QR codes if generated
    if 'bulk_qrs' in st.session_state:
        st.markdown("---")
        st.markdown("### 📦 Generated QR Codes")
        
        qr_results = st.session_state.bulk_qrs
        
        # Display QR codes in a grid
        cols_per_row = 4
        for i in range(0, len(qr_results), cols_per_row):
            cols = st.columns(cols_per_row)
            
            for j in range(cols_per_row):
                if i + j < len(qr_results):
                    qr_result = qr_results[i + j]
                    
                    with cols[j]:
                        import base64
                        qr_image_data = base64.b64decode(qr_result['qr_image'])
                        st.image(qr_image_data, caption=qr_result['batch_id'][:12], width=120)
                        
                        st.download_button(
                            label="PNG",
                            data=qr_image_data,
                            file_name=f"qr_{qr_result['batch_id']}.png",
                            mime="image/png",
                            key=f"bulk_download_{qr_result['batch_id']}"
                        )
        
        if st.button("Clear QR Codes"):
            del st.session_state.bulk_qrs
            st.rerun()

def render_status_management(data):
    """Render status management interface"""
    
    st.subheader("📋 Status Management")
    
    # Status overview
    if 'status' in data.columns:
        status_counts = data['status'].value_counts()
        
        col1, col2, col3, col4 = st.columns(4)
        
        status_colors = {
            'Farm': '🌱',
            'Processing': '⚙️',
            'Warehouse': '🏪',
            'Export Ready': '🚢'
        }
        
        for i, (status, count) in enumerate(status_counts.items()):
            with [col1, col2, col3, col4][i % 4]:
                emoji = status_colors.get(status, '📦')
                st.metric(f"{emoji} {status}", count)
        
        st.markdown("---")
        
        # Status progression tracking
        st.markdown("### 📈 Status Progression")
        
        # Simulate lot progression (in real app, this would track actual changes)
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**Lots Ready for Next Stage**")
            
            # Find lots that could potentially move to next stage
            processing_lots = data[data['status'] == 'Processing'] if 'status' in data.columns else pd.DataFrame()
            warehouse_lots = data[data['status'] == 'Warehouse'] if 'status' in data.columns else pd.DataFrame()
            
            if len(processing_lots) > 0:
                st.write(f"• {len(processing_lots)} lots in Processing → move to Warehouse")
            
            if len(warehouse_lots) > 0:
                st.write(f"• {len(warehouse_lots)} lots in Warehouse → move to Export Ready")
        
        with col2:
            st.markdown("**Status Update Actions**")
            
            # Status update form
            with st.form("status_update_form"):
                lot_to_update = st.selectbox("Select Lot", data['lot_id'].tolist() if 'lot_id' in data.columns else [])
                new_status = st.selectbox("New Status", ['Farm', 'Processing', 'Warehouse', 'Export Ready'])
                update_reason = st.text_area("Update Reason", placeholder="Enter reason for status change...")
                
                submitted = st.form_submit_button("Update Status")
                
                if submitted:
                    st.success(f"Status updated for lot {lot_to_update} to {new_status}")
                    st.info("Note: In production, this would update your inventory database.")
    else:
        st.info("Status information not available in current data.")
    
    # Quality control checklist
    st.markdown("---")
    st.markdown("### ✅ Quality Control Checklist")
    
    with st.expander("Export Readiness Checklist", expanded=False):
        st.markdown("""
        **Before marking lots as Export Ready, ensure:**
        
        - [ ] Moisture content is within acceptable range (10-12%)
        - [ ] Defect count meets international standards
        - [ ] Proper documentation is complete
        - [ ] Quality cupping has been performed
        - [ ] Packaging requirements are met
        - [ ] Export permits and certificates are ready
        - [ ] Transportation arrangements are confirmed
        """)
        
        if st.button("Mark Selected Lots as Checked"):
            st.success("Quality control check recorded!")

def render_batch_analytics(data):
    """Render batch analytics interface"""
    
    st.subheader("📈 Batch Analytics")
    
    # Performance metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # Processing efficiency
        if 'status' in data.columns:
            total_lots = len(data)
            export_ready = len(data[data['status'] == 'Export Ready'])
            efficiency = (export_ready / total_lots * 100) if total_lots > 0 else 0
            
            st.metric(
                "Processing Efficiency",
                f"{efficiency:.1f}%",
                delta=f"{export_ready} of {total_lots} lots export-ready"
            )
    
    with col2:
        # Average processing time (simulated)
        avg_processing_days = 45  # This would be calculated from actual data
        st.metric(
            "Avg Processing Time",
            f"{avg_processing_days} days",
            delta="5 days faster than last season"
        )
    
    with col3:
        # Quality distribution
        if 'quality_score' in data.columns:
            high_quality_lots = len(data[data['quality_score'] >= 8])
            quality_percentage = (high_quality_lots / len(data) * 100) if len(data) > 0 else 0
            
            st.metric(
                "Premium Quality Lots",
                f"{quality_percentage:.1f}%",
                delta=f"{high_quality_lots} lots with 8+ quality score"
            )
    
    # Batch timeline analysis
    st.markdown("---")
    st.markdown("### 📅 Processing Timeline Analysis")
    
    # Simulated timeline data (in real app, this would come from actual processing dates)
    import plotly.graph_objects as go
    from datetime import datetime, timedelta
    
    # Create timeline visualization
    statuses = ['Farm', 'Processing', 'Warehouse', 'Export Ready']
    status_counts = []
    
    for status in statuses:
        count = len(data[data['status'] == status]) if 'status' in data.columns else 0
        status_counts.append(count)
    
    fig = go.Figure(data=[
        go.Bar(
            x=statuses,
            y=status_counts,
            text=status_counts,
            textposition='auto',
            marker_color=['#90EE90', '#FFD700', '#FFA500', '#32CD32']
        )
    ])
    
    fig.update_layout(
        title="Current Batch Distribution by Processing Stage",
        xaxis_title="Processing Stage",
        yaxis_title="Number of Lots",
        showlegend=False
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Regional processing performance
    if 'region_category' in data.columns and 'status' in data.columns:
        st.markdown("### 🌍 Regional Processing Performance")
        
        regional_performance = data.groupby('region_category')['status'].value_counts().unstack(fill_value=0)
        
        fig_regional = go.Figure()
        
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        
        for i, status in enumerate(regional_performance.columns):
            fig_regional.add_trace(go.Bar(
                name=status,
                x=regional_performance.index,
                y=regional_performance[status],
                marker_color=colors[i % len(colors)]
            ))
        
        fig_regional.update_layout(
            title="Processing Status Distribution by Region",
            xaxis_title="Region",
            yaxis_title="Number of Lots",
            barmode='stack'
        )
        
        st.plotly_chart(fig_regional, use_container_width=True)
    
    # Performance insights
    st.markdown("---")
    st.markdown("### 💡 Performance Insights")
    
    insights = []
    
    if 'status' in data.columns:
        export_ready_pct = len(data[data['status'] == 'Export Ready']) / len(data) * 100
        
        if export_ready_pct > 70:
            insights.append("🟢 **Strong Export Readiness**: Over 70% of lots are export-ready")
        elif export_ready_pct > 40:
            insights.append("🟡 **Moderate Progress**: Good processing pipeline with room for improvement")
        else:
            insights.append("🔴 **Processing Bottleneck**: Consider accelerating processing operations")
    
    if 'quality_score' in data.columns:
        avg_quality = data['quality_score'].mean()
        if avg_quality >= 8:
            insights.append("⭐ **Premium Quality Portfolio**: Excellent average quality scores")
        elif avg_quality >= 6:
            insights.append("✅ **Good Quality Standards**: Solid quality across batches")
        else:
            insights.append("⚠️ **Quality Improvement Needed**: Focus on quality enhancement programs")
    
    if 'region_category' in data.columns:
        region_diversity = data['region_category'].nunique()
        if region_diversity >= 5:
            insights.append("🌍 **Diverse Regional Portfolio**: Excellent geographic diversification")
        elif region_diversity >= 3:
            insights.append("📍 **Good Regional Coverage**: Solid regional representation")
    
    for insight in insights:
        st.markdown(insight)
    
    if not insights:
        st.info("Upload more detailed data for comprehensive performance insights.")
