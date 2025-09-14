// M's BASE Rental - セキュアな管理者認証 Lambda関数
// 初心者でも簡単デプロイ対応版

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 環境変数から認証情報取得（AWSコンソールで設定）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$PpFPRCh4tpglSUYBSymtROuFjGCKNpmK02yMM7zlqMeLsqyT9MzVG'; // msbase7032
const JWT_SECRET = process.env.JWT_SECRET || 'msbase-rental-super-secret-key-change-in-production';

// CORS設定（フロントエンドからのアクセス許可）
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 本番では https://ms-base-rental.com に限定
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// メイン認証処理
exports.handler = async (event) => {
  console.log('認証リクエスト受信:', JSON.stringify(event, null, 2));

  // プリフライトリクエスト対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // リクエストボディ解析
    const requestBody = JSON.parse(event.body || '{}');
    const { username, password } = requestBody;

    // 入力値検証
    if (!username || !password) {
      return createErrorResponse(400, 'MISSING_CREDENTIALS', 'ユーザー名とパスワードを入力してください');
    }

    // ユーザー名検証
    if (username.trim() !== ADMIN_USERNAME) {
      // セキュリティログ記録
      console.warn('不正ログイン試行 - 無効なユーザー名:', username);
      return createErrorResponse(401, 'INVALID_CREDENTIALS', 'ユーザー名またはパスワードが正しくありません');
    }

    // パスワード検証（bcrypt）
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValidPassword) {
      // セキュリティログ記録
      console.warn('不正ログイン試行 - 無効なパスワード:', username);
      return createErrorResponse(401, 'INVALID_CREDENTIALS', 'ユーザー名またはパスワードが正しくありません');
    }

    // 認証成功 - JWTトークン生成
    const tokenPayload = {
      username: ADMIN_USERNAME,
      role: 'administrator',
      permissions: ['read', 'write', 'delete', 'admin'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7日間有効
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    // ログイン成功ログ
    console.log('管理者ログイン成功:', username, new Date().toISOString());

    // レスポンス返却
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: '認証に成功しました',
        data: {
          token,
          user: {
            username: ADMIN_USERNAME,
            role: 'administrator',
            loginTime: Date.now()
          },
          expiresIn: '7 days'
        }
      })
    };

  } catch (error) {
    console.error('認証処理エラー:', error);
    return createErrorResponse(500, 'INTERNAL_ERROR', 'サーバーエラーが発生しました');
  }
};

// JWT検証関数（他のAPI用）
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('トークン検証エラー:', error);
    return null;
  }
};

// エラーレスポンス生成
function createErrorResponse(statusCode, errorCode, message) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message: message
      },
      timestamp: new Date().toISOString()
    })
  };
}

// パッケージ依存関係情報
/*
package.json:
{
  "name": "msbase-rental-auth",
  "version": "1.0.0",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
*/