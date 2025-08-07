@echo off
echo ===============================================
echo  M's BASE Rental 開発環境スタート
echo ===============================================
echo.

echo [1/3] プロジェクトディレクトリを確認中...
cd /d "%~dp0"
echo 現在の場所: %CD%

echo.
echo [2/3] Git状況を確認中...
git status --short

echo.
echo [3/3] 開発サーバーを起動中...
echo ブラウザで http://localhost:3000 が開きます
echo.
echo 管理者画面へのアクセス:
echo 1. ロゴ「MB」を10回クリック
echo 2. admin / admin123 でログイン
echo.
echo 終了するには Ctrl+C を押してください
echo.

npm start