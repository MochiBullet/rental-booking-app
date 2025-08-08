# 🔑 AWS認証設定 - 直接リンク集

## 📋 必要な手順（順番通りに実行）

### 1. AWSアカウントログイン
**直接リンク**: https://console.aws.amazon.com/

### 2. IAMサービスを開く
**直接リンク**: https://console.aws.amazon.com/iam/

### 3. ユーザー作成ページ
**直接リンク**: https://console.aws.amazon.com/iam/home#/users$new?step=details

#### 設定内容：
- **User name**: `github-actions-s3`
- **AWS credential type**: `Access key - Programmatic access`

### 4. 権限設定ページ
**権限の種類**: `Attach existing policies directly`

**必要なポリシー**:
- ☑️ `AmazonS3FullAccess`

**検索方法**: 検索ボックスに `S3FullAccess` と入力

### 5. アクセスキー取得
ユーザー作成後、以下のページでアクセスキーを作成:
**直接リンク**: https://console.aws.amazon.com/iam/home#/users

1. 作成したユーザーをクリック
2. **Security credentials** タブ
3. **Create access key**
4. **Use case**: `Command Line Interface (CLI)`
5. **アクセスキーをコピー保存**

## 🎯 取得すべき情報

以下の2つの値を取得してください：

```
AWS_ACCESS_KEY_ID: AKIA******************
AWS_SECRET_ACCESS_KEY: ****************************************
```

⚠️ **重要**: Secret Access Keyは一度だけ表示されます！必ず保存してください。

## 🔗 その他の便利リンク

### S3コンソール
**直接リンク**: https://s3.console.aws.amazon.com/s3/

### 請求ダッシュボード（料金確認）
**直接リンク**: https://console.aws.amazon.com/billing/home

### サポート（問題発生時）
**直接リンク**: https://console.aws.amazon.com/support/home

## 📱 モバイル対応

AWS Consoleはモバイルブラウザからもアクセス可能です：
- iPhone Safari: 上記リンクをそのまま使用
- Android Chrome: 上記リンクをそのまま使用

## ⚡ ワンクリックアクセス

### IAMユーザー作成（ワンクリック）
https://console.aws.amazon.com/iam/home#/users$new?step=details

### S3バケット作成（ワンクリック）
https://s3.console.aws.amazon.com/s3/bucket/create

## 🆘 トラブル時のリンク

### パスワードリセット
https://console.aws.amazon.com/iam/home#/users

### MFA設定（セキュリティ強化）
https://console.aws.amazon.com/iam/home#/security_credentials

### 権限エラー解決
https://console.aws.amazon.com/iam/home#/policies

---

**すべてのリンクはHTTPSで安全です。AWSの公式サイトへの直接リンクです。**