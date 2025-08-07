# RentalEasy AWS データベース デプロイガイド

## 🚀 デプロイ手順

### 前提条件
- AWS CLI インストール・設定済み
- AWS アカウントに適切な権限
- Node.js 18+ インストール済み

## ステップ1: インフラストラクチャ デプロイ

### CloudFormation でインフラ作成
```bash
# AWS CLI でデプロイ
aws cloudformation create-stack \
  --stack-name rentaleasy-dev-infrastructure \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
               ParameterKey=DBUsername,ParameterValue=rentaleasy_admin \
               ParameterKey=DBPassword,ParameterValue=YourSecurePassword123! \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-2

# デプロイ状況確認
aws cloudformation describe-stacks \
  --stack-name rentaleasy-dev-infrastructure \
  --query 'Stacks[0].StackStatus'
```

### 作成されるリソース
- **VPC + サブネット**: セキュアなネットワーク
- **RDS MySQL**: データベースインスタンス
- **セキュリティグループ**: アクセス制御
- **IAM ロール**: Lambda実行権限
- **API Gateway**: RESTful API

## ステップ2: データベース初期化

### MySQL 接続確認
```bash
# RDS エンドポイント取得
export RDS_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name rentaleasy-dev-infrastructure \
  --query 'Stacks[0].Outputs[?OutputKey==`RDSEndpoint`].OutputValue' \
  --output text)

# MySQL 接続（EC2経由またはCloud9推奨）
mysql -h $RDS_ENDPOINT -u rentaleasy_admin -p
```

### データベーススキーマ作成
```sql
-- データベース作成
CREATE DATABASE rentaleasy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rentaleasy;

-- 基本テーブル作成（次のファイルで詳細定義）
SOURCE schema.sql;
```

## ステップ3: Lambda 関数デプロイ

### プロジェクト構造
```
aws-database/
├── lambda/
│   ├── users/
│   │   └── handler.js      # ユーザー管理API
│   ├── rentals/
│   │   └── handler.js      # レンタル管理API
│   ├── announcements/
│   │   └── handler.js      # お知らせ管理API
│   └── shared/
│       └── db.js           # DB接続共通ライブラリ
├── package.json
└── deploy.sh
```

### Lambda デプロイ
```bash
# 依存関係インストール
cd aws-database/lambda
npm install

# デプロイスクリプト実行
./deploy.sh dev
```

## ステップ4: API Gateway 設定

### エンドポイント設定
- `GET/POST /users` - ユーザー管理
- `GET/POST /rentals` - レンタル予約
- `GET/POST /announcements` - お知らせ管理
- `GET/POST /site-settings` - サイト設定

## ステップ5: React アプリケーション更新

### 環境変数設定
```javascript
// .env.production
REACT_APP_API_BASE_URL=https://your-api-id.execute-api.ap-southeast-2.amazonaws.com/dev
REACT_APP_USE_LOCAL_STORAGE=false
```

### API クライアント実装
```javascript
// src/services/apiClient.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

## 💰 コスト管理

### 月額料金概算
- RDS MySQL t3.micro: $15-20
- Lambda 実行: $1-5
- API Gateway: $1-3
- データ転送: $1-2
- **合計: $20-30/月**

### コスト削減Tips
```bash
# RDS を夜間停止（開発環境）
aws rds stop-db-instance --db-instance-identifier dev-rentaleasy-mysql

# RDS を朝に開始
aws rds start-db-instance --db-instance-identifier dev-rentaleasy-mysql
```

## 🔐 セキュリティベストプラクティス

### 1. 認証実装
```javascript
// JWT トークン認証
const authMiddleware = (event) => {
  const token = event.headers.Authorization?.replace('Bearer ', '');
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### 2. CORS設定
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};
```

## 🔧 トラブルシューティング

### よくある問題
1. **RDS接続エラー**: セキュリティグループ設定確認
2. **Lambda タイムアウト**: VPC設定でNAT Gateway必要
3. **CORS エラー**: API Gateway でCORS有効化

### ログ確認
```bash
# Lambda ログ確認
aws logs describe-log-groups --log-group-name-prefix '/aws/lambda/rentaleasy'

# RDS ログ確認  
aws rds describe-db-log-files --db-instance-identifier dev-rentaleasy-mysql
```

## 📋 次のステップ

1. **基本構成デプロイ** ← まずここから
2. Lambda関数実装
3. React アプリ更新
4. 本番環境構築

デプロイを開始しますか？必要な部分から段階的に進められます！