# RentalEasy データベース設計書

## 概要
RentalEasy（レンタルサービス）のデータベース設計書です。
MySQL 8.0を想定した設計となっています。

## データベース構造

### 主要機能
- ユーザー管理（会員登録・ログイン・プロフィール）
- 車両・バイク管理
- レンタル予約システム
- 支払い管理
- お知らせ管理
- サイト設定管理

### テーブル一覧

#### 1. ユーザー関連
- `users` - ユーザー基本情報
- `user_profiles` - ユーザー詳細プロフィール
- `user_sessions` - セッション管理
- `password_resets` - パスワードリセット

#### 2. 車両管理
- `vehicles` - 車両基本情報
- `vehicle_images` - 車両画像
- `vehicle_categories` - 車両カテゴリ

#### 3. レンタル・予約
- `rentals` - レンタル予約
- `rental_items` - レンタル詳細項目
- `rental_status` - レンタル状態

#### 4. 支払い
- `payments` - 支払い情報
- `payment_methods` - 支払い方法

#### 5. サイト管理
- `announcements` - お知らせ
- `site_settings` - サイト設定
- `admin_users` - 管理者ユーザー

## セットアップ手順

### 1. データベース作成
```sql
CREATE DATABASE rentaleasy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rentaleasy_db;
```

### 2. テーブル作成
```bash
mysql -u root -p rentaleasy_db < schema.sql
```

### 3. 初期データ投入
```bash
mysql -u root -p rentaleasy_db < initial_data.sql
```

## 技術仕様
- データベース: MySQL 8.0+
- 文字セット: UTF8MB4
- 照合順序: utf8mb4_unicode_ci
- エンジン: InnoDB（トランザクション対応）
- 外部キー制約: 有効

## セキュリティ考慮事項
- パスワードはハッシュ化（bcrypt推奨）
- 個人情報は適切な暗号化
- SQLインジェクション対策
- CSRF対策
- XSS対策

## バックアップ・メンテナンス
- 日次自動バックアップ推奨
- インデックスの定期メンテナンス
- ログファイルのローテーション