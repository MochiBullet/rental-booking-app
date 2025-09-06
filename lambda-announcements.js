const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-southeast-2" });
const dynamoDb = DynamoDBDocumentClient.from(client);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters;
    
    try {
        switch (httpMethod) {
            case 'OPTIONS':
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'CORS preflight response' })
                };
                
            case 'GET':
                return await handleGet(event);
                
            case 'POST':
                return await handlePost(event);
                
            case 'PUT':
                return await handlePut(event);
                
            case 'DELETE':
                return await handleDelete(event);
                
            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};

async function handleGet(event) {
    const queryParams = event.queryStringParameters || {};
    const published = queryParams.published;
    
    try {
        const params = {
            TableName: 'announcements'
        };
        
        const result = await dynamoDb.send(new ScanCommand(params));
        let announcements = result.Items || [];
        
        // 公開済みのみフィルター
        if (published === 'true') {
            announcements = announcements.filter(item => item.published === true);
        }
        
        // 日付順ソート（新しい順）
        announcements.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ announcements })
        };
    } catch (error) {
        console.error('Get error:', error);
        throw error;
    }
}

async function handlePost(event) {
    const body = JSON.parse(event.body);
    
    const announcement = {
        id: Date.now().toString(),
        title: body.title,
        content: body.content || '',
        date: body.date || new Date().toISOString().split('T')[0],
        published: body.published !== undefined ? body.published : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        const params = {
            TableName: 'announcements',
            Item: announcement
        };
        
        await dynamoDb.send(new PutCommand(params));
        
        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({ announcement })
        };
    } catch (error) {
        console.error('Post error:', error);
        throw error;
    }
}

async function handlePut(event) {
    const id = event.pathParameters?.id;
    const body = JSON.parse(event.body);
    
    if (!id) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'ID is required' })
        };
    }
    
    try {
        // 既存のアイテム取得
        const getParams = {
            TableName: 'announcements',
            Key: { id }
        };
        
        const existingResult = await dynamoDb.send(new GetCommand(getParams));
        
        if (!existingResult.Item) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Announcement not found' })
            };
        }
        
        // 更新データ準備
        const updatedAnnouncement = {
            ...existingResult.Item,
            ...body,
            id, // IDは変更不可
            updatedAt: new Date().toISOString()
        };
        
        const putParams = {
            TableName: 'announcements',
            Item: updatedAnnouncement
        };
        
        await dynamoDb.send(new PutCommand(putParams));
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ announcement: updatedAnnouncement })
        };
    } catch (error) {
        console.error('Put error:', error);
        throw error;
    }
}

async function handleDelete(event) {
    const id = event.pathParameters?.id;
    
    if (!id) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'ID is required' })
        };
    }
    
    try {
        const params = {
            TableName: 'announcements',
            Key: { id }
        };
        
        await dynamoDb.send(new DeleteCommand(params));
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Announcement deleted successfully' })
        };
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}