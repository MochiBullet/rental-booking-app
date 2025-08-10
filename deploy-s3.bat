@echo off
cd /d "%~dp0"
echo ===============================================
echo  M's BASE Rental - S3 Deploy Script
echo ===============================================
echo Current directory: %cd%
echo.

REM Set bucket name with account ID for uniqueness
set BUCKET_BASE_NAME=msbase-rental
set REGION=ap-southeast-2

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
for /f "tokens=2 delims=:" %%a in ('aws sts get-caller-identity --query "Account" --output text') do set ACCOUNT_ID=%%a
set BUCKET_NAME=%BUCKET_BASE_NAME%-%ACCOUNT_ID%
echo Bucket name: %BUCKET_NAME%

echo.
echo 3. Creating S3 bucket...
aws s3 mb s3://%BUCKET_NAME% --region %REGION%
if %ERRORLEVEL% NEQ 0 (
    echo Bucket may already exist, continuing...
)

echo.
echo 4. Configuring bucket for static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document error.html

echo.
echo 5. Setting bucket policy for public access...
echo {> bucket-policy-temp.json
echo   "Version": "2012-10-17",>> bucket-policy-temp.json
echo   "Statement": [>> bucket-policy-temp.json
echo     {>> bucket-policy-temp.json
echo       "Sid": "PublicReadGetObject",>> bucket-policy-temp.json
echo       "Effect": "Allow",>> bucket-policy-temp.json
echo       "Principal": "*",>> bucket-policy-temp.json
echo       "Action": "s3:GetObject",>> bucket-policy-temp.json
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*">> bucket-policy-temp.json
echo     }>> bucket-policy-temp.json
echo   ]>> bucket-policy-temp.json
echo }>> bucket-policy-temp.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy-temp.json
del bucket-policy-temp.json

echo.
echo 6. Disabling block public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

echo.
echo 7. Building React application...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo 8. Uploading to S3...
aws s3 sync build/ s3://%BUCKET_NAME% --delete

echo.
echo ===============================================
echo  DEPLOYMENT SUCCESSFUL!
echo ===============================================
echo.
echo Website URL: http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com
echo.
echo Bucket name: %BUCKET_NAME%
echo Region: %REGION%
echo.
echo To configure GitHub Actions, add these secrets:
echo AWS_ACCESS_KEY_ID: [your access key]
echo AWS_SECRET_ACCESS_KEY: [your secret key]
echo S3_BUCKET_NAME: %BUCKET_NAME%
echo.
pause