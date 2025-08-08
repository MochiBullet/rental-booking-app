# AWS CLI設定ガイド

## 🔧 AWS CLIの設定方法

### ステップ1: AWS認証情報の取得
1. AWSコンソールにログイン: https://console.aws.amazon.com/
2. 右上のユーザー名をクリック → 「Security credentials」
3. 「Access keys」セクション → 「Create access key」
4. Access Key IDとSecret Access Keyをメモ

### ステップ2: AWS CLI設定
コマンドプロンプトで以下を実行:

```bash
aws configure
```

以下を入力:
- AWS Access Key ID: [取得したAccess Key ID]
- AWS Secret Access Key: [取得したSecret Access Key]
- Default region name: ap-southeast-2
- Default output format: json

### ステップ3: CloudFront作成実行
設定後、以下を実行:

```bash
cd C:\Users\hiyok\projects\rental-booking-app
create-cloudfront.bat
```

## 🚀 代替方法: AWSコンソールから手動作成

AWS CLIが使えない場合は、AWSコンソールから直接作成できます:

### 1. CloudFrontコンソールを開く
https://console.aws.amazon.com/cloudfront/

### 2. 「Create Distribution」をクリック

### 3. 以下を設定:
- **Origin Domain**: rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com
- **Protocol**: HTTP only
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Compress Objects Automatically**: Yes
- **Default Root Object**: index.html

### 4. Custom Error Pages設定
- Error Code: 404 → Response: 200 → Page Path: /index.html
- Error Code: 403 → Response: 200 → Page Path: /index.html

### 5. 「Create Distribution」をクリック

### 6. 15-20分待つ
Status が「Deployed」になるまで待機

### 7. CloudFront URLでアクセス
Distribution Domain Name (例: d1234567890.cloudfront.net) でHTTPSアクセス可能

## 📝 重要な情報

- CloudFrontは初回作成に15-20分かかります
- 料金: 月間1TBまで無料枠あり
- 独自ドメインを使う場合はACM証明書が必要

## 🆘 トラブルシューティング

### AWS CLIエラーの場合
1. `aws --version` でインストール確認
2. 未インストールなら: https://aws.amazon.com/cli/
3. 権限不足なら: IAMでCloudFront権限追加

### アクセスできない場合
1. CloudFront Statusが「Deployed」か確認
2. ブラウザのキャッシュクリア
3. CloudFront URLを正確に入力