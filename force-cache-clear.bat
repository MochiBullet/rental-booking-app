@echo off
echo =============================================
echo   CloudFront Cache Clear - Emergency Deploy
echo =============================================

echo Step 1: Building fresh version...
call npm run build

echo Step 2: Deploying to S3...
aws s3 sync build/ s3://rental-booking-app-website --delete --region ap-southeast-2 --cache-control "no-cache, no-store, must-revalidate"

echo Step 3: Force CloudFront invalidation...
aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*" --query "Invalidation.Id" --output text

echo Step 4: Additional browser cache headers...
aws s3 cp build/static/js/ s3://rental-booking-app-website/static/js/ --recursive --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate" --expires "Thu, 01 Jan 1970 00:00:00 GMT"

echo.
echo =============================================
echo   Cache Clear Complete!
echo   Please wait 5-10 minutes for propagation
echo =============================================
pause