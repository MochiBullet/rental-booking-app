#!/bin/bash

# CDK Deployment Script for Rental Booking App
# This script deploys the AWS infrastructure using CDK

set -e

echo "======================================"
echo "Rental Booking App - CDK Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please run 'aws configure' or set AWS environment variables"
    exit 1
fi

# Get AWS account information
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_REGION:-ap-northeast-1}
ENVIRONMENT=${1:-production}

echo -e "${GREEN}AWS Account: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}Region: ${REGION}${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Navigate to CDK directory
cd "$(dirname "$0")"

# Install CDK dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing CDK dependencies...${NC}"
    npm install
fi

# Bootstrap CDK if needed
echo -e "${YELLOW}Bootstrapping CDK (if needed)...${NC}"
npx cdk bootstrap aws://${ACCOUNT_ID}/${REGION} || true

# Synthesize the CDK app
echo -e "${YELLOW}Synthesizing CDK stacks...${NC}"
npx cdk synth --context environment=${ENVIRONMENT}

# Deploy the stacks
echo -e "${YELLOW}Deploying CDK stacks...${NC}"
npx cdk deploy --all \
    --context environment=${ENVIRONMENT} \
    --require-approval never \
    --outputs-file outputs.json

# Extract outputs
if [ -f "outputs.json" ]; then
    echo ""
    echo -e "${GREEN}======================================"
    echo "Deployment Complete!"
    echo "======================================${NC}"
    
    # Parse outputs
    WEBSITE_URL=$(cat outputs.json | grep -o '"WebsiteURL": "[^"]*' | sed 's/"WebsiteURL": "//')
    S3_BUCKET=$(cat outputs.json | grep -o '"S3BucketName": "[^"]*' | sed 's/"S3BucketName": "//')
    ROLE_ARN=$(cat outputs.json | grep -o '"GitHubActionsRoleArn": "[^"]*' | sed 's/"GitHubActionsRoleArn": "//')
    
    echo ""
    echo -e "${GREEN}Website URL:${NC} ${WEBSITE_URL}"
    echo -e "${GREEN}S3 Bucket:${NC} ${S3_BUCKET}"
    echo -e "${GREEN}GitHub Actions Role ARN:${NC} ${ROLE_ARN}"
    
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Add the following secrets to your GitHub repository:"
    echo "   - AWS_REGION: ${REGION}"
    echo "   - S3_BUCKET_NAME: ${S3_BUCKET}"
    echo "   - AWS_ROLE_ARN: ${ROLE_ARN}"
    echo "   - CLOUDFRONT_DISTRIBUTION_ID: (check AWS Console)"
    echo ""
    echo "2. Add the following variable to your GitHub repository:"
    echo "   - USE_OIDC: true"
    echo ""
    echo "3. Push to main branch to trigger automatic deployment"
else
    echo -e "${RED}Warning: Could not read outputs file${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"