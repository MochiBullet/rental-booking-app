@echo off
echo ========================================
echo 正しいS3バケットを特定して自動デプロイ
echo ========================================

cd /d C:\Windows\System32\rental-booking-app

echo ステップ1: ビルド実行...
call npm run build

echo.
echo ステップ2: 両方のバケットを確認...

echo.
echo バケット1: rental-booking-app-production-276291855506
aws s3 ls s3://rental-booking-app-production-276291855506 --region ap-southeast-2 > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ バケット存在確認
    echo デプロイ中...
    aws s3 sync build/ s3://rental-booking-app-production-276291855506 --delete --region ap-southeast-2
    echo ✅ rental-booking-app-production-276291855506 にデプロイ完了
    set DEPLOYED=1
) else (
    echo ❌ アクセス不可
)

echo.
echo バケット2: rental-booking-app-bucket
aws s3 ls s3://rental-booking-app-bucket --region ap-southeast-2 > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ バケット存在確認
    echo デプロイ中...
    aws s3 sync build/ s3://rental-booking-app-bucket --delete --region ap-southeast-2
    echo ✅ rental-booking-app-bucket にデプロイ完了
    set DEPLOYED=1
) else (
    echo ❌ アクセス不可
)

echo.
echo ステップ3: CloudFront無効化...

REM CloudFront Distributionを自動検出して無効化
for /f "tokens=*" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[*].Id" --output text 2^>nul') do (
    if not "%%i"=="" (
        echo CloudFront Distribution %%i のキャッシュをクリア...
        aws cloudfront create-invalidation --distribution-id %%i --paths "/*" > nul 2>&1
        echo ✅ キャッシュクリア完了: %%i
    )
)

echo.
echo ========================================
echo デプロイ完了！
echo.
echo 次の手順:
echo 1. ブラウザを完全に閉じる
echo 2. ブラウザを再度開く  
echo 3. Ctrl+Shift+R でハードリフレッシュ
echo 4. https://ms-base-rental.com にアクセス
echo.
echo コンソールで確認:
echo - API URL に "kgkjjv0rik" が表示されればOK
echo - "ysp1x4cqvk" が表示される場合は古いファイル
echo ========================================
pause