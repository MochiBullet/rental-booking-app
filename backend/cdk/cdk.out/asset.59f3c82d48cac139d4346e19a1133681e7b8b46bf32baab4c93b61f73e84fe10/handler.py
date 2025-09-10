import json
import os
import boto3
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key

# DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ['SITE_SETTINGS_TABLE']
table = dynamodb.Table(table_name)

# Helper function to convert Decimal to float for JSON serialization
def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def create_response(status_code, body):
    """Create HTTP response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': os.environ.get('CORS_ORIGIN', '*'),
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=decimal_default)
    }

def main(event, context):
    """Main Lambda handler for site settings"""
    http_method = event.get('httpMethod', '')
    path_parameters = event.get('pathParameters', {})
    
    try:
        if http_method == 'GET':
            if path_parameters and 'settingKey' in path_parameters:
                # Get single setting
                setting_key = path_parameters['settingKey']
                response = table.get_item(Key={'settingKey': setting_key})
                
                if 'Item' in response:
                    return create_response(200, response['Item'])
                else:
                    return create_response(404, {'error': 'Setting not found'})
            else:
                # Get all settings
                response = table.scan()
                settings = {}
                for item in response.get('Items', []):
                    settings[item['settingKey']] = item.get('settingValue', {})
                
                return create_response(200, {'settings': settings})
        
        elif http_method == 'POST' or http_method == 'PUT':
            # Create or update setting
            body = json.loads(event.get('body', '{}'))
            
            if path_parameters and 'settingKey' in path_parameters:
                # Update specific setting
                setting_key = path_parameters['settingKey']
                setting_value = body.get('settingValue', body.get('value', {}))
            else:
                # Bulk update from POST body
                setting_key = body.get('settingKey')
                setting_value = body.get('settingValue', {})
            
            if not setting_key:
                return create_response(400, {'error': 'Setting key is required'})
            
            # Create/update setting record
            setting = {
                'settingKey': setting_key,
                'settingValue': setting_value,
                'lastModified': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            # Save to DynamoDB
            table.put_item(Item=setting)
            
            return create_response(200, setting)
        
        elif http_method == 'DELETE':
            # Delete setting
            if not path_parameters or 'settingKey' not in path_parameters:
                return create_response(400, {'error': 'Setting key is required'})
            
            setting_key = path_parameters['settingKey']
            
            # Delete item
            table.delete_item(Key={'settingKey': setting_key})
            
            return create_response(200, {'message': f'Setting {setting_key} deleted'})
        
        elif http_method == 'OPTIONS':
            # Handle CORS preflight
            return create_response(200, {})
        
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'error': str(e)})