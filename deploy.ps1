# M's BASE Rental - PowerShell Deploy Script
Write-Host "===============================================" -ForegroundColor Green
Write-Host " M's BASE Rental - S3 Deploy Script" -ForegroundColor Green  
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Change to project directory
Set-Location "C:\Users\hiyok\projects\rental-booking-app"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check AWS credentials
Write-Host "1. Checking AWS credentials..." -ForegroundColor Cyan
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "AWS User: $($identity.Arn)" -ForegroundColor Green
    $accountId = $identity.Account
} catch {
    Write-Host "ERROR: AWS credentials not configured" -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Set bucket name
$bucketName = "msbase-rental-$accountId"
Write-Host "Bucket name: $bucketName" -ForegroundColor Yellow

# Create S3 bucket
Write-Host ""
Write-Host "2. Creating S3 bucket..." -ForegroundColor Cyan
aws s3 mb "s3://$bucketName" --region ap-southeast-2
if ($LASTEXITCODE -eq 0) {
    Write-Host "Bucket created successfully" -ForegroundColor Green
} else {
    Write-Host "Bucket may already exist, continuing..." -ForegroundColor Yellow
}

# Configure website hosting
Write-Host ""
Write-Host "3. Configuring website hosting..." -ForegroundColor Cyan
aws s3 website "s3://$bucketName" --index-document index.html --error-document index.html

# Set public access
Write-Host ""
Write-Host "4. Setting public access..." -ForegroundColor Cyan
aws s3api put-public-access-block --bucket $bucketName --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

# Set bucket policy
Write-Host ""
Write-Host "5. Setting bucket policy..." -ForegroundColor Cyan
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$bucketName/*"
    }
  ]
}
"@
$policy | Out-File -FilePath "temp-policy.json" -Encoding UTF8
aws s3api put-bucket-policy --bucket $bucketName --policy file://temp-policy.json
Remove-Item "temp-policy.json"

# Build React app
Write-Host ""
Write-Host "6. Building React application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Upload to S3
Write-Host ""
Write-Host "7. Uploading to S3..." -ForegroundColor Cyan
aws s3 sync build/ "s3://$bucketName" --delete

# Success message
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
$websiteUrl = "http://$bucketName.s3-website-ap-southeast-2.amazonaws.com"
Write-Host "Website URL: $websiteUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Bucket name: $bucketName" -ForegroundColor Yellow
Write-Host "Region: ap-southeast-2" -ForegroundColor Yellow
Write-Host ""

# Open website
Write-Host "Opening website..." -ForegroundColor Cyan
Start-Process $websiteUrl

Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Read-Host "Press Enter to exit"