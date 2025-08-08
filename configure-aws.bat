@echo off
echo ===============================================
echo  AWS CLI Configuration Helper
echo ===============================================
echo.

echo Step 1: AWS CLI Configuration
echo.
echo You need:
echo 1. AWS Access Key ID
echo 2. AWS Secret Access Key
echo.
echo Get these from AWS Console:
echo 1. Login to https://console.aws.amazon.com/
echo 2. Go to IAM Service
echo 3. Create user with S3 permissions
echo 4. Generate Access Keys
echo.
echo Press any key when you have your keys ready...
pause

echo.
echo Running aws configure...
aws configure

echo.
echo Testing configuration...
aws sts get-caller-identity

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Configuration successful!
    echo.
    echo Now run: execute-aws-setup.bat
) else (
    echo.
    echo ❌ Configuration failed
    echo Please check your keys and try again
)

pause