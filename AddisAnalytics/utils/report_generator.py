import pandas as pd
import io
import base64
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px
from fpdf import FPDF
import json

class ReportGenerator:
    """Generate reports in various formats (PDF, Excel, CSV)"""
    
    def __init__(self):
        self.company_name = "Addis Exporter Analytics"
        self.report_date = datetime.now().strftime("%Y-%m-%d")
    
    def generate_excel_report(self, data, include_charts=True):
        """Generate comprehensive Excel report"""
        try:
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Main data sheet
                data.to_excel(writer, sheet_name='Coffee Inventory', index=False)
                
                # Summary sheet
                summary_data = self._create_summary_data(data)
                summary_df = pd.DataFrame(list(summary_data.items()), columns=['Metric', 'Value'])
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # Regional analysis
                if 'region_category' in data.columns:
                    regional_analysis = data.groupby('region_category').agg({
                        'volume': 'sum',
                        'price_per_kg': 'mean',
                        'total_cost': 'sum',
                        'quality_score': 'mean',
                        'estimated_farmers': 'sum'
                    }).round(2)
                    regional_analysis.to_excel(writer, sheet_name='Regional Analysis')
                
                # Processing method analysis
                if 'processing_category' in data.columns:
                    processing_analysis = data.groupby('processing_category').agg({
                        'volume': 'sum',
                        'price_per_kg': 'mean',
                        'total_cost': 'sum',
                        'quality_score': 'mean'
                    }).round(2)
                    processing_analysis.to_excel(writer, sheet_name='Processing Analysis')
                
                # Export ready lots
                if 'status' in data.columns:
                    export_ready = data[data['status'] == 'Export Ready']
                    export_ready.to_excel(writer, sheet_name='Export Ready', index=False)
            
            output.seek(0)
            return output.getvalue()
            
        except Exception as e:
            raise Exception(f"Error generating Excel report: {str(e)}")
    
    def generate_csv_report(self, data, report_type='full'):
        """Generate CSV report"""
        try:
            output = io.StringIO()
            
            if report_type == 'full':
                data.to_csv(output, index=False)
            elif report_type == 'summary':
                summary_data = self._create_summary_data(data)
                summary_df = pd.DataFrame(list(summary_data.items()), columns=['Metric', 'Value'])
                summary_df.to_csv(output, index=False)
            elif report_type == 'export_ready':
                export_ready = data[data['status'] == 'Export Ready'] if 'status' in data.columns else data
                export_ready.to_csv(output, index=False)
            
            return output.getvalue()
            
        except Exception as e:
            raise Exception(f"Error generating CSV report: {str(e)}")
    
    def generate_pdf_report(self, data):
        """Generate PDF report with charts and analysis"""
        try:
            # Create PDF
            pdf = FPDF()
            pdf.set_auto_page_break(auto=True, margin=15)
            
            # Title page
            pdf.add_page()
            pdf.set_font('Arial', 'B', 20)
            pdf.cell(0, 15, 'Coffee Inventory Analysis Report', 0, 1, 'C')
            
            pdf.set_font('Arial', '', 12)
            pdf.cell(0, 10, f'Company: {self.company_name}', 0, 1)
            pdf.cell(0, 10, f'Report Date: {self.report_date}', 0, 1)
            pdf.cell(0, 10, f'Total Lots Analyzed: {len(data)}', 0, 1)
            pdf.ln(10)
            
            # Executive Summary
            pdf.set_font('Arial', 'B', 16)
            pdf.cell(0, 10, 'Executive Summary', 0, 1)
            pdf.set_font('Arial', '', 11)
            
            summary_data = self._create_summary_data(data)
            
            # Key metrics
            pdf.cell(0, 8, f"Total Volume: {summary_data['Total Volume (kg)']:,.0f} kg", 0, 1)
            pdf.cell(0, 8, f"Total Purchase Cost: ${summary_data['Total Purchase Cost']:,.2f}", 0, 1)
            pdf.cell(0, 8, f"Average Price/kg: ${summary_data['Average Price per kg']:.2f}", 0, 1)
            pdf.cell(0, 8, f"Export Ready Volume: {summary_data['Export Ready Volume (kg)']:,.0f} kg", 0, 1)
            pdf.cell(0, 8, f"Estimated Farmers: {summary_data['Estimated Farmers']:,.0f}", 0, 1)
            pdf.ln(5)
            
            # Regional breakdown
            if 'region_category' in data.columns:
                pdf.set_font('Arial', 'B', 14)
                pdf.cell(0, 10, 'Regional Distribution', 0, 1)
                pdf.set_font('Arial', '', 10)
                
                regional_counts = data['region_category'].value_counts()
                for region, count in regional_counts.head(8).items():
                    percentage = (count / len(data)) * 100
                    pdf.cell(0, 6, f"{region}: {count} lots ({percentage:.1f}%)", 0, 1)
                pdf.ln(5)
            
            # Processing methods
            if 'processing_category' in data.columns:
                pdf.set_font('Arial', 'B', 14)
                pdf.cell(0, 10, 'Processing Methods', 0, 1)
                pdf.set_font('Arial', '', 10)
                
                processing_counts = data['processing_category'].value_counts()
                for method, count in processing_counts.items():
                    percentage = (count / len(data)) * 100
                    pdf.cell(0, 6, f"{method}: {count} lots ({percentage:.1f}%)", 0, 1)
                pdf.ln(5)
            
            # Quality analysis
            if 'quality_score' in data.columns:
                pdf.set_font('Arial', 'B', 14)
                pdf.cell(0, 10, 'Quality Analysis', 0, 1)
                pdf.set_font('Arial', '', 10)
                
                avg_quality = data['quality_score'].mean()
                max_quality = data['quality_score'].max()
                high_quality = len(data[data['quality_score'] >= 8])
                
                pdf.cell(0, 6, f"Average Quality Score: {avg_quality:.1f}/10", 0, 1)
                pdf.cell(0, 6, f"Maximum Quality Score: {max_quality:.1f}/10", 0, 1)
                pdf.cell(0, 6, f"High Quality Lots (8+): {high_quality} lots", 0, 1)
                pdf.ln(5)
            
            # Recommendations
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, 'Recommendations', 0, 1)
            pdf.set_font('Arial', '', 10)
            
            recommendations = self._generate_recommendations(data)
            for rec in recommendations:
                pdf.cell(0, 6, f"• {rec}", 0, 1)
            
            # Return PDF as bytes
            return pdf.output(dest='S').encode('latin1')
            
        except Exception as e:
            raise Exception(f"Error generating PDF report: {str(e)}")
    
    def _create_summary_data(self, data):
        """Create summary statistics"""
        summary = {
            'Total Lots': len(data),
            'Total Volume (kg)': data['volume'].sum() if 'volume' in data.columns else 0,
            'Total Purchase Cost': data['total_cost'].sum() if 'total_cost' in data.columns else 0,
            'Average Price per kg': data['price_per_kg'].mean() if 'price_per_kg' in data.columns else 0,
            'Export Ready Volume (kg)': data[data['status'] == 'Export Ready']['volume'].sum() if 'status' in data.columns and 'volume' in data.columns else 0,
            'Estimated Farmers': data['estimated_farmers'].sum() if 'estimated_farmers' in data.columns else 0,
            'Average Quality Score': data['quality_score'].mean() if 'quality_score' in data.columns else 0,
            'Unique Regions': data['region_category'].nunique() if 'region_category' in data.columns else 0,
            'Processing Methods': data['processing_category'].nunique() if 'processing_category' in data.columns else 0
        }
        
        return summary
    
    def _generate_recommendations(self, data):
        """Generate actionable recommendations based on data analysis"""
        recommendations = []
        
        try:
            # Quality recommendations
            if 'quality_score' in data.columns:
                avg_quality = data['quality_score'].mean()
                if avg_quality < 6:
                    recommendations.append("Consider quality improvement programs for coffee lots")
                elif avg_quality > 8:
                    recommendations.append("Excellent quality profile - market as premium coffee")
            
            # Regional recommendations
            if 'region_category' in data.columns and 'price_per_kg' in data.columns:
                regional_prices = data.groupby('region_category')['price_per_kg'].mean().sort_values(ascending=False)
                if len(regional_prices) > 1:
                    top_region = regional_prices.index[0]
                    recommendations.append(f"Focus sourcing on {top_region} region for premium pricing")
            
            # Volume recommendations
            if 'volume' in data.columns and 'status' in data.columns:
                export_ready_pct = len(data[data['status'] == 'Export Ready']) / len(data) * 100
                if export_ready_pct < 30:
                    recommendations.append("Accelerate processing to increase export-ready inventory")
                elif export_ready_pct > 70:
                    recommendations.append("Strong export readiness - consider expanding marketing efforts")
            
            # Processing recommendations
            if 'processing_category' in data.columns and 'price_per_kg' in data.columns:
                processing_prices = data.groupby('processing_category')['price_per_kg'].mean().sort_values(ascending=False)
                if len(processing_prices) > 1:
                    top_processing = processing_prices.index[0]
                    recommendations.append(f"Promote {top_processing} processing method for higher prices")
            
            # Default recommendations if analysis fails
            if not recommendations:
                recommendations = [
                    "Maintain detailed inventory tracking for better analysis",
                    "Focus on quality improvement and traceability",
                    "Diversify processing methods and regional sourcing"
                ]
                
        except Exception:
            recommendations = [
                "Continue monitoring inventory data for trends",
                "Focus on quality and traceability improvements",
                "Consider expanding data collection for better insights"
            ]
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def generate_traceability_report(self, batch_data):
        """Generate traceability report for specific batch"""
        try:
            report = {
                'batch_id': batch_data.get('batch_id', ''),
                'generation_date': datetime.now().isoformat(),
                'batch_info': {
                    'lot_id': batch_data.get('lot_id', ''),
                    'region': batch_data.get('region_category', batch_data.get('region', '')),
                    'farm_station': batch_data.get('farm_station', ''),
                    'altitude': batch_data.get('altitude', 0),
                    'processing_method': batch_data.get('processing_category', batch_data.get('processing_method', '')),
                    'volume': batch_data.get('volume', 0),
                    'quality_score': batch_data.get('quality_score', 0),
                    'estimated_farmers': batch_data.get('estimated_farmers', 0),
                    'status': batch_data.get('status', 'Unknown')
                }
            }
            
            return json.dumps(report, indent=2)
            
        except Exception as e:
            raise Exception(f"Error generating traceability report: {str(e)}")
