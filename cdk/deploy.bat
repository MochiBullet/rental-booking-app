@echo off
REM CDK Deployment Script for Rental Booking App (Windows)
REM This script deploys the AWS infrastructure using CDK

echo ======================================
echo Rental Booking App - CDK Deployment
echo ======================================

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: AWS credentials not configured
    echo Please run 'aws configure' or set AWS environment variables
    exit /b 1
)

REM Get AWS account information
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
if "%AWS_REGION%"=="" set AWS_REGION=ap-northeast-1
if "%1"=="" (set ENVIRONMENT=production) else (set ENVIRONMENT=%1)

echo AWS Account: %ACCOUNT_ID%
echo Region: %AWS_REGION%
echo Environment: %ENVIRONMENT%
echo.

REM Navigate to CDK directory
cd /d "%~dp0"

REM Install CDK dependencies if needed
if not exist node_modules (
    echo Installing CDK dependencies...
    call npm install
)

REM Bootstrap CDK if needed
echo Bootstrapping CDK if needed...
call npx cdk bootstrap aws://%ACCOUNT_ID%/%AWS_REGION%

REM Synthesize the CDK app
echo Synthesizing CDK stacks...
call npx cdk synth --context environment=%ENVIRONMENT%

REM Deploy the stacks
echo Deploying CDK stacks...
call npx cdk deploy --all ^
    --context environment=%ENVIRONMENT% ^
    --require-approval never ^
    --outputs-file outputs.json

REM Check if outputs file exists
if exist outputs.json (
    echo.
    echo ======================================
    echo Deployment Complete!
    echo ======================================
    echo.
    echo Check outputs.json for deployment details
    echo.
    echo Next Steps:
    echo 1. Add the following secrets to your GitHub repository:
    echo    - AWS_REGION: %AWS_REGION%
    echo    - S3_BUCKET_NAME: Check outputs.json
    echo    - AWS_ROLE_ARN: Check outputs.json
    echo    - CLOUDFRONT_DISTRIBUTION_ID: Check AWS Console
    echo.
    echo 2. Add the following variable to your GitHub repository:
    echo    - USE_OIDC: true
    echo.
    echo 3. Push to main branch to trigger automatic deployment
) else (
    echo Warning: Could not create outputs file
)

echo.
echo Done!
pause