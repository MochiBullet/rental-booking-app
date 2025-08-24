import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface LoginRequest {
  email: string;
  password: string;
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

    const request: LoginRequest = JSON.parse(event.body);

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

    // Find user by email
    const result = await docClient.send(
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

    const user = result.Items?.[0];

    if (!user) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Invalid email or password' }),
      };
    }

    // Check if account is locked
    if (user.authentication?.lockedUntil) {
      const lockedUntil = new Date(user.authentication.lockedUntil);
      if (lockedUntil > new Date()) {
        return {
          statusCode: 423,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            message: 'Account is locked. Please try again later.',
            lockedUntil: user.authentication.lockedUntil 
          }),
        };
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.authentication?.passwordHash || ''
    );

    if (!isPasswordValid) {
      // Increment login attempts
      const loginAttempts = (user.authentication?.loginAttempts || 0) + 1;
      const updateParams: any = {
        TableName: process.env.TABLE_NAME!,
        Key: { userId: user.userId },
        UpdateExpression: 'SET #auth.#attempts = :attempts',
        ExpressionAttributeNames: {
          '#auth': 'authentication',
          '#attempts': 'loginAttempts',
        },
        ExpressionAttributeValues: {
          ':attempts': loginAttempts,
        },
      };

      // Lock account after 5 failed attempts
      if (loginAttempts >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // Lock for 30 minutes
        updateParams.UpdateExpression += ', #auth.#locked = :locked';
        updateParams.ExpressionAttributeNames['#locked'] = 'lockedUntil';
        updateParams.ExpressionAttributeValues[':locked'] = lockedUntil;
      }

      await docClient.send(new UpdateCommand(updateParams));

      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          message: 'Invalid email or password',
          remainingAttempts: Math.max(0, 5 - loginAttempts)
        }),
      };
    }

    // Reset login attempts and update last login
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME!,
        Key: { userId: user.userId },
        UpdateExpression: 'SET #auth.#lastLogin = :lastLogin, #auth.#attempts = :zero REMOVE #auth.#locked',
        ExpressionAttributeNames: {
          '#auth': 'authentication',
          '#lastLogin': 'lastLogin',
          '#attempts': 'loginAttempts',
          '#locked': 'lockedUntil',
        },
        ExpressionAttributeValues: {
          ':lastLogin': new Date().toISOString(),
          ':zero': 0,
        },
      })
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        memberNumber: user.memberNumber,
        memberType: user.memberType,
      },
      JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.userId,
        type: 'refresh',
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // Remove sensitive data
    const { authentication, ...safeUser } = user;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Login successful',
        token,
        refreshToken,
        user: safeUser,
      }),
    };
  } catch (error) {
    console.error('Error during login:', error);
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