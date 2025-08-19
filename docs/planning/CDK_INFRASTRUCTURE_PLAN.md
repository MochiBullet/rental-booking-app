# AWS CDK インフラストラクチャ計画

## アーキテクチャ概要

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  CloudFront │────▶│   S3 Bucket  │     │  DynamoDB   │
│     (CDN)   │     │  (Frontend)  │     │  (Database) │
└─────────────┘     └──────────────┘     └─────────────┘
        │                                         ▲
        │                                         │
        ▼                                         │
┌─────────────┐     ┌──────────────┐             │
│ API Gateway │────▶│    Lambda    │─────────────┘
│   (REST)    │     │    (Hono)    │
└─────────────┘     └──────────────┘
```

## CDKスタック構成

### 1. ベーススタック（共通リソース）
```typescript
// infrastructure/cdk/lib/base-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class BaseStack extends cdk.Stack {
  public readonly vehiclesTable: dynamodb.Table;
  public readonly reservationsTable: dynamodb.Table;
  public readonly membersTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDBテーブル - Vehicles
    this.vehiclesTable = new dynamodb.Table(this, 'VehiclesTable', {
      tableName: `rental-vehicles-${props?.env?.account}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // 本番環境では保持
    });

    // DynamoDBテーブル - Reservations
    this.reservationsTable = new dynamodb.Table(this, 'ReservationsTable', {
      tableName: `rental-reservations-${props?.env?.account}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI: 車両IDで予約を検索
    this.reservationsTable.addGlobalSecondaryIndex({
      indexName: 'vehicleId-index',
      partitionKey: { name: 'vehicleId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DynamoDBテーブル - Members
    this.membersTable = new dynamodb.Table(this, 'MembersTable', {
      tableName: `rental-members-${props?.env?.account}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI: emailでメンバーを検索
    this.membersTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // テーブル名をSSMパラメータストアに保存
    new ssm.StringParameter(this, 'VehiclesTableParam', {
      parameterName: '/rental/tables/vehicles',
      stringValue: this.vehiclesTable.tableName,
    });

    new ssm.StringParameter(this, 'ReservationsTableParam', {
      parameterName: '/rental/tables/reservations',
      stringValue: this.reservationsTable.tableName,
    });
  }
}
```

### 2. APIスタック（Lambda + API Gateway）
```typescript
// infrastructure/cdk/lib/api-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface ApiStackProps extends cdk.StackProps {
  vehiclesTable: dynamodb.Table;
  reservationsTable: dynamodb.Table;
  membersTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Lambda関数
    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      entry: '../../apps/api/src/lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
        VEHICLES_TABLE_NAME: props.vehiclesTable.tableName,
        RESERVATIONS_TABLE_NAME: props.reservationsTable.tableName,
        MEMBERS_TABLE_NAME: props.membersTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
        externalModules: ['@aws-sdk/*'], // AWS SDKは除外
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // DynamoDBへのアクセス権限
    props.vehiclesTable.grantReadWriteData(apiFunction);
    props.reservationsTable.grantReadWriteData(apiFunction);
    props.membersTable.grantReadWriteData(apiFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'RentalApi', {
      restApiName: 'RentalEasy API',
      description: 'API for RentalEasy vehicle booking system',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'], // 本番では制限する
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda統合
    const integration = new apigateway.LambdaIntegration(apiFunction);
    
    // プロキシ統合
    this.api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });

    this.apiUrl = this.api.url;

    // 出力
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.apiUrl,
      description: 'API Gateway URL',
    });
  }
}
```

### 3. フロントエンドスタック（S3 + CloudFront）
```typescript
// infrastructure/cdk/lib/frontend-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

interface FrontendStackProps extends cdk.StackProps {
  apiUrl: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3バケット
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `rental-frontend-${props.env?.account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPAのため
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront OAI
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    websiteBucket.grantRead(oai);

    // CloudFrontディストリビューション
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // デプロイ
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../../apps/web/build')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
      environment: {
        REACT_APP_API_URL: props.apiUrl,
      },
    });

    // 出力
    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL',
    });
  }
}
```

### 4. メインアプリケーション
```typescript
// infrastructure/cdk/bin/app.ts
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BaseStack } from '../lib/base-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// ベーススタック（DynamoDB）
const baseStack = new BaseStack(app, 'RentalBaseStack', { env });

// APIスタック
const apiStack = new ApiStack(app, 'RentalApiStack', {
  env,
  vehiclesTable: baseStack.vehiclesTable,
  reservationsTable: baseStack.reservationsTable,
  membersTable: baseStack.membersTable,
});
apiStack.addDependency(baseStack);

// フロントエンドスタック
const frontendStack = new FrontendStack(app, 'RentalFrontendStack', {
  env,
  apiUrl: apiStack.apiUrl,
});
frontendStack.addDependency(apiStack);

app.synth();
```

## デプロイコマンド

### 開発環境
```bash
# 初回のみ
cd infrastructure/cdk
pnpm install
pnpm cdk bootstrap

# デプロイ
pnpm cdk deploy --all
```

### CI/CD（GitHub Actions）
```yaml
# .github/workflows/deploy-infra.yml
name: Deploy Infrastructure

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'
      - 'apps/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Deploy CDK
        run: |
          cd infrastructure/cdk
          pnpm cdk deploy --all --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ap-northeast-1
```

## コスト最適化

### 開発環境
- DynamoDB: オンデマンド課金
- Lambda: 無料枠内で収まる想定
- S3 + CloudFront: 最小限のトラフィック

### 本番環境での考慮事項
- DynamoDB: 使用量に応じてプロビジョンドキャパシティ検討
- Lambda: 予約済みキャパシティの検討
- CloudFront: カスタムドメイン設定
- WAF: セキュリティ強化（後回しOK）

## 環境変数管理

### ローカル開発
```env
# apps/api/.env.local
DATABASE_URL=http://localhost:4566
VEHICLES_TABLE_NAME=vehicles
RESERVATIONS_TABLE_NAME=reservations
MEMBERS_TABLE_NAME=members
```

### 本番環境
- AWS Systems Manager Parameter Store使用
- 機密情報はSecrets Manager
- Lambda環境変数で注入

---

**注意**: MVP段階ではセキュリティは最小限でOK。まず動くインフラを構築。