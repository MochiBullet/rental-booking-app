// AWS統合セキュリティユーティリティ関数
// M's BASE Rental - セキュリティ強化モジュール（React互換版）
import bcrypt from 'bcryptjs';
import DOMPurify from 'dompurify';
import CryptoJS from 'crypto-js';

// セキュリティ設定（本番環境対応）
const SECURITY_CONFIG = {
  JWT_SECRET: process.env.REACT_APP_JWT_SECRET || 'msbase-rental-secret-2025',
  BCRYPT_ROUNDS: 12,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24時間
  ADMIN_SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 管理者は7日間
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    TIME_WINDOW: 15 * 60 * 1000, // 15分
  },
  ENCRYPTION_KEY: 'ms-base-rental-encryption-key-2025',

  // 本番用管理者認証情報（ハッシュ化対応）
  ADMIN_CREDENTIALS: {
    username: process.env.REACT_APP_ADMIN_USERNAME || 'admin',
    // bcryptハッシュ: msbase7032 のハッシュ値（実際に生成されたもの）
    passwordHash: process.env.REACT_APP_ADMIN_PASSWORD_HASH || '$2b$12$PpFPRCh4tpglSUYBSymtROuFjGCKNpmK02yMM7zlqMeLsqyT9MzVG',
    // フォールバック（開発環境のみ）
    password: process.env.NODE_ENV === 'development' ? 'msbase7032' : null
  }
};

// パスワードハッシュ化
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// パスワード検証
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// データ暗号化
export const encryptData = (data, secretKey) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// データ復号化
export const decryptData = (encryptedData, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// XSS攻撃対策 - HTMLサニタイゼーション（DOMPurify使用）
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// 従来のHTMLエスケープも保持（軽量版）
export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// 入力検証
export const validateInput = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  password: (password) => {
    // 最小8文字、大文字・小文字・数字・特殊文字を含む
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  },
  
  phone: (phone) => {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.replace(/-/g, ''));
  },
  
  name: (name) => {
    return name.length >= 2 && name.length <= 50 && !/[<>"']/g.test(name);
  }
};

// セッショントークン生成
export const generateSessionToken = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// CSRF トークン生成
export const generateCSRFToken = () => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

// セキュアなランダム文字列生成
export const generateSecureRandom = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// レート制限用のトークンバケット
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // 古いリクエストを削除
    const validRequests = userRequests.filter(time => now - time < this.timeWindow);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// React互換トークン生成・検証（CryptoJS使用）
export const generateToken = (userData) => {
  try {
    const payload = {
      ...userData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT) / 1000)
    };

    // CryptoJS使用の簡易JWT実装
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = CryptoJS.HmacSHA256(
      `${encodedHeader}.${encodedPayload}`,
      SECURITY_CONFIG.JWT_SECRET
    ).toString();

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  } catch (error) {
    console.error('トークン生成エラー:', error);
    throw new Error('認証トークン生成に失敗しました');
  }
};

export const verifyToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // 署名検証
    const expectedSignature = CryptoJS.HmacSHA256(
      `${encodedHeader}.${encodedPayload}`,
      SECURITY_CONFIG.JWT_SECRET
    ).toString();

    if (signature !== expectedSignature) return null;

    // ペイロード取得
    const payload = JSON.parse(atob(encodedPayload));

    // 有効期限チェック
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch (error) {
    console.error('トークン検証エラー:', error);
    return null;
  }
};

// SQLインジェクション対策（DynamoDB用）
export const sanitizeDynamoQuery = (input) => {
  if (typeof input !== 'string') return input;

  // DynamoDBに危険な文字をエスケープ
  return input
    .replace(/['"`;\\]/g, '')
    .replace(/(\$|#)/g, '_')
    .trim();
};

// 強化されたセッション管理
export const sessionManager = {
  // セッション作成
  create: (userData, isAdmin = false) => {
    const timeout = isAdmin ? SECURITY_CONFIG.ADMIN_SESSION_TIMEOUT : SECURITY_CONFIG.SESSION_TIMEOUT;
    const token = generateToken({ ...userData, isAdmin, timeout });
    const sessionData = {
      token,
      userData,
      isAdmin,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      csrfToken: generateCSRFToken()
    };

    // セキュアストレージ
    sessionStorage.setItem('ms_base_session', JSON.stringify(sessionData));
    sessionStorage.setItem('ms_base_csrf', sessionData.csrfToken);

    // 管理者の場合、長期保存も行う
    if (isAdmin) {
      localStorage.setItem('adminUser', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
    }

    return sessionData;
  },

  // セッション取得・検証
  get: () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('ms_base_session') || 'null');
      if (!sessionData) return null;

      // セッション有効性チェック
      const now = Date.now();
      const timeout = sessionData.isAdmin ?
        SECURITY_CONFIG.ADMIN_SESSION_TIMEOUT :
        SECURITY_CONFIG.SESSION_TIMEOUT;

      if (now - sessionData.lastActivity > timeout) {
        sessionManager.destroy();
        return null;
      }

      // トークン検証
      const tokenData = verifyToken(sessionData.token);
      if (!tokenData) {
        sessionManager.destroy();
        return null;
      }

      // アクティビティ更新
      sessionData.lastActivity = now;
      sessionStorage.setItem('ms_base_session', JSON.stringify(sessionData));

      return sessionData;
    } catch (error) {
      console.error('セッション取得エラー:', error);
      sessionManager.destroy();
      return null;
    }
  },

  // セッション破棄
  destroy: () => {
    sessionStorage.removeItem('ms_base_session');
    sessionStorage.removeItem('ms_base_csrf');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
  },

  // CSRF検証
  verifyCsrf: (token) => {
    const storedToken = sessionStorage.getItem('ms_base_csrf');
    return token === storedToken;
  }
};

// 強化されたレート制限
export const checkRateLimit = (identifier, action = 'login') => {
  const key = `rateLimit_${action}_${identifier}`;
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(key) || '[]');

  // 時間窓外の試行を削除
  const validAttempts = attempts.filter(
    timestamp => now - timestamp < SECURITY_CONFIG.RATE_LIMIT.TIME_WINDOW
  );

  // 制限チェック
  if (validAttempts.length >= SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS) {
    const oldestAttempt = Math.min(...validAttempts);
    const remainingTime = SECURITY_CONFIG.RATE_LIMIT.TIME_WINDOW - (now - oldestAttempt);
    return {
      allowed: false,
      remainingTime: Math.ceil(remainingTime / 1000 / 60) // 分単位
    };
  }

  // 新しい試行を記録
  validAttempts.push(now);
  localStorage.setItem(key, JSON.stringify(validAttempts));

  return { allowed: true };
};

// セキュリティヘッダー設定（AWS環境用に強化）
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://moto.webike.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://*.execute-api.ap-southeast-2.amazonaws.com https://*.amazonaws.com;
    frame-src 'self' https://moto.webike.net;
    object-src 'none';
    base-uri 'self';
  `.replace(/\s+/g, ' ').trim(),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// セキュリティログ・監査機能
export const securityLogger = {
  logEvent: (event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: sanitizeInput(JSON.stringify(details)),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', logEntry);
    }

    // TODO: AWS CloudWatch Logs統合
  },

  loginAttempt: (username, success, ip = 'unknown') => {
    securityLogger.logEvent('LOGIN_ATTEMPT', {
      username: sanitizeInput(username),
      success,
      ip,
      timestamp: Date.now()
    });
  },

  suspiciousActivity: (activity, details = {}) => {
    securityLogger.logEvent('SUSPICIOUS_ACTIVITY', {
      activity,
      details,
      requiresAttention: true
    });
  }
};

// 本番環境用管理者認証関数（ハッシュ化対応）
// バックエンドAPI認証（セキュアモード）
export const authenticateWithBackend = async (username, password) => {
  try {
    const API_URL = process.env.REACT_APP_API_URL;
    if (!API_URL) {
      console.error('API URL が設定されていません');
      return { success: false, error: 'API_URL_MISSING' };
    }

    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: sanitizeInput(username),
        password: sanitizeInput(password)
      })
    });

    const result = await response.json();

    if (result.success && result.data && result.data.token) {
      // JWT トークンをセッションに保存
      sessionStorage.setItem('authToken', result.data.token);
      sessionStorage.setItem('authUser', JSON.stringify(result.data.user));

      return {
        success: true,
        user: result.data.user,
        token: result.data.token
      };
    } else {
      return {
        success: false,
        error: result.message || 'Authentication failed'
      };
    }
  } catch (error) {
    console.error('バックエンド認証エラー:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR'
    };
  }
};

export const validateAdminCredentials = async (username, password) => {
  // バックエンド認証を優先
  const backendAuth = await authenticateWithBackend(username, password);
  if (backendAuth.success) {
    return {
      valid: true,
      user: backendAuth.user,
      token: backendAuth.token,
      mode: 'backend'
    };
  }

  // フォールバック: フロントエンド認証
  try {
    const { username: adminUser, passwordHash, password: devPassword } = SECURITY_CONFIG.ADMIN_CREDENTIALS;

    // 入力値の基本チェック
    if (!username || !password) {
      return { valid: false, reason: 'MISSING_CREDENTIALS' };
    }

    // ユーザー名検証
    if (sanitizeInput(username) !== adminUser) {
      return { valid: false, reason: 'INVALID_USERNAME' };
    }

    const cleanPassword = sanitizeInput(password);
    let isValidPassword = false;

    // 本番環境: ハッシュ検証
    if (process.env.NODE_ENV === 'production' || !devPassword) {
      try {
        isValidPassword = await verifyPassword(cleanPassword, passwordHash);
      } catch (error) {
        console.error('ハッシュ検証エラー:', error);
        return { valid: false, reason: 'HASH_VERIFICATION_ERROR' };
      }
    }
    // 開発環境: 平文比較（フォールバック）
    else if (devPassword && process.env.NODE_ENV === 'development') {
      isValidPassword = cleanPassword === devPassword;
    }

    if (isValidPassword) {
      return {
        valid: true,
        user: {
          username: adminUser,
          role: 'administrator',
          permissions: ['read', 'write', 'delete', 'admin'],
          loginTime: Date.now(),
          authMethod: process.env.NODE_ENV === 'production' ? 'hash' : 'plaintext'
        }
      };
    }

    return { valid: false, reason: 'INVALID_PASSWORD' };

  } catch (error) {
    securityLogger.suspiciousActivity('ADMIN_AUTH_ERROR', { error: error.message });
    return { valid: false, reason: 'SYSTEM_ERROR' };
  }
};

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  sanitizeInput,
  sanitizeDynamoQuery,
  generateCSRFToken,
  checkRateLimit,
  sessionManager,
  validator: validateInput,
  securityHeaders,
  securityLogger,
  validateAdminCredentials,
  SECURITY_CONFIG
};