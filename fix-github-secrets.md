# 🔧 GitHub Secrets設定ガイド

## 本番環境表示問題の修正手順

### 必要なGitHub Secrets

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で以下を設定:

#### 1. AWS_ACCESS_KEY_ID
- AWSコンソールで作成したアクセスキーID
- IAMユーザーの「Security credentials」から取得

#### 2. AWS_SECRET_ACCESS_KEY
- AWSコンソールで作成したシークレットアクセスキー
- アクセスキー作成時に一度だけ表示される

#### 3. S3_BUCKET_NAME
- 値: `rental-booking-app-bucket`
- または任意の一意なバケット名

### GitHub Secretsの設定方法

1. GitHubリポジトリを開く
   - https://github.com/MochiBullet/rental-booking-app

2. 「Settings」タブをクリック

3. 左サイドバーの「Secrets and variables」→「Actions」

4. 「New repository secret」をクリック

5. 上記3つのシークレットを順番に追加

### AWS IAMユーザー作成手順

もしAWSアクセスキーがない場合:

1. AWSコンソールにログイン
2. IAMサービスを開く
3. 「Users」→「Create user」
4. ユーザー名: `github-actions-user`
5. 「Attach policies directly」を選択
6. 以下のポリシーを追加:
   - `AmazonS3FullAccess`
7. 「Create user」
8. 作成したユーザーをクリック
9. 「Security credentials」タブ
10. 「Create access key」
11. 「Command Line Interface (CLI)」を選択
12. アクセスキーをコピーしてGitHub Secretsに設定

### 設定確認方法

GitHub Secretsを設定後:

1. リポジトリにプッシュする
2. 「Actions」タブで実行状況を確認
3. 緑のチェックマークなら成功
4. ログでデプロイメントURLを確認

### トラブルシューティング

#### エラー: 権限不足
- IAMユーザーに`AmazonS3FullAccess`が必要

#### エラー: バケット名重複
- S3_BUCKET_NAMEを一意な名前に変更
- 例: `msbase-rental-yourname-2025`

#### エラー: リージョンミス
- ワークフローはap-southeast-2固定
- AWSリソースも同じリージョンで作成

## 設定完了後の確認

すべて設定後、以下のURLでアクセス可能:
```
http://rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com
```

バケット名を変更した場合:
```
http://[YOUR-BUCKET-NAME].s3-website-ap-southeast-2.amazonaws.com
```