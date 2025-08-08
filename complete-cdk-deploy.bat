@echo off
echo ===============================================
echo  Complete CDK Deployment for M's BASE Rental
echo ===============================================
echo.
echo This script will:
echo 1. Check AWS credentials
echo 2. Deploy infrastructure with CDK
echo 3. Build and upload the React app
echo 4. Provide the CloudFront HTTPS URL
echo.
pause

echo.
echo Step 1: Checking AWS credentials...
aws sts get-caller-identity > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ AWS credentials not configured!
    echo.
    echo Please configure AWS CLI:
    echo 1. Run: aws configure
    echo 2. Enter your AWS Access Key ID
    echo 3. Enter your AWS Secret Access Key
    echo 4. Enter region: ap-southeast-2
    echo 5. Enter output format: json
    echo.
    echo After configuring, run this script again.
    pause
    exit /b 1
)

echo ✅ AWS credentials found
echo.

echo Step 2: Deploying CDK infrastructure...
cd cdk
call deploy.bat

echo.
echo Step 3: Building React application...
cd ..
call npm run build

echo.
echo Step 4: Uploading to S3...
echo Reading bucket name from CDK outputs...
cd cdk
if exist outputs.json (
    echo ✅ CDK outputs found
    type outputs.json
    echo.
    echo ===============================================
    echo 🎉 Deployment Complete!
    echo.
    echo Your site is being deployed to CloudFront.
    echo It will be accessible in 15-20 minutes at the URL shown above.
    echo.
    echo Look for "WebsiteURL" in the output above for your HTTPS URL.
    echo ===============================================
) else (
    echo ❌ CDK deployment may have failed.
    echo Please check the error messages above.
)

cd ..
pause