import pandas as pd
import numpy as np
from datetime import datetime
import os

class AICopilot:
    """
    AI-powered copilot features for coffee export operations
    Provides season summaries, pricing recommendations, auto-insights, and buyer briefs
    """
    
    def __init__(self, data):
        self.data = data
        self.openai_available = 'OPENAI_API_KEY' in os.environ
    
    def season_summary(self, current_year=None):
        """
        Generate comprehensive season summary with performance analysis and recommendations
        """
        if current_year is None:
            current_year = datetime.now().year
        
        current_season = self.data[self.data['harvest_year'] == current_year]
        previous_season = self.data[self.data['harvest_year'] == current_year - 1]
        
        summary = {
            'season': current_year,
            'overview': {},
            'performance_vs_last_year': {},
            'standout_lots': [],
            'risks': [],
            'recommendations': []
        }
        
        # Overview metrics
        if len(current_season) > 0:
            summary['overview'] = {
                'total_lots': len(current_season),
                'total_volume_kg': current_season['contracted_qty_kg'].sum() if 'contracted_qty_kg' in current_season.columns else 0,
                'avg_quality_score': current_season['sca_total_score'].mean() if 'sca_total_score' in current_season.columns else 0,
                'avg_fob_price': current_season['fob_price_usd_lb'].mean() if 'fob_price_usd_lb' in current_season.columns else 0,
                'top_region': current_season['region'].mode()[0] if 'region' in current_season.columns and len(current_season) > 0 else 'N/A'
            }
        
        # Year-over-year comparison
        if len(previous_season) > 0 and len(current_season) > 0:
            vol_change = ((current_season['contracted_qty_kg'].sum() - previous_season['contracted_qty_kg'].sum()) / 
                         previous_season['contracted_qty_kg'].sum() * 100) if 'contracted_qty_kg' in current_season.columns else 0
            
            quality_change = ((current_season['sca_total_score'].mean() - previous_season['sca_total_score'].mean())) if 'sca_total_score' in current_season.columns else 0
            
            price_change = ((current_season['fob_price_usd_lb'].mean() - previous_season['fob_price_usd_lb'].mean()) / 
                           previous_season['fob_price_usd_lb'].mean() * 100) if 'fob_price_usd_lb' in current_season.columns else 0
            
            summary['performance_vs_last_year'] = {
                'volume_change_pct': round(vol_change, 1),
                'quality_change_points': round(quality_change, 2),
                'price_change_pct': round(price_change, 1)
            }
        
        # Identify standout lots (top 10% quality)
        if 'sca_total_score' in current_season.columns and len(current_season) > 0:
            quality_threshold = current_season['sca_total_score'].quantile(0.9)
            standout = current_season[current_season['sca_total_score'] >= quality_threshold]
            
            summary['standout_lots'] = standout[[
                'lot_id', 'region', 'sca_total_score', 'processing_method'
            ]].head(10).to_dict('records') if all(c in standout.columns for c in ['lot_id', 'region', 'sca_total_score', 'processing_method']) else []
        
        # Risk identification
        if 'moisture_pct' in current_season.columns:
            high_moisture = (current_season['moisture_pct'] > 12).sum()
            if high_moisture > 0:
                summary['risks'].append(f"{high_moisture} lots have moisture >12% (risk of spoilage)")
        
        if 'warehouse_days' in current_season.columns:
            aged_inventory = (current_season['warehouse_days'] > 180).sum()
            if aged_inventory > 0:
                summary['risks'].append(f"{aged_inventory} lots aging >6 months in warehouse")
        
        if 'doc_completeness_score' in current_season.columns:
            incomplete_docs = (current_season['doc_completeness_score'] < 80).sum()
            if incomplete_docs > 0:
                summary['risks'].append(f"{incomplete_docs} lots with incomplete documentation")
        
        # Smart recommendations
        if 'processing_method' in current_season.columns and 'sca_total_score' in current_season.columns:
            processing_performance = current_season.groupby('processing_method')['sca_total_score'].mean()
            best_method = processing_performance.idxmax()
            summary['recommendations'].append(
                f"Focus on {best_method} processing (avg score: {processing_performance[best_method]:.1f})"
            )
        
        if 'margin_pct' in current_season.columns:
            low_margin_lots = (current_season['margin_pct'] < 10).sum()
            if low_margin_lots > 0:
                summary['recommendations'].append(
                    f"Review pricing for {low_margin_lots} lots with margins <10%"
                )
        
        if len(summary['risks']) == 0:
            summary['recommendations'].append("Strong performance - continue current practices")
        
        return summary
    
    def pricing_coach(self, lot_data):
        """
        Suggest minimum and target prices based on costs, quality, and benchmarks
        """
        if isinstance(lot_data, pd.Series):
            lot_data = lot_data.to_dict()
        
        pricing = {
            'lot_id': lot_data.get('lot_id', 'Unknown'),
            'cost_analysis': {},
            'quality_premium': {},
            'market_benchmark': {},
            'recommendations': {}
        }
        
        # Cost-based minimum price
        farmgate = lot_data.get('farmgate_price_etb_kg', 0)
        processing = lot_data.get('processing_cost_etb', 0)
        milling = lot_data.get('milling_cost_etb', 0)
        transport = lot_data.get('transport_cost_etb', 0)
        
        total_cost_etb_kg = farmgate + processing + milling + transport
        
        # Convert to USD/lb for FOB pricing
        fx_rate = lot_data.get('fx_rate_etb_usd', 115)  # Default ETB/USD rate
        cost_usd_kg = total_cost_etb_kg / fx_rate
        cost_usd_lb = cost_usd_kg / 2.20462
        
        pricing['cost_analysis'] = {
            'total_cost_etb_kg': round(total_cost_etb_kg, 2),
            'total_cost_usd_lb': round(cost_usd_lb, 2),
            'breakeven_fob_usd_lb': round(cost_usd_lb * 1.1, 2)  # 10% minimum margin
        }
        
        # Quality-based premium
        sca_score = lot_data.get('sca_total_score', 80)
        base_premium = 0
        
        if sca_score >= 87:
            base_premium = 1.50  # Specialty premium
        elif sca_score >= 85:
            base_premium = 0.75  # Premium
        elif sca_score >= 83:
            base_premium = 0.35  # High quality
        
        pricing['quality_premium'] = {
            'sca_score': sca_score,
            'premium_usd_lb': base_premium,
            'quality_tier': 'Specialty' if sca_score >= 87 else ('Premium' if sca_score >= 85 else 'High Quality')
        }
        
        # Market benchmark (from similar lots)
        region = lot_data.get('region', '')
        processing = lot_data.get('processing_method', '')
        
        similar_lots = self.data[
            (self.data['region'] == region) & 
            (self.data['processing_method'] == processing)
        ]
        
        if len(similar_lots) > 5 and 'fob_price_usd_lb' in similar_lots.columns:
            benchmark_price = similar_lots['fob_price_usd_lb'].median()
            pricing['market_benchmark'] = {
                'similar_lots_count': len(similar_lots),
                'median_price_usd_lb': round(benchmark_price, 2),
                'price_range': f"${similar_lots['fob_price_usd_lb'].quantile(0.25):.2f} - ${similar_lots['fob_price_usd_lb'].quantile(0.75):.2f}"
            }
        
        # Final recommendations
        min_price = pricing['cost_analysis']['breakeven_fob_usd_lb']
        target_price = min_price + base_premium
        
        if 'median_price_usd_lb' in pricing['market_benchmark']:
            market_price = pricing['market_benchmark']['median_price_usd_lb']
            target_price = max(target_price, market_price)
        
        pricing['recommendations'] = {
            'minimum_acceptable_usd_lb': round(min_price, 2),
            'target_price_usd_lb': round(target_price, 2),
            'optimal_range': f"${round(target_price * 0.95, 2)} - ${round(target_price * 1.1, 2)}",
            'rationale': f"Based on ${cost_usd_lb:.2f}/lb costs + ${base_premium:.2f} quality premium"
        }
        
        return pricing
    
    def auto_insights(self, uploaded_data):
        """
        Automatically generate insights from uploaded data: outliers, patterns, alerts
        """
        insights = {
            'outliers': [],
            'patterns': [],
            'alerts': [],
            'opportunities': []
        }
        
        # Outlier detection - Price
        if 'fob_price_usd_lb' in uploaded_data.columns:
            q1 = uploaded_data['fob_price_usd_lb'].quantile(0.25)
            q3 = uploaded_data['fob_price_usd_lb'].quantile(0.75)
            iqr = q3 - q1
            
            high_outliers = uploaded_data[uploaded_data['fob_price_usd_lb'] > q3 + 1.5 * iqr]
            low_outliers = uploaded_data[uploaded_data['fob_price_usd_lb'] < q1 - 1.5 * iqr]
            
            if len(high_outliers) > 0:
                insights['outliers'].append({
                    'type': 'High Price',
                    'count': len(high_outliers),
                    'lots': high_outliers['lot_id'].tolist()[:5] if 'lot_id' in high_outliers.columns else [],
                    'message': f"{len(high_outliers)} lots priced significantly above average (verify premium justification)"
                })
            
            if len(low_outliers) > 0:
                insights['outliers'].append({
                    'type': 'Low Price',
                    'count': len(low_outliers),
                    'lots': low_outliers['lot_id'].tolist()[:5] if 'lot_id' in low_outliers.columns else [],
                    'message': f"{len(low_outliers)} lots priced below market (potential opportunity or error)"
                })
        
        # Pattern detection - Regional performance
        if 'region' in uploaded_data.columns and 'sca_total_score' in uploaded_data.columns:
            regional_avg = uploaded_data.groupby('region')['sca_total_score'].agg(['mean', 'count'])
            top_region = regional_avg['mean'].idxmax()
            
            insights['patterns'].append({
                'type': 'Regional Excellence',
                'message': f"{top_region} shows highest quality (avg {regional_avg.loc[top_region, 'mean']:.1f} SCA points)",
                'recommendation': f"Expand sourcing from {top_region} region"
            })
        
        # Alert - Moisture risk
        if 'moisture_pct' in uploaded_data.columns:
            high_moisture = uploaded_data[uploaded_data['moisture_pct'] > 12]
            if len(high_moisture) > 0:
                insights['alerts'].append({
                    'severity': 'High',
                    'type': 'Moisture Risk',
                    'count': len(high_moisture),
                    'message': f"{len(high_moisture)} lots exceed 12% moisture - immediate action required",
                    'action': 'Re-dry or sell immediately to prevent mold'
                })
        
        # Opportunity - Underpriced quality
        if all(c in uploaded_data.columns for c in ['sca_total_score', 'fob_price_usd_lb']):
            high_quality = uploaded_data[uploaded_data['sca_total_score'] >= 87]
            if len(high_quality) > 0:
                avg_price_specialty = high_quality['fob_price_usd_lb'].mean()
                if avg_price_specialty < 5.0:
                    insights['opportunities'].append({
                        'type': 'Pricing Opportunity',
                        'message': f"{len(high_quality)} specialty lots (87+ SCA) priced at ${avg_price_specialty:.2f}/lb",
                        'potential': f"Could achieve $5.50-7.00/lb in specialty market",
                        'action': 'Target specialty roasters and direct trade channels'
                    })
        
        return insights
    
    def generate_buyer_brief(self, lot_id):
        """
        Generate one-page buyer brief with tasting notes, story, photos, QR code
        """
        lot = self.data[self.data['lot_id'] == lot_id]
        
        if len(lot) == 0:
            return {'error': f'Lot {lot_id} not found'}
        
        lot_data = lot.iloc[0]
        
        brief = {
            'lot_id': lot_id,
            'header': {
                'title': f"Ethiopian Coffee - Lot {lot_id}",
                'harvest_year': lot_data.get('harvest_year', 'N/A'),
                'region': lot_data.get('region', 'N/A'),
                'processing': lot_data.get('processing_method', 'N/A')
            },
            'origin_story': {
                'altitude': f"{lot_data.get('altitude_m', 0):.0f} meters above sea level",
                'variety': lot_data.get('variety', 'Heirloom'),
                'farm': lot_data.get('farm_name', 'Smallholder collective'),
                'zone': lot_data.get('zone', ''),
                'story': lot_data.get('story_text', f"Grown in the renowned {lot_data.get('region', 'Ethiopian')} region")
            },
            'cupping_profile': {
                'sca_score': lot_data.get('sca_total_score', 0),
                'aroma': lot_data.get('aroma_score', 0),
                'acidity': lot_data.get('acidity_score', 0),
                'body': lot_data.get('body_score', 0),
                'aftertaste': lot_data.get('aftertaste_score', 0),
                'notes': lot_data.get('cupping_notes', lot_data.get('flavor_profile', 'Complex and balanced')),
                'grade': lot_data.get('quality_grade', 'Premium')
            },
            'transparency': {
                'farmgate_price': f"{lot_data.get('farmgate_price_etb_kg', 0):.0f} ETB/kg",
                'fob_price_range': f"${lot_data.get('fob_price_usd_lb', 0) * 0.9:.2f} - ${lot_data.get('fob_price_usd_lb', 0) * 1.1:.2f}/lb",
                'certifications': [c for c in ['organic_cert', 'fairtrade_cert', 'rainforest_cert'] 
                                 if lot_data.get(c, False)],
                'farmer_count': int(lot_data.get('estimated_farmers', 0))
            },
            'availability': {
                'total_volume_kg': lot_data.get('contracted_qty_kg', 0),
                'available_kg': lot_data.get('contracted_qty_kg', 0) - lot_data.get('shipped_qty_kg', 0),
                'status': lot_data.get('shipment_status', 'Available'),
                'warehouse': lot_data.get('warehouse_location', 'Addis Ababa')
            },
            'contact': {
                'qr_code_url': lot_data.get('public_url', f'/trace/{lot_id}'),
                'producer_message': lot_data.get('producer_message', 'Direct from our farms to your roastery')
            }
        }
        
        return brief
