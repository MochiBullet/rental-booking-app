"""
Common utilities for Lambda functions
"""

import json
from decimal import Decimal
from datetime import datetime

def decimal_default(obj):
    """Helper function to serialize Decimal objects for JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def create_response(status_code, body, cors_origin="*"):
    """Create standardized HTTP response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': cors_origin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=decimal_default)
    }

def validate_required_fields(data, required_fields):
    """Validate that required fields are present in data"""
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    
    return None

def generate_timestamp():
    """Generate ISO format timestamp"""
    return datetime.now().isoformat()

def safe_decimal(value):
    """Safely convert value to Decimal"""
    if value is None:
        return Decimal('0')
    try:
        return Decimal(str(value))
    except:
        return Decimal('0')

def safe_int(value, default=0):
    """Safely convert value to int"""
    try:
        return int(value)
    except:
        return default