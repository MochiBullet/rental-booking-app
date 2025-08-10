import json
import boto3
from datetime import datetime
from decimal import Decimal
import uuid
import logging
from botocore.exceptions import ClientError

# ロギング設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB設定
dynamodb = boto3.resource('dynamodb')
reservations_table = dynamodb.Table('rental-booking-reservations')
vehicles_table = dynamodb.Table('rental-booking-vehicles')
members_table = dynamodb.Table('rental-booking-members')

def decimal_default(obj):
    """DecimalをJSONシリアライズ可能な形式に変換"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """Lambda関数のメインハンドラー"""
    try:
        logger.info(f"Event: {json.dumps(event)}")
        
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        path_parameters = event.get('pathParameters') or {}
        query_parameters = event.get('queryStringParameters') or {}
        
        # CORSヘッダー
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
        
        # OPTIONSリクエスト（CORS preflight）への対応
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'OK'})
            }
        
        # ルーティング
        if path == '/reservations' and http_method == 'GET':
            return get_reservations(query_parameters, headers)
        elif path == '/reservations' and http_method == 'POST':
            return create_reservation(json.loads(event.get('body', '{}')), headers)
        elif path.startswith('/reservations/') and http_method == 'GET':
            reservation_id = path_parameters.get('id')
            return get_reservation(reservation_id, headers)
        elif path.startswith('/reservations/') and http_method == 'PUT':
            reservation_id = path_parameters.get('id')
            return update_reservation(reservation_id, json.loads(event.get('body', '{}')), headers)
        elif path.startswith('/reservations/') and http_method == 'DELETE':
            reservation_id = path_parameters.get('id')
            return delete_reservation(reservation_id, headers)
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not Found'})
            }
            
    except Exception as e:
        logger.error(f"予期せぬエラー: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '内部サーバーエラーが発生しました'})
        }

def get_reservations(query_parameters, headers):
    """予約一覧を取得"""
    try:
        # クエリパラメータの処理
        member_id = query_parameters.get('memberId')
        vehicle_id = query_parameters.get('vehicleId')
        status = query_parameters.get('status')
        
        if member_id:
            # メンバー別予約取得（GSI使用）
            response = reservations_table.query(
                IndexName='MemberIndex',
                KeyConditionExpression='memberId = :member_id',
                ExpressionAttributeValues={':member_id': member_id}
            )
        elif vehicle_id:
            # 車両別予約取得（GSI使用）
            response = reservations_table.query(
                IndexName='VehicleIndex',
                KeyConditionExpression='vehicleId = :vehicle_id',
                ExpressionAttributeValues={':vehicle_id': vehicle_id}
            )
        else:
            # 全予約取得
            response = reservations_table.scan()
        
        reservations = response.get('Items', [])
        
        # ステータスフィルタ
        if status:
            reservations = [r for r in reservations if r.get('status') == status]
        
        # 日付順でソート（新しい順）
        reservations.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'reservations': reservations,
                'count': len(reservations)
            }, default=decimal_default, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"予約一覧取得エラー: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '予約一覧の取得に失敗しました'})
        }

def get_reservation(reservation_id, headers):
    """特定の予約を取得"""
    try:
        if not reservation_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '予約IDが必要です'})
            }
        
        response = reservations_table.get_item(
            Key={'reservationId': reservation_id}
        )
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': '予約が見つかりません'})
            }
        
        reservation = response['Item']
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(reservation, default=decimal_default, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"予約取得エラー: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '予約の取得に失敗しました'})
        }

def create_reservation(reservation_data, headers):
    """新しい予約を作成"""
    try:
        # 必須フィールドの検証
        required_fields = ['memberId', 'vehicleId', 'startDate', 'endDate', 'rentalType']
        for field in required_fields:
            if field not in reservation_data or not reservation_data[field]:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': f'{field} は必須項目です'})
                }
        
        # 車両の存在と可用性を確認
        vehicle_response = vehicles_table.get_item(
            Key={'vehicleId': reservation_data['vehicleId']}
        )
        
        if 'Item' not in vehicle_response:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '指定された車両が見つかりません'})
            }
        
        vehicle = vehicle_response['Item']
        if not vehicle.get('isAvailable', False):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '指定された車両は現在利用できません'})
            }
        
        # メンバーの存在を確認
        member_response = members_table.get_item(
            Key={'memberId': reservation_data['memberId']}
        )
        
        if 'Item' not in member_response:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '指定されたメンバーが見つかりません'})
            }
        
        # 予約IDを生成
        reservation_id = str(uuid.uuid4())
        
        # 現在時刻
        now = datetime.now().isoformat()
        
        # 料金計算
        rental_type = reservation_data['rentalType']  # 'daily' or 'hourly'
        start_date = datetime.fromisoformat(reservation_data['startDate'])
        end_date = datetime.fromisoformat(reservation_data['endDate'])
        
        if rental_type == 'daily':
            days = (end_date - start_date).days + 1
            total_price = days * vehicle.get('pricePerDay', 0)
        else:  # hourly
            hours = (end_date - start_date).total_seconds() / 3600
            total_price = hours * vehicle.get('pricePerHour', 0)
        
        # 予約データ作成
        reservation = {
            'reservationId': reservation_id,
            'memberId': reservation_data['memberId'],
            'vehicleId': reservation_data['vehicleId'],
            'vehicleName': vehicle.get('name', ''),
            'memberEmail': member_response['Item'].get('email', ''),
            'startDate': reservation_data['startDate'],
            'endDate': reservation_data['endDate'],
            'rentalType': rental_type,
            'totalPrice': Decimal(str(total_price)),
            'status': 'pending',  # pending, confirmed, active, completed, cancelled
            'createdAt': now,
            'updatedAt': now,
            'notes': reservation_data.get('notes', '')
        }
        
        # DynamoDBに保存
        reservations_table.put_item(Item=reservation)
        
        # 成功レスポンス
        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({
                'message': '予約が正常に作成されました',
                'reservation': reservation
            }, default=decimal_default, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"予約作成エラー: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '予約の作成に失敗しました'})
        }

def update_reservation(reservation_id, update_data, headers):
    """予約を更新"""
    try:
        if not reservation_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '予約IDが必要です'})
            }
        
        # 既存の予約を取得
        response = reservations_table.get_item(
            Key={'reservationId': reservation_id}
        )
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': '予約が見つかりません'})
            }
        
        # 更新可能なフィールド
        updatable_fields = ['status', 'notes', 'startDate', 'endDate']
        update_expression = 'SET updatedAt = :updated_at'
        expression_values = {':updated_at': datetime.now().isoformat()}
        
        for field in updatable_fields:
            if field in update_data:
                update_expression += f', {field} = :{field}'
                expression_values[f':{field}'] = update_data[field]
        
        # 更新実行
        reservations_table.update_item(
            Key={'reservationId': reservation_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values
        )
        
        # 更新後のデータを取得
        updated_response = reservations_table.get_item(
            Key={'reservationId': reservation_id}
        )
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': '予約が正常に更新されました',
                'reservation': updated_response['Item']
            }, default=decimal_default, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"予約更新エラー: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '予約の更新に失敗しました'})
        }

def delete_reservation(reservation_id, headers):
    """予約を削除"""
    try:
        if not reservation_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '予約IDが必要です'})
            }
        
        # 予約の存在確認
        response = reservations_table.get_item(
            Key={'reservationId': reservation_id}
        )
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': '予約が見つかりません'})
            }
        
        # 削除実行
        reservations_table.delete_item(
            Key={'reservationId': reservation_id}
        )
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': '予約が正常に削除されました'})
        }
        
    except Exception as e:
        logger.error(f"予約削除エラー: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '予約の削除に失敗しました'})
        }