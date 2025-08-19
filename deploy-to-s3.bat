@echo off
echo S3手動デプロイスクリプト
echo ================================

echo 1. ビルド実行中...
call npm run build
if errorlevel 1 (
    echo ビルドに失敗しました
    pause
    exit /b 1
)

echo 2. AWS CLIでS3にデプロイ中...
echo バケット名を確認してください:
echo - rental-booking-app-bucket
echo - rental-booking-app-production-276291855506

echo.
echo 使用するコマンド例:
echo aws s3 sync build/ s3://rental-booking-app-bucket --delete
echo aws s3 sync build/ s3://rental-booking-app-production-276291855506 --delete

echo.
echo 注意: AWS CLIが設定されている場合のみ実行してください
pause

REM 実際のコマンドはコメントアウト（安全のため）
REM aws s3 sync build/ s3://rental-booking-app-bucket --delete