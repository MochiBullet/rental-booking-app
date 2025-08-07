// お知らせ管理 Lambda Function
const { AnnouncementHelper } = require('../shared/db');

// CORS ヘッダー
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// レスポンス生成ヘルパー
const response = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
});

// エラーレスポンス
const errorResponse = (statusCode, message, error = null) => {
    console.error(`Error ${statusCode}:`, message, error);
    return response(statusCode, {
        error: message,
        timestamp: new Date().toISOString()
    });
};

// メインハンドラー
exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, pathParameters, body } = event;
        
        // CORS プリフライトリクエスト
        if (httpMethod === 'OPTIONS') {
            return response(200, { message: 'CORS preflight' });
        }
        
        switch (httpMethod) {
            case 'GET':
                return await handleGet(pathParameters);
            case 'POST':
                return await handlePost(JSON.parse(body || '{}'));
            case 'PUT':
                return await handlePut(pathParameters, JSON.parse(body || '{}'));
            case 'DELETE':
                return await handleDelete(pathParameters);
            default:
                return errorResponse(405, 'Method Not Allowed');
        }
        
    } catch (error) {
        return errorResponse(500, 'Internal Server Error', error);
    }
};

// GET - お知らせ一覧/詳細取得
async function handleGet(pathParameters) {
    try {
        // 詳細取得
        if (pathParameters?.id) {
            const announcement = await AnnouncementHelper.getAnnouncement(pathParameters.id);
            
            if (!announcement) {
                return errorResponse(404, 'Announcement not found');
            }
            
            return response(200, announcement);
        }
        
        // 一覧取得
        const announcements = await AnnouncementHelper.getAnnouncements();
        
        // 公開済みのみフィルタ（管理者以外）
        const publicAnnouncements = announcements
            .filter(a => a.published)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
        return response(200, {
            announcements: publicAnnouncements,
            count: publicAnnouncements.length
        });
        
    } catch (error) {
        return errorResponse(500, 'Failed to get announcements', error);
    }
}

// POST - お知らせ作成
async function handlePost(data) {
    try {
        // 入力検証
        if (!data.title?.trim()) {
            return errorResponse(400, 'Title is required');
        }
        
        if (!data.content?.trim()) {
            return errorResponse(400, 'Content is required');
        }
        
        const announcement = await AnnouncementHelper.createAnnouncement({
            title: data.title.trim(),
            content: data.content.trim(),
            published: data.published || false
        });
        
        return response(201, {
            message: 'Announcement created successfully',
            announcement
        });
        
    } catch (error) {
        return errorResponse(500, 'Failed to create announcement', error);
    }
}

// PUT - お知らせ更新（今回は簡単のため省略）
async function handlePut(pathParameters, data) {
    return errorResponse(501, 'Not Implemented');
}

// DELETE - お知らせ削除（今回は簡単のため省略）
async function handleDelete(pathParameters) {
    return errorResponse(501, 'Not Implemented');
}