# 🚀 最小コスト AWS データベース移行ガイド

## ⚡ ワンクリック開始（推奨）

### 今すぐ実行可能
```bash
# プロジェクトディレクトリで実行
cd aws-database
chmod +x quick-deploy.sh
./quick-deploy.sh
```

**所要時間**: 5-10分  
**推定月額**: $0-3 (AWS無料利用枠)

## 📋 段階的移行プラン

### Phase 1: インフラ構築 (今日)
```bash
# 1. CloudFormation でインフラ作成
aws cloudformation create-stack \
  --stack-name rentaleasy-minimal-dev \
  --template-body file://minimal-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-2

# 2. 完了確認（2-3分後）
aws cloudformation describe-stacks \
  --stack-name rentaleasy-minimal-dev \
  --query 'Stacks[0].StackStatus'
```

**作成されるリソース**:
- ✅ DynamoDB テーブル (25GB無料)
- ✅ Lambda 実行ロール
- ✅ API Gateway (100万リクエスト/月無料)
- ✅ CloudWatch アラーム ($5超過で通知)

### Phase 2: Lambda関数デプロイ (明日)
```bash
# 1. 依存関係インストール
cd lambda
npm install

# 2. お知らせ管理API
aws lambda create-function \
  --function-name dev-rentaleasy-announcements \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT:role/dev-rentaleasy-lambda-minimal-role \
  --handler announcements/handler.handler \
  --zip-file fileb://announcements.zip

# 3. API Gateway 統合
# (詳細は deploy-functions.sh に記載)
```

### Phase 3: React アプリ統合 (来週)
```bash
# 1. 環境変数ファイル使用
cp .env.aws .env

# 2. API クライアント実装
# src/services/awsApiClient.js を作成

# 3. 段階的置き換え
# LocalStorage → AWS DynamoDB
```

## 💰 コスト詳細

### AWS無料利用枠 (12ヶ月)
| サービス | 無料枠 | 超過料金 |
|----------|---------|-----------|
| Lambda | 100万実行/月 | $0.0000002/実行 |
| API Gateway | 100万コール/月 | $3.50/100万コール |
| DynamoDB | 25GB + 200万R/W | $0.25/GB |
| CloudWatch | 10メトリクス | $0.30/メトリクス |

### 実際のコスト予想
- **0-1000ユーザー**: $0/月
- **1000-5000ユーザー**: $1-2/月  
- **5000-10000ユーザー**: $2-5/月

## 🔧 実装手順（詳細）

### 1. 最小限デプロイ
```bash
# すべて自動実行
./quick-deploy.sh

# 手動確認
aws dynamodb list-tables
aws lambda list-functions
aws apigateway get-rest-apis
```

### 2. データ構造テスト
```javascript
// DynamoDB テーブル確認
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// お知らせテスト作成
const testAnnouncement = {
    PK: 'ANNOUNCEMENTS',
    SK: 'ANNOUNCEMENT#001',
    title: 'テストお知らせ',
    content: 'DynamoDB接続テスト',
    published: true,
    createdAt: new Date().toISOString()
};

await dynamodb.put({
    TableName: 'dev-rentaleasy-main',
    Item: testAnnouncement
}).promise();
```

### 3. React アプリ更新
```javascript
// src/services/awsApiClient.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const awsApiClient = {
    async getAnnouncements() {
        const response = await fetch(`${API_BASE_URL}/announcements`);
        return response.json();
    },
    
    async createAnnouncement(data) {
        const response = await fetch(`${API_BASE_URL}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
```

## 🚨 トラブルシューティング

### よくある問題と解決法

**1. CloudFormation デプロイエラー**
```bash
# エラー詳細確認
aws cloudformation describe-stack-events \
  --stack-name rentaleasy-minimal-dev

# ロールバック後に再実行
aws cloudformation delete-stack \
  --stack-name rentaleasy-minimal-dev
```

**2. Lambda 関数エラー**
```bash
# ログ確認
aws logs tail /aws/lambda/dev-rentaleasy-announcements

# テスト実行
aws lambda invoke \
  --function-name dev-rentaleasy-announcements \
  --payload '{"httpMethod":"GET"}' \
  response.json
```

**3. CORS エラー**
```javascript
// API Gateway でCORS有効化済み
// フロントエンドで確認
fetch(API_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
```

## 📊 監視・メンテナンス

### 日次チェック項目
- [ ] CloudWatch でコスト確認
- [ ] Lambda エラー率監視  
- [ ] DynamoDB 使用量確認
- [ ] API Gateway レスポンス時間

### 週次最適化
```bash
# 未使用リソース確認
aws logs describe-log-groups \
  --log-group-name-prefix '/aws/lambda/dev-rentaleasy'

# DynamoDB使用量確認  
aws dynamodb describe-table \
  --table-name dev-rentaleasy-main
```

## 🎯 成功指標

### 技術指標
- ✅ API レスポンス時間 < 500ms
- ✅ Lambda エラー率 < 1%
- ✅ 月額コスト < $5
- ✅ 可用性 > 99.9%

### ビジネス指標  
- ✅ ページ読み込み速度改善
- ✅ リアルタイムデータ更新
- ✅ スケーラビリティ確保
- ✅ 開発速度向上

## 🏃‍♂️ 今すぐ開始

```bash
# ワンコマンドで開始
cd rental-booking-app/aws-database
./quick-deploy.sh
```

**所要時間**: 10分で完全なAWSデータベースが利用可能！  
**月額コスト**: $0-3 (AWS無料利用枠内)

質問や問題があれば、AWSサポートまたはCloudFormationログで詳細を確認できます。