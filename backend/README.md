# Rental Booking Backend

AWS CDK + Lambda + DynamoDB を使用したレンタル予約システムのバックエンド

## 構成

### DynamoDB テーブル
- **members**: 会員情報
- **vehicles**: 車両情報  
- **reservations**: 予約情報

### Lambda 関数
- **MembersFunction**: 会員管理API
- **VehiclesFunction**: 車両管理API
- **ReservationsFunction**: 予約管理API

### API Gateway
- RESTful API エンドポイント
- CORS対応

## デプロイ手順

1. **前提条件**
   ```bash
   # AWS CLI設定
   aws configure
   
   # CDK CLI インストール
   npm install -g aws-cdk
   ```

2. **デプロイ実行**
   ```bash
   # バッチファイルで一括実行
   backend\deploy.bat
   
   # または手動で実行
   cd backend\cdk
   pip install -r requirements.txt
   cdk bootstrap
   cdk deploy
   ```

3. **API エンドポイント確認**
   デプロイ完了後に出力されるAPI Gateway URLを確認

## API エンドポイント

### Members API
- `GET /members` - 全会員取得
- `GET /members?email={email}` - メールで会員検索
- `GET /members/{memberId}` - 会員詳細取得
- `POST /members` - 新規会員登録
- `PUT /members/{memberId}` - 会員情報更新
- `DELETE /members/{memberId}` - 会員削除（無効化）

### Vehicles API  
- `GET /vehicles` - 全車両取得
- `GET /vehicles?type={type}` - タイプ別車両取得
- `GET /vehicles/{vehicleId}` - 車両詳細取得
- `POST /vehicles` - 新規車両登録
- `PUT /vehicles/{vehicleId}` - 車両情報更新
- `DELETE /vehicles/{vehicleId}` - 車両削除（無効化）

## データ構造

### Member
```json
{
  "memberId": "2025081234",
  "email": "test@example.com", 
  "licenseLastFour": "1234",
  "registrationDate": "2025-08-10T12:00:00Z",
  "isActive": true
}
```

### Vehicle
```json
{
  "vehicleId": "uuid",
  "name": "Toyota Prius",
  "vehicleType": "car",
  "pricePerHour": 1500,
  "capacity": 5,
  "isAvailable": true
}
```

## テスト

```bash
# API テストスクリプト実行
python backend\test-api.py
```

## セキュリティ

- Lambda実行ロールで最小権限設定
- DynamoDB リードライト権限のみ付与
- CORS設定でフロントエンドドメイン制限
- Point-in-time recovery有効化