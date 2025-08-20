# ✅ 開発チェックリスト - 毎回必ず確認

## 🔴 最重要事項（絶対に守る）

### エンドポイントURL（変更禁止）
```javascript
// ✅ 正しいAPI URL（絶対に変更しない）
const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';
```

### S3バケット名（変更禁止）
```yaml
# ✅ 正しいバケット名
S3_BUCKET_NAME: rental-booking-app-website

# ❌ 間違ったバケット名（使用禁止）
# rental-booking-app-production-276291855506
```

---

## 📋 作業開始時チェックリスト

### 1. 環境準備
- [ ] `cd C:\Windows\System32\rental-booking-app`
- [ ] `git pull origin master` - 最新を取得
- [ ] `npm install` - 依存関係を最新化
- [ ] `npm start` - 開発サーバー起動

### 2. AWS環境確認
- [ ] AWS CLIが設定済み（`aws configure list`）
- [ ] リージョンが`ap-southeast-2`
- [ ] CDKがインストール済み（`cdk --version`）

---

## 🔄 作業中の必須ルール

### コード変更時
- [ ] 変更前にブランチの状態確認（`git status`）
- [ ] ローカルでテスト実行（`npm start`）
- [ ] ビルド成功確認（`npm run build`）

### Git操作（毎回必須）
```bash
# 変更後は必ず実行
git add -A
git commit -m "変更内容: 詳細な説明"
git push origin master
```

### デプロイ確認
- [ ] GitHub Actions確認: https://github.com/MochiBullet/rental-booking-app/actions
- [ ] 本番環境確認: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com

---

## 🚀 CDK使用時の必須事項

### Lambda関数更新時
```bash
# 1. 関数を編集
vi backend/lambda/[function-name]/handler.py

# 2. CDKデプロイ（必須）
cd backend/cdk
cdk deploy

# 3. 出力を確認・記録
# APIEndpoint: https://xxxxx.execute-api.ap-southeast-2.amazonaws.com/prod

# 4. 変更をコミット（必須）
git add -A
git commit -m "Lambda: [関数名]を更新"
git push origin master
```

### DynamoDB変更時
```bash
# 1. CDKファイルを編集
vi backend/cdk/app.py

# 2. 差分確認
cdk diff

# 3. デプロイ
cdk deploy

# 4. 必ずコミット
git add -A
git commit -m "DynamoDB: テーブル構造を更新"
git push origin master
```

---

## ⚠️ やってはいけないこと

### ❌ 絶対禁止事項
1. **API URLの変更** - 既存のエンドポイントを変更しない
2. **直接DynamoDBアクセス** - フロントエンドから直接アクセスしない
3. **S3バケット名変更** - `rental-booking-app-website`から変更しない
4. **リージョン変更** - `ap-southeast-2`から変更しない
5. **git pushを忘れる** - 変更は必ずプッシュ

### ❌ 避けるべきこと
1. CDKを使わずに手動でAWSリソース作成
2. Lambda関数のローカルテストなしでデプロイ
3. ビルドエラーを無視してデプロイ
4. コミットメッセージを適当に書く

---

## 🔍 デバッグ時の確認項目

### フロントエンドが動かない
```javascript
// ブラウザコンソールで実行
console.log('API URL:', 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod');
localStorage.clear();
location.reload();
```

### API接続エラー
```bash
# Lambda関数のログ確認
aws logs tail /aws/lambda/[function-name] --follow

# API Gatewayのテスト
curl https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod/site-settings
```

### DynamoDB接続エラー
```bash
# テーブル存在確認
aws dynamodb list-tables --region ap-southeast-2

# データ確認
aws dynamodb scan --table-name rental-booking-site-settings --region ap-southeast-2
```

---

## 📊 現在の構成（2025年8月20日時点）

### 実装済みLambda関数
- ✅ `members` - 会員CRUD
- ✅ `vehicles` - 車両CRUD  
- ✅ `reservations` - 予約CRUD
- ✅ `site-settings` - サイト設定CRUD

### DynamoDBテーブル
- ✅ `rental-booking-members`
- ✅ `rental-booking-vehicles`
- ✅ `rental-booking-reservations`
- ✅ `rental-booking-site-settings`

### API エンドポイント
```
GET/POST    /members
GET/PUT/DELETE /members/{memberId}

GET/POST    /vehicles  
GET/PUT/DELETE /vehicles/{vehicleId}

GET/POST    /reservations
GET/PUT/DELETE /reservations/{id}

GET/POST    /site-settings
GET/PUT/DELETE /site-settings/{settingKey}
```

---

## 💾 バックアップとリカバリ

### 設定のバックアップ
```bash
# DynamoDBデータのエクスポート
aws dynamodb scan --table-name rental-booking-site-settings > backup-settings.json

# S3バケットのバックアップ
aws s3 sync s3://rental-booking-app-website ./backup-s3 --region ap-southeast-2
```

### 緊急時の手動デプロイ
```bash
# ビルド
npm run build

# S3アップロード
aws s3 sync build/ s3://rental-booking-app-website --delete --region ap-southeast-2

# キャッシュクリア
aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*"
```

---

## 📝 コミット前の最終チェック

- [ ] `npm run build` が成功する
- [ ] ローカルで動作確認済み
- [ ] API URLが変更されていない
- [ ] S3バケット名が正しい
- [ ] 不要なconsole.logを削除
- [ ] コミットメッセージが明確

---

## 🎯 完了したら

1. GitHub Actionsでデプロイ確認
2. 本番環境で動作確認
3. 問題があれば即座に前のコミットに戻す
```bash
git revert HEAD
git push origin master
```

---

最終更新: 2025年8月20日
次回はこのチェックリストに従って作業を開始してください！