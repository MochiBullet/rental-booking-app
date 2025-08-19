@echo off
echo ========================================
echo 強制デプロイスクリプト
echo ========================================

cd /d C:\Windows\System32\rental-booking-app

echo ビルド実行中...
call npm run build

echo.
echo S3へ直接アップロード（複数のバケットを試す）
echo.

echo 1. rental-booking-app-production-276291855506 にデプロイ...
aws s3 sync build/ s3://rental-booking-app-production-276291855506 --delete --region ap-southeast-2
echo.

echo 2. rental-booking-app-bucket にデプロイ...
aws s3 sync build/ s3://rental-booking-app-bucket --delete --region ap-southeast-2
echo.

echo 3. CloudFrontキャッシュをクリア...
aws cloudfront create-invalidation --distribution-id E1O8QRS9FHZ8G9 --paths "/*" 2>nul
aws cloudfront create-invalidation --distribution-id ESWX0FBRT9F89 --paths "/*" 2>nul

echo.
echo ========================================
echo 完了！
echo ブラウザでCtrl+Shift+Rでハードリフレッシュしてください
echo ========================================
pause