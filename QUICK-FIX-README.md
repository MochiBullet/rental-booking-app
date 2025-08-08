# 🚨 緊急修正: S3バケット404エラー

## 問題
```
404 Not Found - The specified bucket does not exist
BucketName: rental-booking-app-bucket
```

## 原因
1. GitHub SecretsにS3_BUCKET_NAMEが未設定
2. AWS認証情報が未設定
3. S3バケットが実際に存在しない

## 🚀 即座に解決する方法

### 方法1: 自動バケット作成（推奨）
```bash
create-bucket-now.bat
```
このスクリプトが自動で実行:
- ✅ 一意なバケット名を生成
- ✅ S3バケット作成
- ✅ 静的ホスティング設定
- ✅ パブリックアクセス設定
- ✅ ビルド&アップロード

### 方法2: GitHub Secretsを手動設定

1. **GitHubリポジトリを開く**
   https://github.com/MochiBullet/rental-booking-app

2. **Settings → Secrets and variables → Actions**

3. **以下を追加**:
   ```
   AWS_ACCESS_KEY_ID = [あなたのAWSアクセスキー]
   AWS_SECRET_ACCESS_KEY = [あなたのAWSシークレットキー]
   S3_BUCKET_NAME = msbase-rental-[ランダム番号]
   ```

### 方法3: AWSコンソールで手動作成

1. **S3コンソール**: https://s3.console.aws.amazon.com/s3/
2. **Create bucket**
3. **Bucket name**: `msbase-rental-2025` (一意な名前)
4. **Region**: `ap-southeast-2`
5. **Block Public Access**: すべてのチェックを外す
6. **Create bucket**

その後:
- **Properties** → **Static website hosting** → **Enable**
- **Index document**: `index.html`
- **Permissions** → **Bucket policy**で公開設定

## 📊 設定後の確認

正しく設定されると以下のURLでアクセス可能:
```
http://[YOUR-BUCKET-NAME].s3-website-ap-southeast-2.amazonaws.com
```

## 🔄 今後の自動デプロイ

GitHub Secretsを設定後、以下で自動デプロイ:
1. コードを変更
2. git push
3. GitHub Actionsが自動実行

## ⚡ 最速解決手順

1. `create-bucket-now.bat` 実行
2. 表示されたバケット名をGitHub Secretsに設定
3. git push で再デプロイ

**5分で完全解決できます！**