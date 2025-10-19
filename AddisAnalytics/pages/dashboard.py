import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

def render_dashboard(data):
    """Render the main analytics dashboard with advanced coffee insights"""
    
    st.markdown('<h2>📊 Advanced Analytics Dashboard</h2>', unsafe_allow_html=True)
    st.markdown("""
    <div style="background: linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 100%); padding: 1.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(99,102,241,0.05);">
        <p style="color: #64748B; margin: 0; font-size: 0.9375rem; line-height: 1.6; font-weight: 500;">
            <strong style="color: #6366F1;">Comprehensive Intelligence:</strong> Deep insights into coffee quality, market positioning, regional performance, and export potential
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Key Performance Metrics with premium cards
    st.markdown("### 📈 Key Performance Indicators")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_lots = len(data)
        st.metric("Total Lots", f"{total_lots:,}")
    
    with col2:
        total_cost = data['total_cost'].sum() if 'total_cost' in data.columns else 0
        st.metric("Total Purchase Cost", f"${total_cost:,.0f}")
    
    with col3:
        avg_price = data['price_per_kg'].mean() if 'price_per_kg' in data.columns else 0
        st.metric("Average Price/kg", f"${avg_price:.2f}")
    
    with col4:
        export_ready = data[data['status'] == 'Export Ready']['volume'].sum() if 'status' in data.columns and 'volume' in data.columns else 0
        st.metric("Export Ready Volume", f"{export_ready:,.0f} kg")
    
    st.markdown("---")
    
    # Filters with premium styling
    st.markdown("### 🔍 Filter & Analyze")
    st.markdown('<p style="color: #64748B; font-size: 0.9375rem; margin-bottom: 1rem; font-weight: 500;">Customize your view by selecting specific regions, processing methods, or status</p>', unsafe_allow_html=True)
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if 'region_category' in data.columns:
            regions = ['All'] + list(data['region_category'].unique())
            selected_region = st.selectbox("Region", regions)
        else:
            selected_region = 'All'
    
    with col2:
        if 'processing_category' in data.columns:
            processing_methods = ['All'] + list(data['processing_category'].unique())
            selected_processing = st.selectbox("Processing Method", processing_methods)
        else:
            selected_processing = 'All'
    
    with col3:
        if 'status' in data.columns:
            statuses = ['All'] + list(data['status'].unique())
            selected_status = st.selectbox("Status", statuses)
        else:
            selected_status = 'All'
    
    # Apply filters
    filtered_data = data.copy()
    
    if selected_region != 'All' and 'region_category' in data.columns:
        filtered_data = filtered_data[filtered_data['region_category'] == selected_region]
    
    if selected_processing != 'All' and 'processing_category' in data.columns:
        filtered_data = filtered_data[filtered_data['processing_category'] == selected_processing]
    
    if selected_status != 'All' and 'status' in data.columns:
        filtered_data = filtered_data[filtered_data['status'] == selected_status]
    
    st.markdown("---")
    
    # Visualization Section
    if len(filtered_data) == 0:
        st.warning("No data matches the selected filters.")
        return
    
    # Row 1: Regional Distribution and Processing Methods
    st.markdown("### 📊 Distribution Analytics")
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">📍 Regional Distribution</p>', unsafe_allow_html=True)
        if 'region_category' in filtered_data.columns:
            region_counts = filtered_data['region_category'].value_counts()
            fig_region = px.pie(
                values=region_counts.values,
                names=region_counts.index,
                title="Coffee Lots by Region",
                color_discrete_sequence=['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1']
            )
            fig_region.update_traces(textposition='inside', textinfo='percent+label', textfont=dict(size=11))
            fig_region.update_layout(
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(t=40, b=20, l=20, r=20)
            )
            st.plotly_chart(fig_region, use_container_width=True)
        else:
            st.info("Regional data not available")
    
    with col2:
        st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">⚙️ Processing Methods</p>', unsafe_allow_html=True)
        if 'processing_category' in filtered_data.columns:
            processing_counts = filtered_data['processing_category'].value_counts()
            fig_processing = px.bar(
                x=processing_counts.values,
                y=processing_counts.index,
                title="Volume by Processing Method",
                orientation='h'
            )
            fig_processing.update_traces(marker_color='#6366F1', marker_line_color='#4F46E5', marker_line_width=1.5)
            fig_processing.update_layout(
                xaxis_title="Number of Lots",
                yaxis_title="Processing Method",
                showlegend=False,
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0', gridwidth=1),
                yaxis=dict(gridcolor='#E2E8F0'),
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_processing, use_container_width=True)
        else:
            st.info("Processing method data not available")
    
    # Row 2: Price Analysis
    st.markdown("---")
    st.markdown("### 💰 Price & Quality Insights")
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">💵 Price Distribution</p>', unsafe_allow_html=True)
        if 'price_per_kg' in filtered_data.columns:
            fig_price_hist = px.histogram(
                filtered_data,
                x='price_per_kg',
                nbins=20,
                title="Price per kg Distribution"
            )
            fig_price_hist.update_traces(marker_color='#10B981', marker_line_color='#059669', marker_line_width=1.5)
            fig_price_hist.update_layout(
                xaxis_title="Price per kg ($)",
                yaxis_title="Number of Lots",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0', gridwidth=1),
                yaxis=dict(gridcolor='#E2E8F0'),
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_price_hist, use_container_width=True)
        else:
            st.info("Price data not available")
    
    with col2:
        st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">🏔️ Altitude vs Price</p>', unsafe_allow_html=True)
        if 'altitude' in filtered_data.columns and 'price_per_kg' in filtered_data.columns:
            fig_alt_price = px.scatter(
                filtered_data,
                x='altitude',
                y='price_per_kg',
                color='region_category' if 'region_category' in filtered_data.columns else None,
                size='volume' if 'volume' in filtered_data.columns else None,
                title="Altitude vs Price Relationship",
                hover_data=['lot_id', 'farm_station'] if 'lot_id' in filtered_data.columns else None,
                color_discrete_sequence=['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
            )
            fig_alt_price.update_layout(
                xaxis_title="Altitude (m)",
                yaxis_title="Price per kg ($)",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0', gridwidth=1),
                yaxis=dict(gridcolor='#E2E8F0'),
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_alt_price, use_container_width=True)
        else:
            st.info("Altitude or price data not available")
    
    # Row 3: Volume Analysis
    st.markdown("---")
    st.markdown("### 📦 Volume & Status Analysis")
    
    if 'volume' in filtered_data.columns and 'region_category' in filtered_data.columns:
        col1, col2 = st.columns(2)
        
        with col1:
            # Volume by region
            region_volume = filtered_data.groupby('region_category')['volume'].sum().sort_values(ascending=True)
            fig_vol_region = px.bar(
                x=region_volume.values,
                y=region_volume.index,
                title="Total Volume by Region",
                orientation='h',
                color=region_volume.values,
                color_continuous_scale='Blues'
            )
            fig_vol_region.update_layout(
                xaxis_title="Volume (kg)",
                yaxis_title="Region",
                showlegend=False
            )
            st.plotly_chart(fig_vol_region, use_container_width=True)
        
        with col2:
            # Status distribution
            if 'status' in filtered_data.columns:
                status_counts = filtered_data['status'].value_counts()
                fig_status = px.donut(
                    values=status_counts.values,
                    names=status_counts.index,
                    title="Coffee Lot Status Distribution",
                    color_discrete_sequence=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99']
                )
                st.plotly_chart(fig_status, use_container_width=True)
            else:
                st.info("Status data not available")
    
    # Row 4: Quality Analysis
    if 'quality_score' in filtered_data.columns:
        st.markdown("---")
        st.markdown("### ⭐ Quality & Grading Analysis")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Quality distribution
            st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">📊 Quality Score Distribution</p>', unsafe_allow_html=True)
            fig_quality = px.histogram(
                filtered_data,
                x='quality_score',
                nbins=10,
                title="Quality Score Distribution"
            )
            fig_quality.update_traces(marker_color='#8B5CF6', marker_line_color='#7C3AED', marker_line_width=1.5)
            fig_quality.update_layout(
                xaxis_title="Quality Score (1-10)",
                yaxis_title="Number of Lots",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0', gridwidth=1),
                yaxis=dict(gridcolor='#E2E8F0'),
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_quality, use_container_width=True)
        
        with col2:
            # Quality by region
            if 'region_category' in filtered_data.columns:
                st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">🏆 Regional Quality Comparison</p>', unsafe_allow_html=True)
                quality_by_region = filtered_data.groupby('region_category')['quality_score'].mean().sort_values(ascending=False)
                fig_quality_region = px.bar(
                    x=quality_by_region.index,
                    y=quality_by_region.values,
                    title="Average Quality Score by Region"
                )
                fig_quality_region.update_traces(marker_color=quality_by_region.values, 
                                                marker_colorscale=[[0, '#EF4444'], [0.5, '#F59E0B'], [1, '#10B981']],
                                                marker_line_color='#E2E8F0', marker_line_width=1)
                fig_quality_region.update_layout(
                    xaxis_title="Region",
                    yaxis_title="Average Quality Score",
                    showlegend=False,
                    font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                    title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    xaxis=dict(gridcolor='#E2E8F0'),
                    yaxis=dict(gridcolor='#E2E8F0'),
                    margin=dict(t=40, b=40, l=40, r=20)
                )
                st.plotly_chart(fig_quality_region, use_container_width=True)
    
    # Row 5: Cup Score & Export Grade Analysis
    st.markdown("---")
    st.markdown("### ☕ Cup Score & Export Grade Intelligence")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if 'cup_score' in filtered_data.columns:
            st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">📈 SCA Cup Score Distribution</p>', unsafe_allow_html=True)
            fig_cup = px.violin(
                filtered_data,
                y='cup_score',
                box=True,
                points='all',
                title="Cup Score Spread",
                color_discrete_sequence=['#6366F1']
            )
            fig_cup.update_layout(
                yaxis_title="Cup Score (SCA)",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(gridcolor='#E2E8F0'),
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_cup, use_container_width=True)
    
    with col2:
        if 'export_grade' in filtered_data.columns:
            st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">🎯 Ethiopian Export Grade Breakdown</p>', unsafe_allow_html=True)
            grade_counts = filtered_data['export_grade'].value_counts()
            fig_grade = px.pie(
                values=grade_counts.values,
                names=grade_counts.index,
                title="Export Grade Distribution",
                color_discrete_sequence=['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5']
            )
            fig_grade.update_traces(textposition='inside', textinfo='percent+label', textfont=dict(size=11))
            fig_grade.update_layout(
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(t=40, b=20, l=20, r=20)
            )
            st.plotly_chart(fig_grade, use_container_width=True)
    
    # Row 6: Market Segment & Value Analysis
    st.markdown("---")
    st.markdown("### 💼 Market Segmentation & Value Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if 'market_segment' in filtered_data.columns:
            st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">🎯 Target Market Segments</p>', unsafe_allow_html=True)
            segment_counts = filtered_data['market_segment'].value_counts()
            fig_segment = px.bar(
                x=segment_counts.values,
                y=segment_counts.index,
                title="Lots by Market Segment",
                orientation='h'
            )
            fig_segment.update_traces(marker_color='#6366F1', marker_line_color='#4F46E5', marker_line_width=1.5)
            fig_segment.update_layout(
                xaxis_title="Number of Lots",
                yaxis_title="Market Segment",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0'),
                yaxis=dict(gridcolor='#E2E8F0'),
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_segment, use_container_width=True)
    
    with col2:
        if 'value_category' in filtered_data.columns:
            st.markdown('<p style="color: #475569; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem;">💰 Value Distribution</p>', unsafe_allow_html=True)
            value_data = filtered_data.groupby('value_category')['total_cost'].sum()
            fig_value = px.funnel(
                y=value_data.index,
                x=value_data.values,
                title="Total Value by Category"
            )
            fig_value.update_traces(marker_color=['#10B981', '#F59E0B', '#EF4444'])
            fig_value.update_layout(
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                title_font=dict(size=15, color="#0F172A", family="Inter, sans-serif", weight=600),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(t=40, b=40, l=40, r=20)
            )
            st.plotly_chart(fig_value, use_container_width=True)
    
    # Summary Statistics Table
    st.markdown("---")
    st.markdown("### 📊 Summary Statistics")
    st.markdown('<p style="color: #5F6368; font-size: 0.9rem; margin-bottom: 1rem;">Detailed breakdown by region with key performance metrics</p>', unsafe_allow_html=True)
    
    if len(filtered_data) > 0:
        # Create summary by region
        if 'region_category' in filtered_data.columns:
            summary_stats = filtered_data.groupby('region_category').agg({
                'volume': ['sum', 'count'],
                'price_per_kg': 'mean',
                'total_cost': 'sum',
                'quality_score': 'mean' if 'quality_score' in filtered_data.columns else lambda x: 0,
                'estimated_farmers': 'sum' if 'estimated_farmers' in filtered_data.columns else lambda x: 0
            }).round(2)
            
            # Flatten column names
            summary_stats.columns = ['Total Volume (kg)', 'Number of Lots', 'Avg Price/kg ($)', 
                                   'Total Cost ($)', 'Avg Quality Score', 'Total Farmers']
            
            st.dataframe(summary_stats, use_container_width=True)
        else:
            # Basic summary if no region data
            basic_stats = {
                'Total Lots': len(filtered_data),
                'Total Volume (kg)': filtered_data['volume'].sum() if 'volume' in filtered_data.columns else 0,
                'Average Price/kg ($)': filtered_data['price_per_kg'].mean() if 'price_per_kg' in filtered_data.columns else 0,
                'Total Cost ($)': filtered_data['total_cost'].sum() if 'total_cost' in filtered_data.columns else 0
            }
            st.json(basic_stats)
    
    # Export Options
    st.markdown("---")
    st.markdown("### 📤 Export Reports")
    st.markdown('<p style="color: #5F6368; font-size: 0.9rem; margin-bottom: 1rem;">Download your data in multiple formats for offline analysis and reporting</p>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # CSV Export
        csv_data = filtered_data.to_csv(index=False)
        st.download_button(
            label="Download CSV",
            data=csv_data,
            file_name=f"coffee_inventory_{pd.Timestamp.now().strftime('%Y%m%d')}.csv",
            mime="text/csv"
        )
    
    with col2:
        # Excel Export
        from utils.report_generator import ReportGenerator
        try:
            report_gen = ReportGenerator()
            excel_data = report_gen.generate_excel_report(filtered_data)
            st.download_button(
                label="Download Excel Report",
                data=excel_data,
                file_name=f"coffee_inventory_report_{pd.Timestamp.now().strftime('%Y%m%d')}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        except Exception as e:
            st.error(f"Error generating Excel report: {str(e)}")
    
    with col3:
        # PDF Export
        try:
            report_gen = ReportGenerator()
            pdf_data = report_gen.generate_pdf_report(filtered_data)
            st.download_button(
                label="Download PDF Report",
                data=pdf_data,
                file_name=f"coffee_inventory_analysis_{pd.Timestamp.now().strftime('%Y%m%d')}.pdf",
                mime="application/pdf"
            )
        except Exception as e:
            st.error(f"Error generating PDF report: {str(e)}")
