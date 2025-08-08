# 🚨 AWS S3デプロイ - 最終確実手順書

## 現在の状況
ワークフローをシンプルに戻し、確実にAWS S3でサイトを表示します。

## 📋 必要な設定（絶対に必要）

### 1. AWS IAMユーザー作成
1. **AWSコンソールにログイン**: https://console.aws.amazon.com/
2. **IAMサービス**を開く
3. **「Users」→「Create user」**
4. **ユーザー名**: `github-actions-deploy`
5. **「Attach policies directly」**を選択
6. **ポリシーを追加**:
   - ✅ `AmazonS3FullAccess`
7. **「Create user」**をクリック

### 2. アクセスキー生成
1. 作成したユーザーをクリック
2. **「Security credentials」**タブ
3. **「Create access key」**
4. **「Command Line Interface (CLI)」**を選択
5. **アクセスキーをコピー**（一度だけ表示されます）

### 3. S3バケット手動作成
1. **S3コンソール**: https://s3.console.aws.amazon.com/s3/
2. **「Create bucket」**
3. **設定**:
   - Bucket name: `msbase-rental-2025-01-08`
   - Region: `ap-southeast-2`
   - **「Block all public access」のすべてのチェックを外す**
4. **「Create bucket」**

### 4. バケット設定
作成したバケットで:

#### A. 静的ウェブサイトホスティング
1. **「Properties」**タブ
2. **「Static website hosting」→「Edit」**
3. **設定**:
   - Static website hosting: **Enable**
   - Index document: `index.html`
   - Error document: `index.html`
4. **「Save changes」**

#### B. バケットポリシー
1. **「Permissions」**タブ
2. **「Bucket policy」→「Edit」**
3. **以下をコピペ**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::msbase-rental-2025-01-08/*"
    }
  ]
}
```
4. **「Save changes」**

### 5. GitHub Secrets設定
1. **GitHubリポジトリ**: https://github.com/MochiBullet/rental-booking-app
2. **「Settings」→「Secrets and variables」→「Actions」**
3. **「New repository secret」**で以下を追加:

```
AWS_ACCESS_KEY_ID
値: [ステップ2で取得したアクセスキーID]

AWS_SECRET_ACCESS_KEY  
値: [ステップ2で取得したシークレットアクセスキー]

S3_BUCKET_NAME
値: msbase-rental-2025-01-08
```

## 🚀 デプロイ実行

### 自動デプロイ
GitHub Secretsを設定後、以下で自動デプロイ:
```bash
git push origin master
```

### 手動デプロイ（バックアップ）
```bash
# 1. ビルド
npm run build

# 2. AWS CLI設定
aws configure
# ↑で上記のアクセスキーを設定

# 3. アップロード
aws s3 sync build/ s3://msbase-rental-2025-01-08/ --delete --region ap-southeast-2
```

## 🌐 アクセスURL

設定完了後、以下でアクセス可能:
```
http://msbase-rental-2025-01-08.s3-website-ap-southeast-2.amazonaws.com
```

## ✅ 確認チェックリスト

- [ ] IAMユーザー作成完了
- [ ] アクセスキー取得完了
- [ ] S3バケット作成完了
- [ ] 静的ホスティング有効化完了
- [ ] バケットポリシー設定完了
- [ ] GitHub Secrets 3つ設定完了
- [ ] git push実行完了
- [ ] サイトアクセス確認完了

## 🆘 トラブルシューティング

### エラー: Access Denied
→ バケットポリシーとパブリックアクセス設定を再確認

### エラー: Bucket does not exist  
→ S3_BUCKET_NAMEが正確に設定されているか確認

### エラー: Credentials not found
→ GitHub Secretsの設定を再確認

**この手順で確実にAWS S3でのサイト表示が可能になります！**