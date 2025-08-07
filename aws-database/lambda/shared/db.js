// DynamoDB 共通ライブラリ - 最小コスト設定
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// DynamoDB クライアント設定（最小コスト）
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    // コスト削減のため接続プール最小化
    maxAttempts: 2,
    retryMode: 'standard'
});

const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true
    }
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'dev-rentaleasy-main';

// DynamoDB操作ラッパー（コスト効率重視）
class DBHelper {
    // 単一項目取得
    static async getItem(pk, sk) {
        try {
            const command = new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: pk, SK: sk }
            });
            
            const response = await docClient.send(command);
            return response.Item || null;
        } catch (error) {
            console.error('DynamoDB GetItem error:', error);
            throw error;
        }
    }

    // 項目作成/更新
    static async putItem(item) {
        try {
            const command = new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    ...item,
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            });
            
            await docClient.send(command);
            return item;
        } catch (error) {
            console.error('DynamoDB PutItem error:', error);
            throw error;
        }
    }

    // クエリ実行（効率的な読み取り）
    static async query(pk, options = {}) {
        try {
            const command = new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': pk
                },
                ScanIndexForward: options.ascending !== false,
                Limit: options.limit || 20, // コスト削減のため制限
                ...options
            });
            
            const response = await docClient.send(command);
            return response.Items || [];
        } catch (error) {
            console.error('DynamoDB Query error:', error);
            throw error;
        }
    }

    // GSI クエリ
    static async queryGSI(gsi1pk, options = {}) {
        try {
            const command = new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :gsi1pk',
                ExpressionAttributeValues: {
                    ':gsi1pk': gsi1pk
                },
                ScanIndexForward: options.ascending !== false,
                Limit: options.limit || 20,
                ...options
            });
            
            const response = await docClient.send(command);
            return response.Items || [];
        } catch (error) {
            console.error('DynamoDB GSI Query error:', error);
            throw error;
        }
    }

    // 項目更新
    static async updateItem(pk, sk, updates) {
        try {
            const updateExpression = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {
                ':updatedAt': new Date().toISOString()
            };

            // 動的な更新式生成
            Object.keys(updates).forEach(key => {
                const placeholder = `#${key}`;
                const valuePlaceholder = `:${key}`;
                
                updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
                expressionAttributeNames[placeholder] = key;
                expressionAttributeValues[valuePlaceholder] = updates[key];
            });

            updateExpression.push('#updatedAt = :updatedAt');
            expressionAttributeNames['#updatedAt'] = 'updatedAt';

            const command = new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: pk, SK: sk },
                UpdateExpression: `SET ${updateExpression.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            });

            const response = await docClient.send(command);
            return response.Attributes;
        } catch (error) {
            console.error('DynamoDB UpdateItem error:', error);
            throw error;
        }
    }

    // 項目削除
    static async deleteItem(pk, sk) {
        try {
            const command = new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: pk, SK: sk }
            });
            
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('DynamoDB DeleteItem error:', error);
            throw error;
        }
    }
}

// ユーザー管理ヘルパー
class UserHelper {
    static async getUser(userId) {
        return await DBHelper.getItem(`USER#${userId}`, 'PROFILE');
    }

    static async createUser(userData) {
        const userId = userData.id || Date.now().toString();
        const user = {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
            userId,
            email: userData.email,
            name: userData.name,
            phone: userData.phone || null,
            status: 'active'
        };
        
        return await DBHelper.putItem(user);
    }

    static async getUserByEmail(email) {
        // GSI でメール検索（実装要）
        // 今回は簡単のためScan使用（本番では最適化必要）
        return null; // TODO: 実装
    }
}

// お知らせ管理ヘルパー  
class AnnouncementHelper {
    static async getAnnouncements() {
        return await DBHelper.query('ANNOUNCEMENTS', {
            limit: 10,
            ascending: false
        });
    }

    static async getAnnouncement(id) {
        return await DBHelper.getItem('ANNOUNCEMENTS', `ANNOUNCEMENT#${id}`);
    }

    static async createAnnouncement(data) {
        const id = Date.now().toString();
        const announcement = {
            PK: 'ANNOUNCEMENTS',
            SK: `ANNOUNCEMENT#${id}`,
            id,
            title: data.title,
            content: data.content,
            published: data.published || false,
            publishedAt: data.published ? new Date().toISOString() : null
        };
        
        return await DBHelper.putItem(announcement);
    }
}

module.exports = {
    DBHelper,
    UserHelper,
    AnnouncementHelper
};