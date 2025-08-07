# 🏆 最低コスト AWS データベース構成

## 💰 **月額コスト: $0-3** (AWS無料利用枠活用)

### アーキテクチャ
```
[React App (S3 - 無料)] 
       ↓ HTTPS
[API Gateway (100万リクエスト/月無料)]
       ↓ 
[Lambda (100万実行/月無料)]
       ↓ 
[DynamoDB (25GB無料 + 200万リクエスト/月無料)]
```

## 🆓 **AWS無料利用枠最大活用**

### 完全無料リソース (12ヶ月間)
- **Lambda**: 100万リクエスト/月 + 400,000GB秒
- **API Gateway**: 100万APIコール/月
- **DynamoDB**: 25GB ストレージ + 200万リクエスト/月
- **S3**: 5GB ストレージ + 20,000 GET + 2,000 PUT
- **CloudWatch**: 10個のメトリクス

### 有料になるケース
- Lambda実行時間が月400,000GB秒超過: $0.0000166667/GB秒
- API Gateway が100万コール超過: $3.50/100万コール
- DynamoDB が25GB超過: $0.25/GB
- **想定月額: $0-3** (小規模利用時)

## 🗄️ **DynamoDB テーブル設計**

### メインテーブル
```javascript
// users テーブル
{
  PK: "USER#123",              // パーティションキー
  SK: "PROFILE",               // ソートキー
  email: "user@example.com",
  name: "山田太郎",
  phone: "090-1234-5678",
  createdAt: "2024-12-10T10:00:00Z"
}

// rentals テーブル  
{
  PK: "RENTAL#456",
  SK: "BOOKING#2024-12-10",
  userId: "USER#123",
  vehicleId: "VEHICLE#789",
  startDate: "2024-12-15",
  endDate: "2024-12-17",
  status: "confirmed",
  totalPrice: 15000
}

// announcements テーブル
{
  PK: "ANNOUNCEMENT#001",
  SK: "2024-12-10",
  title: "サービス開始のお知らせ",
  content: "RentalEasyのサービス...",
  published: true,
  createdAt: "2024-12-10T10:00:00Z"
}
```

### GSI (Global Secondary Index)
```javascript
// ユーザーのレンタル履歴検索用
{
  GSI1PK: "USER#123",          // ユーザーID
  GSI1SK: "RENTAL#2024-12-15", // 日付順ソート
}
```

## 📋 **段階的移行計画**

### Phase 1: DynamoDB のみ ($0/月)
- **目的**: 基本機能のクラウド移行
- **期間**: 1-2週間
- **対象**: ユーザー管理、お知らせ

### Phase 2: 全機能移行 ($0-1/月)  
- **目的**: 完全クラウド化
- **期間**: 2-4週間
- **対象**: レンタル予約、支払い情報

### Phase 3: 最適化 ($1-3/月)
- **目的**: パフォーマンス向上
- **期間**: 継続的改善
- **対象**: インデックス最適化、キャッシュ

## ⚡ **コスト最適化設定**

### DynamoDB オンデマンド設定
```yaml
# 使用量ベースの課金
BillingMode: PAY_PER_REQUEST
# 予想外のコスト防止
PointInTimeRecoveryEnabled: false
# 暗号化（無料）
SSESpecification:
  SSEEnabled: true
```

### Lambda メモリ最適化
```yaml
# メモリを最小に（実行時間短縮とコストバランス）
MemorySize: 128  # MB
Timeout: 10      # 秒
```

## 🚀 **即座にデプロイ可能**

### 1. 最小CloudFormationデプロイ
```bash
# 30秒でデプロイ完了
aws cloudformation create-stack \
  --stack-name rentaleasy-minimal \
  --template-body file://minimal-template.yaml \
  --capabilities CAPABILITY_IAM
```

### 2. 基本Lambda関数デプロイ
```bash
# Node.js関数を3個デプロイ
cd lambda-minimal/
npm install
./deploy.sh
```

### 3. React アプリ更新
```bash
# 環境変数のみ変更
export REACT_APP_USE_DYNAMODB=true
npm run build
```

## 📊 **コスト監視設定**

### CloudWatch アラート
```yaml
# 月額$5超過でアラート
MetricName: EstimatedCharges
Threshold: 5
ComparisonOperator: GreaterThanThreshold
```

### 使用量ダッシュボード
- Lambda実行回数
- DynamoDB読み書き回数  
- API Gateway リクエスト数

## 🎯 **メリット**

✅ **初期費用ゼロ**: AWS無料枠で1年間
✅ **スケーラビリティ**: 需要に応じて自動拡張
✅ **メンテナンス不要**: AWS完全管理
✅ **高速開発**: NoSQL で柔軟なスキーマ
✅ **セキュリティ**: AWS標準セキュリティ

## ⚠️ **制限事項**

- **クエリ制限**: SQLライクなクエリは制限あり
- **トランザクション**: 複雑な処理は要工夫
- **データ移行**: 既存MySQLとは構造が異なる

## 🏃‍♂️ **今すぐ開始**

どの方法で始めますか？

**A. ワンクリックデプロイ** (推奨)
```bash
# 全自動セットアップ（10分）
./quick-deploy.sh
```

**B. 段階的構築**
```bash
# DynamoDB のみ先行
aws cloudformation create-stack --stack-name rentaleasy-db-only
```

**C. 手動カスタマイズ**
- 設定を調整してからデプロイ

選択いただければ、具体的なファイルを作成します！