import pandas as pd
import numpy as np
from datetime import datetime
import uuid

class EnterpriseDataModel:
    """
    Enterprise-grade data model for Ethiopian coffee export operations
    Handles comprehensive lot tracking, commercials, logistics, and compliance
    """
    
    def __init__(self):
        # Comprehensive field definitions
        self.field_groups = {
            'lot_details': [
                'lot_id', 'harvest_year', 'region', 'zone', 'woreda', 'kebele',
                'farm_name', 'farmer_names', 'altitude_m', 'variety',
                'processing_method', 'moisture_pct', 'screen_size', 'defects_count'
            ],
            'cupping_scores': [
                'aroma_score', 'acidity_score', 'body_score', 'aftertaste_score',
                'uniformity_score', 'overall_score', 'sca_total_score', 'cupping_date',
                'cupper_name', 'cupping_notes'
            ],
            'certifications': [
                'organic_cert', 'fairtrade_cert', 'rainforest_cert', 'specialty_cert',
                'cert_expiry_date', 'cert_documents'
            ],
            'commercials': [
                'farmgate_price_etb_kg', 'fob_price_usd_lb', 'processing_cost_etb',
                'milling_cost_etb', 'transport_cost_etb', 'sale_price_usd_lb',
                'contracted_qty_bags', 'contracted_qty_kg', 'shipped_qty_bags',
                'shipped_qty_kg', 'buyer_name', 'roaster_name', 'incoterms',
                'payment_terms', 'fx_rate_etb_usd', 'fx_snapshot_date'
            ],
            'logistics': [
                'mill_name', 'milling_date', 'warehouse_location', 'warehouse_entry_date',
                'bag_type', 'bags_count', 'jute_liner_type', 'seal_ids',
                'container_number', 'container_size', 'bill_of_lading',
                'vessel_name', 'etd_date', 'eta_date', 'port_of_loading',
                'port_of_discharge', 'shipment_status', 'last_milestone',
                'milestone_date'
            ],
            'compliance': [
                'coa_reference', 'ico_marks', 'phytosanitary_cert',
                'invoice_number', 'packing_list_ref', 'export_permit',
                'customs_declaration', 'origin_certificate', 'quality_certificate'
            ],
            'traceability': [
                'qr_code_id', 'public_url', 'story_text', 'producer_message',
                'photos_urls', 'transparency_level', 'farm_coordinates'
            ],
            'metadata': [
                'created_at', 'updated_at', 'created_by', 'updated_by',
                'data_source', 'validation_status', 'completeness_score'
            ]
        }
        
        # All fields combined
        self.all_fields = []
        for group in self.field_groups.values():
            self.all_fields.extend(group)
    
    def get_field_definitions(self):
        """Return field definitions with types and validation rules"""
        return {
            # Lot Details
            'lot_id': {'type': 'string', 'required': True, 'unique': True},
            'harvest_year': {'type': 'int', 'required': True, 'range': (2000, 2030)},
            'region': {'type': 'string', 'required': True},
            'altitude_m': {'type': 'float', 'required': True, 'range': (500, 3000)},
            'variety': {'type': 'string', 'required': False},
            'processing_method': {'type': 'string', 'required': True, 
                                 'options': ['Washed', 'Natural', 'Honey', 'Experimental']},
            'moisture_pct': {'type': 'float', 'required': True, 'range': (8, 13)},
            
            # Cupping Scores
            'aroma_score': {'type': 'float', 'range': (6, 10), 'precision': 2},
            'acidity_score': {'type': 'float', 'range': (6, 10), 'precision': 2},
            'body_score': {'type': 'float', 'range': (6, 10), 'precision': 2},
            'aftertaste_score': {'type': 'float', 'range': (6, 10), 'precision': 2},
            'uniformity_score': {'type': 'float', 'range': (6, 10), 'precision': 2},
            'overall_score': {'type': 'float', 'range': (6, 10), 'precision': 2},
            'sca_total_score': {'type': 'float', 'range': (0, 100), 'precision': 1},
            
            # Commercials
            'farmgate_price_etb_kg': {'type': 'float', 'required': False, 'range': (0, 10000)},
            'fob_price_usd_lb': {'type': 'float', 'required': False, 'range': (0, 50)},
            'contracted_qty_kg': {'type': 'float', 'required': False, 'range': (0, 1000000)},
            'shipped_qty_kg': {'type': 'float', 'required': False, 'range': (0, 1000000)},
            
            # Logistics
            'warehouse_location': {'type': 'string', 'required': False},
            'container_number': {'type': 'string', 'required': False},
            'shipment_status': {'type': 'string', 'required': False,
                              'options': ['Pending', 'At Mill', 'In Warehouse', 
                                        'Ready to Ship', 'In Transit', 'Delivered']},
            
            # Compliance
            'export_permit': {'type': 'string', 'required': False},
            'ico_marks': {'type': 'string', 'required': False},
        }
    
    def validate_field(self, field_name, value):
        """Validate a single field value"""
        definitions = self.get_field_definitions()
        
        if field_name not in definitions:
            return {'valid': True, 'warnings': [f'Unknown field: {field_name}']}
        
        field_def = definitions[field_name]
        errors = []
        warnings = []
        
        # Check required
        if field_def.get('required', False) and pd.isna(value):
            errors.append(f'{field_name} is required')
            return {'valid': False, 'errors': errors, 'warnings': warnings}
        
        if pd.isna(value):
            return {'valid': True, 'errors': [], 'warnings': []}
        
        # Type validation
        field_type = field_def.get('type', 'string')
        
        if field_type == 'float':
            try:
                float_val = float(value)
                # Range check
                if 'range' in field_def:
                    min_val, max_val = field_def['range']
                    if float_val < min_val or float_val > max_val:
                        errors.append(f'{field_name} must be between {min_val} and {max_val}')
            except (ValueError, TypeError):
                errors.append(f'{field_name} must be a number')
        
        elif field_type == 'int':
            try:
                int_val = int(value)
                if 'range' in field_def:
                    min_val, max_val = field_def['range']
                    if int_val < min_val or int_val > max_val:
                        errors.append(f'{field_name} must be between {min_val} and {max_val}')
            except (ValueError, TypeError):
                errors.append(f'{field_name} must be an integer')
        
        elif field_type == 'string':
            if 'options' in field_def:
                if str(value) not in field_def['options']:
                    warnings.append(f'{field_name} should be one of: {", ".join(field_def["options"])}')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def calculate_derived_fields(self, data):
        """Calculate derived business metrics"""
        derived = data.copy()
        
        # SCA Total Score (if individual scores available)
        cupping_cols = ['aroma_score', 'acidity_score', 'body_score', 
                       'aftertaste_score', 'uniformity_score', 'overall_score']
        if all(col in derived.columns for col in cupping_cols):
            derived['sca_calculated_total'] = derived[cupping_cols].sum(axis=1)
        
        # Cost stack (total costs)
        cost_cols = ['processing_cost_etb', 'milling_cost_etb', 'transport_cost_etb']
        available_costs = [col for col in cost_cols if col in derived.columns]
        if available_costs:
            derived['total_cost_etb'] = derived[available_costs].sum(axis=1)
        
        # Margin calculation
        if 'fob_price_usd_lb' in derived.columns and 'farmgate_price_etb_kg' in derived.columns:
            # Convert FOB to ETB/kg for comparison
            if 'fx_rate_etb_usd' in derived.columns:
                derived['fob_price_etb_kg'] = (derived['fob_price_usd_lb'] * 2.20462 * 
                                               derived['fx_rate_etb_usd'])
                derived['margin_etb_kg'] = derived['fob_price_etb_kg'] - derived['farmgate_price_etb_kg']
                derived['margin_pct'] = (derived['margin_etb_kg'] / 
                                        derived['fob_price_etb_kg'] * 100).round(2)
        
        # Shipment fulfillment
        if 'shipped_qty_kg' in derived.columns and 'contracted_qty_kg' in derived.columns:
            derived['fulfillment_pct'] = (derived['shipped_qty_kg'] / 
                                         derived['contracted_qty_kg'] * 100).round(2)
        
        # Warehouse aging (days since entry)
        if 'warehouse_entry_date' in derived.columns:
            derived['warehouse_entry_date'] = pd.to_datetime(derived['warehouse_entry_date'], 
                                                             errors='coerce')
            derived['warehouse_days'] = (datetime.now() - 
                                        derived['warehouse_entry_date']).dt.days
        
        # Document completeness score
        compliance_fields = self.field_groups['compliance']
        available_compliance = [f for f in compliance_fields if f in derived.columns]
        if available_compliance:
            derived['doc_completeness_score'] = (
                derived[available_compliance].notna().sum(axis=1) / 
                len(available_compliance) * 100
            ).round(1)
        
        # Quality grade based on SCA score
        if 'sca_total_score' in derived.columns:
            derived['quality_grade'] = pd.cut(
                derived['sca_total_score'],
                bins=[0, 80, 83, 85, 87, 90, 100],
                labels=['Standard', 'Good', 'High Quality', 'Premium', 'Specialty', 'Exceptional']
            )
        
        return derived
    
    def get_template_dataframe(self, include_all_fields=True):
        """Generate Excel template with all fields"""
        if include_all_fields:
            columns = self.all_fields
        else:
            # Just core required fields
            columns = ['lot_id', 'harvest_year', 'region', 'altitude_m', 
                      'processing_method', 'moisture_pct', 'farmgate_price_etb_kg']
        
        # Create empty dataframe with sample row
        template = pd.DataFrame(columns=columns)
        
        # Add example row
        example = {
            'lot_id': 'LOT-2024-0001',
            'harvest_year': 2024,
            'region': 'Yirgacheffe',
            'zone': 'Gedeo',
            'altitude_m': 2100,
            'processing_method': 'Washed',
            'moisture_pct': 11.5,
            'variety': 'Heirloom',
            'farmgate_price_etb_kg': 180,
            'fob_price_usd_lb': 4.50
        }
        
        template = pd.concat([template, pd.DataFrame([example])], ignore_index=True)
        return template
