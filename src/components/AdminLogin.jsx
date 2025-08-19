import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdmin, onSuccess, onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    setError('');
    
    // Admin authentication
    if (username === 'admin' && password === 'msbase7032') {
      try {
        if (setIsAdmin) setIsAdmin(true);
        if (onLogin) onLogin();
        if (onSuccess) onSuccess();
        
        // Store login state
        localStorage.setItem('adminUser', 'true');
        sessionStorage.setItem('adminSession', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        const adminInfo = {
          username: 'admin',
          loginTime: Date.now(),
          lastActivity: Date.now()
        };
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
        
        if (navigate) navigate('/admin');
      } catch (error) {
        console.error('Failed to set admin status:', error);
        setError('ログインに失敗しました');
      }
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
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
        
        {navigate && (
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
            type="button"
          >
            ← ホームに戻る
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;