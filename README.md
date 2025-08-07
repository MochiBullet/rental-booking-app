# 車・バイクレンタル予約サイト (RentalEasy)

React で作成した車とバイクのレンタル予約システムです。

## 📚 ドキュメント構成

- **[実装計画](docs/planning/IMPLEMENTATION_PLAN.md)** - 実稼働に向けた段階的計画
- **[TODO一覧](docs/planning/TODO.md)** - 実装が必要な機能リスト
- **[開発履歴](docs/development/CHANGELOG.md)** - これまでの開発記録
- **[デプロイガイド](docs/deployment/)** - AWS/Vercel等へのデプロイ方法

## 機能

- 🚗 車両一覧表示（車・バイク）
- 🔍 車種・料金での絞り込み・並び替え
- 📅 予約フォーム（日付選択・料金計算）
- 📱 レスポンシブデザイン
- ✅ フォームバリデーション
- 💰 リアルタイム料金計算
- 👤 会員登録・ログイン機能
- 🔐 管理者ダッシュボード
- 🎁 ポイントシステム

## 車両の種類

### 車
- トヨタ プリウス（エコカー）- ¥8,000/日
- ホンダ フリード（ミニバン）- ¥9,500/日
- 日産 軽自動車 - ¥6,000/日
- BMW X3（SUV）- ¥15,000/日

### バイク
- ヤマハ MT-07（スポーツバイク）- ¥4,000/日
- ホンダ PCX160（スクーター）- ¥3,000/日
- カワサキ Ninja 400（スポーツバイク）- ¥5,000/日
- ハーレーダビッドソン（クルーザー）- ¥8,000/日

## セットアップ

1. 依存関係のインストール:
   ```bash
   npm install
   ```

2. 開発サーバーの起動:
   ```bash
   npm start
   ```

3. ブラウザで `http://localhost:3000` を開く

## テストアカウント

- **会員ログイン**: test@example.com / password123
- **管理者アクセス**: ロゴ「RentalEasy」を10回連続クリック → admin / rental123

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── Header.jsx      # ヘッダーナビゲーション
│   ├── Hero.jsx        # ヒーローセクション
│   ├── VehicleList.jsx # 車両一覧
│   ├── VehicleCard.jsx # 車両カード
│   ├── ReservationForm.jsx # 予約フォーム
│   ├── MemberRegistration.jsx # 会員登録
│   ├── MemberLogin.jsx # 会員ログイン
│   ├── AdminDashboard.jsx # 管理者ダッシュボード
│   └── その他のコンポーネント
├── data/
│   ├── vehicleData.js  # 車両データ
│   ├── memberData.js   # 会員データ
│   └── siteSettings.js # サイト設定
├── utils/
│   └── memberUtils.js  # 会員関連ユーティリティ
├── App.jsx             # メインアプリケーション
├── App.css            # スタイルシート
└── index.js           # エントリーポイント
```

## 使用技術

- React 18
- CSS3（Grid、Flexbox）
- JavaScript ES6+

## デプロイ

### AWS S3 + GitHub Actions

1. AWS S3バケットの作成と設定
2. GitHub Secretsの設定
3. プッシュで自動デプロイ

詳細は[デプロイガイド](docs/deployment/)を参照してください。

## 今後の拡張予定

- バックエンドAPI連携（Hono + Lambda）
- データベース統合（DynamoDB + Prisma）
- Turborepoによるモノレポ構成
- 決済システム統合
- メール通知機能
