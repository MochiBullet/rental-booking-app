import React, { useState } from 'react';
import './EmailRegistration.css';

const EmailRegistration = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setIsLoading(true);
    
    // Simulate email sending
    setTimeout(() => {
      // Generate verification token
      const verificationToken = btoa(email + Date.now());
      
      // Store pre-registration data
      const preRegistration = {
        email: email,
        token: verificationToken,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const existingPreRegs = JSON.parse(localStorage.getItem('preRegistrations') || '[]');
      existingPreRegs.push(preRegistration);
      localStorage.setItem('preRegistrations', JSON.stringify(existingPreRegs));
      
      // Store token for demo purposes (in production, this would be sent via email)
      localStorage.setItem('latestVerificationToken', verificationToken);
      
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  if (isSubmitted) {
    const token = localStorage.getItem('latestVerificationToken');
    const registrationUrl = `${window.location.origin}/complete-registration/${token}`;
    
    return (
      <div className="email-registration-container">
        <div className="registration-card success-card">
          <div className="success-icon">✉️</div>
          <h2>メールを送信しました</h2>
          <p className="success-message">
            <strong>{email}</strong> に確認メールを送信しました。
          </p>
          <div className="email-notice">
            <h3>次のステップ</h3>
            <ol>
              <li>受信トレイをご確認ください</li>
              <li>メール内のリンクをクリック</li>
              <li>詳細情報を入力して登録完了</li>
            </ol>
          </div>
          
          {/* Demo purposes - show the link directly */}
          <div className="demo-notice">
            <p className="demo-label">デモ用リンク（実際はメールで送信）</p>
            <a href={`/complete-registration/${token}`} className="demo-link">
              登録を続ける →
            </a>
          </div>
          
          <div className="resend-section">
            <p>メールが届かない場合</p>
            <button onClick={handleResend} className="resend-btn">
              もう一度送信
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-registration-container">
      <div className="registration-card">
        <div className="card-header">
          <h1>会員登録</h1>
          <p>まずはメールアドレスを入力してください</p>
        </div>
        
        <form onSubmit={handleSubmit} className="email-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="email-input"
              required
              disabled={isLoading}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          
          <div className="benefits-list">
            <h3>会員特典</h3>
            <ul>
              <li>🎁 新規登録で1,000ポイントプレゼント</li>
              <li>📱 簡単オンライン予約</li>
              <li>💰 利用金額の5%ポイント還元</li>
              <li>🚗 会員限定の特別プラン</li>
            </ul>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">送信中...</span>
            ) : (
              '登録メールを送信'
            )}
          </button>
          
          <p className="privacy-notice">
            登録することで、<a href="/terms">利用規約</a>と
            <a href="/privacy">プライバシーポリシー</a>に同意したものとみなされます。
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmailRegistration;