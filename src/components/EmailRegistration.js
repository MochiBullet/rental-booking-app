import React, { useState } from 'react';
import './EmailRegistration.css';

const EmailRegistration = () => {
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    licenseNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // パスワード要件のチェック
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const minLength = password.length >= 8;
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      isValid: minLength && hasUpperCase && hasLowerCase
    };
  };

  // 会員ID生成
  const generateMemberId = (year, month, licenseNumber) => {
    return `${year}${month.padStart(2, '0')}${licenseNumber.slice(-4)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // バリデーション
    if (!formData.year || formData.year < 1950 || formData.year > new Date().getFullYear()) {
      newErrors.year = '有効な西暦を入力してください';
    }
    
    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = '1-12の範囲で月を入力してください';
    }
    
    if (!formData.licenseNumber || formData.licenseNumber.length < 4) {
      newErrors.licenseNumber = '免許証番号の下4桁を入力してください';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'パスワードは8桁以上で、大文字・小文字を含む必要があります';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // 会員ID生成
      const memberId = generateMemberId(formData.year, formData.month, formData.licenseNumber);
      
      // 会員データ作成
      const memberData = {
        id: memberId,
        password: formData.password,
        points: 500, // 新規登録プレゼント500ポイント
        registeredAt: new Date().toISOString(),
        status: 'active'
      };
      
      // まずローカルストレージをチェック（デモ用）
      const existingMembers = JSON.parse(localStorage.getItem('members') || '[]');
      if (existingMembers.find(member => member.id === memberId)) {
        setErrors({ general: 'この会員IDは既に使用されています。別の組み合わせをお試しください。' });
        setIsLoading(false);
        return;
      }
      
      try {
        // バックエンドAPIを呼び出し
        const response = await fetch('https://9v7h3mj14g.execute-api.ap-southeast-2.amazonaws.com/prod/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            year: formData.year,
            month: formData.month,
            licenseNumber: formData.licenseNumber,
            password: formData.password
          })
        });

        if (response.ok) {
          const data = await response.json();
          // ローカルストレージにも保存（デモ用）
          existingMembers.push(memberData);
          localStorage.setItem('members', JSON.stringify(existingMembers));
          setIsSubmitted(true);
        } else {
          const errorData = await response.json();
          if (response.status === 409) {
            setErrors({ general: 'この会員IDは既に使用されています。別の組み合わせをお試しください。' });
          } else {
            setErrors({ general: errorData.message || '登録中にエラーが発生しました。' });
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        // ネットワークエラーの場合はローカルストレージに保存（デモ用フォールバック）
        existingMembers.push(memberData);
        localStorage.setItem('members', JSON.stringify(existingMembers));
        setIsSubmitted(true);
      }
      
    } catch (error) {
      setErrors({ general: '登録中にエラーが発生しました。もう一度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setFormData({
      year: '',
      month: '',
      licenseNumber: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  if (isSubmitted) {
    const memberId = generateMemberId(formData.year, formData.month, formData.licenseNumber);
    
    return (
      <div className="email-registration-container">
        <div className="registration-card success-card">
          <div className="success-icon">🎉</div>
          <h2>会員登録完了</h2>
          <div className="member-id-display">
            <h3>あなたの会員ID</h3>
            <div className="member-id">{memberId}</div>
            <p className="member-id-note">この会員IDでログインしてください</p>
          </div>
          
          <div className="welcome-benefits">
            <h3>登録特典</h3>
            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <span>新規登録プレゼント: 500ポイント</span>
            </div>
          </div>
          
          <div className="next-steps">
            <a href="/login" className="login-link-btn">
              ログインしてサービスを始める
            </a>
          </div>
          
          <div className="retry-section">
            <button onClick={handleRetry} className="retry-btn">
              別の会員IDで登録する
            </button>
          </div>
        </div>
      </div>
    );
  }

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="email-registration-container">
      <div className="registration-card">
        <div className="card-header">
          <h1>会員登録</h1>
          <p>会員IDとパスワードを作成してください</p>
        </div>
        
        <form onSubmit={handleSubmit} className="member-form">
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}
          
          <div className="member-id-section">
            <h3>会員ID作成</h3>
            <p className="id-rule">西暦 + 月 + 免許証番号下4桁</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">西暦</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="2025"
                  min="1950"
                  max={new Date().getFullYear()}
                  className={errors.year ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.year && <span className="error-message">{errors.year}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="month">月</label>
                <input
                  type="number"
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  placeholder="08"
                  min="1"
                  max="12"
                  className={errors.month ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.month && <span className="error-message">{errors.month}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="licenseNumber">免許証番号下4桁</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="1234"
                  maxLength="4"
                  className={errors.licenseNumber ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>
            </div>
            
            {formData.year && formData.month && formData.licenseNumber && (
              <div className="member-id-preview">
                <span>会員ID: </span>
                <strong>{generateMemberId(formData.year, formData.month, formData.licenseNumber)}</strong>
              </div>
            )}
          </div>
          
          <div className="password-section">
            <h3>パスワード設定</h3>
            
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="パスワードを入力"
                className={errors.password ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              
              {formData.password && (
                <div className="password-requirements">
                  <div className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                    ✓ 8文字以上
                  </div>
                  <div className={passwordValidation.hasUpperCase ? 'valid' : 'invalid'}>
                    ✓ 大文字を含む
                  </div>
                  <div className={passwordValidation.hasLowerCase ? 'valid' : 'invalid'}>
                    ✓ 小文字を含む
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード確認</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="もう一度パスワードを入力"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="benefits-list">
            <h3>会員特典</h3>
            <ul>
              <li>🎁 新規登録で500ポイントプレゼント</li>
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
              <span className="loading-spinner">登録中...</span>
            ) : (
              '会員登録完了'
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