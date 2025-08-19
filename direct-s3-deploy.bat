@echo off
echo ========================================
echo 直接S3デプロイ（確実版）
echo ========================================

cd /d C:\Windows\System32\rental-booking-app

echo ステップ1: 最新ビルド実行...
call npm run build

echo.
echo ステップ2: 正しいバケットを確認...
echo rental-booking-app-production-276291855506 を試します

echo.
echo ステップ3: S3に直接アップロード...
aws s3 sync build/ s3://rental-booking-app-production-276291855506 --delete --region ap-southeast-2

echo.
echo ステップ4: CloudFront無効化...
echo すべてのCloudFrontディストリビューションのキャッシュをクリア

for /f "tokens=2" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[*].Id" --output text') do (
    echo Distribution %%i のキャッシュをクリア...
    aws cloudfront create-invalidation --distribution-id %%i --paths "/*"
)

echo.
echo ========================================
echo 完了！
echo.
echo 確認方法:
echo 1. ブラウザを完全に閉じて再度開く
echo 2. https://ms-base-rental.com にアクセス
echo 3. F12でConsoleを開いて確認
echo    - API URL: kgkjjv0rik（正しい）
echo    - API URL: ysp1x4cqvk（間違い - 古いファイル）
echo ========================================
pause