@echo off
echo ========================================
echo 緊急強制デプロイ（S3完全クリア版）
echo ========================================

cd /d C:\Windows\System32\rental-booking-app

echo ステップ1: クリーンビルド...
rmdir /s /q build 2>nul
call npm run build

echo.
echo ステップ2: S3バケットを完全にクリア...
echo rental-booking-app-production-276291855506 をクリア中...
aws s3 rm s3://rental-booking-app-production-276291855506 --recursive

echo.
echo ステップ3: 新しいファイルをアップロード...
aws s3 sync build/ s3://rental-booking-app-production-276291855506 --region ap-southeast-2

echo.
echo ステップ4: CloudFront無効化...
for /f "tokens=1" %%i in (aws cloudfront list-distributions --query "DistributionList.Items[*].Id" --output text) do (
    aws cloudfront create-invalidation --distribution-id %%i --paths "/*"
)

echo.
echo ========================================
echo 完了！
echo ========================================
pause
