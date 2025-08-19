import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケット作成（新しいバケット名で確実に作成）
    const websiteBucket = new s3.Bucket(this, 'RentalBookingWebsiteBucket', {
      bucketName: `rental-booking-app-${Date.now()}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
        allowedOrigins: ['*'],
        maxAge: 3000,
      }],
    });

    // CloudFrontディストリビューション作成
    const distribution = new cloudfront.Distribution(this, 'RentalBookingDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: new cloudfront.CachePolicy(this, 'CustomCachePolicy', {
          defaultTtl: cdk.Duration.minutes(0),
          minTtl: cdk.Duration.minutes(0),
          maxTtl: cdk.Duration.minutes(1),
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
        }),
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(0),
        },
      ],
    });

    // S3デプロイ（ビルドファイルをS3にアップロード）
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../build')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // GitHub Actions用のIAMユーザー作成
    const githubActionsUser = new iam.User(this, 'GitHubActionsUser', {
      userName: 'github-actions-rental-app',
    });

    // S3とCloudFrontへのフルアクセス権限
    websiteBucket.grantReadWrite(githubActionsUser);
    
    // アクセスキー作成
    const accessKey = new iam.AccessKey(this, 'GitHubActionsAccessKey', {
      user: githubActionsUser,
    });

    // 出力
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'AccessKeyId', {
      value: accessKey.accessKeyId,
      description: 'GitHub Actions Access Key ID',
    });

    new cdk.CfnOutput(this, 'SecretAccessKey', {
      value: accessKey.secretAccessKey.unsafeUnwrap(),
      description: 'GitHub Actions Secret Access Key (Save this securely!)',
    });
  }
}