import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from utils.enterprise_analytics import EnterpriseAnalytics

def render_quality_dashboard(data):
    """Render enterprise quality analytics dashboard"""
    
    st.markdown('<h2>☕ Quality Intelligence Dashboard</h2>', unsafe_allow_html=True)
    st.markdown("""
    <div style="background: linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 100%); padding: 1.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(99,102,241,0.05);">
        <p style="color: #64748B; margin: 0; font-size: 0.9375rem; line-height: 1.6; font-weight: 500;">
            <strong style="color: #6366F1;">Quality Analysis:</strong> Comprehensive cupping scores, moisture tracking, defect analysis, and regional quality benchmarking
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    analytics = EnterpriseAnalytics(data)
    quality_data = analytics.quality_dashboard_data()
    
    # KPIs
    st.markdown("### 📊 Quality KPIs")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        avg_sca = data['sca_total_score'].mean() if 'sca_total_score' in data.columns else 0
        st.metric("Average SCA Score", f"{avg_sca:.1f}", "Industry-leading" if avg_sca > 85 else "")
    
    with col2:
        specialty_count = (data['sca_total_score'] >= 87).sum() if 'sca_total_score' in data.columns else 0
        st.metric("Specialty Lots", f"{specialty_count}", f"{specialty_count/len(data)*100:.0f}% of total")
    
    with col3:
        avg_moisture = data['moisture_pct'].mean() if 'moisture_pct' in data.columns else 0
        st.metric("Avg Moisture %", f"{avg_moisture:.1f}%", "✓ Optimal" if 10.5 <= avg_moisture <= 12 else "⚠️ Check")
    
    with col4:
        zero_defects = (data['defects_count'] == 0).sum() if 'defects_count' in data.columns else 0
        st.metric("Zero Defect Lots", f"{zero_defects}", f"{zero_defects/len(data)*100:.0f}%")
    
    st.markdown("---")
    
    # Cupping Score Analysis
    st.markdown("### 🎯 Cupping Score Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # SCA Score Distribution
        if 'sca_total_score' in data.columns:
            fig = px.histogram(
                data,
                x='sca_total_score',
                nbins=15,
                title="SCA Score Distribution",
                color_discrete_sequence=['#6366F1']
            )
            fig.add_vline(x=87, line_dash="dash", line_color="#10B981", 
                         annotation_text="Specialty Threshold (87)")
            fig.update_layout(
                xaxis_title="SCA Total Score",
                yaxis_title="Number of Lots",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0'),
                yaxis=dict(gridcolor='#E2E8F0'),
                height=400
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Regional Quality Comparison
        if 'region' in data.columns and 'sca_total_score' in data.columns:
            regional_scores = data.groupby('region')['sca_total_score'].mean().sort_values(ascending=True)
            
            fig = go.Figure(go.Bar(
                x=regional_scores.values,
                y=regional_scores.index,
                orientation='h',
                marker_color=regional_scores.values,
                marker_colorscale=[[0, '#EF4444'], [0.5, '#F59E0B'], [1, '#10B981']],
                marker_line_color='#E2E8F0',
                marker_line_width=1,
                text=regional_scores.values.round(1),
                textposition='outside'
            ))
            
            fig.update_layout(
                title="Average Quality Score by Region",
                xaxis_title="Average SCA Score",
                yaxis_title="Region",
                font=dict(family="Inter, sans-serif", size=12, color="#1E293B"),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0'),
                height=400
            )
            st.plotly_chart(fig, use_container_width=True)
    
    # Quality Heatmap
    st.markdown("---")
    st.markdown("### 🔥 Quality Heatmap: Region × Processing Method")
    
    if all(c in data.columns for c in ['region', 'processing_method', 'sca_total_score']):
        pivot = data.pivot_table(
            values='sca_total_score',
            index='region',
            columns='processing_method',
            aggfunc='mean'
        )
        
        fig = go.Figure(data=go.Heatmap(
            z=pivot.values,
            x=pivot.columns,
            y=pivot.index,
            colorscale='RdYlGn',
            text=pivot.values.round(1),
            texttemplate='%{text}',
            textfont={"size": 11, "color": "#0F172A"},
            colorbar=dict(title="SCA Score", titlefont=dict(size=12))
        ))
        
        fig.update_layout(
            title="Average SCA Scores by Region and Processing Method",
            xaxis_title="Processing Method",
            yaxis_title="Region",
            font=dict(family="Inter, sans-serif", size=12),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            height=450
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    # Cupping Profile Breakdown
    st.markdown("---")
    st.markdown("### 📈 Detailed Cupping Profile")
    
    cupping_attributes = ['aroma_score', 'acidity_score', 'body_score', 'aftertaste_score', 'uniformity_score']
    available_attrs = [attr for attr in cupping_attributes if attr in data.columns]
    
    if available_attrs:
        avg_scores = {attr.replace('_score', '').title(): data[attr].mean() for attr in available_attrs}
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatterpolar(
            r=list(avg_scores.values()),
            theta=list(avg_scores.keys()),
            fill='toself',
            name='Average Profile',
            line_color='#6366F1',
            fillcolor='rgba(99, 102, 241, 0.2)'
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[6, 10],
                    gridcolor='#E2E8F0'
                ),
                bgcolor='rgba(0,0,0,0)'
            ),
            title="Average Cupping Attribute Scores",
            font=dict(family="Inter, sans-serif", size=12),
            paper_bgcolor='rgba(0,0,0,0)',
            height=450
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    # Moisture Analysis
    st.markdown("---")
    st.markdown("### 💧 Moisture Content Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if 'moisture_pct' in data.columns:
            fig = px.box(
                data,
                y='moisture_pct',
                x='processing_method' if 'processing_method' in data.columns else None,
                title="Moisture Distribution by Processing Method",
                color='processing_method' if 'processing_method' in data.columns else None,
                color_discrete_sequence=['#6366F1', '#8B5CF6', '#10B981', '#F59E0B']
            )
            
            fig.add_hline(y=11.5, line_dash="dash", line_color="#10B981", 
                         annotation_text="Target: 11.5%")
            fig.add_hline(y=12, line_dash="dash", line_color="#EF4444",
                         annotation_text="Max: 12%")
            
            fig.update_layout(
                yaxis_title="Moisture %",
                font=dict(family="Inter, sans-serif", size=12),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(gridcolor='#E2E8F0'),
                height=400
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        if 'moisture_pct' in data.columns and 'sca_total_score' in data.columns:
            fig = px.scatter(
                data,
                x='moisture_pct',
                y='sca_total_score',
                color='region' if 'region' in data.columns else None,
                size='contracted_qty_kg' if 'contracted_qty_kg' in data.columns else None,
                title="Moisture vs Quality Correlation",
                hover_data=['lot_id'],
                color_discrete_sequence=['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
            )
            
            fig.update_layout(
                xaxis_title="Moisture %",
                yaxis_title="SCA Score",
                font=dict(family="Inter, sans-serif", size=12),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(gridcolor='#E2E8F0'),
                yaxis=dict(gridcolor='#E2E8F0'),
                height=400
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    # Data Table
    st.markdown("---")
    st.markdown("### 📋 Quality Details Table")
    
    if 'sca_total_score' in data.columns:
        quality_cols = ['lot_id', 'region', 'processing_method', 'sca_total_score', 
                       'moisture_pct', 'quality_grade']
        available_cols = [col for col in quality_cols if col in data.columns]
        
        quality_table = data[available_cols].sort_values('sca_total_score', ascending=False)
        st.dataframe(quality_table.head(20), use_container_width=True, height=400)
