#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RentalBookingWebStack } from './rental-booking-web-stack';
import { RentalBookingCICDStack } from './rental-booking-cicd-stack';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'production';
const accountId = process.env.CDK_DEFAULT_ACCOUNT || app.node.tryGetContext('accountId');
const region = process.env.CDK_DEFAULT_REGION || app.node.tryGetContext('region') || 'ap-southeast-2';

const env = {
  account: accountId,
  region: region
};

// Web hosting infrastructure stack (S3 + CloudFront)
const webStack = new RentalBookingWebStack(app, `RentalBookingWebStack-${environment}`, {
  env,
  environment,
  description: 'Rental Booking App - Web hosting infrastructure (S3 + CloudFront)'
});

// CI/CD infrastructure stack (IAM roles for GitHub Actions)
const cicdStack = new RentalBookingCICDStack(app, `RentalBookingCICDStack-${environment}`, {
  env,
  environment,
  bucketName: webStack.bucketName,
  distributionId: webStack.distributionId,
  description: 'Rental Booking App - CI/CD infrastructure (IAM roles for GitHub Actions)'
});

// Add dependency
cicdStack.addDependency(webStack);

// Output important values
new cdk.CfnOutput(webStack, 'WebsiteURL', {
  value: webStack.websiteUrl,
  description: 'CloudFront Distribution URL'
});

new cdk.CfnOutput(webStack, 'S3BucketName', {
  value: webStack.bucketName,
  description: 'S3 Bucket Name for deployment'
});

new cdk.CfnOutput(cicdStack, 'GitHubActionsRoleArn', {
  value: cicdStack.githubActionsRoleArn,
  description: 'IAM Role ARN for GitHub Actions'
});