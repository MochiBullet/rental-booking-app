# GitHub Secrets 設定手順

## 📝 設定が必要なシークレット

GitHubリポジトリで以下の手順で設定してください：

### 1. リポジトリの設定ページを開く
[https://github.com/MochiBullet/rental-booking-app/settings/secrets/actions](https://github.com/MochiBullet/rental-booking-app/settings/secrets/actions)

### 2. 「New repository secret」をクリック

### 3. 以下の4つのシークレットを追加

#### AWS_ACCESS_KEY_ID
- Name: `AWS_ACCESS_KEY_ID`
- Secret: （あなたのAWSアクセスキーID）

#### AWS_SECRET_ACCESS_KEY
- Name: `AWS_SECRET_ACCESS_KEY`
- Secret: （あなたのAWSシークレットアクセスキー）

#### AWS_REGION
- Name: `AWS_REGION`
- Secret: `ap-northeast-1`

#### S3_BUCKET_NAME
- Name: `S3_BUCKET_NAME`
- Secret: `rental-booking-app-website`

## 🔐 AWSキーの確認方法

もしAWSキーが不明な場合：

1. AWS Management Consoleにログイン
2. IAM → ユーザー → あなたのユーザー名をクリック
3. セキュリティ認証情報タブ
4. アクセスキーの作成（既存のキーは表示されません）

## ✅ 設定完了後

GitHub Secretsを設定したら、以下のコマンドでデプロイをトリガーできます：

```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

または、GitHub Actionsページから手動で実行：
[https://github.com/MochiBullet/rental-booking-app/actions](https://github.com/MochiBullet/rental-booking-app/actions)

「Run workflow」ボタンをクリック