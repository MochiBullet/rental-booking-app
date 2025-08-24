# ユーザーデータベース CDK

## 概要
Rental Booking App のユーザー管理システムをAWS CDKで構築します。

## アーキテクチャ
- **DynamoDB**: ユーザーデータの保存
- **Lambda**: CRUD操作のサーバーレス関数
- **API Gateway**: RESTful API エンドポイント

## セットアップ

### 前提条件
- Node.js 18以上
- AWS CLI設定済み
- AWS CDK CLI (`npm install -g aws-cdk`)

### インストール
```bash
npm install
```

### デプロイ
```bash
# Windows
deploy.bat

# または手動で
npm install
cd lambda/layer/nodejs && npm install --production && cd ../../..
npm run build
cdk bootstrap
cdk deploy
```

## API エンドポイント

### ユーザー作成
```bash
POST /users
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "firstName": "太郎",
    "lastName": "山田"
  }
}
```

### ユーザー取得
```bash
GET /users/{userId}
GET /users?email=user@example.com
```

### ユーザー更新
```bash
PUT /users/{userId}
{
  "profile": {
    "phone": "090-1234-5678"
  }
}
```

### ユーザー削除
```bash
DELETE /users/{userId}
```

### ユーザー一覧
```bash
GET /users?limit=50&memberType=premium&status=active
```

### ログイン
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## データ構造

### ユーザーテーブル
- **パーティションキー**: userId (UUID)
- **GSI**: email-index, memberNumber-index

### ユーザー属性
- `userId`: ユーザーID
- `email`: メールアドレス
- `memberNumber`: 会員番号
- `memberType`: 会員タイプ (regular/premium/vip)
- `status`: ステータス (active/inactive/suspended)
- `profile`: プロフィール情報
- `address`: 住所情報
- `driverLicense`: 免許証情報
- `authentication`: 認証情報
- `points`: ポイント情報
- `statistics`: 統計情報
- `preferences`: 設定
- `metadata`: メタデータ

## セキュリティ

- パスワードはbcryptでハッシュ化
- JWTトークンによる認証
- 5回ログイン失敗でアカウントロック (30分)
- DynamoDB暗号化有効
- ポイントインタイムリカバリ有効

## 環境変数

Lambda関数で使用:
- `TABLE_NAME`: DynamoDBテーブル名
- `JWT_SECRET`: JWT署名用秘密鍵
- `NODE_ENV`: 実行環境

## テスト

### ローカルテスト
```bash
npm test
```

### APIテスト (デプロイ後)
```bash
# テストスクリプト実行
cd ..
python test-api.py
```

## クリーンアップ

```bash
cdk destroy
```

## トラブルシューティング

### デプロイエラー
- AWS認証情報を確認: `aws sts get-caller-identity`
- リージョン設定を確認: `aws configure get region`
- CDKブートストラップ: `cdk bootstrap`

### Lambda関数エラー
- CloudWatch Logsでログ確認
- 環境変数の設定確認
- IAMロールの権限確認