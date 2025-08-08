# CloudFront HTTPS設定ガイド

## 🔒 HTTPSでサイトを公開する方法

### 方法1: AWS CloudFront経由（無料・推奨）

#### ステップ1: CloudFrontディストリビューション作成
1. AWSコンソールにログイン
2. CloudFront サービスを開く
3. 「Create Distribution」をクリック
4. 以下を設定:
   - Origin Domain: `rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com`
   - Protocol: `HTTP only`
   - Viewer Protocol Policy: `Redirect HTTP to HTTPS`
   - Allowed HTTP Methods: `GET, HEAD`
   - Cache Policy: `CachingOptimized`

#### ステップ2: デプロイ待機（15-20分）
CloudFrontがグローバルに配信されるまで待つ

#### ステップ3: 新しいURLでアクセス
```
https://[your-distribution-id].cloudfront.net
```

### 方法2: 簡易スクリプトで自動設定

以下のコマンドをAWS CLIで実行:

```bash
aws cloudfront create-distribution \
  --origin-domain-name rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com \
  --default-root-object index.html \
  --output json
```

### 方法3: 独自ドメインでHTTPS（ACM証明書必要）

1. AWS Certificate Managerで証明書取得
2. CloudFrontに証明書を設定
3. Route 53でドメイン設定

## 📝 重要な注意点

- S3静的ホスティングは直接HTTPSをサポートしません
- CloudFront経由なら無料でHTTPS化可能
- 初回設定は15-20分かかります

## 🚀 今すぐアクセスする方法

HTTPでアクセス（セキュリティ警告は無視）:
http://rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com