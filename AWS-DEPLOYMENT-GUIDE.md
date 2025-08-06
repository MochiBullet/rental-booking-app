# 🚀 AWS Amplifyデプロイガイド

## 📁 現在の状態
✅ **プロダクションビルド完了**: `build/` フォルダに最適化されたファイルが準備済み  
✅ **Git管理下**: 全ソースコードがコミット済み  
✅ **完全動作確認済み**: エラー修正・機能実装完了  

---

## 🎯 推奨デプロイ方法: AWS Amplify

### 方法1: GitHub連携 (推奨)

#### Step 1: GitHubリポジトリ作成
1. [GitHub](https://github.com)にログイン
2. 「New repository」をクリック
3. Repository name: `rental-booking-app`
4. Public/Privateを選択
5. 「Create repository」をクリック

#### Step 2: コードをGitHubにプッシュ
```bash
cd rental-booking-app
git remote add origin https://github.com/[あなたのユーザー名]/rental-booking-app.git
git branch -M main
git push -u origin main
```

#### Step 3: AWS Amplifyでデプロイ
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)にアクセス
2. 「New app」→ 「Host web app」をクリック
3. 「GitHub」を選択して認証
4. リポジトリ `rental-booking-app` を選択
5. ブランチ `main` を選択
6. Build settings (自動検出):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
   ```
7. 「Save and deploy」をクリック

### 方法2: 直接アップロード

#### Step 1: AWS Amplify Console
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)にアクセス
2. 「New app」→ 「Deploy without Git」をクリック
3. App name: `RentalEasy`
4. Environment: `production`

#### Step 2: ビルドファイルをアップロード
1. `build` フォルダをZIP圧縮
2. AWS Amplify Consoleで「Choose files」
3. ZIPファイルをアップロード
4. 「Save and deploy」をクリック

---

## 🔧 その他のデプロイオプション

### オプション1: Vercel (簡単)
1. [Vercel](https://vercel.com)アカウント作成
2. GitHub連携してリポジトリをインポート
3. 自動デプロイ開始

### オプション2: Netlify (簡単)
1. [Netlify](https://netlify.com)アカウント作成
2. `build` フォルダをドラッグ&ドロップ
3. 即座にデプロイ完了

### オプション3: AWS S3 + CloudFront
1. S3バケット作成（Static Website Hosting有効化）
2. `build` フォルダの内容をアップロード
3. CloudFrontディストリビューション作成
4. カスタムドメイン設定

---

## ⚙️ 環境変数・設定

現在のアプリケーションは **フロントエンドのみ** で動作し、外部APIや環境変数は不要です。

### 将来的な設定（必要に応じて）
- データベース接続設定
- 決済API設定（Stripe等）
- メール送信設定
- 画像ストレージ設定

---

## 📊 デプロイ後の確認事項

### ✅ 機能テスト
- [ ] トップページの表示
- [ ] 車両一覧・予約フォーム
- [ ] 会員登録（6ステップ + 免許証アップロード）
- [ ] 会員ログイン・マイページ
- [ ] 管理者アクセス（ロゴ10回連続クリック）
- [ ] 管理者ダッシュボード

### 🔐 テスト用ログイン情報
- **会員ログイン**: test@example.com / password123
- **管理者ログイン**: admin / rental123

### 🎨 レスポンシブ対応確認
- [ ] PC表示
- [ ] タブレット表示  
- [ ] スマートフォン表示

---

## 🚀 本番運用の推奨事項

### セキュリティ強化
- HTTPS強制
- CSP（Content Security Policy）設定
- 認証システム強化

### パフォーマンス最適化
- CDN活用（既にAmplify/Vercelで提供）
- 画像最適化
- コード分割

### 監視・分析
- Google Analytics設定
- エラー監視（Sentry等）
- パフォーマンス監視

---

## 💡 次のステップ

1. **デプロイ実行** → 上記いずれかの方法でデプロイ
2. **カスタムドメイン** → 独自ドメイン設定
3. **SSL証明書** → HTTPS化（自動）
4. **機能拡張** → 決済システム等の追加

---

**現在のファイル構成**:
```
rental-booking-app/
├── build/              # 本番用ビルドファイル ← これをデプロイ
├── src/                # ソースコード
├── public/             # 静的ファイル
├── package.json        # 依存関係
└── README.md           # プロジェクト説明
```

**デプロイURL例**:
- Amplify: `https://[アプリID].amplifyapp.com`
- Vercel: `https://[プロジェクト名].vercel.app`
- Netlify: `https://[サイト名].netlify.app`