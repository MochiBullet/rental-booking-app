@echo off
echo ===============================================
echo  Rental Booking Backend Deployment
echo ===============================================
echo.

cd /d "C:\Users\hiyok\projects\rental-booking-app\backend\cdk"

echo 1. Setting environment variables...
set CDK_DEFAULT_ACCOUNT=276291855506
set CDK_DEFAULT_REGION=ap-southeast-2

echo.
echo 2. Installing CDK requirements...
pip install -r requirements.txt

echo.
echo 3. CDK Bootstrap (if needed)...
cdk bootstrap

echo.
echo 4. CDK Synth...
cdk synth

echo.
echo 5. CDK Deploy...
cdk deploy --require-approval never

echo.
echo ===============================================
echo  Deployment Complete!
echo ===============================================
echo.
echo Check the outputs above for:
echo - API Gateway endpoint URL
echo - DynamoDB table names
echo.
pause