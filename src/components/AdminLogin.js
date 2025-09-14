import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  sessionManager,
  checkRateLimit,
  sanitizeInput,
  securityLogger,
  validateAdminCredentials
} from '../utils/security';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdmin, onSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    setError('');

    try {
      // 入力値サニタイゼーション
      const cleanUsername = sanitizeInput(username);
      const cleanPassword = sanitizeInput(password);

      // レート制限チェック
      const rateCheck = checkRateLimit(cleanUsername, 'admin_login');
      if (!rateCheck.allowed) {
        setError(`ログイン試行回数が上限に達しました。${rateCheck.remainingTime}分後に再試行してください。`);
        securityLogger.loginAttempt(cleanUsername, false, 'rate_limited');
        setIsLogging(false);
        return;
      }

      // 本番環境用管理者認証（環境変数対応）
      const authResult = await validateAdminCredentials(cleanUsername, cleanPassword);

      if (authResult.valid) {
        try {
          setIsAdmin(true);

          // セキュアなセッション作成
          const sessionData = sessionManager.create(authResult.user, true);

          // ログイン成功のログ記録
          securityLogger.loginAttempt(cleanUsername, true, 'admin_success');

          const adminInfo = {
            username: authResult.user.username,
            role: authResult.user.role,
            loginTime: Date.now(),
            lastActivity: Date.now(),
            sessionToken: sessionData.token,
            csrfToken: sessionData.csrfToken,
            permissions: authResult.user.permissions
          };
          localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
        
        navigate('/admin');
        } catch (error) {
          console.error('管理者ログイン処理エラー:', error);
          securityLogger.suspiciousActivity('ADMIN_LOGIN_ERROR', { error: error.message });
          setError('ログイン処理でエラーが発生しました');
        }
      } else {
        // ログイン失敗のログ記録（詳細な理由付き）
        securityLogger.loginAttempt(cleanUsername, false, authResult.reason || 'invalid_credentials');

        // ユーザー向けエラーメッセージ（セキュリティ上の理由で詳細は隠す）
        let errorMessage = 'ユーザー名またはパスワードが正しくありません';

        // 開発環境でのみ詳細表示
        if (process.env.NODE_ENV === 'development') {
          switch (authResult.reason) {
            case 'MISSING_CREDENTIALS':
              errorMessage = 'ユーザー名とパスワードを入力してください';
              break;
            case 'INVALID_USERNAME':
              errorMessage = 'ユーザー名が正しくありません';
              break;
            case 'INVALID_PASSWORD':
              errorMessage = 'パスワードが正しくありません';
              break;
            case 'SYSTEM_ERROR':
              errorMessage = 'システムエラーが発生しました';
              break;
            default:
              errorMessage = 'ユーザー名またはパスワードが正しくありません';
          }
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error('ログイン処理中のエラー:', error);
      securityLogger.suspiciousActivity('LOGIN_SYSTEM_ERROR', { error: error.message });
      setError('システムエラーが発生しました。しばらくしてから再試行してください。');
    }

    setIsLogging(false);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="admin-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.09 8.26L20.36 5L17.1 12.27L24 13.36L17.74 14.45L21 21.18L13.73 17.92L12.64 24L11.55 17.74L4.28 21L7.54 13.73L1 12.64L7.26 11.55L4 4.82L11.27 8.08L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>管理者ログイン</h2>
          <p>システム管理画面へのアクセス</p>
        </div>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="管理者ユーザー名を入力"
              required
              autoComplete="username"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={isLogging}
          >
            {isLogging ? (
              <>
                <span className="spinner"></span>
                ログイン中...
              </>
            ) : (
              '管理画面にログイン'
            )}
          </button>
        </form>
        
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
          type="button"
        >
          ← ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;