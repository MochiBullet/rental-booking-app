import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingWheel from './LoadingWheel';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // メールアドレスの検証
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
      setError('このメールアドレスは登録されていません。');
      setIsLoading(false);
      return;
    }

    // リセットトークンの生成
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpiry = new Date(Date.now() + 3600000); // 1時間後に期限切れ

    // パスワードリセット情報を保存
    const passwordResets = JSON.parse(localStorage.getItem('passwordResets') || '[]');
    passwordResets.push({
      email,
      token: resetToken,
      expiry: resetExpiry.toISOString(),
      used: false
    });
    localStorage.setItem('passwordResets', JSON.stringify(passwordResets));

    // メール送信のシミュレーション
    setTimeout(() => {
      console.log('Password reset email sent to:', email);
      console.log('Reset link:', `${window.location.origin}/reset-password/${resetToken}`);
      
      // 開発環境では、リセットリンクをアラートで表示
      if (window.location.hostname === 'localhost') {
        alert(`パスワードリセットリンク（開発用）:\n${window.location.origin}/reset-password/${resetToken}`);
      }
      
      setIsSubmitted(true);
      setIsLoading(false);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card success-card">
          <div className="success-icon">✉️</div>
          <h2>メールを送信しました</h2>
          <p>
            パスワードリセット用のリンクを
            <br />
            <strong>{email}</strong>
            <br />
            に送信しました。
          </p>
          <div className="info-box">
            <p>メールが届かない場合：</p>
            <ul>
              <li>迷惑メールフォルダをご確認ください</li>
              <li>メールアドレスが正しいか確認してください</li>
              <li>しばらく待ってから再度お試しください</li>
            </ul>
          </div>
          <Link to="/login" className="back-to-login-btn">
            ログインページへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>パスワードをお忘れですか？</h2>
        <p className="description">
          登録したメールアドレスを入力してください。
          パスワードリセット用のリンクをお送りします。
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <LoadingWheel size={20} />
                送信中...
              </div>
            ) : (
              'リセットリンクを送信'
            )}
          </button>
        </form>
        
        <div className="divider"></div>
        
        <div className="links">
          <Link to="/login" className="back-link">
            ← ログインページに戻る
          </Link>
          <Link to="/register" className="register-link">
            アカウントをお持ちでない方
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;