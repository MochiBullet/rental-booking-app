import React, { useState } from 'react';

const MemberLogin = ({ onLogin, onCancel, onRegister }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // ここで実際の認証処理を行う
      // デモ用に簡単な認証
      if (loginData.email === 'test@example.com' && loginData.password === 'password123') {
        onLogin({
          id: 1,
          email: loginData.email,
          profile: {
            name: 'テストユーザー',
            nameKana: 'テストユーザー',
            phone: '090-1234-5678',
            birthDate: '1990-01-01',
            address: {
              zipCode: '100-0001',
              prefecture: '東京都',
              city: '千代田区',
              street: '丸の内1-1-1'
            },
            emergencyContact: {
              name: '緊急連絡先',
              phone: '090-9876-5432',
              relationship: '家族'
            },
            driverLicense: {
              number: '123456789012',
              expiryDate: '2029-12-31',
              frontImage: null,
              backImage: null,
              verificationStatus: 'approved'
            }
          },
          preferences: {
            newsletterSubscription: true,
            smsNotification: false
          },
          membershipInfo: {
            memberNumber: 'M000001',
            joinDate: '2024-01-01',
            membershipType: 'regular',
            points: 1500
          }
        });
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    } catch (err) {
      setError('ログインに失敗しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="member-login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>👤 会員ログイン</h2>
          <p>M's BASE Rental会員サービス</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleInputChange}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
              required
              placeholder="パスワードを入力"
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleInputChange}
              />
              ログイン状態を保持する
            </label>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div className="login-options">
          <button type="button" className="forgot-password-link">
            パスワードを忘れた方
          </button>
        </div>
        
        <div className="registration-prompt">
          <p>まだ会員登録がお済みでない方</p>
          <button type="button" onClick={onRegister} className="register-button">
            新規会員登録
          </button>
        </div>
        
        <div className="login-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            キャンセル
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default MemberLogin;