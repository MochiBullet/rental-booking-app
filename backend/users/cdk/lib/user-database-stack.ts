import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class UserDatabaseStack extends cdk.Stack {
  public readonly userTable: dynamodb.Table;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for Users
    this.userTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'rental-users',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI for email lookup
    this.userTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for member number lookup
    this.userTable.addGlobalSecondaryIndex({
      indexName: 'memberNumber-index',
      partitionKey: {
        name: 'memberNumber',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Environment variables for all Lambda functions
    const environment = {
      TABLE_NAME: this.userTable.tableName,
      NODE_ENV: 'production',
      JWT_SECRET: 'rental-booking-jwt-secret-2025',
    };

    // Create User Lambda
    const createUserFunction = new lambda.Function(this, 'CreateUserFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
        const crypto = require('crypto');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          };

          if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
          }

          try {
            if (!event.body) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Request body is required' }) };
            }

            const request = JSON.parse(event.body);
            if (!request.email || !request.password) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email and password are required' }) };
            }

            // Check if email exists
            const existingUserQuery = await docClient.send(new QueryCommand({
              TableName: process.env.TABLE_NAME,
              IndexName: 'email-index',
              KeyConditionExpression: 'email = :email',
              ExpressionAttributeValues: { ':email': request.email },
              Limit: 1,
            }));

            if (existingUserQuery.Items && existingUserQuery.Items.length > 0) {
              return { statusCode: 409, headers, body: JSON.stringify({ message: 'Email already exists' }) };
            }

            const userId = crypto.randomUUID();
            const memberNumber = 'M' + Date.now().toString().slice(-6);
            const passwordHash = crypto.createHash('sha256').update(request.password + 'salt').digest('hex');
            const now = new Date().toISOString();

            const user = {
              userId, email: request.email, memberNumber, memberType: 'regular', status: 'active',
              profile: request.profile || {}, address: request.address || {},
              authentication: { passwordHash, lastLogin: null, loginAttempts: 0 },
              points: { balance: 1000, totalEarned: 1000, totalUsed: 0 },
              metadata: { createdAt: now, updatedAt: now, version: 1 }
            };

            await docClient.send(new PutCommand({ TableName: process.env.TABLE_NAME, Item: user }));

            const { authentication, ...safeUser } = user;
            return { statusCode: 201, headers, body: JSON.stringify({ message: 'User created', user: safeUser }) };
          } catch (error) {
            console.error('Error:', error);
            return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
          }
        };
      `),
      environment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Forgot Password Lambda
    const forgotPasswordFunction = new lambda.Function(this, 'ForgotPasswordFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
        const crypto = require('crypto');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          };

          if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
          }

          try {
            const { email } = JSON.parse(event.body || '{}');
            if (!email) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email is required' }) };
            }

            // Find user by email
            const result = await docClient.send(new QueryCommand({
              TableName: process.env.TABLE_NAME,
              IndexName: 'email-index',
              KeyConditionExpression: 'email = :email',
              ExpressionAttributeValues: { ':email': email },
              Limit: 1,
            }));

            const user = result.Items?.[0];
            if (!user) {
              // セキュリティ上、ユーザーが存在しない場合でも成功レスポンスを返す
              return { statusCode: 200, headers, body: JSON.stringify({ message: 'Password reset email sent if account exists' }) };
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

            // Save reset token to user record
            await docClient.send(new UpdateCommand({
              TableName: process.env.TABLE_NAME,
              Key: { userId: user.userId },
              UpdateExpression: 'SET #auth.#resetToken = :token, #auth.#resetExpiry = :expiry',
              ExpressionAttributeNames: { 
                '#auth': 'authentication', 
                '#resetToken': 'resetToken',
                '#resetExpiry': 'resetExpiry'
              },
              ExpressionAttributeValues: { 
                ':token': resetToken,
                ':expiry': resetExpiry 
              },
            }));

            // TODO: Send email with reset link
            console.log('Reset token for', email, ':', resetToken);
            console.log('Reset link: /reset-password/' + resetToken);

            return { 
              statusCode: 200, 
              headers, 
              body: JSON.stringify({ 
                message: 'Password reset email sent if account exists',
                resetToken: resetToken  // 開発用（本番では削除）
              }) 
            };
          } catch (error) {
            console.error('Error:', error);
            return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
          }
        };
      `),
      environment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Reset Password Lambda
    const resetPasswordFunction = new lambda.Function(this, 'ResetPasswordFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
        const crypto = require('crypto');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          };

          if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
          }

          try {
            const { token, newPassword } = JSON.parse(event.body || '{}');
            if (!token || !newPassword) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Token and new password are required' }) };
            }

            if (newPassword.length < 8) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Password must be at least 8 characters' }) };
            }

            // Find user by reset token
            const result = await docClient.send(new ScanCommand({
              TableName: process.env.TABLE_NAME,
              FilterExpression: '#auth.#resetToken = :token',
              ExpressionAttributeNames: { 
                '#auth': 'authentication', 
                '#resetToken': 'resetToken'
              },
              ExpressionAttributeValues: { ':token': token },
            }));

            const user = result.Items?.[0];
            if (!user || !user.authentication?.resetToken) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid or expired reset token' }) };
            }

            // Check if token is expired
            const resetExpiry = new Date(user.authentication.resetExpiry);
            if (resetExpiry < new Date()) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Reset token has expired' }) };
            }

            // Update password and remove reset token
            const newPasswordHash = crypto.createHash('sha256').update(newPassword + 'salt').digest('hex');
            
            await docClient.send(new UpdateCommand({
              TableName: process.env.TABLE_NAME,
              Key: { userId: user.userId },
              UpdateExpression: 'SET #auth.#passwordHash = :password REMOVE #auth.#resetToken, #auth.#resetExpiry',
              ExpressionAttributeNames: { 
                '#auth': 'authentication', 
                '#passwordHash': 'passwordHash',
                '#resetToken': 'resetToken',
                '#resetExpiry': 'resetExpiry'
              },
              ExpressionAttributeValues: { ':password': newPasswordHash },
            }));

            return { 
              statusCode: 200, 
              headers, 
              body: JSON.stringify({ message: 'Password reset successfully' }) 
            };
          } catch (error) {
            console.error('Error:', error);
            return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
          }
        };
      `),
      environment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Login Lambda
    const loginFunction = new lambda.Function(this, 'LoginFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
        const crypto = require('crypto');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          };

          if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
          }

          try {
            if (!event.body) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Request body is required' }) };
            }

            const { email, password } = JSON.parse(event.body);
            if (!email || !password) {
              return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email and password are required' }) };
            }

            const result = await docClient.send(new QueryCommand({
              TableName: process.env.TABLE_NAME,
              IndexName: 'email-index',
              KeyConditionExpression: 'email = :email',
              ExpressionAttributeValues: { ':email': email },
              Limit: 1,
            }));

            const user = result.Items?.[0];
            if (!user) {
              return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid email or password' }) };
            }

            const inputHash = crypto.createHash('sha256').update(password + 'salt').digest('hex');
            if (inputHash !== user.authentication?.passwordHash) {
              return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid email or password' }) };
            }

            // Update last login
            await docClient.send(new UpdateCommand({
              TableName: process.env.TABLE_NAME,
              Key: { userId: user.userId },
              UpdateExpression: 'SET #auth.#lastLogin = :lastLogin',
              ExpressionAttributeNames: { '#auth': 'authentication', '#lastLogin': 'lastLogin' },
              ExpressionAttributeValues: { ':lastLogin': new Date().toISOString() },
            }));

            const token = Buffer.from(JSON.stringify({
              userId: user.userId, 
              email: user.email, 
              memberNumber: user.memberNumber,
              exp: Date.now() + 24*60*60*1000
            })).toString('base64');

            const { authentication, ...safeUser } = user;
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Login successful', token, user: safeUser }) };
          } catch (error) {
            console.error('Error:', error);
            return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
          }
        };
      `),
      environment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Grant DynamoDB permissions to Lambda functions
    this.userTable.grantReadWriteData(createUserFunction);
    this.userTable.grantReadWriteData(forgotPasswordFunction);
    this.userTable.grantReadWriteData(resetPasswordFunction);
    this.userTable.grantReadWriteData(loginFunction);

    // API Gateway REST API
    this.api = new apigateway.RestApi(this, 'UserAPI', {
      restApiName: 'rental-users-api',
      description: 'User Management API for Rental Booking App',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Resources and Methods
    const usersResource = this.api.root.addResource('users');
    usersResource.addMethod('POST', new apigateway.LambdaIntegration(createUserFunction));

    const authResource = this.api.root.addResource('auth');
    const loginResource = authResource.addResource('login');
    loginResource.addMethod('POST', new apigateway.LambdaIntegration(loginFunction));
    
    const forgotPasswordResource = authResource.addResource('forgot-password');
    forgotPasswordResource.addMethod('POST', new apigateway.LambdaIntegration(forgotPasswordFunction));
    
    const resetPasswordResource = authResource.addResource('reset-password');
    resetPasswordResource.addMethod('POST', new apigateway.LambdaIntegration(resetPasswordFunction));

    // Outputs
    new cdk.CfnOutput(this, 'UserTableName', {
      value: this.userTable.tableName,
      description: 'DynamoDB Table Name for Users',
      exportName: 'UserTableName',
    });

    new cdk.CfnOutput(this, 'UserAPIEndpoint', {
      value: this.api.url,
      description: 'API Gateway Endpoint URL',
      exportName: 'UserAPIEndpoint',
    });

    new cdk.CfnOutput(this, 'UserAPIId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: 'UserAPIId',
    });
  }
}