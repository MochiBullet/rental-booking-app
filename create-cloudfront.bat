@echo off
echo ===============================================
echo  CloudFront HTTPS Setup for M's BASE Rental
echo ===============================================
echo.

echo Setting AWS region...
set AWS_DEFAULT_REGION=ap-southeast-2

echo Creating CloudFront distribution...
echo This will take about 15-20 minutes to fully deploy.
echo.

aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --region us-east-1 > cloudfront-output.json 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ CloudFront distribution created successfully!
    echo.
    echo 📋 Next steps:
    echo 1. Wait 15-20 minutes for deployment
    echo 2. Check cloudfront-output.json for your CloudFront URL
    echo 3. Access your site via HTTPS at the CloudFront URL
    echo.
    for /f "tokens=*" %%a in ('type cloudfront-output.json ^| findstr /C:"DomainName"') do (
        echo Your CloudFront URL will be: https://%%a
    )
) else (
    echo ❌ Failed to create CloudFront distribution
    echo Please check cloudfront-output.json for error details
    echo.
    echo Common issues:
    echo - AWS CLI not configured (run: aws configure)
    echo - Insufficient permissions
    echo - Distribution already exists
)

pause