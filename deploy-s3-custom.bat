@echo off
chcp 65001 > nul
echo ===============================================
echo  M's BASE Rental - Custom S3 Deploy Script
echo ===============================================
echo.

cd /d "C:\Users\hiyok\projects\rental-booking-app"

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
    echo Or set environment variables:
    echo   set AWS_ACCESS_KEY_ID=your_key
    echo   set AWS_SECRET_ACCESS_KEY=your_secret
    echo   set AWS_DEFAULT_REGION=us-east-1
    pause
    exit /b 1
)

echo ✅ AWS CLI configured
echo.

echo Getting AWS Account ID...
for /f "tokens=2 delims=," %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
if "%ACCOUNT_ID%"=="" (
    for /f %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
)

echo Account ID: %ACCOUNT_ID%
set BUCKET_NAME=msbase-rental-%ACCOUNT_ID%
set REGION=us-east-1

echo Using bucket name: %BUCKET_NAME%
echo Using region: %REGION%
echo.

echo Step 1: Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Dependencies installation failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building React application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Creating S3 bucket...
aws s3 mb s3://%BUCKET_NAME% --region %REGION% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Bucket created: %BUCKET_NAME%
) else (
    echo ℹ️ Bucket already exists: %BUCKET_NAME%
)

echo.
echo Step 4: Disabling block public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo.
echo Step 5: Configuring static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo.
echo Step 6: Setting bucket policy for public access...
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
echo Step 7: Uploading build files to S3...
aws s3 sync build/ s3://%BUCKET_NAME%/ --delete --region %REGION%

echo.
echo ===============================================
echo ✅ S3 Deployment Complete!
echo.
echo Your website is now accessible at:
echo http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com
echo.
echo Alternative URL format:
echo http://%BUCKET_NAME%.s3-website.%REGION%.amazonaws.com
echo.
echo If the site doesn't load immediately, wait 2-3 minutes for DNS propagation
echo ===============================================
echo.

echo Website URL: http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com > deployment-url.txt
echo Deployment completed at: %DATE% %TIME% >> deployment-url.txt

pause