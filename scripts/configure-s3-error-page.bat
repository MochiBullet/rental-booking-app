@echo off
REM S3バケットのエラードキュメント設定スクリプト
REM React RouterのSPAリロード問題を解決

SET BUCKET_NAME=rental-booking-app-website
SET REGION=ap-southeast-2

echo Setting up S3 error document for SPA routing...

REM S3バケットのウェブサイト設定を更新
aws s3api put-bucket-website ^
  --bucket %BUCKET_NAME% ^
  --website-configuration "{\"IndexDocument\":{\"Suffix\":\"index.html\"},\"ErrorDocument\":{\"Key\":\"404.html\"}}" ^
  --region %REGION%

IF %ERRORLEVEL% EQU 0 (
  echo [SUCCESS] S3 error document configured successfully!
  echo 404 errors will now redirect to 404.html, which redirects to React Router
) ELSE (
  echo [ERROR] Failed to configure S3 error document
  exit /b 1
)

echo.
echo Note: Also configure CloudFront custom error pages:
echo   - 404 to /404.html (200 response code)
echo   - 403 to /404.html (200 response code)
echo.
echo This ensures proper SPA routing for all paths
pause