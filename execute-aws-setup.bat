@echo off
echo ===============================================
echo  AWS S3 Complete Setup - AUTO EXECUTION
echo ===============================================
echo.

cd /d C:\Users\hiyok\projects\rental-booking-app

REM Step 1: Check AWS CLI
echo [1/6] Checking AWS CLI...
aws --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI not found
    echo Install from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)
echo ✅ AWS CLI found

REM Step 2: Check AWS credentials
echo.
echo [2/6] Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS not configured
    echo.
    echo Please run: aws configure
    echo Enter your AWS Access Key ID and Secret Access Key
    echo Region: ap-southeast-2
    echo Output: json
    echo.
    pause
    exit /b 1
)
echo ✅ AWS credentials configured

REM Get account ID for unique bucket name
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
set BUCKET_NAME=msbase-rental-%ACCOUNT_ID%
set REGION=ap-southeast-2

echo.
echo [3/6] Creating S3 bucket: %BUCKET_NAME%
aws s3 mb s3://%BUCKET_NAME% --region %REGION%
if %ERRORLEVEL% NEQ 0 (
    echo ℹ️ Bucket may already exist, continuing...
)

echo.
echo [4/6] Configuring static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo.
echo [5/6] Setting bucket policy for public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo Creating bucket policy...
(
echo {
echo   "Version": "2012-10-17",
echo   "Statement": [
echo     {
echo       "Sid": "PublicReadGetObject",
echo       "Effect": "Allow",
echo       "Principal": "*",
echo       "Action": "s3:GetObject",
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*"
echo     }
echo   ]
echo }
) > policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://policy.json
del policy.json

echo.
echo [6/6] Building and uploading website...
call npm run build
if exist build\index.html (
    aws s3 sync build/ s3://%BUCKET_NAME%/ --delete --region %REGION%
    echo ✅ Upload complete
) else (
    echo ❌ Build failed - no index.html found
    pause
    exit /b 1
)

echo.
echo ===============================================
echo 🎉 AWS S3 Setup Complete!
echo.
echo 🌐 Your website is now available at:
echo http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com
echo.
echo 📋 For GitHub Actions, add these secrets:
echo AWS_ACCESS_KEY_ID = [your access key]
echo AWS_SECRET_ACCESS_KEY = [your secret key]
echo S3_BUCKET_NAME = %BUCKET_NAME%
echo.
echo 📝 Save this information:
echo BUCKET_NAME=%BUCKET_NAME% > aws-info.txt
echo URL=http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com >> aws-info.txt
echo ===============================================
echo.

REM Open website in browser
start http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com

pause