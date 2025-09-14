// PC作業用: フロントエンド接続コード
// API URL取得後に実行するコード

// ===== AdminLogin.js 修正用コード =====

// 1. インポート部分を以下に変更:
/*
import {
  sanitizeInput,
  securityLogger,
  sessionManager
} from '../utils/security';
*/

// 2. handleSubmit 関数を以下で置き換え:
/*
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLogging(true);
  setError('');

  try {
    // 入力値サニタイゼーション
    const cleanUsername = sanitizeInput(username);
    const cleanPassword = sanitizeInput(password);

    // API エンドポイントURL（PCで設定）
    const API_URL = process.env.REACT_APP_API_URL || '取得したAPIのURL';

    // バックエンド認証リクエスト
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: cleanUsername,
        password: cleanPassword
      })
    });

    const authResult = await response.json();

    if (authResult.success) {
      try {
        setIsAdmin(true);

        // セキュアなセッション作成（JWT トークン使用）
        const sessionData = sessionManager.createFromBackend(authResult.data);

        // ログイン成功のログ記録
        securityLogger.loginAttempt(cleanUsername, true, 'backend_auth_success');

        const adminInfo = {
          username: authResult.data.user.username,
          role: authResult.data.user.role,
          loginTime: Date.now(),
          lastActivity: Date.now(),
          token: authResult.data.token,
          authMethod: 'backend_secure'
        };
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));

        navigate('/admin');
      } catch (error) {
        console.error('管理者ログイン処理エラー:', error);
        securityLogger.suspiciousActivity('ADMIN_LOGIN_ERROR', { error: error.message });
        setError('ログイン処理でエラーが発生しました');
      }
    } else {
      // ログイン失敗のログ記録
      securityLogger.loginAttempt(cleanUsername, false, authResult.error?.code || 'backend_auth_failed');
      setError(authResult.error?.message || 'ユーザー名またはパスワードが正しくありません');
    }
  } catch (error) {
    console.error('バックエンド認証エラー:', error);
    securityLogger.suspiciousActivity('BACKEND_CONNECTION_ERROR', { error: error.message });

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      setError('認証サーバーに接続できません。しばらくしてから再試行してください。');
    } else {
      setError('システムエラーが発生しました。管理者に連絡してください。');
    }
  }

  setIsLogging(false);
};
*/

// ===== security.js 修正用コード =====

// sessionManager に以下のメソッドを追加:
/*
// バックエンド認証結果からセッション作成
createFromBackend: (backendData) => {
  const sessionData = {
    token: backendData.token,
    userData: backendData.user,
    isAdmin: backendData.user.role === 'administrator',
    createdAt: Date.now(),
    lastActivity: Date.now(),
    csrfToken: generateCSRFToken(),
    authMethod: 'backend'
  };

  // セキュアストレージ
  sessionStorage.setItem('ms_base_session', JSON.stringify(sessionData));
  sessionStorage.setItem('ms_base_csrf', sessionData.csrfToken);

  return sessionData;
},

// JWT トークン検証（バックエンド用）
validateBackendToken: async (token) => {
  try {
    const API_URL = process.env.REACT_APP_API_URL;
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('バックエンドトークン検証エラー:', error);
    return { valid: false };
  }
}
*/

// ===== .env.local 作成用 =====

// PC作業で以下の内容で .env.local ファイル作成:
/*
# M's BASE Rental - PC環境用設定
REACT_APP_API_URL=取得したAPIのURL
REACT_APP_ENVIRONMENT=production
REACT_APP_AUTH_METHOD=backend

# セキュリティ設定
REACT_APP_JWT_SECRET=msbase-rental-jwt-secret-pc-2025
REACT_APP_ENABLE_BACKEND_AUTH=true

# AWS設定
REACT_APP_AWS_REGION=ap-southeast-2
*/

// ===== package.json 依存関係確認 =====

// 以下が package.json に含まれていることを確認:
/*
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "crypto-js": "^4.2.0",
    "dompurify": "^3.2.6",
    // 他の既存依存関係...
  }
}
*/

// ===== テスト用コード =====

// ブラウザ開発者ツールでテスト実行:
/*
// API接続テスト
async function testBackendAuth() {
  const API_URL = 'YOUR_API_URL_HERE'; // 実際のURLに置き換え

  try {
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'msbase7032'
      })
    });

    const result = await response.json();
    console.log('🔒 バックエンド認証テスト結果:', result);

    if (result.success) {
      console.log('✅ バックエンド認証成功！');
      console.log('🎫 JWT トークン:', result.data.token.substring(0, 50) + '...');
    } else {
      console.log('❌ バックエンド認証失敗:', result.error);
    }
  } catch (error) {
    console.log('🚨 接続エラー:', error);
  }
}

// テスト実行
testBackendAuth();
*/

console.log('📋 フロントエンド接続コード準備完了');
console.log('🔄 PC作業でAPI URL取得後に上記コードを適用してください');