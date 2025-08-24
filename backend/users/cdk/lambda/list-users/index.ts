import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse query parameters
    const limit = event.queryStringParameters?.limit 
      ? parseInt(event.queryStringParameters.limit) 
      : 50;
    const lastEvaluatedKey = event.queryStringParameters?.nextToken
      ? JSON.parse(Buffer.from(event.queryStringParameters.nextToken, 'base64').toString())
      : undefined;
    const memberType = event.queryStringParameters?.memberType;
    const status = event.queryStringParameters?.status;

    // Build filter expression if needed
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (memberType) {
      filterExpressions.push('#memberType = :memberType');
      expressionAttributeNames['#memberType'] = 'memberType';
      expressionAttributeValues[':memberType'] = memberType;
    }

    if (status) {
      filterExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    // Scan parameters
    const scanParams: any = {
      TableName: process.env.TABLE_NAME!,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(' AND ');
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    // Scan users
    const result = await docClient.send(new ScanCommand(scanParams));

    // Remove sensitive data from all users
    const users = result.Items?.map(user => {
      if (user.authentication) {
        delete user.authentication.passwordHash;
        delete user.authentication.salt;
      }
      return user;
    }) || [];

    // Create response
    const response: any = {
      users,
      count: users.length,
    };

    // Add pagination token if there are more results
    if (result.LastEvaluatedKey) {
      response.nextToken = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey)
      ).toString('base64');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error listing users:', error);
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