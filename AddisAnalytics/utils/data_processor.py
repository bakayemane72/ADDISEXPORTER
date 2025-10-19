import pandas as pd
import numpy as np
from datetime import datetime
import uuid
import io

class DataProcessor:
    """Process and clean coffee inventory data from Excel files - Robust and comprehensive"""
    
    def __init__(self):
        self.core_columns = [
            'lot_id', 'region', 'farm_station', 'altitude', 
            'processing_method', 'volume', 'price_per_kg'
        ]
        
    def process_excel_file(self, uploaded_file):
        """
        Extract ALL data from Excel file - supports multiple sheets
        Returns combined dataframe with all columns preserved
        """
        try:
            # Read ALL sheets from Excel file
            excel_file = pd.ExcelFile(uploaded_file)
            all_sheets_data = []
            
            for sheet_name in excel_file.sheet_names:
                # Read each sheet
                sheet_data = pd.read_excel(uploaded_file, sheet_name=sheet_name)
                
                # Skip empty sheets
                if len(sheet_data) == 0:
                    continue
                
                # Add sheet identifier if multiple sheets
                if len(excel_file.sheet_names) > 1:
                    sheet_data['source_sheet'] = sheet_name
                
                all_sheets_data.append(sheet_data)
            
            # Combine all sheets
            if len(all_sheets_data) == 0:
                raise Exception("No data found in Excel file")
            
            raw_data = pd.concat(all_sheets_data, ignore_index=True)
            
            # Process the combined data
            return self.process_data(raw_data)
            
        except Exception as e:
            raise Exception(f"Error reading Excel file: {str(e)}")
    
    def process_data(self, raw_data):
        """
        Process raw data and standardize it - PRESERVES ALL ORIGINAL COLUMNS
        """
        try:
            # Store original data
            original_columns = raw_data.columns.tolist()
            processed_data = raw_data.copy()
            
            # Normalize column names (create mapping)
            normalized_cols = processed_data.columns.str.lower().str.strip().str.replace(' ', '_').str.replace('-', '_')
            column_map = dict(zip(processed_data.columns, normalized_cols))
            processed_data = processed_data.rename(columns=column_map)
            
            # Map common column variations to standard names (while preserving originals)
            column_mapping = {
                'lot': 'lot_id',
                'batch_id': 'lot_id', 
                'batch': 'lot_id',
                'batch_number': 'lot_id',
                'lot_number': 'lot_id',
                'location': 'region',
                'area': 'region',
                'origin': 'region',
                'farm': 'farm_station',
                'station': 'farm_station',
                'washing_station': 'farm_station',
                'wet_mill': 'farm_station',
                'elevation': 'altitude',
                'height': 'altitude',
                'meters': 'altitude',
                'masl': 'altitude',
                'process': 'processing_method',
                'method': 'processing_method',
                'processing': 'processing_method',
                'weight': 'volume',
                'quantity': 'volume',
                'amount': 'volume',
                'kg': 'volume',
                'price': 'price_per_kg',
                'cost': 'price_per_kg',
                'unit_price': 'price_per_kg',
                'price_kg': 'price_per_kg'
            }
            
            # Apply mapping only if core column doesn't exist
            for old_col, new_col in column_mapping.items():
                if old_col in processed_data.columns and new_col not in processed_data.columns:
                    processed_data[new_col] = processed_data[old_col]
            
            # Generate lot_id if missing
            if 'lot_id' not in processed_data.columns:
                processed_data['lot_id'] = [f"LOT_{str(uuid.uuid4())[:8].upper()}" for _ in range(len(processed_data))]
            
            # Fill missing values for core columns only
            defaults = {
                'region': 'Unknown',
                'farm_station': 'Unknown',
                'altitude': 0,
                'processing_method': 'Unknown',
                'volume': 0,
                'price_per_kg': 0
            }
            
            for col, default_val in defaults.items():
                if col in processed_data.columns:
                    processed_data[col] = processed_data[col].fillna(default_val)
                else:
                    processed_data[col] = default_val
            
            # Clean and standardize data types
            processed_data = self._clean_data_types(processed_data)
            
            # Add calculated fields
            processed_data['total_cost'] = processed_data['volume'] * processed_data['price_per_kg']
            processed_data['batch_id'] = processed_data['lot_id']
            processed_data['status'] = self._determine_status(processed_data)
            processed_data['date_added'] = datetime.now().strftime('%Y-%m-%d')
            processed_data['timestamp'] = datetime.now()
            
            # Add unique identifier for each row
            processed_data['id'] = range(1, len(processed_data) + 1)
            
            return processed_data
            
        except Exception as e:
            raise Exception(f"Error processing data: {str(e)}")
    
    def _clean_data_types(self, data):
        """Clean and convert data types"""
        # Convert altitude to numeric
        if 'altitude' in data.columns:
            data['altitude'] = pd.to_numeric(data['altitude'], errors='coerce').fillna(0)
        
        # Convert volume to numeric
        if 'volume' in data.columns:
            data['volume'] = pd.to_numeric(data['volume'], errors='coerce').fillna(0)
        
        # Convert price to numeric
        if 'price_per_kg' in data.columns:
            data['price_per_kg'] = pd.to_numeric(data['price_per_kg'], errors='coerce').fillna(0)
        
        # Standardize text fields
        text_fields = ['region', 'farm_station', 'processing_method']
        for field in text_fields:
            if field in data.columns:
                data[field] = data[field].astype(str).str.title().str.strip()
        
        return data
    
    def _determine_status(self, data):
        """Determine processing status based on available data"""
        status_list = []
        for _, row in data.iterrows():
            if row['volume'] > 0 and row['price_per_kg'] > 0:
                # Simple logic: if volume > 100kg, consider export ready
                if row['volume'] >= 100:
                    status_list.append('Export Ready')
                else:
                    status_list.append('Processing')
            else:
                status_list.append('Farm')
        
        return status_list
    
    def validate_data(self, data):
        """Comprehensive data validation with detailed checks"""
        errors = []
        warnings = []
        
        # Check for empty data
        if len(data) == 0:
            errors.append("❌ No data rows found in file")
            return {'errors': errors, 'warnings': warnings, 'is_valid': False}
        
        # Check for required columns (soft check - will create if missing)
        missing_cols = [col for col in self.core_columns if col not in data.columns]
        if missing_cols:
            warnings.append(f"⚠️ Some standard columns missing (will be auto-generated): {', '.join(missing_cols)}")
        
        # Check for negative values
        if 'volume' in data.columns:
            negative_volumes = (data['volume'] < 0).sum()
            if negative_volumes > 0:
                errors.append(f"❌ Found {negative_volumes} negative volume values")
        
        if 'price_per_kg' in data.columns:
            negative_prices = (data['price_per_kg'] < 0).sum()
            if negative_prices > 0:
                errors.append(f"❌ Found {negative_prices} negative price values")
        
        # Check for suspicious data
        if 'altitude' in data.columns:
            extreme_alt = ((data['altitude'] > 3000) | ((data['altitude'] < 500) & (data['altitude'] > 0))).sum()
            if extreme_alt > 0:
                warnings.append(f"⚠️ {extreme_alt} lots have unusual altitude values (check if valid)")
        
        if 'price_per_kg' in data.columns:
            very_high_price = (data['price_per_kg'] > 50).sum()
            if very_high_price > 0:
                warnings.append(f"⚠️ {very_high_price} lots have unusually high prices (>$50/kg)")
        
        # Data quality score
        null_percentage = (data.isnull().sum().sum() / (len(data) * len(data.columns))) * 100
        if null_percentage > 20:
            warnings.append(f"⚠️ Data has {null_percentage:.1f}% missing values")
        
        return {
            'errors': errors,
            'warnings': warnings,
            'is_valid': len(errors) == 0,
            'data_quality_score': max(0, 100 - null_percentage)
        }
    
    def get_data_summary(self, data):
        """Get comprehensive data summary"""
        return {
            'total_rows': len(data),
            'total_columns': len(data.columns),
            'column_list': list(data.columns),
            'numeric_columns': list(data.select_dtypes(include=['number']).columns),
            'text_columns': list(data.select_dtypes(include=['object']).columns),
            'memory_usage_mb': data.memory_usage(deep=True).sum() / (1024 * 1024),
            'null_counts': data.isnull().sum().to_dict()
        }
