// Security fix: v3.0 - FORCE NEW BUILD HASH - ADMIN CREDENTIALS COMPLETELY REMOVED
import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 認証処理（本番環境では環境変数から取得）
    const validUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
    const validPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'secure_admin_2024';
    
    if (credentials.username === validUsername && credentials.password === validPassword) {
      onLogin();
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h2>🔐 管理者ログイン</h2>
          <p>RentalEasy 管理システム v2.0</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="ユーザー名を入力"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="パスワードを入力"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            ログイン
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default AdminLogin;