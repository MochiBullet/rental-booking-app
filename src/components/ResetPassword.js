import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // トークンの検証はパスワードリセット時にサーバーで実行
    // ここではUIだけ準備
    if (token) {
      setIsValid(true);
    } else {
      setError('無効なリンクです。');
    }
    setIsChecking(false);
  }, [token]);

  // パスワード強度チェック
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z\d]/.test(password)) strength += 12.5;
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return '弱い';
    if (passwordStrength <= 50) return '普通';
    if (passwordStrength <= 75) return '強い';
    return '非常に強い';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return '#f44336';
    if (passwordStrength <= 50) return '#ff9800';
    if (passwordStrength <= 75) return '#ffc107';
    return '#4caf50';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // パスワードの検証
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    setIsLoading(true);

    try {
      // 新しいAPIサービスを使用
      const userAuthService = (await import('../services/userAPI.js')).default;
      const result = await userAuthService.resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        
        // 3秒後にログインページへリダイレクト
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'パスワードリセットに失敗しました。');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('ネットワークエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="spinner"></div>
          <p>リンクを確認中...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card error-card">
          <div className="error-icon">⚠️</div>
          <h2>リンクが無効です</h2>
          <p>{error}</p>
          <Link to="/forgot-password" className="retry-btn">
            もう一度試す
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card success-card">
          <div className="success-icon">✅</div>
          <h2>パスワードを変更しました</h2>
          <p>新しいパスワードでログインできます。</p>
          <p className="redirect-text">3秒後にログインページへ移動します...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>新しいパスワードを設定</h2>
        <p className="description">
          パスワードをリセットします
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="password">新しいパスワード</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${passwordStrength}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-label"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthLabel()}
                </span>
              </div>
            )}
            <div className="password-requirements">
              <p>パスワードの要件：</p>
              <ul>
                <li className={password.length >= 8 ? 'met' : ''}>
                  8文字以上
                </li>
                <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'met' : ''}>
                  大文字と小文字を含む
                </li>
                <li className={/\d/.test(password) ? 'met' : ''}>
                  数字を含む
                </li>
                <li className={/[^a-zA-Z\d]/.test(password) ? 'met' : ''}>
                  特殊文字を含む（推奨）
                </li>
              </ul>
            </div>
          </div>
          
          <div className="form-field">
            <label htmlFor="confirmPassword">パスワード（確認）</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
              required
              disabled={isLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <span className="field-error">パスワードが一致しません</span>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <span className="car-wheel-spinner small">🔄</span>
                変更中...
              </>
            ) : (
              'パスワードを変更'
            )}
          </button>
        </form>
        
        <div className="divider"></div>
        
        <div className="links">
          <Link to="/login" className="back-link">
            ← ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;