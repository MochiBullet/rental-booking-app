# Shuriken Designer GAS連携セットアップガイド

## 概要
このGAS（Google Apps Script）は、ShurikenDesignerで作成したデザインをGoogle DriveとSpreadsheetに保存する機能を提供します。

## セットアップ手順

### 1. Google Driveにフォルダを作成
1. Google Driveを開く
2. 新しいフォルダを作成（例: `ShurikenDesigns`）
3. フォルダを開き、URLからフォルダIDをコピー
   - URL例: `https://drive.google.com/drive/folders/XXXXXXXXXXXXXX`
   - `XXXXXXXXXXXXXX`の部分がフォルダID

### 2. Google Spreadsheetを作成
1. Google Spreadsheetを新規作成（例: `Shurikenデザイン履歴`）
2. URLからスプレッドシートIDをコピー
   - URL例: `https://docs.google.com/spreadsheets/d/YYYYYYYYYYYYYY/edit`
   - `YYYYYYYYYYYYYY`の部分がスプレッドシートID

### 3. Google Apps Scriptを設定
1. [script.google.com](https://script.google.com) にアクセス
2. 「新しいプロジェクト」をクリック
3. `ShurikenDesignerGAS.js` の内容をコピー＆ペースト
4. 以下の定数を編集:
   ```javascript
   const FOLDER_ID = 'XXXXXXXXXXXXXX'; // 手順1でコピーしたフォルダID
   const SPREADSHEET_ID = 'YYYYYYYYYYYYYY'; // 手順2でコピーしたスプレッドシートID
   ```
5. Ctrl+S で保存

### 4. ウェブアプリとしてデプロイ
1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 歯車アイコン横の「種類を選択」→「ウェブアプリ」を選択
4. 設定:
   - 説明: `Shuriken Designer API`
   - 次のユーザーとして実行: `自分`
   - アクセスできるユーザー: `全員`
5. 「デプロイ」をクリック
6. アクセスを承認（初回のみ）
7. 表示されるURLをコピー（例: `https://script.google.com/macros/s/ZZZZZZZ/exec`）

### 5. Reactアプリに環境変数を設定
1. プロジェクトルートに `.env` ファイルを作成（既存の場合は追記）
2. 以下を追加:
   ```
   REACT_APP_GAS_WEBAPP_URL=https://script.google.com/macros/s/ZZZZZZZ/exec
   ```
3. 開発サーバーを再起動

### 6. 本番環境（Cloudflare等）の場合
環境変数に `REACT_APP_GAS_WEBAPP_URL` を設定してください。

## スプレッドシートの列構成

自動的に以下の列が作成されます:

| 列 | 内容 |
|---|---|
| A | 受付日時 |
| B | カード色 |
| C | 印刷タイプ |
| D | 裏面印刷 |
| E | 合計金額 |
| F | 表面プレビュー（Driveリンク） |
| G | 表面印刷用（Driveリンク） |
| H | 裏面プレビュー（Driveリンク） |
| I | 裏面印刷用（Driveリンク） |
| J | フォルダリンク |

## Google Driveのフォルダ構造

```
ShurikenDesigns/
├── 2026-01-17/
│   ├── 143052_表面_プレビュー.png
│   ├── 143052_表面_印刷用.png
│   ├── 143052_裏面_プレビュー.png
│   └── 143052_裏面_印刷用.png
├── 2026-01-18/
│   └── ...
```

日付ごとにフォルダが自動作成されます。

## トラブルシューティング

### 送信ボタンを押しても反応がない
- ブラウザの開発者ツール（F12）→ Consoleタブでエラーを確認
- 環境変数 `REACT_APP_GAS_WEBAPP_URL` が設定されているか確認

### 「アクセスが拒否されました」エラー
- GASの「アクセスできるユーザー」が「全員」になっているか確認
- 再デプロイを試す

### 画像がDriveに保存されない
- フォルダIDが正しいか確認
- GASの実行ログ（表示→実行ログ）でエラーを確認

### スプレッドシートに記録されない
- スプレッドシートIDが正しいか確認
- GASの実行ログでエラーを確認

## セキュリティに関する注意

- GASのURLは公開URLになるため、第三者に共有しないでください
- 必要に応じてGAS側でリクエストの検証を追加してください
