# 🔧 S3バケット手動設定ガイド

## 問題: サイトにアクセスできない（ERR_CONNECTION_RESET）

S3バケットが正しく設定されていない可能性があります。以下の手順で修正してください。

## 📝 AWSコンソールでの設定手順

### 1. S3コンソールにログイン
https://s3.console.aws.amazon.com/s3/home?region=ap-southeast-2

### 2. バケット「rental-booking-app-bucket」を探す
- もし存在しない場合は新規作成:
  - バケット名: `rental-booking-app-bucket`
  - リージョン: `ap-southeast-2` (シドニー)

### 3. バケットの設定を確認/変更

#### A. パブリックアクセス設定
1. バケットをクリック
2. 「Permissions」タブ
3. 「Block public access」セクション → 「Edit」
4. **すべてのチェックを外す**:
   - ❌ Block all public access
   - ❌ Block public access to buckets and objects granted through new access control lists
   - ❌ Block public access to buckets and objects granted through any access control lists
   - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
   - ❌ Block public and cross-account access to buckets and objects through any public bucket or access point policies
5. 「Save changes」→ 確認で「confirm」入力

#### B. バケットポリシー設定
1. 「Permissions」タブ → 「Bucket policy」
2. 以下のポリシーをコピー&ペースト:

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

3. 「Save changes」

#### C. 静的ウェブサイトホスティング有効化
1. 「Properties」タブ
2. 一番下の「Static website hosting」→ 「Edit」
3. 設定:
   - Static website hosting: **Enable**
   - Hosting type: **Host a static website**
   - Index document: `index.html`
   - Error document: `index.html`
4. 「Save changes」

### 4. ファイルのアップロード
1. 「Objects」タブ
2. 「Upload」ボタン
3. プロジェクトの `build` フォルダ内の全ファイルをドラッグ&ドロップ:
   - `C:\Users\hiyok\projects\rental-booking-app\build\*`
4. 「Upload」をクリック

### 5. アクセス確認
設定完了後、以下のURLでアクセス:
- http://rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com

## 🚨 それでもアクセスできない場合

### チェックリスト
- [ ] バケット名が正確に `rental-booking-app-bucket` であるか
- [ ] リージョンが `ap-southeast-2` であるか
- [ ] パブリックアクセスがすべて許可されているか
- [ ] バケットポリシーが正しく設定されているか
- [ ] Static website hostingが有効になっているか
- [ ] index.htmlがアップロードされているか

### 代替案: 新しいバケット作成
もし既存のバケットに問題がある場合:

1. 新しいバケット名で作成（例: `msbase-rental-website`）
2. 上記の設定をすべて適用
3. ファイルをアップロード
4. 新しいURLでアクセス

## 📞 サポート
問題が解決しない場合は、AWSコンソールのエラーメッセージを確認してください。