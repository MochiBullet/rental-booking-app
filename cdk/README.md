# AWS CDK Infrastructure for Rental Booking App

このディレクトリには、Rental Booking AppのAWSインフラストラクチャをCDKで定義したコードが含まれています。

## 構成

### スタック

1. **RentalBookingWebStack**
   - S3バケット（静的ウェブサイトホスティング）
   - CloudFrontディストリビューション（CDN）
   - Origin Access Identity（OAI）

2. **RentalBookingCICDStack**
   - GitHub Actions用のIAMロール（OIDC認証）
   - S3とCloudFrontへのアクセス権限

## 前提条件

- Node.js 18以上
- AWS CLI設定済み
- AWS CDK CLI（自動インストールされます）

## デプロイ手順

### 1. AWS認証情報の設定

```bash
aws configure
```

または環境変数を設定:

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=ap-northeast-1
```

### 2. CDKのデプロイ

#### Windows
```cmd
cd cdk
deploy.bat
```

#### Linux/Mac
```bash
cd cdk
chmod +x deploy.sh
./deploy.sh
```

#### 手動デプロイ
```bash
cd cdk
npm install
npx cdk bootstrap
npx cdk deploy --all
```

### 3. GitHub Secretsの設定

デプロイ完了後、`outputs.json`ファイルまたはコンソール出力から以下の値を取得し、GitHubリポジトリのSecretsに設定:

| Secret/Variable名 | 値 | タイプ |
|------------------|---|--------|
| `AWS_REGION` | ap-northeast-1 | Secret |
| `S3_BUCKET_NAME` | outputs.jsonから取得 | Secret |
| `AWS_ROLE_ARN` | outputs.jsonから取得 | Secret |
| `CLOUDFRONT_DISTRIBUTION_ID` | AWS Consoleから取得 | Secret |
| `USE_OIDC` | true | Variable |

### 4. 自動デプロイの確認

mainブランチにプッシュすると、GitHub Actionsが自動的に実行され、アプリケーションがデプロイされます。

## コマンド

```bash
# CDKスタックの合成（確認）
npm run synth

# CDKスタックのデプロイ
npm run deploy

# CDKスタックの削除
npm run destroy

# TypeScriptのビルド
npm run build

# TypeScriptの監視モード
npm run watch
```

## 環境別デプロイ

```bash
# 本番環境（デフォルト）
./deploy.sh production

# ステージング環境
./deploy.sh staging

# 開発環境
./deploy.sh development
```

## リソース

デプロイされるAWSリソース:

- **S3バケット**: `rental-booking-app-{environment}-{account-id}`
- **CloudFront Distribution**: グローバルCDN配信
- **IAM Role**: `RentalBookingApp-GitHubActions-{environment}`
- **OIDC Provider**: GitHub Actions認証用

## コスト見積もり

月額コスト（目安）:
- S3: $0.023/GB（ストレージ）+ $0.0004/1000リクエスト
- CloudFront: $0.085/GB（転送）+ $0.0075/10000リクエスト
- 合計: 小規模サイトの場合、月額$1-5程度

## トラブルシューティング

### CDKブートストラップエラー
```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### デプロイ権限エラー
AWS IAMユーザーに以下の権限が必要:
- CloudFormation
- S3
- CloudFront
- IAM（ロール作成用）

### GitHub Actions失敗
1. Secretsが正しく設定されているか確認
2. USE_OIDC変数がtrueに設定されているか確認
3. IAMロールの信頼関係が正しいか確認

## 削除

インフラストラクチャを完全に削除する場合:

```bash
cd cdk
npx cdk destroy --all
```

注意: S3バケットにファイルがある場合は、先に手動で削除が必要です。

## サポート

問題が発生した場合は、GitHubのIssueで報告してください。