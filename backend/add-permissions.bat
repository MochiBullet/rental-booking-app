@echo off
echo ===============================================
echo  AWS IAM Permissions Setup
echo ===============================================
echo.

echo Adding CDK deployment permissions to user github-actions-s3...

echo.
echo 1. Creating CDK deployment policy...
aws iam create-policy ^
    --policy-name CDKDeploymentPolicy ^
    --policy-document file://aws-permissions-policy.json ^
    --description "Full CDK deployment permissions"

echo.
echo 2. Attaching policy to user...
aws iam attach-user-policy ^
    --user-name github-actions-s3 ^
    --policy-arn arn:aws:iam::%AWS_ACCOUNT_ID%:policy/CDKDeploymentPolicy

echo.
echo 3. Alternative: Attach AdministratorAccess (full permissions)
echo Run this if you want full admin access:
echo aws iam attach-user-policy --user-name github-actions-s3 --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

echo.
echo ===============================================
echo  Permissions Setup Complete
echo ===============================================
pause