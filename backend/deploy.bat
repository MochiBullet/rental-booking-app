@echo off
echo ===============================================
echo  Rental Booking Backend Deployment
echo ===============================================
echo.

cd /d %~dp0

echo 1. Installing CDK requirements...
cd cdk
pip install -r requirements.txt

echo.
echo 2. CDK Bootstrap (if needed)...
cdk bootstrap

echo.
echo 3. CDK Deploy...
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