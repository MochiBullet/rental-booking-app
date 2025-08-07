# RentalEasy AWS データベース アーキテクチャ

## 🏗️ 推奨構成：サーバーレス + RDS

### アーキテクチャ図
```
[React App (S3)] 
       ↓ HTTPS
[CloudFront + API Gateway]
       ↓ Lambda invoke  
[Lambda Functions (Node.js)]
       ↓ MySQL connection
[RDS MySQL (t3.micro)]
       ↓ backup
[RDS Automated Backups]
```

## 📊 データベース選択肢

### 1. **Amazon RDS MySQL** ⭐ 推奨
- **料金**: t3.micro $15-20/月
- **利点**: 
  - 自動バックアップ・メンテナンス
  - スケーラブル
  - 高可用性オプション
  - 既存SQLスキル活用可能
- **用途**: レンタル予約、ユーザー管理、決済情報

### 2. **DynamoDB** (NoSQL)
- **料金**: 従量課金 (~$5-15/月)
- **利点**:
  - 完全サーバーレス
  - 高速・低レイテンシ
  - 自動スケーリング
- **用途**: セッション管理、ログ、キャッシュ

### 3. **Aurora Serverless v2** (高機能)
- **料金**: $50-100/月
- **利点**:
  - MySQL互換
  - 自動スケーリング
  - 高性能
- **用途**: 本格運用時の移行先

## 🎯 推奨：**ハイブリッド構成**

### メインDB: RDS MySQL
```sql
-- ユーザー・予約・支払い・車両情報
-- トランザクション重要データ
```

### セッション・キャッシュ: DynamoDB  
```json
// セッション情報、一時データ
{
  "userId": "12345",
  "sessionToken": "abc...",
  "expires": 1672531200
}
```

## 🚀 実装ステップ

### フェーズ1: RDS MySQL セットアップ
1. RDS インスタンス作成
2. セキュリティグループ設定
3. データベーススキーマ作成

### フェーズ2: Lambda API 構築
1. Lambda関数作成（Node.js）
2. RDS接続設定
3. API Gateway統合

### フェーズ3: React アプリ接続
1. API呼び出しロジック実装
2. LocalStorage→AWS DB移行
3. エラーハンドリング

## 💰 月額料金概算

### 最小構成（開発・小規模）
- RDS MySQL t3.micro: $15
- Lambda実行: $1-5  
- API Gateway: $1-3
- データ転送: $1-2
- **合計: ~$20-25/月**

### 本格運用時
- RDS MySQL t3.small: $30
- Lambda + API Gateway: $10
- CloudWatch: $5
- **合計: ~$45-50/月**

## 🔐 セキュリティ設計

### ネットワーク
- VPC内でのRDS配置
- Lambda→RDS間は内部通信
- API GatewayでCORS設定

### 認証・認可
- JWT トークン認証
- Lambda Authorizer使用
- IAM ロールでアクセス制御

### データ暗号化
- RDS暗号化有効
- 転送時SSL/TLS
- 機密データはAWS KMS

## 📋 次のステップ

どの構成で進めますか？

**A. 最小構成スタート**（RDS MySQL + Lambda）
- コスト重視
- 素早い構築

**B. ハイブリッド構成**（RDS + DynamoDB）  
- パフォーマンス重視
- 本格的な設計

**C. CloudFormation自動化**
- インフラ as Code
- 再現性重視

選択いただければ、具体的な実装を開始します！