# 🔐 AWS IAM権限設定オプション詳細

## 📋 ユーザー作成時の権限設定手順

### 1. 権限設定ページでの選択肢

IAMユーザー作成の「Set permissions」ステップで、以下の3つのオプションが表示されます：

#### ✅ **推奨: Attach existing policies directly**
- **選択理由**: 既存のAWSポリシーを直接適用
- **メリット**: 簡単で確実
- **デメリット**: なし

#### ❌ **非推奨: Add user to group**
- **用途**: グループ管理が必要な場合のみ
- **今回は不要**: 個人プロジェクトのため

#### ❌ **非推奨: Copy permissions from existing user**
- **用途**: 既存ユーザーと同じ権限が必要な場合
- **今回は不要**: 新規設定のため

### 2. 必要なポリシーの選択

**「Attach existing policies directly」**を選択後：

#### 🔍 検索方法
1. **Filter policies**の検索ボックスに入力
2. **検索ワード**: `S3`

#### ✅ **選択するポリシー（必須）**

**AmazonS3FullAccess**
- **説明**: Amazon S3への完全なアクセス権限
- **ARN**: `arn:aws:iam::aws:policy/AmazonS3FullAccess`
- **用途**: バケット作成、ファイルアップロード、設定変更

#### 📋 **ポリシーの詳細内容**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

### 3. 権限境界（Permission boundary）

**❌ 設定不要**
- **Use a permissions boundary to control the maximum user permissions**
- **今回は空白のまま**

## 🎯 最小権限の原則（参考）

より細かい権限制御が必要な場合の代替案：

### カスタムポリシー例
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::msbase-rental-*",
        "arn:aws:s3:::msbase-rental-*/*"
      ]
    }
  ]
}
```

## 📱 設定画面のスクリーンショット説明

### Step 1: Permission options
```
○ Attach existing policies directly  ← これを選択
○ Add user to group
○ Copy permissions from existing user
```

### Step 2: Policy selection
```
Filter policies: [S3で検索]

☑ AmazonS3FullAccess  ← これにチェック
  Provides full access to all buckets via the AWS Management Console
```

### Step 3: Permission boundary
```
Use a permissions boundary to control the maximum user permissions
[ ] Set permissions boundary  ← チェックしない（空白のまま）
```

## 🚨 よくある間違い

### ❌ 間違った選択
- `AmazonS3ReadOnlyAccess` → 読み取り専用（アップロード不可）
- `AmazonS3ObjectLambdaExecutionRolePolicy` → Lambda用（今回不要）

### ✅ 正しい選択
- `AmazonS3FullAccess` → 完全なアクセス権限

## 🔄 設定後の確認方法

### 1. ユーザー詳細画面
https://console.aws.amazon.com/iam/home#/users/[ユーザー名]

### 2. 権限タブで確認
- **Policies**: `AmazonS3FullAccess`が表示される
- **Groups**: 空（未所属）
- **Permission boundary**: 設定なし

## 🎯 次のステップ

権限設定完了後：
1. **アクセスキー作成**
2. **configure-aws.bat実行**
3. **execute-aws-setup.bat実行**

---

**この設定で確実にS3への完全アクセスが可能になります！**