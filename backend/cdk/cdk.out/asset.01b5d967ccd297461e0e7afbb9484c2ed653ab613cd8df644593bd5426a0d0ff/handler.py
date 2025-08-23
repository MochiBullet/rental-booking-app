import json
import os
import boto3
import uuid
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ['VEHICLES_TABLE']
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
    """Main Lambda handler"""
    http_method = event.get('httpMethod', '')
    path_parameters = event.get('pathParameters', {})
    query_parameters = event.get('queryStringParameters', {})
    
    try:
        if http_method == 'GET':
            if path_parameters and 'vehicleId' in path_parameters:
                # Get single vehicle
                vehicle_id = path_parameters['vehicleId']
                response = table.get_item(Key={'vehicleId': vehicle_id})
                
                if 'Item' in response:
                    return create_response(200, response['Item'])
                else:
                    return create_response(404, {'error': 'Vehicle not found'})
            
            elif query_parameters and 'type' in query_parameters:
                # Filter by vehicle type using scan (fallback for tables without GSI)
                vehicle_type = query_parameters['type']
                response = table.scan(
                    FilterExpression=Attr('vehicleType').eq(vehicle_type)
                )
                
                return create_response(200, {'vehicles': response.get('Items', [])})
            
            else:
                # List all vehicles
                response = table.scan()
                return create_response(200, {'vehicles': response.get('Items', [])})
        
        elif http_method == 'POST':
            # Create new vehicle
            body = json.loads(event.get('body', '{}'))
            
            # Validate required fields
            required_fields = ['name', 'vehicleType', 'pricePerHour', 'capacity']
            for field in required_fields:
                if field not in body:
                    return create_response(400, {'error': f'{field} is required'})
            
            # Generate vehicle ID
            vehicle_id = str(uuid.uuid4())
            
            # Create vehicle record
            vehicle = {
                'vehicleId': vehicle_id,
                'name': body['name'],
                'vehicleType': body['vehicleType'],
                'description': body.get('description', ''),
                'pricePerHour': Decimal(str(body['pricePerHour'])),
                'pricePerDay': Decimal(str(body.get('pricePerDay', body['pricePerHour'] * 8))),
                'capacity': int(body['capacity']),
                'fuelType': body.get('fuelType', 'gasoline'),
                'transmission': body.get('transmission', 'automatic'),
                'features': body.get('features', []),
                'images': body.get('images', []),
                'isAvailable': body.get('isAvailable', True),
                'location': body.get('location', ''),
                'licensePlate': body.get('licensePlate', ''),
                'year': body.get('year', datetime.now().year),
                'brand': body.get('brand', ''),
                'model': body.get('model', ''),
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            # Save to DynamoDB
            table.put_item(Item=vehicle)
            
            return create_response(201, vehicle)
        
        elif http_method == 'PUT':
            # Update vehicle
            if not path_parameters or 'vehicleId' not in path_parameters:
                return create_response(400, {'error': 'Vehicle ID is required'})
            
            vehicle_id = path_parameters['vehicleId']
            body = json.loads(event.get('body', '{}'))
            
            # Check if vehicle exists
            response = table.get_item(Key={'vehicleId': vehicle_id})
            if 'Item' not in response:
                return create_response(404, {'error': 'Vehicle not found'})
            
            # Build update expression
            update_expression = "SET updatedAt = :updated"
            expression_values = {':updated': datetime.now().isoformat()}
            
            updatable_fields = [
                'name', 'description', 'pricePerHour', 'pricePerDay', 
                'capacity', 'fuelType', 'transmission', 'features', 
                'images', 'isAvailable', 'location', 'licensePlate',
                'year', 'brand', 'model'
            ]
            
            for field in updatable_fields:
                if field in body:
                    update_expression += f", {field} = :{field}"
                    if field in ['pricePerHour', 'pricePerDay']:
                        expression_values[f':{field}'] = Decimal(str(body[field]))
                    elif field == 'capacity':
                        expression_values[f':{field}'] = int(body[field])
                    else:
                        expression_values[f':{field}'] = body[field]
            
            # Update item
            response = table.update_item(
                Key={'vehicleId': vehicle_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ReturnValues="ALL_NEW"
            )
            
            return create_response(200, response['Attributes'])
        
        elif http_method == 'DELETE':
            # Delete vehicle (soft delete by setting isAvailable to false)
            if not path_parameters or 'vehicleId' not in path_parameters:
                return create_response(400, {'error': 'Vehicle ID is required'})
            
            vehicle_id = path_parameters['vehicleId']
            
            # Soft delete
            response = table.update_item(
                Key={'vehicleId': vehicle_id},
                UpdateExpression="SET isAvailable = :unavailable, updatedAt = :updated",
                ExpressionAttributeValues={
                    ':unavailable': False,
                    ':updated': datetime.now().isoformat()
                },
                ReturnValues="ALL_NEW"
            )
            
            return create_response(200, {'message': 'Vehicle deactivated', 'vehicle': response['Attributes']})
        
        elif http_method == 'OPTIONS':
            # Handle CORS preflight
            return create_response(200, {})
        
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'error': str(e)})