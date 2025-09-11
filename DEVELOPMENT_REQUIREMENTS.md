# 🚨 開発環境必須要件 - 絶対条件チェックリスト

## 📌 プロジェクト基本情報
- **プロジェクト名**: M's BASE Rental (rental-booking-app)
- **作業ディレクトリ**: `C:\Users\hiyok\rental-booking-app`
- **GitHubリポジトリ**: https://github.com/MochiBullet/rental-booking-app
- **本番URL**: https://ms-base-rental.com
- **S3直接URL**: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com

## 🔴 絶対必要な開発環境

### 1. Node.js環境
```bash
# 必須バージョン
Node.js: v18.x以上
npm: v8.x以上

# 確認コマンド
node --version
npm --version
```

### 2. Git設定
```bash
# リモートリポジトリ
origin: https://github.com/MochiBullet/rental-booking-app.git

# 確認コマンド
git remote -v
```

### 3. AWS CLI設定
```bash
# 必須設定
- リージョン: ap-southeast-2
- S3バケット: rental-booking-app-website
- CloudFront Distribution ID: E2ANNXZ9LL61PY

# 確認コマンド
aws s3 ls s3://rental-booking-app-website
```

## 🔧 開発サーバー起動手順

### 1. 初回セットアップ
```bash
cd C:\Users\hiyok\rental-booking-app
npm install
```

### 2. 開発サーバー起動
```bash
npm start
# → http://localhost:3000 で確認
```

### 3. ビルド実行
```bash
npm run build
# → buildフォルダにプロダクションビルド生成
```

## 📦 重要なnpmパッケージ
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.3.0",
  "react-scripts": "5.0.1",
  "aws-sdk": "^2.1404.0"
}
```

## 🚀 デプロイプロセス

### 1. GitHub Actions自動デプロイ
```bash
# コミット&プッシュで自動デプロイ
git add -A
git commit -m "コミットメッセージ

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```

### 2. GitHub Secrets（設定済み）
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` = rental-booking-app-website

### 3. デプロイ確認
- GitHub Actions: https://github.com/MochiBullet/rental-booking-app/actions
- 実行時間: 約1-2分
- CloudFrontキャッシュ: 5-15分で反映

## 🎨 現在のローディングアニメーション仕様

### wheel-spinner.svg
- **場所**: `/public/wheel-spinner.svg`
- **サイズ**: 3.5KB
- **デザイン**: 6スポークリアルホイール

### CSSクラス
```css
.car-wheel-spinner {
  width: 200px;  /* 通常サイズ */
  height: 200px;
  background-image: url('../public/wheel-spinner.svg');
  animation: wheelSpin 1s linear infinite;
}

.car-wheel-spinner.small { width: 100px; height: 100px; }
.car-wheel-spinner.large { width: 300px; height: 300px; }
```

### ローディングテキスト
- 全箇所統一: **「少々お待ちください」**
- フォントサイズ: 24px

## 🔐 管理者アクセス

### 管理画面への入り方
1. ロゴ「MB」を**10回クリック**
2. ログイン情報:
   - Username: `admin`
   - Password: `msbase7032`

## 📁 重要ファイル構成

```
rental-booking-app/
├── .github/
│   └── workflows/
│       └── main.yml          # GitHub Actions設定
├── public/
│   ├── index.html
│   └── wheel-spinner.svg     # ローディングホイール画像
├── src/
│   ├── App.js                # メインアプリケーション
│   ├── App.css               # グローバルスタイル（3105行）
│   └── components/
│       ├── HomePage.js       # ホームページ
│       ├── LoadingWheel.jsx  # ローディングコンポーネント
│       ├── VehicleListPage.jsx
│       ├── ReservationManagement.jsx
│       └── DeletedVehiclesManagement.jsx
├── package.json
├── CLAUDE.md                 # 作業記録・技術仕様書
└── DEVELOPMENT_REQUIREMENTS.md  # この文書
```

## ⚠️ 注意事項・既知の問題

### 1. ビルド時の警告
- ESLintの警告は無視可能（no-unused-vars等）
- `CI: false` 環境変数でビルド継続

### 2. CSSパス指定
```css
/* 正しい */
background-image: url('../public/wheel-spinner.svg');

/* 間違い（ビルドエラー） */
background-image: url('/wheel-spinner.svg');
```

### 3. GitHub Actions失敗時の対処
1. ビルドエラー確認: `npm run build` をローカル実行
2. GitHub Secrets確認: S3_BUCKET_NAME等が設定されているか
3. パス問題確認: 画像やCSSのパスが正しいか

## 🔄 日常的な作業フロー

### 1. 作業開始
```bash
cd C:\Users\hiyok\rental-booking-app
git pull origin master
npm start
```

### 2. 変更作業
- コード編集
- ローカルで動作確認（localhost:3000）

### 3. コミット＆デプロイ
```bash
git add -A
git commit -m "変更内容の説明

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```

### 4. 本番確認
- GitHub Actions: 緑のチェックマーク確認
- 本番サイト: https://ms-base-rental.com で確認

## 📝 DynamoDB関連

### テーブル情報
- **リージョン**: ap-southeast-2
- **テーブル**: vehicles, members, reservations, siteSettings
- **API Gateway**: https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod/

### Lambda関数
- settings-api-lambda
- vehicles-api-lambda
- members-api-lambda
- reservations-api-lambda

## 🎯 現在の開発状態

### 実装済み機能
- ✅ 車両一覧表示（車・バイク）
- ✅ 管理者ダッシュボード
- ✅ 予約管理システム
- ✅ 削除済み車両管理
- ✅ ローディングアニメーション（特大ホイール）
- ✅ DynamoDB連携
- ✅ タイル画像永続化

### 現在の課題
- ⚠️ 認証システムは無効化中（情報サイトモード）
- ⚠️ 決済システム未実装

## 🛠️ トラブルシューティング

### npm install失敗時
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 開発サーバーが起動しない
```bash
# ポート3000が使用中の場合
netstat -ano | findstr :3000
# プロセスをkill
taskkill /PID [プロセスID] /F
```

### GitHubプッシュ失敗時
```bash
git status
git log --oneline -5
git remote -v
# 必要に応じて強制プッシュ（注意）
git push -f origin master
```

---

**最終更新**: 2025年9月12日
**作成者**: Claude Code Assistant
**次回引継ぎ用**: このファイルとCLAUDE.mdを必ず確認すること