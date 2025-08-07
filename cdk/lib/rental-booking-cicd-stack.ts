import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface RentalBookingCICDStackProps extends cdk.StackProps {
  environment: string;
  bucketName: string;
  distributionId: string;
}

export class RentalBookingCICDStack extends cdk.Stack {
  public readonly githubActionsRoleArn: string;

  constructor(scope: Construct, id: string, props: RentalBookingCICDStackProps) {
    super(scope, id, props);

    // GitHub repository information
    const githubOrg = this.node.tryGetContext('githubOrg') || 'MochiBullet';
    const githubRepo = this.node.tryGetContext('githubRepo') || 'rental-booking-app';
    
    // Create OIDC provider for GitHub Actions
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1']
    });

    // Create IAM role for GitHub Actions
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: `RentalBookingApp-GitHubActions-${props.environment}`,
      assumedBy: new iam.FederatedPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${githubRepo}:*`
          }
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'IAM role for GitHub Actions to deploy Rental Booking App',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // S3 permissions for deployment
    githubActionsRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:ListBucket',
        's3:GetBucketLocation',
        's3:GetBucketVersioning'
      ],
      resources: [`arn:aws:s3:::${props.bucketName}`]
    }));

    githubActionsRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:PutObjectAcl',
        's3:GetObjectAcl',
        's3:GetObjectVersion'
      ],
      resources: [`arn:aws:s3:::${props.bucketName}/*`]
    }));

    // CloudFront permissions for cache invalidation
    githubActionsRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudfront:CreateInvalidation',
        'cloudfront:GetInvalidation',
        'cloudfront:ListInvalidations'
      ],
      resources: [`arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${props.distributionId}`]
    }));

    // Store role ARN for output
    this.githubActionsRoleArn = githubActionsRole.roleArn;

    // Tags
    cdk.Tags.of(this).add('Project', 'RentalBookingApp');
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    cdk.Tags.of(this).add('Purpose', 'CI/CD');
  }
}