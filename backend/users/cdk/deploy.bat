@echo off
echo ========================================
echo User Database CDK Deployment Script
echo ========================================
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

echo.
echo Installing Lambda layer dependencies...
cd lambda\layer\nodejs
call npm install --production
if %errorlevel% neq 0 (
    echo Error: Failed to install Lambda layer dependencies
    exit /b 1
)
cd ..\..\..

echo.
echo Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build TypeScript
    exit /b 1
)

echo.
echo Bootstrapping CDK (if needed)...
call npx cdk bootstrap
if %errorlevel% neq 0 (
    echo Warning: Bootstrap failed or already completed
)

echo.
echo Synthesizing CDK stack...
call npx cdk synth
if %errorlevel% neq 0 (
    echo Error: Failed to synthesize CDK stack
    exit /b 1
)

echo.
echo Deploying CDK stack...
call npx cdk deploy --require-approval never
if %errorlevel% neq 0 (
    echo Error: Failed to deploy CDK stack
    exit /b 1
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Check the outputs above for:
echo - API Endpoint URL
echo - DynamoDB Table Name
echo - Other resource ARNs
echo.
pause