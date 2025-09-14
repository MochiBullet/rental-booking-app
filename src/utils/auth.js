// 認証・認可管理

import { hashPassword, verifyPassword, generateSessionToken, generateCSRFToken } from './security';

// セッション管理
class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30分
  }

  createSession(userId, role) {
    const sessionId = generateSessionToken();
    const csrfToken = generateCSRFToken();
    const expiresAt = Date.now() + this.sessionTimeout;
    
    const session = {
      sessionId,
      userId,
      role,
      csrfToken,
      createdAt: Date.now(),
      expiresAt,
      lastActivity: Date.now()
    };
    
    this.sessions.set(sessionId, session);
    
    // セッションをセキュアにsessionStorageに保存（暂定的）
    // 本番環境ではHttpOnly Cookieを使用すべき
    const secureSession = {
      sessionId,
      csrfToken,
      expiresAt
    };
    
    try {
      sessionStorage.setItem('secure_session', JSON.stringify(secureSession));
    } catch (e) {
      console.error('Session storage failed:', e);
    }
    
    return { sessionId, csrfToken };
  }

  validateSession(sessionId, csrfToken = null) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }
    
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { valid: false, reason: 'Session expired' };
    }
    
    if (csrfToken && session.csrfToken !== csrfToken) {
      return { valid: false, reason: 'CSRF token mismatch' };
    }
    
    // アクティビティを更新
    session.lastActivity = Date.now();
    session.expiresAt = Date.now() + this.sessionTimeout;
    
    return { valid: true, session };
  }

  destroySession(sessionId) {
    this.sessions.delete(sessionId);
    try {
      sessionStorage.removeItem('secure_session');
    } catch (e) {
      console.error('Failed to clear session storage:', e);
    }
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// セッションクリーンアップを定期実行
setInterval(() => {
  sessionManager.cleanupExpiredSessions();
}, 5 * 60 * 1000); // 5分ごと

// 認証ヘルパー関数
export const authenticateUser = async (email, password, members) => {
  const member = members.find(m => m.email === email);
  
  if (!member) {
    return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
  }
  
  // パスワードがハッシュ化されている場合
  if (member.hashedPassword) {
    const isValid = await verifyPassword(password, member.hashedPassword);
    if (!isValid) {
      return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
    }
  } else {
    // レガシー: 平文パスワード（移行期間中のみ）
    if (member.password !== password) {
      return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
    }
  }
  
  // セッション作成
  const { sessionId, csrfToken } = sessionManager.createSession(member.id, 'member');
  
  return {
    success: true,
    member: {
      ...member,
      password: undefined, // パスワードを除外
      hashedPassword: undefined
    },
    sessionId,
    csrfToken
  };
};

// 管理者認証（環境変数を使用しない安全な方法）
export const authenticateAdmin = async (username, password) => {
  // 本番環境ではデータベースから管理者情報を取得
  // ここではハードコードされたハッシュを使用（デモ用）
  const adminHash = '$2a$12$eImiTXuWVxfM37uY4JANjOeLHYAMCsFx4nKpDWKBP0wcVlnXpMSLy'; // デフォルト: admin123
  
  if (username !== 'admin') {
    return { success: false, message: '認証に失敗しました' };
  }
  
  const isValid = await verifyPassword(password, adminHash);
  if (!isValid) {
    return { success: false, message: '認証に失敗しました' };
  }
  
  const { sessionId, csrfToken } = sessionManager.createSession('admin', 'admin');
  
  return {
    success: true,
    sessionId,
    csrfToken
  };
};

// アクセス制御
export const checkPermission = (sessionId, requiredRole) => {
  const validation = sessionManager.validateSession(sessionId);
  
  if (!validation.valid) {
    return { allowed: false, reason: validation.reason };
  }
  
  const { session } = validation;
  
  if (requiredRole === 'admin' && session.role !== 'admin') {
    return { allowed: false, reason: 'Admin access required' };
  }
  
  if (requiredRole === 'member' && !['member', 'admin'].includes(session.role)) {
    return { allowed: false, reason: 'Member access required' };
  }
  
  return { allowed: true, session };
};

// ログアウト
export const logout = (sessionId) => {
  sessionManager.destroySession(sessionId);
};