# 🚀 CDK完全デプロイガイド

## CDKでAWSインフラを構築してHTTPS対応サイトを公開

### 📋 前提条件
- Node.js インストール済み
- AWS CLIインストール済み
- AWSアカウント作成済み

## 🎯 ワンクリックデプロイ

### ステップ1: AWS認証情報の設定
```bash
aws configure
```
以下を入力:
- AWS Access Key ID: [あなたのアクセスキー]
- AWS Secret Access Key: [あなたのシークレットキー]
- Default region: ap-southeast-2
- Default output format: json

### ステップ2: 完全自動デプロイ実行
```bash
complete-cdk-deploy.bat
```

このスクリプトが自動で実行すること:
1. ✅ AWS認証チェック
2. ✅ S3バケット作成
3. ✅ CloudFrontディストリビューション作成（HTTPS対応）
4. ✅ IAMロール作成（GitHub Actions用）
5. ✅ Reactアプリのビルド
6. ✅ S3へのアップロード

## 📂 作成したスクリプト

### 1. `cdk/setup-cdk.bat`
CDKの初期セットアップ（依存関係インストール、ビルド）

### 2. `cdk/deploy.bat`
CDKスタックのデプロイ（インフラ構築）

### 3. `cdk/post-deploy.bat`
ビルドファイルのS3アップロード

### 4. `complete-cdk-deploy.bat`
上記すべてを順番に実行する統合スクリプト

## 🏗️ CDKが作成するインフラ

### RentalBookingWebStack
- **S3バケット**: 静的ファイルホスティング
- **CloudFront**: HTTPS対応、グローバルCDN
- **OAI**: セキュアなS3アクセス

### RentalBookingCICDStack
- **IAMロール**: GitHub Actions用
- **ポリシー**: S3アップロード権限

## 📊 デプロイ後の確認

### CDK出力ファイル
`cdk/outputs.json`に以下が記録されます:
- CloudFront URL（HTTPS）
- S3バケット名
- IAMロール ARN

### アクセス方法
1. `cdk/outputs.json`を開く
2. `WebsiteURL`の値をコピー
3. ブラウザでアクセス（15-20分後）

## 🔧 トラブルシューティング

### AWS認証エラー
```bash
aws configure list
```
で設定を確認

### CDKブートストラップエラー
```bash
cd cdk
npx cdk bootstrap aws://[ACCOUNT_ID]/ap-southeast-2
```

### ビルドエラー
```bash
npm install
npm run build
```

### S3アップロードエラー
バケット名を確認:
```bash
aws s3 ls
```

## 🎉 成功時の動作

1. **インフラ構築**: 5-10分
2. **CloudFront配信**: 15-20分
3. **HTTPS URL発行**: 即座
4. **グローバル配信**: 自動

## 📝 次のステップ

### GitHub Actions設定
`cdk/outputs.json`から以下をGitHub Secretsに追加:
- S3_BUCKET_NAME
- CLOUDFRONT_DISTRIBUTION_ID
- AWS_ROLE_ARN

### 自動デプロイ
GitHubにプッシュすると自動でデプロイされます

## 💡 Tips

- CloudFrontは初回配信に時間がかかります
- キャッシュクリアは`aws cloudfront create-invalidation`
- ログは CloudWatch で確認可能

## 🚨 注意事項

- AWS利用料金が発生する可能性があります
- 無料枠: CloudFront 1TB/月、S3 5GB
- 不要時は`cdk destroy`で削除

---

**準備ができたら `complete-cdk-deploy.bat` を実行してください！**