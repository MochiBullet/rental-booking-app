@echo off
echo ===============================================
echo  Manual Deploy to S3 (Emergency Fix)
echo ===============================================
echo.

cd /d C:\Windows\System32\rental-booking-app

echo Checking AWS CLI installation...
aws --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI not installed
    echo Please install: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

echo Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS credentials not configured
    echo Please run: aws configure
    pause
    exit /b 1
)

echo ✅ AWS CLI configured
echo.

REM 実際のバケット名を使用（どちらか有効な方）
set BUCKET_NAME=rental-booking-app-production-276291855506
REM set BUCKET_NAME=rental-booking-app-bucket
set REGION=ap-southeast-2

echo Step 1: Building React application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Creating S3 bucket...
aws s3 mb s3://%BUCKET_NAME% --region %REGION% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Bucket created
) else (
    echo ℹ️ Bucket already exists
)

echo.
echo Step 3: Configuring static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo.
echo Step 4: Setting bucket policy...
echo {^
  "Version": "2012-10-17",^
  "Statement": [^
    {^
      "Sid": "PublicReadGetObject",^
      "Effect": "Allow",^
      "Principal": "*",^
      "Action": "s3:GetObject",^
      "Resource": "arn:aws:s3:::%BUCKET_NAME%/*"^
    }^
  ]^
} > temp-policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://temp-policy.json
del temp-policy.json

echo.
echo Step 5: Disabling block public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo.
echo Step 6: Uploading files...
aws s3 sync build/ s3://%BUCKET_NAME%/ --delete --region %REGION%

echo.
echo Step 7: Clearing CloudFront cache...
REM CloudFront Distribution IDを取得
for /f "tokens=*" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text') do set DIST_ID=%%i

if "%DIST_ID%" NEQ "None" (
    echo Creating invalidation for distribution %DIST_ID%...
    aws cloudfront create-invalidation --distribution-id %DIST_ID% --paths "/*"
    echo ✅ CloudFront cache cleared
) else (
    echo ⚠️ No CloudFront distribution found
)

echo.
echo ===============================================
echo ✅ Manual deployment complete!
echo.
echo Your website should be accessible at:
echo 🌐 Primary: https://ms-base-rental.com
echo 🌐 S3 Direct: http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com
echo.
echo ⚠️ IMPORTANT: Hard refresh your browser (Ctrl+Shift+R)
echo ===============================================
echo.
pause