@echo off
echo ===============================================
echo  S3 Bucket Setup for M's BASE Rental
echo ===============================================
echo.

set BUCKET_NAME=rental-booking-app-bucket
set REGION=ap-southeast-2

echo Step 1: Creating S3 bucket (if not exists)...
aws s3 mb s3://%BUCKET_NAME% --region %REGION% 2>nul

echo.
echo Step 2: Enabling static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html --region %REGION%

echo.
echo Step 3: Setting bucket policy for public access...
aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://s3-bucket-policy.json --region %REGION%

echo.
echo Step 4: Disabling block public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" --region %REGION%

echo.
echo Step 5: Uploading build files...
aws s3 sync build/ s3://%BUCKET_NAME%/ --delete --region %REGION%

echo.
echo ===============================================
echo ✅ Setup complete!
echo.
echo Your website should be accessible at:
echo http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com
echo.
echo If you still can't access it, please:
echo 1. Check AWS Console S3 settings
echo 2. Verify bucket policy is applied
echo 3. Ensure static website hosting is enabled
echo ===============================================
echo.
pause