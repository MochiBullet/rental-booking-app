@echo off
echo Starting build and deploy...
cd /d C:\Users\hiyok\projects\rental-booking-app

echo Building React app...
call npm run build

echo Deploying to S3...
aws s3 sync build/ s3://rental-booking-app-website --delete

echo Deployment complete!
echo Site URL: http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com
pause