import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface CreateUserRequest {
  email: string;
  password: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    firstNameKana?: string;
    lastNameKana?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  };
  address?: {
    postalCode?: string;
    prefecture?: string;
    city?: string;
    street?: string;
    building?: string;
  };
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const request: CreateUserRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.email || !request.password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Email and password are required' }),
      };
    }

    // Check if email already exists
    const existingUserQuery = await docClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME!,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': request.email,
        },
        Limit: 1,
      })
    );

    if (existingUserQuery.Items && existingUserQuery.Items.length > 0) {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Email already exists' }),
      };
    }

    // Generate user data
    const userId = uuidv4();
    const memberNumber = 'M' + Date.now().toString().slice(-6);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(request.password, salt);
    const now = new Date().toISOString();

    const user = {
      userId,
      email: request.email,
      memberNumber,
      memberType: 'regular',
      status: 'active',
      profile: request.profile || {},
      address: request.address || {},
      driverLicense: {},
      authentication: {
        passwordHash,
        salt,
        lastLogin: null,
        loginAttempts: 0,
        lockedUntil: null,
        mfaEnabled: false,
      },
      points: {
        balance: 1000,
        totalEarned: 1000,
        totalUsed: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      statistics: {
        totalReservations: 0,
        totalSpent: 0,
        joinDate: now,
      },
      preferences: {
        language: 'ja',
        currency: 'JPY',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        newsletter: true,
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        version: 1,
      },
    };

    // Save user to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME!,
        Item: user,
      })
    );

    // Remove sensitive data before returning
    const { authentication, ...safeUser } = user;
    const { passwordHash: _, salt: __, ...safeAuth } = authentication;

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'User created successfully',
        user: {
          ...safeUser,
          authentication: safeAuth,
        },
      }),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};