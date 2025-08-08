# 🚀 AWS設定手順書

## 現在の状況
- ✅ CDKデプロイスクリプト作成完了
- ✅ GitHubへのプッシュ完了
- ❌ AWS認証未設定のため自動実行不可

## 📋 今すぐ実行する手順

### 方法1: AWS CLIでの設定（推奨）

#### 1. AWS認証設定
```bash
aws configure
```
入力項目:
- AWS Access Key ID: [AWSコンソールから取得]
- AWS Secret Access Key: [AWSコンソールから取得]
- Default region name: **ap-southeast-2**
- Default output format: **json**

#### 2. CDKデプロイ実行
```bash
cd C:\Users\hiyok\projects\rental-booking-app
complete-cdk-deploy.bat
```

### 方法2: AWSコンソールで手動設定

#### 1. S3バケット作成
1. https://s3.console.aws.amazon.com/s3/
2. 「Create bucket」
3. バケット名: `rental-booking-app-bucket`
4. リージョン: `ap-southeast-2`
5. 「Block all public access」のチェックをすべて外す
6. 作成

#### 2. 静的ウェブサイトホスティング有効化
1. 作成したバケットを選択
2. 「Properties」タブ
3. 「Static website hosting」→「Edit」
4. Enable, Index document: `index.html`
5. 保存

#### 3. バケットポリシー設定
1. 「Permissions」タブ
2. 「Bucket policy」→「Edit」
3. 以下をペースト:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::rental-booking-app-bucket/*"
        }
    ]
}
```

#### 4. ビルドファイルアップロード
1. プロジェクトフォルダで `run-build.bat` 実行
2. S3コンソールで「Upload」
3. `build`フォルダの中身をすべてアップロード

### 方法3: GitHub Actionsの確認

現在GitHub Actionsが設定されている場合:
1. https://github.com/MochiBullet/rental-booking-app/actions
2. 最新のワークフロー実行を確認
3. 緑のチェックマークなら成功

## 📊 動作確認URL

### S3直接（HTTP）
http://rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com

### CloudFront（HTTPS）※CDKデプロイ後
デプロイ後に`cdk/outputs.json`で確認

## 🔍 現在の課題と解決策

### 課題
1. AWS認証情報が未設定
2. S3バケットの状態が不明
3. HTTPSアクセス不可

### 解決策
1. AWS CLIを設定する
2. または手動でS3を設定する
3. CDKでCloudFrontを作成する

## 📝 次のアクション

1. **最優先**: AWS認証設定
2. **その後**: `complete-cdk-deploy.bat`実行
3. **確認**: CloudFront URLでアクセス

---

**サポートが必要な場合は、エラーメッセージを共有してください。**