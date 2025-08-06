# レンタル予約サービス - AWS S3 自動デプロイ設定

## セットアップ手順

### 1. AWS S3バケットの設定

1. AWS S3でバケットを作成（まだの場合）
2. バケットの「プロパティ」→「静的ウェブサイトホスティング」を有効化
3. インデックスドキュメント: `index.html`
4. エラードキュメント: `index.html` (React SPAの場合)

### 2. S3バケットポリシーの設定

バケットの「アクセス許可」→「バケットポリシー」に以下を追加：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

### 3. GitHub Secretsの設定

GitHubリポジトリの Settings → Secrets and variables → Actions で以下のシークレットを追加：

- `AWS_ACCESS_KEY_ID`: AWSアクセスキーID
- `AWS_SECRET_ACCESS_KEY`: AWSシークレットアクセスキー
- `AWS_REGION`: リージョン（例: ap-northeast-1）
- `S3_BUCKET_NAME`: S3バケット名
- `CLOUDFRONT_DISTRIBUTION_ID`: (オプション) CloudFrontを使用する場合

### 4. デプロイの実行

1. このコードをGitHubリポジトリにプッシュ
```bash
git add .
git commit -m "Add S3 deployment configuration"
git remote add origin https://github.com/YOUR-USERNAME/rental-booking-app.git
git push -u origin main
```

2. GitHub Actionsが自動的に実行され、S3にデプロイされます

### 5. アクセス確認

S3の静的ウェブサイトホスティングURLでアプリケーションにアクセス：
`http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com`

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start

# ビルド
npm run build
```

## トラブルシューティング

### デプロイが失敗する場合

1. GitHub Secretsが正しく設定されているか確認
2. S3バケット名が正しいか確認
3. IAMユーザーに必要な権限があるか確認（S3FullAccess または カスタムポリシー）

### 必要なIAM権限

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR-BUCKET-NAME",
                "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            ]
        }
    ]
}
```