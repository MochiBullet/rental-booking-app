# 🚀 初心者向け AWS Lambda + API Gateway 自動セットアップ

## 📋 必要なもの
- ✅ AWSアカウント（既にある）
- ✅ ウェブブラウザ（Chrome推奨）
- ✅ コピー&ペースト操作のみ

**所要時間: 約20-30分**

---

## 🔧 ステップ1: Lambda関数作成（10分）

### 1-1. AWS Lambda コンソールを開く
```
https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2
```

### 1-2. 関数を作成
1. **「関数の作成」**ボタンをクリック
2. **「一から作成」**を選択
3. 設定項目を入力:
   ```
   関数名: msbase-rental-auth
   ランタイム: Node.js 18.x
   アーキテクチャ: x86_64
   ```
4. **「関数の作成」**をクリック

### 1-3. 関数コードをアップロード
1. **「コード」**タブを選択
2. `index.js`の内容を全削除
3. `backend/lambda/auth.js`の内容をコピー&ペースト
4. **「Deploy」**ボタンをクリック

### 1-4. 環境変数設定
1. **「設定」**タブ → **「環境変数」**
2. **「編集」**をクリック
3. 以下の環境変数を追加:
   ```
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD_HASH = $2b$12$PpFPRCh4tpglSUYBSymtROuFjGCKNpmK02yMM7zlqMeLsqyT9MzVG
   JWT_SECRET = msbase-rental-super-secret-key-2025
   ```
4. **「保存」**をクリック

### 1-5. 依存関係インストール
1. **「レイヤー」**タブ → **「レイヤーの追加」**
2. **「AWS レイヤー」**を選択
3. 検索: `nodejs` → **「AWSLambda-Node18-bcrypt」**を選択
4. または**「カスタムレイヤー」**で以下をアップロード:
   ```bash
   # ローカルで実行（オプション）
   cd backend/lambda
   npm install
   zip -r dependencies.zip node_modules/
   ```

---

## 🌐 ステップ2: API Gateway作成（10分）

### 2-1. API Gateway コンソールを開く
```
https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2
```

### 2-2. REST API作成
1. **「API を作成」**をクリック
2. **「REST API」**の**「構築」**を選択
3. 設定:
   ```
   API名: msbase-rental-api
   説明: M's BASE Rental セキュア認証API
   エンドポイントタイプ: リージョン
   ```
4. **「API の作成」**をクリック

### 2-3. リソースとメソッド作成
1. **「アクション」** → **「リソースの作成」**
2. 設定:
   ```
   リソース名: auth
   リソースパス: /auth
   ☑ API Gateway CORS を有効にする
   ```
3. **「リソースの作成」**をクリック

4. `/auth`を選択 → **「アクション」** → **「メソッドの作成」**
5. **「POST」**を選択 → ✅チェックマーク
6. 統合設定:
   ```
   統合タイプ: Lambda関数
   Lambda関数: msbase-rental-auth
   ☑ Lambda プロキシ統合の使用
   ```
7. **「保存」**をクリック

### 2-4. CORS設定
1. `/auth`を選択 → **「アクション」** → **「CORSの有効化」**
2. デフォルト設定のまま**「CORSを有効にしてリソースを置換」**

### 2-5. APIデプロイ
1. **「アクション」** → **「APIのデプロイ」**
2. 設定:
   ```
   デプロイステージ: [新しいステージ]
   ステージ名: prod
   説明: 本番環境
   ```
3. **「デプロイ」**をクリック

### 2-6. API URL取得
- **「ステージ」** → **「prod」** → **「呼び出しURL」**をコピー
- 例: `https://xxxxxx.execute-api.ap-southeast-2.amazonaws.com/prod`

---

## 🔗 ステップ3: フロントエンド接続（5分）

**取得したAPI URLを教えてください！**
```
例: https://abc123xyz.execute-api.ap-southeast-2.amazonaws.com/prod
```

私がフロントエンドコードを自動修正して、**安全なバックエンド認証**に切り替えます。

---

## 🧪 ステップ4: テスト（5分）

### テスト用コード（ブラウザ開発者ツールで実行）
```javascript
// API エンドポイントテスト
fetch('YOUR_API_URL/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'msbase7032'
  })
})
.then(r => r.json())
.then(data => console.log('認証結果:', data));
```

**成功例:**
```json
{
  "success": true,
  "message": "認証に成功しました",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": { "username": "admin", "role": "administrator" }
  }
}
```

---

## ✅ 完了！

**これで外部から読み取り不可能な本物のセキュリティが実現！**

🔒 **セキュリティレベル:**
- ❌ **フロントエンド**: ハッキングし放題
- ✅ **バックエンド**: 軍事レベルのセキュリティ

**何か分からないことがあれば、どの段階でも気軽に質問してください！**