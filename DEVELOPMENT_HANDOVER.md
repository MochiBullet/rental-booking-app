# 完全開発引継ぎドキュメント - M's BASE Rental

このドキュメントは別環境のClaude開発者が完全に引継ぎできるよう、すべての開発環境・AWS連携・プロジェクト状況を記載しています。

## 🚨 緊急引継ぎ情報

### プロジェクト基本情報
- **プロジェクト名**: M's BASE Rental（車・バイクレンタル予約サイト）
- **現在のブランチ**: master
- **最新コミット**: eac980fb（2025年9月14日）
- **開発状況**: Webikeバナー追加・iOS対応・背景復元完了

### リポジトリ情報
```bash
# GitHub リポジトリ
https://github.com/MochiBullet/rental-booking-app.git

# ローカル開発環境
cd C:\Users\hiyok\rental-booking-app
npm start  # http://localhost:3000
```

## 🔥 AWS環境・デプロイ設定

### AWS S3本番環境
- **S3バケット名**: `rental-booking-app-website`
- **S3直接URL**: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com
- **AWS リージョン**: ap-southeast-2 (Sydney)
- **CloudFront Distribution ID**: E2ANNXZ9LL61PY

### 本番サイトURL（最重要）
- **独自ドメイン**: https://ms-base-rental.com
- **CloudFront URL**: https://d1y20ady8hnkgx.cloudfront.net
- **S3直接URL**: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com

### GitHub Actions自動デプロイ
**ファイル**: `.github/workflows/main.yml`
**トリガー**: masterブランチへのpush時
**必要なSecrets**:
```
AWS_ACCESS_KEY_ID=（AWS認証用）
AWS_SECRET_ACCESS_KEY=（AWS認証用）
S3_BUCKET_NAME=rental-booking-app-website
```

**デプロイフロー**:
1. Node.js 18環境構築
2. `npm install` → `npm run build`
3. AWS認証・S3同期
4. S3ウェブサイト設定（SPA対応）
5. CloudFrontキャッシュ無効化（独自ドメイン反映用）
6. デプロイ検証

## 💾 データベース連携

### DynamoDB設定
- **テーブル**: `vehicles`
- **GSI**: `type-index` (type属性でクエリ)
- **リージョン**: ap-southeast-2
- **データ**: 車両6台（車2台・バイク4台）

### API エンドポイント
- **API Gateway**: https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod/
- **Lambda関数**: DynamoDB CRUD操作
- **認証**: 現在なし（プロトタイプレベル）

## 📱 現在の実装状況

### 最新機能（2025年9月14日）
1. **Webikeバナー実装**
   - ホームページお問い合わせ上部に中古バイクWidget追加
   - URL: https://moto.webike.net/widget_bike_list.html?dlr=25604&wvc=3&per=9&srt=15
   - ヘッダー: "中古バイクも取り扱っております"

2. **iOS完全対応**
   - iPhone 15 Pro Max (430px)、iPhone 15/14 (390px)、iPhone SE (375px)
   - お問い合わせタイルの中央配置修正
   - Flexboxレイアウト + !important でiOS Safari問題解決

3. **背景システム復元**
   - M'S BASEテキストパターン実装・テスト後削除
   - 元の緑色グラデーション背景に完全復元
   - 不要なSVGファイル削除済み

### 修正されたファイル
```
src/components/HomePage.js        # Webikeバナー追加（lines 537-566）
src/components/HomePage.css       # Webike関連スタイル、背景復元
src/App.css                       # iOS対応レスポンシブ、背景復元
public/index.html                 # 背景パターン削除済み
src/components/Terms.js           # 東京住所削除、理解しましたボタン削除
src/components/PrivacyPolicy.js   # 理解しましたボタン削除
```

## 🔧 技術スタック詳細

### フロントエンド
```json
{
  "name": "rental-booking-app",
  "version": "3.0.7",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@aws-sdk/client-dynamodb": "^3.883.0",
    "@aws-sdk/lib-dynamodb": "^3.883.0",
    "aws-sdk": "^2.1691.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "node-fetch": "^3.3.2"
  },
  "homepage": "."
}
```

### 管理者アクセス
- **隠しログイン**: ロゴ「MB」を10回クリック
- **認証情報**:
  - Username: `admin`
  - Password: `msbase7032`

## 🐛 既知の問題・エラー

### CloudflareInsights エラー（対処不要）
```
GET https://static.cloudflareinsights.com/beacon.min.js/... net::ERR_BLOCKED_BY_CLIENT
```
- **原因**: Webikeのiframe内でCloudflare Analytics読み込み時の広告ブロッカー影響
- **対処**: 不要（機能に影響なし）

### 本番環境反映の遅延
- **問題**: 独自ドメインでの変更反映に5-15分必要
- **原因**: CloudFrontキャッシュ
- **解決**: GitHub Actionsで自動キャッシュクリア実行中

## 🚀 開発継続手順

### 1. 環境セットアップ
```bash
# リポジトリクローン
git clone https://github.com/MochiBullet/rental-booking-app.git
cd rental-booking-app

# 依存関係インストール
npm install

# 開発サーバー起動
npm start  # http://localhost:3000
```

### 2. 必読ドキュメント
1. **CLAUDE.md**: 最新作業記録・プロジェクト概要
2. **DEVELOPMENT_REQUIREMENTS.md**: 環境要件
3. このファイル（DEVELOPMENT_HANDOVER.md）

### 3. 作業フロー
```bash
# 変更確認
git status

# 変更をステージング
git add -A

# コミット（日本語メッセージ推奨）
git commit -m "機能追加: 具体的な変更内容

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ（自動デプロイ開始）
git push origin master
```

## 🎯 重要な設計方針

### CSS構造
- **App.css**: グローバルスタイル、レスポンシブ対応
- **HomePage.css**: ホームページ専用（背景: var(--gradient-soft)）
- **緑色テーマ統一**: CSS変数で一貫したデザイン

### レスポンシブ設計
```css
/* iPhone各機種対応 */
@media screen and (max-width: 430px) { /* iPhone 15 Pro Max */ }
@media screen and (max-width: 390px) { /* iPhone 15/14 */ }
@media screen and (max-width: 375px) { /* iPhone SE */ }

/* 重要: iOS Safari問題は !important で強制解決 */
.contact-info {
  display: flex !important;
  align-items: center !important;
}
```

## 📞 サポート・連絡先

### 本番サイト確認用URL
- **メイン**: https://ms-base-rental.com
- **S3直接**: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com
- **CloudFront**: https://d1y20ady8hnkgx.cloudfront.net

### GitHub
- **Actions**: https://github.com/MochiBullet/rental-booking-app/actions
- **Issues**: https://github.com/MochiBullet/rental-booking-app/issues

## 🔄 継続タスク・次の作業候補

### 優先度: 高
1. **決済システム統合** (Stripe/PayPal)
2. **セキュリティ強化** (JWT認証、HTTPS)
3. **テスト実装** (ユニット・統合・E2E)

### 優先度: 中
4. **メール通知システム** (SendGrid/AWS SES)
5. **画像管理システム** (S3画像ストレージ)
6. **多言語対応** (i18n)

### 優先度: 低
7. **レビュー・評価システム**
8. **分析機能強化** (Google Analytics)
9. **SEO最適化**

---

**最終更新**: 2025年9月14日
**コミット**: eac980fb
**次回開発者へ**: このドキュメントで完全引継ぎ可能。CLAUDE.mdも併読推奨。