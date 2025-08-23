import json
import os
import boto3
import uuid
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key

# DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ['MEMBERS_TABLE']
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

def generate_member_id(license_last_four):
    """Generate member ID: YYYYMM + license last 4 digits"""
    now = datetime.now()
    year_month = now.strftime('%Y%m')
    return f"{year_month}{license_last_four}"

def main(event, context):
    """Main Lambda handler"""
    http_method = event.get('httpMethod', '')
    path_parameters = event.get('pathParameters', {})
    query_parameters = event.get('queryStringParameters', {})
    
    try:
        if http_method == 'GET':
            if path_parameters and 'memberId' in path_parameters:
                # Get single member
                member_id = path_parameters['memberId']
                response = table.get_item(Key={'memberId': member_id})
                
                if 'Item' in response:
                    return create_response(200, response['Item'])
                else:
                    return create_response(404, {'error': 'Member not found'})
            
            elif query_parameters and 'email' in query_parameters:
                # Query by email using GSI
                email = query_parameters['email']
                response = table.query(
                    IndexName='email-index',
                    KeyConditionExpression=Key('email').eq(email)
                )
                
                if response['Items']:
                    return create_response(200, response['Items'][0])
                else:
                    return create_response(404, {'error': 'Member not found'})
            
            else:
                # List all members
                response = table.scan()
                return create_response(200, {'members': response.get('Items', [])})
        
        elif http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # Check if this is a login request
            if event.get('path', '').endswith('/login'):
                # Login endpoint
                member_id = body.get('id', body.get('memberId'))
                password = body.get('password')
                
                if not member_id or not password:
                    return create_response(400, {'error': 'Member ID and password are required'})
                
                # Get member by ID
                response = table.get_item(Key={'memberId': member_id})
                
                if 'Item' in response:
                    member = response['Item']
                    # Simple password check (should be hashed in production)
                    if member.get('password') == password:
                        # Remove password from response
                        member.pop('password', None)
                        return create_response(200, {'member': member})
                    else:
                        return create_response(401, {'error': 'Invalid credentials'})
                else:
                    return create_response(404, {'error': 'Member not found'})
            
            # Create new member
            body = json.loads(event.get('body', '{}'))
            
            # Validate required fields
            if not body.get('email') or not body.get('licenseNumber'):
                return create_response(400, {'error': 'Email and license number are required'})
            
            # Extract last 4 digits from license number
            license_last_four = body.get('licenseNumber', '')[-4:]
            
            # Use provided member ID or generate one
            member_id = body.get('memberId') or generate_member_id(license_last_four)
            existing_member = table.get_item(Key={'memberId': member_id})
            if existing_member.get('Item'):
                return create_response(409, {'error': 'This member ID combination already exists'})
            
            # Check if email already exists
            existing = table.query(
                IndexName='email-index',
                KeyConditionExpression=Key('email').eq(body['email'])
            )
            
            if existing['Items']:
                return create_response(409, {'error': 'Email already registered'})
            
            # Create member record
            member = {
                'memberId': member_id,
                'email': body['email'],
                'password': body.get('password', ''),  # Store password (in production, should be hashed)
                'licenseLastFour': license_last_four,
                'points': 0,  # Initial points
                'registrationDate': datetime.now().isoformat(),
                'isActive': True,
                'status': 'active',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            # Save to DynamoDB
            table.put_item(Item=member)
            
            return create_response(201, member)
        
        elif http_method == 'PUT':
            # Update member
            if not path_parameters or 'memberId' not in path_parameters:
                return create_response(400, {'error': 'Member ID is required'})
            
            member_id = path_parameters['memberId']
            body = json.loads(event.get('body', '{}'))
            
            # Check if member exists
            response = table.get_item(Key={'memberId': member_id})
            if 'Item' not in response:
                return create_response(404, {'error': 'Member not found'})
            
            # Build update expression
            update_expression = "SET updatedAt = :updated"
            expression_values = {':updated': datetime.now().isoformat()}
            
            if 'email' in body:
                update_expression += ", email = :email"
                expression_values[':email'] = body['email']
            
            if 'password' in body:
                update_expression += ", password = :password"
                expression_values[':password'] = body['password']  # In production, should be hashed
            
            if 'points' in body:
                update_expression += ", points = :points"
                expression_values[':points'] = body['points']
            
            if 'isActive' in body:
                update_expression += ", isActive = :active"
                expression_values[':active'] = body['isActive']
            
            if 'status' in body:
                update_expression += ", status = :status"
                expression_values[':status'] = body['status']
            
            # Update item
            response = table.update_item(
                Key={'memberId': member_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ReturnValues="ALL_NEW"
            )
            
            return create_response(200, response['Attributes'])
        
        elif http_method == 'DELETE':
            # Delete member (soft delete)
            if not path_parameters or 'memberId' not in path_parameters:
                return create_response(400, {'error': 'Member ID is required'})
            
            member_id = path_parameters['memberId']
            
            # Soft delete by setting isActive to false
            response = table.update_item(
                Key={'memberId': member_id},
                UpdateExpression="SET isActive = :inactive, updatedAt = :updated",
                ExpressionAttributeValues={
                    ':inactive': False,
                    ':updated': datetime.now().isoformat()
                },
                ReturnValues="ALL_NEW"
            )
            
            return create_response(200, {'message': 'Member deactivated', 'member': response['Attributes']})
        
        elif http_method == 'OPTIONS':
            # Handle CORS preflight
            return create_response(200, {})
        
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'error': str(e)})