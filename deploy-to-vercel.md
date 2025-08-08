# 🚀 Vercelで今すぐ公開する方法（無料・5分）

## AWSが使えない場合の簡単な代替方法

### 方法1: Vercel経由でデプロイ（最も簡単）

#### ステップ1: Vercelアカウント作成
1. https://vercel.com にアクセス
2. 「Sign Up」→ GitHubアカウントで登録

#### ステップ2: プロジェクトをインポート
1. 「New Project」をクリック
2. 「Import Git Repository」
3. `https://github.com/MochiBullet/rental-booking-app` を選択
4. 「Import」をクリック

#### ステップ3: 自動デプロイ（1分）
- Vercelが自動的にビルドしてデプロイ
- 完了後、HTTPSのURLが発行される
- 例: `https://rental-booking-app.vercel.app`

### 方法2: Netlifyでデプロイ（同じく無料）

1. https://www.netlify.com
2. GitHubでログイン
3. 「New site from Git」
4. リポジトリを選択
5. 自動デプロイ完了

### 方法3: GitHub Pagesでデプロイ

1. GitHubリポジトリの「Settings」
2. 「Pages」セクション
3. Source: Deploy from a branch
4. Branch: master, /build
5. 数分で公開

## 🎯 今すぐ動作確認する方法

### ローカルで確認
```bash
cd C:\Users\hiyok\projects\rental-booking-app
npm start
```
ブラウザで http://localhost:3000 を開く

### quick-start.batを実行
ダブルクリックするだけで起動

## 📝 現在の状況

- ✅ ビルドファイルは存在
- ✅ GitHubリポジトリは更新済み
- ❌ S3の認証情報がない
- ✅ Vercel/Netlifyなら認証不要

## 🔥 推奨: Vercelを使う

**メリット:**
- 無料
- HTTPS対応
- 自動デプロイ
- 高速CDN
- 設定不要

**5分で完了します！**