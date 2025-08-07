# RentalEasy MVP実装計画

## 方針：最小限動作する実装を優先

「完璧より動くもの」を重視し、段階的に改善していきます。

## 🎯 MVP実装順序

### Phase 1: 最小限のバックエンド（1週間）

#### 1.1 シンプルなAPIサーバー
```bash
# バックエンドプロジェクト作成
mkdir rental-booking-backend
cd rental-booking-backend
npm init -y
npm install express cors
npm install -D nodemon
```

#### 1.2 最小限のエンドポイント
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// インメモリデータ（まずはDBなしで）
let vehicles = [...];  // 既存のvehicleDataをコピー
let reservations = [];
let members = [...];   // 既存のmemberDataをコピー

// 基本的なCRUD API
app.get('/api/vehicles', (req, res) => res.json(vehicles));
app.get('/api/reservations', (req, res) => res.json(reservations));
app.post('/api/reservations', (req, res) => {
  const reservation = { id: Date.now(), ...req.body };
  reservations.push(reservation);
  res.json(reservation);
});

app.listen(3001, () => console.log('API running on :3001'));
```

### Phase 2: フロントエンドのAPI接続（3-4日）

#### 2.1 最小限のAPI呼び出し
```javascript
// src/api/apiClient.js
const API_URL = 'http://localhost:3001/api';

export const api = {
  vehicles: {
    getAll: () => fetch(`${API_URL}/vehicles`).then(r => r.json())
  },
  reservations: {
    create: (data) => 
      fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json())
  }
};
```

#### 2.2 App.jsxの修正
- useEffectでAPIから車両データ取得
- 予約作成時にAPIを呼び出し
- エラーは console.log で確認（まずは動くことを優先）

### Phase 3: 基本的なデータ永続化（1週間）

#### 3.1 簡易ファイルDB（JSONファイル）
```javascript
// まずはJSONファイルでデータ保存
const fs = require('fs').promises;

async function saveData() {
  await fs.writeFile('./data.json', JSON.stringify({
    vehicles, reservations, members
  }));
}

async function loadData() {
  try {
    const data = await fs.readFile('./data.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return { vehicles: [], reservations: [], members: [] };
  }
}
```

#### 3.2 基本的な会員機能
- メールアドレスでの簡易ログイン（パスワードは後回し）
- 予約に会員IDを紐付け
- セッションは単純なトークン（UUIDなど）

### Phase 4: 管理画面の最小限実装（3-4日）

#### 4.1 管理者ログイン
- ハードコードされた管理者アカウント
- 簡易トークン認証

#### 4.2 基本的な管理機能
- 予約一覧表示
- 予約ステータス変更
- 車両の利用可否切り替え

## 🚫 MVPで実装しないもの

### 後回しにする機能
- ❌ パスワードハッシュ化（平文でOK）
- ❌ 本格的なJWT認証
- ❌ 入力値の厳密な検証
- ❌ HTTPS/SSL
- ❌ 決済システム
- ❌ メール送信
- ❌ 画像アップロード最適化
- ❌ エラーハンドリングの洗練
- ❌ ログシステム

### シンプルに保つ方針
- データベースは後回し（JSONファイル使用）
- 認証は最小限（メールアドレスのみ）
- UIの変更は最小限
- 既存のコードを最大限活用

## 📋 実装チェックリスト

### Week 1: バックエンド基礎
- [ ] Express サーバー起動
- [ ] 車両一覧API
- [ ] 予約作成API
- [ ] CORS設定

### Week 2: フロントエンド接続
- [ ] APIクライアント作成
- [ ] 車両データをAPIから取得
- [ ] 予約をAPIで作成
- [ ] 基本的なローディング表示

### Week 3: データ永続化
- [ ] JSONファイルでのデータ保存
- [ ] サーバー再起動後もデータ保持
- [ ] 簡易ログイン機能
- [ ] 予約履歴表示

### Week 4: 管理機能
- [ ] 管理者ログイン
- [ ] 予約管理画面
- [ ] 車両ステータス管理

## 🎉 MVP完成基準

以下ができれば「動くシステム」として完成：

1. ✅ 車両一覧が表示される
2. ✅ 予約ができる
3. ✅ データが保存される（再起動後も残る）
4. ✅ 会員がログインできる
5. ✅ 管理者が予約を確認できる

## 次のステップ（MVP完成後）

1. **セキュリティ強化**
   - パスワードハッシュ化
   - 適切な認証システム
   - 入力検証

2. **データベース導入**
   - PostgreSQL移行
   - Prisma ORM

3. **本番環境準備**
   - HTTPS設定
   - エラーハンドリング
   - ログシステム

4. **機能拡張**
   - 決済システム
   - メール通知
   - 高度な管理機能

---

**重要**: まず動くものを作り、その後で改善する。完璧を求めすぎない。