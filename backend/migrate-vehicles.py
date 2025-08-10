#!/usr/bin/env python3
"""
ローカルの車両データをDynamoDBに登録するスクリプト
"""

import boto3
import json
import uuid
from datetime import datetime
from decimal import Decimal

# DynamoDB設定
REGION = 'ap-southeast-2'
TABLE_NAME = 'rental-booking-vehicles'

def decimal_default(obj):
    """Decimal型をfloatに変換"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def create_dynamodb_client():
    """DynamoDBクライアント作成"""
    return boto3.resource('dynamodb', region_name=REGION)

def convert_vehicle_data(vehicle):
    """ローカルデータをDynamoDB用に変換"""
    
    # vehicleTypeをtypeから取得
    vehicle_type = vehicle.get('type', 'car')
    
    # 車種/バイク種別を判定
    if vehicle_type == 'motorcycle':
        category_type = 'motorcycle'
    else:
        category_type = 'car'
    
    # 時給と日額を計算 (既存のpriceは日額として扱う)
    daily_price = vehicle.get('price', 0)
    hourly_price = round(daily_price / 8)  # 8時間で日額
    
    # DynamoDB用データ構造
    dynamodb_vehicle = {
        'vehicleId': str(uuid.uuid4()),
        'name': vehicle.get('name', ''),
        'vehicleType': category_type,
        'category': vehicle.get('category', ''),
        'description': vehicle.get('description', ''),
        'pricePerHour': Decimal(str(hourly_price)),
        'pricePerDay': Decimal(str(daily_price)),
        'capacity': vehicle.get('specifications', {}).get('seats', 1),
        'fuelType': vehicle.get('specifications', {}).get('fuelType', 'ガソリン'),
        'transmission': vehicle.get('specifications', {}).get('transmission', 'AT'),
        'engineSize': vehicle.get('specifications', {}).get('cc', 0),
        'features': [],
        'images': [vehicle.get('image', '')] if vehicle.get('image') else [],
        'isAvailable': vehicle.get('available', True),
        'location': '東京都',  # デフォルト場所
        'licensePlate': f'東京 {vehicle.get("id", "000")}-{str(vehicle.get("id", "0000")).zfill(4)}',
        'year': 2023,  # デフォルト年式
        'brand': extract_brand(vehicle.get('name', '')),
        'model': extract_model(vehicle.get('name', '')),
        'insurance': {
            'dailyRate': vehicle.get('insurance', {}).get('dailyRate', 1000),
            'description': vehicle.get('insurance', {}).get('description', '基本保険')
        },
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    return dynamodb_vehicle

def extract_brand(name):
    """車両名からブランドを抽出"""
    brands = {
        'トヨタ': 'Toyota',
        'ホンダ': 'Honda', 
        '日産': 'Nissan',
        'BMW': 'BMW',
        'ヤマハ': 'Yamaha',
        'カワサキ': 'Kawasaki',
        'ハーレーダビッドソン': 'Harley-Davidson'
    }
    
    for jp_brand, en_brand in brands.items():
        if jp_brand in name or en_brand in name:
            return en_brand
    
    return name.split()[0] if name else 'Unknown'

def extract_model(name):
    """車両名からモデルを抽出"""
    # ブランド名を除去してモデル名を取得
    model_parts = name.split()
    if len(model_parts) > 1:
        return ' '.join(model_parts[1:])
    return name

def load_local_vehicles():
    """ローカル車両データを読み込み（JSファイルから手動変換）"""
    vehicles = [
        {
            "id": 1,
            "name": "トヨタ プリウス",
            "type": "car",
            "category": "エコカー",
            "price": 8000,
            "image": "https://via.placeholder.com/300x200?text=プリウス",
            "description": "燃費抜群のハイブリッドカー。街乗りから長距離まで快適。",
            "specifications": {
                "seats": 5,
                "transmission": "AT",
                "fuelType": "ハイブリッド",
                "cc": 1800
            },
            "insurance": {
                "dailyRate": 1500,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 2,
            "name": "ホンダ フリード",
            "type": "car",
            "category": "ミニバン",
            "price": 9500,
            "image": "https://via.placeholder.com/300x200?text=フリード",
            "description": "コンパクトなミニバン。家族での移動に最適。",
            "specifications": {
                "seats": 6,
                "transmission": "AT",
                "fuelType": "ガソリン",
                "cc": 1500
            },
            "insurance": {
                "dailyRate": 1500,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 3,
            "name": "日産 軽自動車",
            "type": "car",
            "category": "軽自動車",
            "price": 6000,
            "image": "https://via.placeholder.com/300x200?text=軽自動車",
            "description": "小回りが利いて運転しやすい軽自動車。",
            "specifications": {
                "seats": 4,
                "transmission": "AT",
                "fuelType": "ガソリン",
                "cc": 660
            },
            "insurance": {
                "dailyRate": 1200,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 4,
            "name": "BMW X3",
            "type": "car",
            "category": "SUV", 
            "price": 15000,
            "image": "https://via.placeholder.com/300x200?text=BMW+X3",
            "description": "高級SUV。快適な乗り心地と上質な内装。",
            "specifications": {
                "seats": 5,
                "transmission": "AT",
                "fuelType": "ガソリン",
                "cc": 2000
            },
            "insurance": {
                "dailyRate": 2500,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 5,
            "name": "ヤマハ MT-07",
            "type": "motorcycle",
            "category": "スポーツバイク",
            "price": 4000,
            "image": "https://via.placeholder.com/300x200?text=MT-07",
            "description": "扱いやすいスポーツバイク。初心者から上級者まで。",
            "specifications": {
                "seats": 2,
                "transmission": "MT",
                "fuelType": "ガソリン",
                "cc": 689
            },
            "insurance": {
                "dailyRate": 800,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 6,
            "name": "ホンダ PCX160",
            "type": "motorcycle",
            "category": "スクーター",
            "price": 3000,
            "image": "https://via.placeholder.com/300x200?text=PCX160",
            "description": "通勤や街乗りに最適なスクーター。",
            "specifications": {
                "seats": 2,
                "transmission": "AT",
                "fuelType": "ガソリン",
                "cc": 157
            },
            "insurance": {
                "dailyRate": 600,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 7,
            "name": "カワサキ Ninja 400",
            "type": "motorcycle",
            "category": "スポーツバイク", 
            "price": 5000,
            "image": "https://via.placeholder.com/300x200?text=Ninja+400",
            "description": "本格的なスポーツバイク。爽快な走りを楽しめます。",
            "specifications": {
                "seats": 2,
                "transmission": "MT",
                "fuelType": "ガソリン",
                "cc": 399
            },
            "insurance": {
                "dailyRate": 1000,
                "description": "車両・対物・対人保険込み"
            },
            "available": True
        },
        {
            "id": 8,
            "name": "ハーレーダビッドソン",
            "type": "motorcycle",
            "category": "クルーザー",
            "price": 8000,
            "image": "https://via.placeholder.com/300x200?text=ハーレー",
            "description": "アメリカンバイクの代表格。独特の乗り味。",
            "specifications": {
                "seats": 2,
                "transmission": "MT", 
                "fuelType": "ガソリン",
                "cc": 883
            },
            "insurance": {
                "dailyRate": 1800,
                "description": "車両・対物・対人保険込み"
            },
            "available": False
        }
    ]
    
    return vehicles

def migrate_vehicles():
    """車両データをDynamoDBに登録"""
    print("=== 車両データマイグレーション開始 ===")
    
    # DynamoDBテーブル接続
    dynamodb = create_dynamodb_client()
    table = dynamodb.Table(TABLE_NAME)
    
    # ローカルデータ読み込み
    local_vehicles = load_local_vehicles()
    print(f"ローカル車両データ: {len(local_vehicles)}件")
    
    # 各車両データを変換・登録
    success_count = 0
    error_count = 0
    
    for vehicle in local_vehicles:
        try:
            # データ変換
            dynamodb_vehicle = convert_vehicle_data(vehicle)
            
            print(f"\n登録中: {vehicle['name']}")
            print(f"  Vehicle ID: {dynamodb_vehicle['vehicleId']}")
            print(f"  Type: {dynamodb_vehicle['vehicleType']}")
            print(f"  Price: {int(dynamodb_vehicle['pricePerHour'])}円/時 {int(dynamodb_vehicle['pricePerDay'])}円/日")
            
            # DynamoDBに登録
            table.put_item(Item=dynamodb_vehicle)
            
            success_count += 1
            print(f"  登録成功")
            
        except Exception as e:
            error_count += 1
            print(f"  登録失敗: {str(e)}")
    
    print(f"\n=== マイグレーション完了 ===")
    print(f"成功: {success_count}件")
    print(f"失敗: {error_count}件")
    print(f"合計: {success_count + error_count}件")

def verify_migration():
    """マイグレーション結果を確認"""
    print("\n=== DynamoDBデータ確認 ===")
    
    dynamodb = create_dynamodb_client()
    table = dynamodb.Table(TABLE_NAME)
    
    try:
        # 全車両データを取得
        response = table.scan()
        vehicles = response.get('Items', [])
        
        print(f"DynamoDB登録済み車両: {len(vehicles)}件")
        
        # 車種別集計
        car_count = len([v for v in vehicles if v.get('vehicleType') == 'car'])
        motorcycle_count = len([v for v in vehicles if v.get('vehicleType') == 'motorcycle'])
        
        print(f"  車: {car_count}台")
        print(f"  バイク: {motorcycle_count}台")
        
        # サンプル表示
        print("\n登録済み車両一覧:")
        for vehicle in vehicles:
            name = vehicle.get('name', 'Unknown')
            vehicle_type = vehicle.get('vehicleType', 'Unknown')
            brand = vehicle.get('brand', 'Unknown')
            available = vehicle.get('isAvailable', False)
            status = "利用可能" if available else "利用不可"
            print(f"  - {name} ({brand} / {vehicle_type}) [{status}]")
        
    except Exception as e:
        print(f"確認エラー: {str(e)}")

def main():
    """メイン実行"""
    print("車両データマイグレーションスクリプト")
    print("=" * 50)
    
    try:
        # マイグレーション実行
        migrate_vehicles()
        
        # 結果確認
        verify_migration()
        
        print("\nすべて完了しました！")
        
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")

if __name__ == "__main__":
    main()