# AWS S3 デプロイメント設定ガイド

このガイドでは、GitHub ActionsからAWS S3にReactアプリケーションを自動デプロイする設定方法を説明します。

## 1. AWS S3バケットの作成と設定

### 1.1 S3バケットの作成
1. AWS Management Consoleにログイン
2. S3サービスを開く
3. 「バケットを作成」をクリック
4. バケット名を入力（例: `rental-booking-app-production`）
5. リージョンを選択（例: `ap-northeast-1` 東京）
6. 「パブリックアクセスをすべてブロック」のチェックを外す
7. 「バケットを作成」をクリック

### 1.2 静的ウェブサイトホスティングの有効化
1. 作成したバケットを開く
2. 「プロパティ」タブに移動
3. 「静的ウェブサイトホスティング」セクションを編集
4. 「有効にする」を選択
5. インデックスドキュメント: `index.html`
6. エラードキュメント: `index.html` (React SPAのため)
7. 保存

### 1.3 バケットポリシーの設定
1. 「アクセス許可」タブに移動
2. 「バケットポリシー」を編集
3. 以下のポリシーを追加（`YOUR-BUCKET-NAME`を実際のバケット名に置換）:

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

## 2. IAMユーザーの作成（GitHub Actions用）

### 2.1 IAMユーザーの作成
1. IAMサービスを開く
2. 「ユーザー」→「ユーザーを追加」
3. ユーザー名: `github-actions-deploy`
4. 「プログラムによるアクセス」にチェック

### 2.2 権限の付与
1. 「既存のポリシーを直接アタッチ」を選択
2. 以下のカスタムポリシーを作成してアタッチ:

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

### 2.3 アクセスキーの保存
1. ユーザー作成完了後、アクセスキーIDとシークレットアクセスキーを安全に保存

## 3. GitHub Secretsの設定

GitHubリポジトリで以下のSecretsを設定:

1. リポジトリの「Settings」に移動
2. 「Secrets and variables」→「Actions」
3. 「New repository secret」で以下を追加:

| Secret Name | 値 | 説明 |
|------------|---|------|
| `AWS_ACCESS_KEY_ID` | IAMユーザーのアクセスキーID | 例: AKIAIOSFODNN7EXAMPLE |
| `AWS_SECRET_ACCESS_KEY` | IAMユーザーのシークレットアクセスキー | 例: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |
| `AWS_REGION` | S3バケットのリージョン | 例: ap-northeast-1 |
| `S3_BUCKET_NAME` | S3バケット名 | 例: rental-booking-app-production |

## 4. CloudFront（オプション）

より高速な配信を実現したい場合:

### 4.1 CloudFrontディストリビューションの作成
1. CloudFrontサービスを開く
2. 「ディストリビューションを作成」
3. オリジンドメイン: S3バケットのウェブサイトエンドポイント
4. ビューワープロトコルポリシー: 「Redirect HTTP to HTTPS」
5. デフォルトルートオブジェクト: `index.html`

### 4.2 エラーページの設定
1. 「エラーページ」タブで設定
2. HTTPエラーコード: 403, 404
3. レスポンスページパス: `/index.html`
4. HTTPレスポンスコード: 200

### 4.3 GitHub Secretに追加
| Secret Name | 値 |
|------------|---|
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFrontディストリビューションID |

## 5. デプロイの確認

1. mainブランチにpushすると自動的にデプロイが開始
2. GitHubの「Actions」タブで進捗を確認
3. デプロイ完了後、S3ウェブサイトエンドポイントでアプリケーションにアクセス
   - エンドポイント例: `http://YOUR-BUCKET-NAME.s3-website-ap-northeast-1.amazonaws.com`

## トラブルシューティング

### デプロイが失敗する場合
- GitHub Secretsが正しく設定されているか確認
- IAMユーザーの権限が適切か確認
- S3バケット名が正しいか確認

### ウェブサイトが表示されない場合
- S3バケットの静的ウェブサイトホスティングが有効か確認
- バケットポリシーが正しく設定されているか確認
- index.htmlがbuildフォルダに存在するか確認