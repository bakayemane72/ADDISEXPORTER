import pandas as pd
import numpy as np

class CoffeeClassifier:
    """Classify coffee lots by region, processing method, price tier, and altitude"""
    
    def __init__(self):
        # Ethiopian coffee regions
        self.regions = {
            'sidamo': ['sidamo', 'sidama'],
            'guji': ['guji'],
            'yirgacheffe': ['yirgacheffe', 'yirga cheffe', 'yrgacheffe'],
            'jimma': ['jimma', 'jima'],
            'harar': ['harar', 'harrar'],
            'limu': ['limu'],
            'lekempti': ['lekempti', 'nekempte'],
            'bebeka': ['bebeka'],
            'tepi': ['tepi'],
            'kaffa': ['kaffa', 'kefa']
        }
        
        # Processing methods
        self.processing_methods = {
            'washed': ['washed', 'wet', 'fully washed'],
            'natural': ['natural', 'dry', 'sun dried'],
            'honey': ['honey', 'semi-washed', 'pulped natural'],
            'experimental': ['experimental', 'special', 'carbonic']
        }
    
    def classify_lots(self, data):
        """Classify all coffee lots with comprehensive attributes and advanced analytics"""
        classified_data = data.copy()
        
        # Core classifications
        classified_data['region_category'] = classified_data['region'].apply(self._classify_region)
        classified_data['processing_category'] = classified_data['processing_method'].apply(self._classify_processing)
        classified_data['price_tier'] = self._classify_price_tier(classified_data['price_per_kg'])
        classified_data['altitude_range'] = classified_data['altitude'].apply(self._classify_altitude)
        
        # Quality metrics
        classified_data['quality_score'] = self._calculate_quality_score(classified_data)
        classified_data['cup_score'] = self._estimate_cup_score(classified_data)
        classified_data['export_grade'] = self._determine_export_grade(classified_data)
        
        # Business analytics
        classified_data['estimated_farmers'] = classified_data['volume'].apply(self._estimate_farmer_count)
        classified_data['value_category'] = self._categorize_value(classified_data)
        classified_data['market_segment'] = self._identify_market_segment(classified_data)
        
        # Flavor profile prediction
        classified_data['flavor_profile'] = self._predict_flavor_profile(classified_data)
        
        # Processing insights
        classified_data['drying_days_est'] = classified_data['processing_category'].apply(self._estimate_drying_days)
        classified_data['target_moisture'] = 11.5  # Standard target for export
        
        # ROI and margin analysis
        classified_data['value_per_lot'] = classified_data['total_cost']
        classified_data['premium_potential'] = self._calculate_premium_potential(classified_data)
        
        return classified_data
    
    def _classify_region(self, region_name):
        """Classify region into standard Ethiopian coffee regions"""
        if pd.isna(region_name):
            return 'Unknown'
        
        region_lower = str(region_name).lower()
        
        for standard_region, variations in self.regions.items():
            for variation in variations:
                if variation in region_lower:
                    return standard_region.title()
        
        return 'Other'
    
    def _classify_processing(self, processing_method):
        """Classify processing method into standard categories"""
        if pd.isna(processing_method):
            return 'Unknown'
        
        method_lower = str(processing_method).lower()
        
        for standard_method, variations in self.processing_methods.items():
            for variation in variations:
                if variation in method_lower:
                    return standard_method.title()
        
        return 'Other'
    
    def _classify_price_tier(self, prices):
        """Classify prices into tiers (Low, Mid, Premium)"""
        if len(prices) == 0 or prices.isna().all():
            return ['Unknown'] * len(prices)
        
        # Calculate quartiles for price classification
        q25 = prices.quantile(0.25)
        q75 = prices.quantile(0.75)
        
        tiers = []
        for price in prices:
            if pd.isna(price) or price == 0:
                tiers.append('Unknown')
            elif price < q25:
                tiers.append('Low')
            elif price > q75:
                tiers.append('Premium')
            else:
                tiers.append('Mid')
        
        return tiers
    
    def _classify_altitude(self, altitude):
        """Classify altitude into ranges"""
        if pd.isna(altitude) or altitude == 0:
            return 'Unknown'
        
        if altitude < 1200:
            return 'Low (< 1200m)'
        elif altitude < 1600:
            return 'Medium (1200-1600m)'
        elif altitude < 2000:
            return 'High (1600-2000m)'
        else:
            return 'Very High (> 2000m)'
    
    def _calculate_quality_score(self, data):
        """Calculate quality score based on region and altitude"""
        scores = []
        
        # Region scoring
        region_scores = {
            'yirgacheffe': 9,
            'guji': 9,
            'sidamo': 8,
            'harar': 8,
            'limu': 7,
            'jimma': 6,
            'other': 5,
            'unknown': 3
        }
        
        # Altitude bonus
        for _, row in data.iterrows():
            base_score = region_scores.get(row['region_category'].lower(), 5)
            
            # Altitude bonus
            altitude = row['altitude']
            if altitude > 2000:
                altitude_bonus = 1
            elif altitude > 1600:
                altitude_bonus = 0.5
            else:
                altitude_bonus = 0
            
            # Processing method bonus
            processing_bonus = 0.5 if row['processing_category'].lower() == 'washed' else 0
            
            final_score = min(10, base_score + altitude_bonus + processing_bonus)
            scores.append(round(final_score, 1))
        
        return scores
    
    def _estimate_farmer_count(self, volume):
        """Estimate number of smallholder farmers based on volume"""
        if pd.isna(volume) or volume == 0:
            return 0
        
        # Assume average smallholder produces 500kg per season
        avg_production = 500
        farmers = max(1, int(volume / avg_production))
        
        return farmers
    
    def _estimate_cup_score(self, data):
        """Estimate SCA cup score based on quality metrics"""
        scores = []
        
        for _, row in data.iterrows():
            base_score = 80  # Baseline for Ethiopian specialty
            
            # Region contribution
            region_bonus = {
                'yirgacheffe': 4, 'guji': 4, 'sidamo': 3,
                'harar': 3, 'limu': 2, 'other': 0
            }
            base_score += region_bonus.get(row['region_category'].lower(), 0)
            
            # Altitude contribution
            if row['altitude'] > 2000:
                base_score += 2
            elif row['altitude'] > 1800:
                base_score += 1
            
            # Processing contribution
            if row['processing_category'].lower() == 'washed':
                base_score += 1
            
            scores.append(min(90, round(base_score, 1)))
        
        return scores
    
    def _determine_export_grade(self, data):
        """Determine Ethiopian export grade (Grade 1-5)"""
        grades = []
        
        for _, row in data.iterrows():
            cup_score = row.get('cup_score', 80)
            
            if cup_score >= 87:
                grades.append('Grade 1 (Specialty)')
            elif cup_score >= 85:
                grades.append('Grade 2 (Premium)')
            elif cup_score >= 83:
                grades.append('Grade 3 (High Quality)')
            elif cup_score >= 81:
                grades.append('Grade 4 (Good)')
            else:
                grades.append('Grade 5 (Standard)')
        
        return grades
    
    def _categorize_value(self, data):
        """Categorize lots by total value"""
        values = data['total_cost']
        q33, q66 = values.quantile(0.33), values.quantile(0.66)
        
        categories = []
        for val in values:
            if val >= q66:
                categories.append('High Value')
            elif val >= q33:
                categories.append('Medium Value')
            else:
                categories.append('Low Value')
        
        return categories
    
    def _identify_market_segment(self, data):
        """Identify target market segment"""
        segments = []
        
        for _, row in data.iterrows():
            cup_score = row.get('cup_score', 80)
            price = row.get('price_per_kg', 0)
            
            if cup_score >= 87 and price > 8:
                segments.append('Specialty/Single Origin')
            elif cup_score >= 85:
                segments.append('Premium Retail')
            elif cup_score >= 83:
                segments.append('Commercial Specialty')
            else:
                segments.append('Commodity/Bulk')
        
        return segments
    
    def _predict_flavor_profile(self, data):
        """Predict flavor profile based on region and processing"""
        profiles = []
        
        flavor_map = {
            'yirgacheffe': 'Floral, Citrus, Tea-like',
            'guji': 'Fruity, Wine-like, Complex',
            'sidamo': 'Balanced, Chocolate, Berry',
            'harar': 'Wine-like, Blueberry, Spice',
            'limu': 'Balanced, Sweet, Mild Acidity',
            'jimma': 'Earthy, Full-body, Low Acidity',
            'other': 'Varied, Regional Character'
        }
        
        for _, row in data.iterrows():
            region = row['region_category'].lower()
            processing = row['processing_category'].lower()
            
            base_profile = flavor_map.get(region, 'Regional Character')
            
            # Modify by processing
            if processing == 'natural':
                base_profile = f"{base_profile}, Fruity, Heavy Body"
            elif processing == 'honey':
                base_profile = f"{base_profile}, Sweet, Balanced"
            
            profiles.append(base_profile)
        
        return profiles
    
    def _estimate_drying_days(self, processing_method):
        """Estimate drying days required"""
        if pd.isna(processing_method):
            return 0
        
        drying_days = {
            'washed': '7-10 days',
            'natural': '21-30 days',
            'honey': '14-21 days',
            'experimental': '10-20 days'
        }
        
        return drying_days.get(processing_method.lower(), '14-21 days')
    
    def _calculate_premium_potential(self, data):
        """Calculate premium earning potential"""
        potentials = []
        
        for _, row in data.iterrows():
            base_premium = 0
            
            # Region premium
            if row['region_category'].lower() in ['yirgacheffe', 'guji']:
                base_premium += 15
            elif row['region_category'].lower() in ['sidamo', 'harar']:
                base_premium += 10
            
            # Altitude premium
            if row['altitude'] > 2000:
                base_premium += 10
            elif row['altitude'] > 1800:
                base_premium += 5
            
            # Processing premium
            if row['processing_category'].lower() in ['washed', 'experimental']:
                base_premium += 5
            
            potentials.append(f"+{base_premium}%")
        
        return potentials
    
    def get_classification_summary(self, data):
        """Get summary statistics of classifications"""
        summary = {}
        
        if 'region_category' in data.columns:
            summary['regions'] = data['region_category'].value_counts().to_dict()
        
        if 'processing_category' in data.columns:
            summary['processing_methods'] = data['processing_category'].value_counts().to_dict()
        
        if 'price_tier' in data.columns:
            summary['price_tiers'] = data['price_tier'].value_counts().to_dict()
        
        if 'altitude_range' in data.columns:
            summary['altitude_ranges'] = data['altitude_range'].value_counts().to_dict()
        
        if 'export_grade' in data.columns:
            summary['export_grades'] = data['export_grade'].value_counts().to_dict()
        
        if 'market_segment' in data.columns:
            summary['market_segments'] = data['market_segment'].value_counts().to_dict()
        
        return summary
