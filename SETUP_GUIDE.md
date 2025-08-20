# 🚀 開発環境セットアップ完全ガイド

## 📌 重要な情報とURL

### 本番環境URL
- **S3直接URL**: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com
- **CloudFront**: https://d1y20ady8hnkgx.cloudfront.net
- **独自ドメイン**: https://ms-base-rental.com

### AWS設定
- **リージョン**: `ap-southeast-2` (シドニー)
- **S3バケット名**: `rental-booking-app-website`
- **CloudFront Distribution ID**: `E2ANNXZ9LL61PY`

### API エンドポイント（重要：変更禁止）
- **API Gateway Base URL**: `https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod`
- **サイト設定API**: `https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod/site-settings`

### DynamoDBテーブル
- `rental-booking-members` - 会員情報
- `rental-booking-vehicles` - 車両情報
- `rental-booking-reservations` - 予約情報
- `rental-booking-site-settings` - サイト設定

### 管理者ログイン情報
- **アクセス方法**: サイト名を10回クリック
- **Username**: `admin`
- **Password**: `msbase7032`

---

## ✅ 実装済み機能一覧

### 1. バックエンド（AWS CDK + Python Lambda）
- [x] CDKによるインフラ構築（`backend/cdk/app.py`）
- [x] DynamoDBテーブル作成（members, vehicles, reservations, site-settings）
- [x] Python Lambda関数（CRUD操作）
- [x] API Gateway設定（REST API）
- [x] CORS設定
- [x] 環境変数設定

### 2. フロントエンド
- [x] React 18アプリケーション
- [x] DynamoDB API連携（`src/services/siteSettingsAPI.js`）
- [x] LocalStorageフォールバック機能
- [x] リアルタイム設定反映機能

### 3. デプロイ設定
- [x] GitHub Actions自動デプロイ（`.github/workflows/main.yml`）
- [x] S3静的ホスティング
- [x] CloudFront CDN設定

---

## 🔧 開発環境セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/MochiBullet/rental-booking-app.git
cd rental-booking-app
```

### 2. 依存関係のインストール
```bash
# フロントエンド
npm install

# バックエンド（CDK）
cd backend/cdk
npm install
pip install -r requirements.txt
cd ../..
```

### 3. AWS CLI設定
```bash
aws configure
# Region: ap-southeast-2
# Output format: json
```

### 4. 開発サーバー起動
```bash
npm start
# http://localhost:3000 で確認
```

---

## 🏗️ CDKデプロイ手順（重要）

### 1. CDKブートストラップ（初回のみ）
```bash
cd backend/cdk
cdk bootstrap aws://ACCOUNT-ID/ap-southeast-2
```

### 2. CDKデプロイ
```bash
cd backend/cdk
cdk deploy --all
# 出力されるAPI URLを記録
```

### 3. API URLの更新（必須）
```javascript
// src/services/siteSettingsAPI.js
const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';
// ↑ CDKデプロイで出力されたURLに更新
```

---

## 📝 開発フロー（必ず守ること）

### 1. 機能開発の基本フロー
```bash
# 1. 最新を取得
git pull origin master

# 2. 開発作業
# コード編集...

# 3. ローカルテスト
npm start

# 4. ビルド
npm run build

# 5. コミット＆プッシュ（必須）
git add -A
git commit -m "機能: 実装内容を記載"
git push origin master

# 6. デプロイ確認
# GitHub Actions: https://github.com/MochiBullet/rental-booking-app/actions
```

### 2. バックエンド変更時
```bash
# 1. Lambda関数を編集
# backend/lambda/*/handler.py

# 2. CDKデプロイ
cd backend/cdk
cdk deploy

# 3. 変更をコミット（重要）
git add -A
git commit -m "バックエンド: Lambda関数更新"
git push origin master
```

### 3. 手動デプロイ（緊急時）
```bash
# S3へ直接デプロイ
aws s3 sync build/ s3://rental-booking-app-website --delete --region ap-southeast-2

# CloudFrontキャッシュクリア
aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*"
```

---

## ⚠️ 重要な注意事項

### 絶対に変更してはいけないもの
1. **API Gateway URL**: `https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod`
2. **S3バケット名**: `rental-booking-app-website`
3. **リージョン**: `ap-southeast-2`
4. **DynamoDBテーブル名のプレフィックス**: `rental-booking-`

### 必ず実行すること
1. **毎回git push**: 変更は必ずGitHubにプッシュ
2. **CDK使用**: インフラ変更は必ずCDKを使用
3. **API経由アクセス**: DynamoDBへは必ずLambda経由でアクセス
4. **ビルドテスト**: デプロイ前に必ず`npm run build`

---

## 🐛 トラブルシューティング

### CloudFrontが更新されない
```bash
# キャッシュ強制クリア
aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*"
# 5-10分待つ
```

### DynamoDB接続エラー
```javascript
// ブラウザコンソールで実行
localStorage.clear();
location.reload();
```

### GitHub Actions失敗
1. Secretsを確認:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME` = `rental-booking-app-website`

---

## 📂 プロジェクト構造

```
rental-booking-app/
├── src/                      # フロントエンド
│   ├── components/          # Reactコンポーネント
│   ├── services/           # API連携
│   │   └── siteSettingsAPI.js  # DynamoDB API
│   └── data/              # 初期データ
├── backend/                # バックエンド
│   ├── cdk/              # CDKインフラ定義
│   │   └── app.py       # メインスタック
│   └── lambda/          # Lambda関数
│       ├── members/     # 会員CRUD
│       ├── vehicles/    # 車両CRUD
│       ├── reservations/# 予約CRUD
│       └── site-settings/# サイト設定CRUD
├── .github/
│   └── workflows/
│       └── main.yml     # 自動デプロイ
└── scripts/            # ユーティリティスクリプト
```

---

## 🔐 セキュリティ設定

### フロントエンド→バックエンド通信
```javascript
// 正しい実装（API Gateway経由）
const response = await fetch('https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod/members');

// ❌ 絶対にやってはいけない（直接DynamoDB）
// const dynamodb = new AWS.DynamoDB(); // 禁止
```

### Lambda IAMロール
- DynamoDBへの読み書き権限のみ付与
- 最小権限の原則を遵守

---

## 📊 現在のデータフロー

```
ユーザー（ブラウザ）
    ↓ HTTPS
API Gateway (https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod)
    ↓ 
Lambda関数 (Python)
    ↓ AWS SDK
DynamoDB
```

---

## 🎯 次回作業時のクイックスタート

```bash
# 1. プロジェクトディレクトリへ
cd C:\Windows\System32\rental-booking-app

# 2. 最新を取得
git pull origin master

# 3. 開発サーバー起動
npm start

# 4. 別ターミナルでログ監視
cd backend/cdk
cdk logs --follow

# 5. 作業開始！
```

---

## 📞 問題発生時の確認リスト

- [ ] GitHub Actionsの状態確認
- [ ] CloudFrontキャッシュクリア実行
- [ ] S3バケット名が正しいか確認
- [ ] API URLが変更されていないか確認
- [ ] DynamoDBテーブルが存在するか確認
- [ ] Lambda関数のログ確認（CloudWatch）

---

## 🎉 実装完了機能

1. **DynamoDB統合** ✅
   - 4つのテーブル作成済み
   - Lambda経由でCRUD操作可能

2. **Python Lambda** ✅
   - 各リソース用のハンドラー実装済み
   - エラーハンドリング実装

3. **CDKインフラ** ✅
   - 完全なIaCで管理
   - 1コマンドでデプロイ可能

4. **フロントエンド分離** ✅
   - API経由でバックエンド接続
   - LocalStorageフォールバック

5. **自動デプロイ** ✅
   - GitHub push → 自動S3デプロイ
   - CloudFront自動無効化

---

## 📝 コミットメッセージテンプレート

```
機能: [新機能の説明]
修正: [バグ修正の説明]
更新: [既存機能の更新]
削除: [機能削除]
ドキュメント: [ドキュメント更新]
リファクタ: [コード改善]
テスト: [テスト追加/修正]
デプロイ: [デプロイ設定変更]

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

最終更新: 2025年8月20日
作成者: Claude Code with MochiBullet