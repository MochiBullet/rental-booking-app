@echo off
title M's BASE Rental - S3 Deploy
color 0A

cd /d "C:\Users\hiyok\projects\rental-booking-app"

echo ===============================================
echo  M's BASE Rental - S3 Deploy Script
echo ===============================================
echo Current directory: %cd%
echo.

echo 1. Checking AWS credentials...
aws sts get-caller-identity
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: AWS credentials not configured
    echo Please run: aws configure
    pause
    exit /b 1
)

echo.
echo 2. Getting AWS account ID...
for /f "tokens=*" %%a in ('aws sts get-caller-identity --query "Account" --output text') do set ACCOUNT_ID=%%a
set BUCKET_NAME=msbase-rental-%ACCOUNT_ID%
echo Bucket name: %BUCKET_NAME%

echo.
echo 3. Creating S3 bucket...
aws s3 mb s3://%BUCKET_NAME% --region ap-southeast-2
echo S3 bucket creation completed

echo.
echo 4. Configuring website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo.
echo 5. Setting public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

echo.
echo 6. Setting bucket policy...
echo {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::%BUCKET_NAME%/*"}]} > temp-policy.json
aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://temp-policy.json
del temp-policy.json

echo.
echo 7. Building React app...
call npm run build

echo.
echo 8. Uploading to S3...
aws s3 sync build/ s3://%BUCKET_NAME% --delete

echo.
echo ===============================================
echo  DEPLOYMENT COMPLETE!
echo ===============================================
echo.
echo Website URL: http://%BUCKET_NAME%.s3-website-ap-southeast-2.amazonaws.com
echo.
echo Press any key to open website...
pause >nul
start http://%BUCKET_NAME%.s3-website-ap-southeast-2.amazonaws.com