# ユーザーデータベース設計

## DynamoDB テーブル構造

### テーブル名: `rental-users`

### プライマリキー
- **パーティションキー**: `userId` (String) - UUID形式
- **ソートキー**: なし

### グローバルセカンダリインデックス (GSI)
1. **email-index**
   - パーティションキー: `email` (String)
   - 用途: メールアドレスでのユーザー検索

2. **memberNumber-index**
   - パーティションキー: `memberNumber` (String)
   - 用途: 会員番号での検索

### 属性

```json
{
  "userId": "uuid-v4",
  "email": "user@example.com",
  "memberNumber": "M000001",
  "memberType": "regular|premium|vip",
  "status": "active|inactive|suspended",
  
  "profile": {
    "firstName": "太郎",
    "lastName": "山田",
    "firstNameKana": "タロウ",
    "lastNameKana": "ヤマダ",
    "phone": "090-1234-5678",
    "birthDate": "1990-01-01",
    "gender": "male|female|other"
  },
  
  "address": {
    "postalCode": "123-4567",
    "prefecture": "東京都",
    "city": "渋谷区",
    "street": "渋谷1-1-1",
    "building": "渋谷ビル101"
  },
  
  "driverLicense": {
    "number": "123456789012",
    "lastFourDigits": "1234",
    "expiryDate": "2025-12-31",
    "issuedDate": "2020-01-01",
    "frontImageUrl": "s3://bucket/licenses/front.jpg",
    "backImageUrl": "s3://bucket/licenses/back.jpg",
    "verificationStatus": "pending|approved|rejected",
    "verifiedAt": "2025-01-01T00:00:00Z"
  },
  
  "authentication": {
    "passwordHash": "bcrypt-hash",
    "salt": "random-salt",
    "lastLogin": "2025-01-01T00:00:00Z",
    "loginAttempts": 0,
    "lockedUntil": null,
    "refreshToken": "jwt-refresh-token",
    "mfaEnabled": false,
    "mfaSecret": null
  },
  
  "points": {
    "balance": 1000,
    "totalEarned": 1500,
    "totalUsed": 500,
    "expiryDate": "2025-12-31"
  },
  
  "statistics": {
    "totalReservations": 10,
    "totalSpent": 50000,
    "averageRating": 4.5,
    "joinDate": "2024-01-01T00:00:00Z",
    "lastReservation": "2025-01-01T00:00:00Z",
    "favoriteVehicleType": "car"
  },
  
  "preferences": {
    "language": "ja",
    "currency": "JPY",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "newsletter": true
  },
  
  "metadata": {
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "createdBy": "system",
    "updatedBy": "admin-user-id",
    "version": 1
  }
}
```

## アクセスパターン

1. **ユーザー登録**
   - emailでの重複チェック
   - 新規ユーザー作成

2. **ログイン**
   - emailでユーザー検索
   - パスワード検証

3. **プロフィール取得**
   - userIdで直接取得

4. **プロフィール更新**
   - userIdで更新

5. **会員番号検索**
   - memberNumberで検索

6. **ポイント更新**
   - userIdでアトミックな更新

## セキュリティ考慮事項

- パスワードはbcryptでハッシュ化
- 個人情報は暗号化して保存
- アクセスログの記録
- レート制限の実装
- MFA（多要素認証）サポート