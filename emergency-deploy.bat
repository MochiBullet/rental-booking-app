@echo off
echo ===============================================
echo  Emergency Deploy - Quick Fix
echo ===============================================
echo.

cd /d C:\Users\hiyok\projects\rental-booking-app

REM Check if we can deploy locally
echo Checking local environment...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Build the project
echo Building the project...
call npm install
call npm run build

if not exist build\index.html (
    echo ❌ Build failed - index.html not found
    pause
    exit /b 1
)

echo ✅ Build successful
echo.

REM Check AWS CLI
aws --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI not found
    echo.
    echo Manual options:
    echo 1. Install AWS CLI: https://aws.amazon.com/cli/
    echo 2. Use Vercel: https://vercel.com/
    echo 3. Use Netlify: https://www.netlify.com/
    echo.
    echo For Vercel deployment:
    echo - Install: npm i -g vercel
    echo - Run: vercel --prod
    echo.
    pause
    exit /b 1
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS not configured
    echo Run: aws configure
    echo.
    echo Enter:
    echo - AWS Access Key ID
    echo - AWS Secret Access Key  
    echo - Region: ap-southeast-2
    echo - Output: json
    echo.
    pause
    exit /b 1
)

echo ✅ AWS configured
echo.

REM Deploy
set BUCKET=rental-booking-app-bucket

echo Creating/configuring S3 bucket...
aws s3 mb s3://%BUCKET% --region ap-southeast-2 2>nul

echo Configuring website hosting...
aws s3 website s3://%BUCKET% --index-document index.html --error-document index.html

echo Setting public access...
aws s3api put-public-access-block --bucket %BUCKET% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo Creating bucket policy...
echo {"Version": "2012-10-17","Statement": [{"Sid": "PublicReadGetObject","Effect": "Allow","Principal": "*","Action": "s3:GetObject","Resource": "arn:aws:s3:::%BUCKET%/*"}]} > temp-policy.json
aws s3api put-bucket-policy --bucket %BUCKET% --policy file://temp-policy.json
del temp-policy.json

echo Uploading files...
aws s3 sync build/ s3://%BUCKET%/ --delete

echo.
echo ===============================================
echo ✅ Emergency deployment complete!
echo.
echo 🌐 Website URL:
echo http://%BUCKET%.s3-website-ap-southeast-2.amazonaws.com
echo.
echo Wait 2-3 minutes for DNS propagation
echo ===============================================
echo.
pause