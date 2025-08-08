@echo off
echo ===============================================
echo  CDK Setup for M's BASE Rental
echo ===============================================
echo.

cd /d C:\Users\hiyok\projects\rental-booking-app\cdk

echo Step 1: Installing CDK dependencies...
call npm install

echo.
echo Step 2: Building TypeScript files...
call npm run build

echo.
echo Step 3: Bootstrapping CDK (first time only)...
call npx cdk bootstrap

echo.
echo Step 4: Synthesizing CloudFormation templates...
call npx cdk synth

echo.
echo ===============================================
echo ✅ CDK Setup Complete!
echo.
echo Next steps:
echo 1. Configure AWS credentials: aws configure
echo 2. Deploy the stack: npm run deploy
echo ===============================================
echo.
pause