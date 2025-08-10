import React, { useState } from 'react';
import './EmailRegistration.css';

const EmailRegistration = () => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    licenseNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [generatedMemberId, setGeneratedMemberId] = useState('');
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
    return `${year}${month.toString().padStart(2, '0')}${licenseNumber.slice(-4)}`;
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
          setGeneratedMemberId(memberId);
          setRegistrationComplete(true);
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
        setGeneratedMemberId(memberId);
        setRegistrationComplete(true);
      }
      
    } catch (error) {
      setErrors({ general: '登録中にエラーが発生しました。もう一度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setRegistrationComplete(false);
    setGeneratedMemberId('');
    setErrors({});
  };

  const passwordValidation = validatePassword(formData.password);
  const previewMemberId = formData.licenseNumber && formData.licenseNumber.length === 4 
    ? generateMemberId(formData.year, formData.month, formData.licenseNumber) 
    : '';

  if (registrationComplete) {
    return (
      <div className="email-registration-container">
        <div className="registration-card">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2>会員登録完了！</h2>
            
            <div className="member-id-display">
              <h3>あなたの会員番号は</h3>
              <div className="member-id-number">{generatedMemberId}</div>
              <h3>です。</h3>
            </div>
            
            <div className="success-message">
              初回登録ボーナスとして<strong>500ポイント</strong>を付与いたします！
            </div>
            
            <button 
              className="continue-rental-btn"
              onClick={() => window.location.href = '/vehicles'}
            >
              レンタルを続行する
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
          <p>会員IDとパスワードを設定してください</p>
        </div>
        
        <form onSubmit={handleSubmit} className="member-form">
          {errors.general && <div className="general-error">{errors.general}</div>}
          
          <div className="member-id-section">
            <h3>会員ID作成</h3>
            <div className="id-rule">
              西暦 + 月 + 免許証番号の下4桁
            </div>
            
            <div className="form-group">
              <label>免許証番号（下4桁）</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, licenseNumber: value }));
                }}
                maxLength="4"
                placeholder="1234"
                required
                className={errors.licenseNumber ? 'error' : ''}
              />
              {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>西暦（自動入力）</label>
                <input
                  type="number"
                  value={formData.year}
                  readOnly
                  disabled
                  className="auto-filled"
                />
              </div>
              
              <div className="form-group">
                <label>月（自動入力）</label>
                <input
                  type="number"
                  value={formData.month}
                  readOnly
                  disabled
                  className="auto-filled"
                />
              </div>
            </div>
            
            {previewMemberId && (
              <div className="member-id-preview">
                <strong>会員ID: {previewMemberId}</strong>
              </div>
            )}
          </div>
          
          <div className="password-section">
            <h3>パスワード設定</h3>
            
            <div className="form-group">
              <label>パスワード</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="8桁以上、大文字・小文字を含む"
                required
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              
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
            </div>
            
            <div className="form-group">
              <label>パスワード確認</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="パスワードを再度入力"
                required
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="benefits-list">
            <h3>会員特典</h3>
            <ul>
              <li>✨ 新規登録で500ポイントプレゼント</li>
              <li>🎯 利用金額の5%をポイント還元</li>
              <li>🚗 限定車両の優先予約</li>
              <li>💳 ポイントでお得にレンタル</li>
            </ul>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading || !passwordValidation.isValid || formData.password !== formData.confirmPassword || formData.licenseNumber.length < 4}
          >
            {isLoading ? (
              <div className="loading-spinner">
                🔄 登録中...
              </div>
            ) : (
              '会員登録する'
            )}
          </button>
          
          <div className="privacy-notice">
            登録することで、
            <a href="/terms">利用規約</a>および<a href="/privacy">プライバシーポリシー</a>
            に同意したものとみなされます。
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailRegistration;