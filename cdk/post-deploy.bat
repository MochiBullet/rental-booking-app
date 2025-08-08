@echo off
echo ===============================================
echo  Post-Deploy: Upload Build Files to S3
echo ===============================================
echo.

cd /d C:\Users\hiyok\projects\rental-booking-app

echo Step 1: Building the React application...
call npm run build

echo.
echo Step 2: Reading CDK outputs...
cd cdk
if exist outputs.json (
    for /f "tokens=*" %%a in ('type outputs.json ^| findstr /C:"S3BucketName"') do (
        set BUCKET_LINE=%%a
    )
    echo Found CDK outputs
) else (
    echo ❌ outputs.json not found. Please run CDK deploy first.
    pause
    exit /b 1
)

echo.
echo Step 3: Uploading build files to S3...
cd ..
aws s3 sync build/ s3://%BUCKET_NAME%/ --delete --region ap-southeast-2

echo.
echo Step 4: Invalidating CloudFront cache...
for /f "tokens=*" %%a in ('type cdk\outputs.json ^| findstr /C:"DistributionId"') do (
    set DIST_LINE=%%a
)
REM Extract distribution ID from the line
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*" --region us-east-1

echo.
echo ===============================================
echo ✅ Post-deployment complete!
echo.
echo Your website should be accessible via CloudFront URL
echo Check cdk/outputs.json for the exact URL
echo ===============================================
echo.
pause