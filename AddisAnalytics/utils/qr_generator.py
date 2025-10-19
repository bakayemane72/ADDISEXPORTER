import qrcode
from PIL import Image
import io
import base64
import json
import uuid
from datetime import datetime

class QRGenerator:
    """Generate QR codes for coffee batch traceability"""
    
    def __init__(self):
        self.base_url = "https://addis-exporter.com/trace"  # This would be your actual domain
        
    def generate_batch_qr(self, batch_data):
        """Generate QR code for a specific batch"""
        try:
            # Create traceability data
            trace_data = {
                'batch_id': batch_data.get('batch_id', str(uuid.uuid4())),
                'lot_id': batch_data.get('lot_id', ''),
                'region': batch_data.get('region_category', batch_data.get('region', '')),
                'farm_station': batch_data.get('farm_station', ''),
                'altitude': batch_data.get('altitude', 0),
                'processing_method': batch_data.get('processing_category', batch_data.get('processing_method', '')),
                'volume': batch_data.get('volume', 0),
                'price_per_kg': batch_data.get('price_per_kg', 0),
                'quality_score': batch_data.get('quality_score', 0),
                'estimated_farmers': batch_data.get('estimated_farmers', 0),
                'date_processed': batch_data.get('date_added', datetime.now().strftime('%Y-%m-%d')),
                'status': batch_data.get('status', 'Unknown')
            }
            
            # Create QR code URL (in real implementation, this would link to your website)
            qr_url = f"{self.base_url}/{trace_data['batch_id']}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            
            # Add the traceability data as JSON to QR code
            qr_payload = {
                'url': qr_url,
                'data': trace_data
            }
            
            qr.add_data(json.dumps(qr_payload))
            qr.make(fit=True)
            
            # Create QR code image
            qr_img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64 for display
            img_buffer = io.BytesIO()
            qr_img.save(img_buffer, format='PNG')
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            
            return {
                'qr_image': img_base64,
                'qr_data': trace_data,
                'qr_url': qr_url,
                'batch_id': trace_data['batch_id']
            }
            
        except Exception as e:
            raise Exception(f"Error generating QR code: {str(e)}")
    
    def generate_multiple_qrs(self, batch_list):
        """Generate QR codes for multiple batches"""
        qr_codes = []
        
        for batch in batch_list:
            try:
                qr_result = self.generate_batch_qr(batch)
                qr_codes.append(qr_result)
            except Exception as e:
                print(f"Error generating QR for batch {batch.get('lot_id', 'Unknown')}: {str(e)}")
                continue
        
        return qr_codes
    
    def create_traceability_page_data(self, batch_data):
        """Create data structure for traceability landing page"""
        trace_page = {
            'batch_info': {
                'batch_id': batch_data.get('batch_id', ''),
                'lot_id': batch_data.get('lot_id', ''),
                'status': batch_data.get('status', 'Unknown'),
                'date_processed': batch_data.get('date_added', datetime.now().strftime('%Y-%m-%d'))
            },
            'origin_info': {
                'region': batch_data.get('region_category', batch_data.get('region', '')),
                'farm_station': batch_data.get('farm_station', ''),
                'altitude': f"{batch_data.get('altitude', 0)}m",
                'altitude_range': batch_data.get('altitude_range', 'Unknown')
            },
            'processing_info': {
                'method': batch_data.get('processing_category', batch_data.get('processing_method', '')),
                'quality_score': f"{batch_data.get('quality_score', 0)}/10"
            },
            'volume_info': {
                'total_volume': f"{batch_data.get('volume', 0)} kg",
                'estimated_farmers': batch_data.get('estimated_farmers', 0),
                'price_per_kg': f"${batch_data.get('price_per_kg', 0):.2f}",
                'price_tier': batch_data.get('price_tier', 'Unknown')
            },
            'roaster_notes': {
                'flavor_profile': self._generate_flavor_notes(batch_data),
                'brewing_recommendations': self._generate_brewing_notes(batch_data),
                'cupping_score': batch_data.get('quality_score', 0) * 10  # Convert to 100-point scale
            }
        }
        
        return trace_page
    
    def _generate_flavor_notes(self, batch_data):
        """Generate flavor notes based on region and processing method"""
        region = batch_data.get('region_category', '').lower()
        processing = batch_data.get('processing_category', '').lower()
        
        # Flavor profiles by region
        region_flavors = {
            'yirgacheffe': ['floral', 'citrus', 'bright acidity', 'tea-like'],
            'sidamo': ['wine-like', 'fruity', 'medium body', 'balanced'],
            'guji': ['complex', 'fruity', 'winey', 'full body'],
            'harar': ['wine-like', 'blueberry', 'medium body', 'dry finish'],
            'jimma': ['earthy', 'spicy', 'full body', 'low acidity'],
            'limu': ['wine-like', 'spicy', 'good body', 'sharp acidity']
        }
        
        # Processing method influence
        processing_influence = {
            'washed': ['clean', 'bright', 'pronounced acidity'],
            'natural': ['fruity', 'sweet', 'full body', 'wine-like'],
            'honey': ['balanced', 'sweet', 'medium body']
        }
        
        flavors = region_flavors.get(region, ['complex', 'balanced'])
        if processing in processing_influence:
            flavors.extend(processing_influence[processing])
        
        return ', '.join(flavors[:6])  # Limit to 6 descriptors
    
    def _generate_brewing_notes(self, batch_data):
        """Generate brewing recommendations"""
        processing = batch_data.get('processing_category', '').lower()
        altitude = batch_data.get('altitude', 0)
        
        if processing == 'natural':
            method = "Pour-over or French press"
            temp = "195-205°F"
        elif processing == 'washed':
            method = "V60 or Chemex"
            temp = "200-210°F"
        else:
            method = "Pour-over"
            temp = "200-205°F"
        
        # Adjust for altitude
        if altitude > 1800:
            grind = "Medium-fine"
        else:
            grind = "Medium"
        
        return f"{method}, {temp}, {grind} grind, 1:16 ratio"
    
    def export_qr_png(self, qr_image_base64):
        """Convert base64 QR image to PNG bytes for download"""
        try:
            img_data = base64.b64decode(qr_image_base64)
            return img_data
        except Exception as e:
            raise Exception(f"Error exporting QR code: {str(e)}")
