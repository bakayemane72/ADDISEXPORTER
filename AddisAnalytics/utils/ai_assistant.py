import os
import json
import pandas as pd
from openai import OpenAI

class AIAssistant:
    """AI-powered chat assistant for coffee data analysis"""
    
    def __init__(self):
        # the newest OpenAI model is "gpt-5" which was released August 7, 2025.
        # do not change this unless explicitly requested by the user
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-5"
        self.data_context = None
        
    def set_data_context(self, data):
        """Set the coffee data context for the AI assistant"""
        self.data_context = data
        
    def ask_question(self, question):
        """Process user question and return data-based answer"""
        try:
            if self.data_context is None or len(self.data_context) == 0:
                return "No data available. Please upload coffee inventory data first."
            
            # Create data summary for context
            data_summary = self._create_data_summary()
            
            # Create system prompt
            system_prompt = f"""
            You are an AI assistant specialized in Ethiopian coffee export data analysis. 
            You have access to coffee inventory data with the following information:
            
            {data_summary}
            
            Analyze the data and answer questions about:
            - Coffee lots, regions, processing methods
            - Prices, volumes, and costs
            - Quality scores and farmer information
            - Export readiness and inventory status
            
            Provide specific, data-driven answers. If you need to perform calculations, 
            show the numbers. Be conversational but professional.
            
            When referring to coffee regions, use Ethiopian coffee terminology.
            """
            
            user_prompt = f"""
            Based on the coffee inventory data provided, please answer this question:
            {question}
            
            If the question requires specific data analysis, provide exact numbers and calculations.
            If asking for comparisons, show the comparison clearly.
            If asking for filtering or searching, provide the matching results.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_completion_tokens=2048
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Sorry, I encountered an error while processing your question: {str(e)}"
    
    def _create_data_summary(self):
        """Create a comprehensive summary of the data for AI context"""
        try:
            data = self.data_context
            
            summary = {
                "total_lots": len(data),
                "regions": data['region_category'].value_counts().to_dict() if 'region_category' in data.columns else {},
                "processing_methods": data['processing_category'].value_counts().to_dict() if 'processing_category' in data.columns else {},
                "price_tiers": data['price_tier'].value_counts().to_dict() if 'price_tier' in data.columns else {},
                "status_distribution": data['status'].value_counts().to_dict() if 'status' in data.columns else {},
                "total_volume": data['volume'].sum() if 'volume' in data.columns else 0,
                "average_price": data['price_per_kg'].mean() if 'price_per_kg' in data.columns else 0,
                "total_cost": data['total_cost'].sum() if 'total_cost' in data.columns else 0,
                "altitude_ranges": data['altitude_range'].value_counts().to_dict() if 'altitude_range' in data.columns else {},
                "export_ready_volume": data[data['status'] == 'Export Ready']['volume'].sum() if 'volume' in data.columns and 'status' in data.columns else 0,
                "estimated_farmers": data['estimated_farmers'].sum() if 'estimated_farmers' in data.columns else 0
            }
            
            # Add sample data for context
            sample_data = data.head(3)[['lot_id', 'region_category', 'processing_category', 'volume', 'price_per_kg', 'status']].to_dict('records')
            summary['sample_lots'] = sample_data
            
            # Calculate additional insights
            if 'region_category' in data.columns and 'price_per_kg' in data.columns:
                avg_price_by_region = data.groupby('region_category')['price_per_kg'].mean().to_dict()
                summary['avg_price_by_region'] = avg_price_by_region
            
            if 'processing_category' in data.columns and 'volume' in data.columns:
                volume_by_processing = data.groupby('processing_category')['volume'].sum().to_dict()
                summary['volume_by_processing'] = volume_by_processing
            
            return json.dumps(summary, indent=2)
            
        except Exception as e:
            return f"Error creating data summary: {str(e)}"
    
    def suggest_questions(self):
        """Suggest relevant questions based on available data"""
        if self.data_context is None or len(self.data_context) == 0:
            return ["Please upload coffee inventory data to get question suggestions."]
        
        suggestions = [
            "Which region has the highest average price per kg?",
            "How many lots are export ready?",
            "What's the total volume of washed coffee?",
            "Show me all natural lots from Guji above 1900m altitude",
            "What's the price distribution across different processing methods?",
            "How many smallholder farmers are represented in the inventory?",
            "Which processing method has the highest quality scores?",
            "What's the total purchase cost for premium tier coffees?",
            "Show me the volume breakdown by region",
            "Which lots have the highest quality scores?"
        ]
        
        return suggestions
    
    def analyze_data_trends(self):
        """Provide automatic analysis of data trends"""
        try:
            if self.data_context is None or len(self.data_context) == 0:
                return "No data available for analysis."
            
            data = self.data_context
            
            analysis_prompt = f"""
            Analyze the following Ethiopian coffee inventory data and provide key insights:
            
            Data Summary:
            {self._create_data_summary()}
            
            Provide a concise analysis covering:
            1. Regional distribution and pricing patterns
            2. Processing method preferences and volumes
            3. Quality distribution and premium lots
            4. Export readiness status
            5. Key recommendations for the exporter
            
            Keep the analysis professional and actionable.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a coffee industry analyst specializing in Ethiopian coffee exports."},
                    {"role": "user", "content": analysis_prompt}
                ],
                max_completion_tokens=2048
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error analyzing data trends: {str(e)}"
    
    def get_specific_data(self, query):
        """Get specific data based on query parameters"""
        try:
            data = self.data_context
            
            # Common query patterns
            query_lower = query.lower()
            
            if 'export ready' in query_lower:
                export_ready = data[data['status'] == 'Export Ready']
                return f"Export Ready Lots: {len(export_ready)} lots, Total Volume: {export_ready['volume'].sum():.0f} kg"
            
            if 'highest price' in query_lower and 'region' in query_lower:
                if 'region_category' in data.columns and 'price_per_kg' in data.columns:
                    avg_prices = data.groupby('region_category')['price_per_kg'].mean().sort_values(ascending=False)
                    top_region = avg_prices.index[0]
                    top_price = avg_prices.iloc[0]
                    return f"Highest average price by region: {top_region} at ${top_price:.2f}/kg"
            
            if 'washed' in query_lower and 'coffee' in query_lower:
                washed_coffee = data[data['processing_category'] == 'Washed'] if 'processing_category' in data.columns else pd.DataFrame()
                return f"Washed Coffee: {len(washed_coffee)} lots, Total Volume: {washed_coffee['volume'].sum():.0f} kg"
            
            # If no specific pattern matched, use general AI processing
            return self.ask_question(query)
            
        except Exception as e:
            return f"Error retrieving specific data: {str(e)}"
