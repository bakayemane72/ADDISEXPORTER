import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

class EnterpriseAnalytics:
    """
    Advanced analytics engine for coffee export operations
    Provides quality analysis, inventory tracking, commercial insights, and operational metrics
    """
    
    def __init__(self, data):
        self.data = data
    
    def quality_dashboard_data(self):
        """Generate quality analytics: cupping trends, moisture analysis, defect tracking"""
        analytics = {}
        
        # Cupping trend by region
        if 'sca_total_score' in self.data.columns and 'region' in self.data.columns:
            analytics['regional_quality'] = self.data.groupby('region').agg({
                'sca_total_score': ['mean', 'std', 'count'],
                'aroma_score': 'mean' if 'aroma_score' in self.data.columns else lambda x: 0,
                'acidity_score': 'mean' if 'acidity_score' in self.data.columns else lambda x: 0,
                'body_score': 'mean' if 'body_score' in self.data.columns else lambda x: 0
            }).round(2)
        
        # Moisture vs Score correlation
        if 'moisture_pct' in self.data.columns and 'sca_total_score' in self.data.columns:
            analytics['moisture_quality_corr'] = self.data[[
                'moisture_pct', 'sca_total_score'
            ]].corr().iloc[0, 1]
        
        # Processing method quality comparison
        if 'processing_method' in self.data.columns and 'sca_total_score' in self.data.columns:
            analytics['processing_quality'] = self.data.groupby('processing_method').agg({
                'sca_total_score': ['mean', 'min', 'max', 'count']
            }).round(2)
        
        # Defect analysis
        if 'defects_count' in self.data.columns:
            analytics['defect_stats'] = {
                'avg_defects': self.data['defects_count'].mean(),
                'high_defect_lots': (self.data['defects_count'] > 10).sum(),
                'zero_defect_lots': (self.data['defects_count'] == 0).sum()
            }
        
        # Quality grade distribution
        if 'quality_grade' in self.data.columns:
            analytics['grade_distribution'] = self.data['quality_grade'].value_counts().to_dict()
        
        return analytics
    
    def inventory_dashboard_data(self):
        """Track inventory by status, warehouse aging, and commitments"""
        analytics = {}
        
        # Status breakdown
        if 'shipment_status' in self.data.columns:
            analytics['status_summary'] = self.data.groupby('shipment_status').agg({
                'contracted_qty_kg': 'sum' if 'contracted_qty_kg' in self.data.columns else lambda x: 0,
                'lot_id': 'count'
            })
        
        # Warehouse aging analysis
        if 'warehouse_days' in self.data.columns:
            aging_bins = [0, 30, 60, 90, 180, 365, float('inf')]
            aging_labels = ['<30 days', '30-60', '60-90', '90-180', '180-365', '>365']
            analytics['warehouse_aging'] = pd.cut(
                self.data['warehouse_days'],
                bins=aging_bins,
                labels=aging_labels
            ).value_counts().to_dict()
        
        # Available vs committed
        if 'contracted_qty_kg' in self.data.columns and 'shipped_qty_kg' in self.data.columns:
            total_contracted = self.data['contracted_qty_kg'].sum()
            total_shipped = self.data['shipped_qty_kg'].sum()
            analytics['commitment_status'] = {
                'total_contracted_kg': total_contracted,
                'total_shipped_kg': total_shipped,
                'pending_kg': total_contracted - total_shipped,
                'fulfillment_rate_pct': (total_shipped / total_contracted * 100) if total_contracted > 0 else 0
            }
        
        # Warehouse location distribution
        if 'warehouse_location' in self.data.columns:
            analytics['warehouse_distribution'] = self.data.groupby('warehouse_location').agg({
                'contracted_qty_kg': 'sum' if 'contracted_qty_kg' in self.data.columns else lambda x: 0,
                'lot_id': 'count'
            })
        
        return analytics
    
    def commercial_dashboard_data(self):
        """Analyze cost stacks, margins, FX impact, and pricing waterfalls"""
        analytics = {}
        
        # Cost stack analysis
        cost_components = ['farmgate_price_etb_kg', 'processing_cost_etb', 
                          'milling_cost_etb', 'transport_cost_etb']
        available_costs = [c for c in cost_components if c in self.data.columns]
        
        if available_costs:
            analytics['avg_cost_stack'] = {
                comp: self.data[comp].mean() for comp in available_costs
            }
        
        # Margin analysis
        if 'margin_pct' in self.data.columns:
            analytics['margin_stats'] = {
                'avg_margin_pct': self.data['margin_pct'].mean(),
                'median_margin_pct': self.data['margin_pct'].median(),
                'min_margin_pct': self.data['margin_pct'].min(),
                'max_margin_pct': self.data['margin_pct'].max()
            }
        
        # Margin by region
        if 'margin_etb_kg' in self.data.columns and 'region' in self.data.columns:
            analytics['regional_margins'] = self.data.groupby('region')['margin_etb_kg'].mean().to_dict()
        
        # FX impact analysis
        if 'fx_rate_etb_usd' in self.data.columns:
            analytics['fx_stats'] = {
                'avg_rate': self.data['fx_rate_etb_usd'].mean(),
                'current_rate': self.data['fx_rate_etb_usd'].iloc[-1] if len(self.data) > 0 else 0,
                'rate_volatility': self.data['fx_rate_etb_usd'].std()
            }
        
        # Pricing waterfall (farmgate → FOB → sale)
        if all(c in self.data.columns for c in ['farmgate_price_etb_kg', 'fob_price_etb_kg', 'sale_price_usd_lb']):
            analytics['pricing_waterfall'] = {
                'avg_farmgate_etb_kg': self.data['farmgate_price_etb_kg'].mean(),
                'avg_fob_etb_kg': self.data['fob_price_etb_kg'].mean(),
                'avg_markup_farmgate_to_fob': (
                    (self.data['fob_price_etb_kg'].mean() - self.data['farmgate_price_etb_kg'].mean()) / 
                    self.data['farmgate_price_etb_kg'].mean() * 100
                )
            }
        
        # Buyer performance
        if 'buyer_name' in self.data.columns and 'contracted_qty_kg' in self.data.columns:
            analytics['top_buyers'] = self.data.groupby('buyer_name').agg({
                'contracted_qty_kg': 'sum',
                'fob_price_usd_lb': 'mean' if 'fob_price_usd_lb' in self.data.columns else lambda x: 0,
                'lot_id': 'count'
            }).sort_values('contracted_qty_kg', ascending=False).head(10)
        
        return analytics
    
    def operations_dashboard_data(self):
        """Track lead times, on-time performance, and document completeness"""
        analytics = {}
        
        # Lead time analysis
        if 'milling_date' in self.data.columns and 'etd_date' in self.data.columns:
            self.data['milling_date_dt'] = pd.to_datetime(self.data['milling_date'], errors='coerce')
            self.data['etd_date_dt'] = pd.to_datetime(self.data['etd_date'], errors='coerce')
            self.data['lead_time_days'] = (self.data['etd_date_dt'] - 
                                           self.data['milling_date_dt']).dt.days
            
            analytics['lead_time_stats'] = {
                'avg_days': self.data['lead_time_days'].mean(),
                'median_days': self.data['lead_time_days'].median(),
                'min_days': self.data['lead_time_days'].min(),
                'max_days': self.data['lead_time_days'].max()
            }
        
        # On-time-in-full (OTIF) performance
        if 'eta_date' in self.data.columns and 'milestone_date' in self.data.columns:
            self.data['eta_date_dt'] = pd.to_datetime(self.data['eta_date'], errors='coerce')
            self.data['actual_arrival_dt'] = pd.to_datetime(self.data['milestone_date'], errors='coerce')
            
            delivered_shipments = self.data[self.data['shipment_status'] == 'Delivered']
            if len(delivered_shipments) > 0:
                on_time = (delivered_shipments['actual_arrival_dt'] <= 
                          delivered_shipments['eta_date_dt']).sum()
                analytics['otif_rate'] = (on_time / len(delivered_shipments) * 100)
        
        # Document completeness
        if 'doc_completeness_score' in self.data.columns:
            analytics['doc_completeness'] = {
                'avg_score': self.data['doc_completeness_score'].mean(),
                'fully_complete': (self.data['doc_completeness_score'] == 100).sum(),
                'missing_docs': (self.data['doc_completeness_score'] < 80).sum()
            }
        
        # Milestone tracking
        if 'last_milestone' in self.data.columns:
            analytics['milestone_distribution'] = self.data['last_milestone'].value_counts().to_dict()
        
        return analytics
    
    def generate_quality_charts(self):
        """Create Plotly charts for quality dashboard"""
        charts = []
        
        # Chart 1: Cupping score heatmap by region and processing
        if all(c in self.data.columns for c in ['region', 'processing_method', 'sca_total_score']):
            pivot = self.data.pivot_table(
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
                textfont={"size": 12},
                colorbar=dict(title="SCA Score")
            ))
            
            fig.update_layout(
                title="Quality Heatmap: SCA Score by Region & Processing",
                xaxis_title="Processing Method",
                yaxis_title="Region",
                font=dict(family="Inter, sans-serif", size=12),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                height=400
            )
            
            charts.append(('quality_heatmap', fig))
        
        # Chart 2: Moisture vs Quality scatter
        if 'moisture_pct' in self.data.columns and 'sca_total_score' in self.data.columns:
            fig = px.scatter(
                self.data,
                x='moisture_pct',
                y='sca_total_score',
                color='processing_method' if 'processing_method' in self.data.columns else None,
                size='contracted_qty_kg' if 'contracted_qty_kg' in self.data.columns else None,
                hover_data=['lot_id', 'region'],
                title="Moisture Content vs Quality Score",
                color_discrete_sequence=['#6366F1', '#8B5CF6', '#10B981', '#F59E0B']
            )
            
            fig.update_layout(
                font=dict(family="Inter, sans-serif", size=12),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                height=400
            )
            
            charts.append(('moisture_quality', fig))
        
        return charts
    
    def generate_inventory_charts(self):
        """Create Plotly charts for inventory dashboard"""
        charts = []
        
        # Warehouse aging chart
        if 'warehouse_days' in self.data.columns:
            fig = px.histogram(
                self.data,
                x='warehouse_days',
                nbins=20,
                title="Warehouse Aging Distribution",
                color_discrete_sequence=['#6366F1']
            )
            
            fig.update_layout(
                xaxis_title="Days in Warehouse",
                yaxis_title="Number of Lots",
                font=dict(family="Inter, sans-serif", size=12),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                height=400
            )
            
            charts.append(('warehouse_aging', fig))
        
        # Status timeline
        if 'shipment_status' in self.data.columns:
            status_counts = self.data['shipment_status'].value_counts()
            
            fig = go.Figure(data=[go.Funnel(
                y=status_counts.index,
                x=status_counts.values,
                textinfo="value+percent initial"
            )])
            
            fig.update_layout(
                title="Shipment Pipeline Status",
                font=dict(family="Inter, sans-serif", size=12),
                paper_bgcolor='rgba(0,0,0,0)',
                height=400
            )
            
            charts.append(('status_funnel', fig))
        
        return charts
