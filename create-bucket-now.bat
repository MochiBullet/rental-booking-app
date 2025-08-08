@echo off
echo ===============================================
echo  Immediate S3 Bucket Creation
echo ===============================================
echo.

REM Check AWS CLI
aws --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI not installed
    echo.
    echo Quick install options:
    echo 1. Download: https://aws.amazon.com/cli/
    echo 2. Or use AWS Console manually
    echo.
    pause
    exit /b 1
)

REM Check credentials
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS not configured
    echo.
    echo Run: aws configure
    echo Then enter your AWS credentials
    echo.
    pause
    exit /b 1
)

echo ✅ AWS CLI ready
echo.

REM Create unique bucket name
set BUCKET_BASE=msbase-rental
for /f %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
set BUCKET_NAME=%BUCKET_BASE%-%ACCOUNT_ID%

echo Creating bucket: %BUCKET_NAME%

REM Create bucket
aws s3 mb s3://%BUCKET_NAME% --region ap-southeast-2

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Bucket creation failed
    echo Trying alternative name...
    set BUCKET_NAME=%BUCKET_BASE%-backup-%RANDOM%
    aws s3 mb s3://!BUCKET_NAME! --region ap-southeast-2
)

echo ✅ Bucket created: %BUCKET_NAME%
echo.

REM Configure website hosting
echo Setting up static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

REM Set public access
echo Configuring public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

REM Create policy file
echo Creating bucket policy...
echo {> policy.json
echo   "Version": "2012-10-17",>> policy.json
echo   "Statement": [>> policy.json
echo     {>> policy.json
echo       "Sid": "PublicReadGetObject",>> policy.json
echo       "Effect": "Allow",>> policy.json
echo       "Principal": "*",>> policy.json
echo       "Action": "s3:GetObject",>> policy.json
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*">> policy.json
echo     }>> policy.json
echo   ]>> policy.json
echo }>> policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://policy.json
del policy.json

echo ✅ Bucket configured
echo.

REM Build and upload if build exists
if exist build\index.html (
    echo Found build files, uploading...
    aws s3 sync build/ s3://%BUCKET_NAME%/ --delete
    echo ✅ Files uploaded
) else (
    echo Building project...
    call npm run build
    if exist build\index.html (
        aws s3 sync build/ s3://%BUCKET_NAME%/ --delete
        echo ✅ Files uploaded
    ) else (
        echo ❌ Build failed
    )
)

echo.
echo ===============================================
echo ✅ Setup Complete!
echo.
echo 🌐 Website URL:
echo http://%BUCKET_NAME%.s3-website-ap-southeast-2.amazonaws.com
echo.
echo 📋 Update GitHub Secrets:
echo S3_BUCKET_NAME = %BUCKET_NAME%
echo.
echo ⏱️ Wait 2-3 minutes for DNS propagation
echo ===============================================
echo.

REM Save bucket name for future use
echo BUCKET_NAME=%BUCKET_NAME% > bucket-info.txt
echo %BUCKET_NAME%

pause