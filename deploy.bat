@echo off
echo ===============================================
echo  M's BASE Rental デプロイスクリプト
echo ===============================================
echo.

echo [1/5] 現在の変更を確認中...
git status

echo.
set /p commit_message="コミットメッセージを入力してください: "

echo.
echo [2/5] 変更をステージング中...
git add -A

echo.
echo [3/5] コミットを作成中...
git commit -m "%commit_message%"

echo.
echo [4/5] GitHubにプッシュ中...
git push origin master

echo.
echo [5/5] デプロイ完了!
echo.
echo デプロイ状況確認: https://github.com/MochiBullet/rental-booking-app/actions
echo サイト確認: https://rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com
echo.
pause