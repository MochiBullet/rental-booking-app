# 🚀 M's BASE Rental - 開発者向けドキュメント

## クイックスタート（3ステップ）

### 1️⃣ 開発環境起動
```bash
# Windowsの場合
start-dev.bat

# または手動で
npm start
```
→ ブラウザで http://localhost:3000 が開きます

### 2️⃣ 管理者画面アクセス
1. ロゴ「**MB**」を **10回クリック**
2. ログイン：`admin` / `admin123`

### 3️⃣ デプロイ
```bash
# Windowsの場合
deploy.bat

# または手動で
git add -A
git commit -m "変更内容"
git push origin master
```

## 📁 プロジェクト構造

```
src/
├── App.js                 # メインアプリ・ルーティング
├── App.css               # グローバルCSS変数
└── components/
    ├── HomePage.js       # ホーム（動的コンテンツ対応）
    ├── VehicleList.js    # 車両一覧・予約
    ├── AdminDashboard.js # 管理者機能
    ├── MyPage.js         # マイページ
    └── *.css            # 各コンポーネントのスタイル
```

## ⚙️ 管理機能

| セクション | 機能 |
|-----------|-----|
| **Overview** | ダッシュボード概要・統計 |
| **Bookings** | 予約管理（承認・キャンセル） |
| **Vehicles** | 車両CRUD・画像・価格設定 |
| **Users** | ユーザー管理・VIPランク |
| **Analytics** | 売上分析・レポート |
| **Site Settings** | デザイン・色・テーマ変更 |
| **Content Editor** | ホームページ文言編集 |

## 🎨 デザインシステム

### CSS変数（動的変更可能）
```css
:root {
  --green: #43a047;        /* メインカラー */
  --green-light: #66bb6a;  /* サブカラー */
  --gradient-1: ...;       /* メイングラデーション */
  --gradient-2: ...;       /* サブグラデーション */
}
```

### テーマプリセット
- 🟢 Green（デフォルト）
- 🔵 Blue
- 🟣 Purple  
- 🟠 Orange

## 💾 データ管理

### LocalStorage Keys
```javascript
{
  "siteSettings": {...},      // サイト設定
  "homeContent": {...},       // ホームコンテンツ
  "vehicles": [...],          // 車両データ
  "bookings": [...],          // 予約データ  
  "users": [...],             // ユーザーデータ
}
```

## 🔧 開発コマンド

```bash
# 開発サーバー
npm start

# プロダクションビルド
npm run build

# Git操作
git status           # 変更確認
git add -A          # ステージング
git commit -m "..."  # コミット
git push origin master  # デプロイ
```

## 🚀 デプロイフロー

1. **コード変更**
2. **Git Push** → GitHub
3. **GitHub Actions** → 自動ビルド
4. **AWS S3** → サイト更新

監視URL: https://github.com/MochiBullet/rental-booking-app/actions

## 🛠️ よくある作業

### ホームページ文言変更
1. 管理者画面 → **Content Editor**
2. 各セクションを編集
3. **「コンテンツを保存」**

### サイトデザイン変更  
1. 管理者画面 → **Site Settings**
2. **「デザイン変更」** → カラーピッカー
3. **「変更を適用」**

### 車両情報管理
1. 管理者画面 → **Vehicles** 
2. **「+ Add New Vehicle」**
3. 情報入力・保存

### 予約管理
1. 管理者画面 → **Bookings**
2. **「Confirm」**/**「Cancel」**

## 🎯 次の開発候補

### 🔥 優先度：高
- 決済システム（Stripe）
- バックエンドAPI（Node.js）
- メール通知（AWS SES）

### 📈 優先度：中
- 画像アップロード
- 多言語対応
- レビューシステム

### ⚡ 優先度：低
- Google Analytics
- SEO最適化
- PWA化

## 🆘 トラブルシューティング

### ビルドエラー
```bash
rm -rf node_modules
npm install
npm run build
```

### デプロイが反映されない
- GitHub Actionsログ確認
- CloudFrontキャッシュクリア

### LocalStorage確認
Chrome DevTools → Application → Local Storage

---

**📞 サポート**: 何か問題があれば CLAUDE.md を確認してください