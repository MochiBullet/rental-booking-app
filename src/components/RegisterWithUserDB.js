import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import userAuthService from '../services/userAPI';

function RegisterWithUserDB({ setUser }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: 基本情報
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: 個人情報
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    phone: '',
    birthDate: '',
    gender: '',
    
    // Step 3: 住所情報
    postalCode: '',
    prefecture: '',
    city: '',
    street: '',
    building: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.email) {
          newErrors.email = 'メールアドレスを入力してください';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '有効なメールアドレスを入力してください';
        }
        
        if (!formData.password) {
          newErrors.password = 'パスワードを入力してください';
        } else if (formData.password.length < 8) {
          newErrors.password = 'パスワードは8文字以上で入力してください';
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'パスワード（確認）を入力してください';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'パスワードが一致しません';
        }
        break;
        
      case 2:
        if (!formData.lastName) newErrors.lastName = '姓を入力してください';
        if (!formData.firstName) newErrors.firstName = '名を入力してください';
        if (!formData.lastNameKana) newErrors.lastNameKana = 'セイを入力してください';
        if (!formData.firstNameKana) newErrors.firstNameKana = 'メイを入力してください';
        if (!formData.phone) newErrors.phone = '電話番号を入力してください';
        if (!formData.birthDate) newErrors.birthDate = '生年月日を入力してください';
        if (!formData.gender) newErrors.gender = '性別を選択してください';
        break;
        
      case 3:
        if (!formData.postalCode) newErrors.postalCode = '郵便番号を入力してください';
        if (!formData.prefecture) newErrors.prefecture = '都道府県を選択してください';
        if (!formData.city) newErrors.city = '市区町村を入力してください';
        if (!formData.street) newErrors.street = '番地を入力してください';
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await userAuthService.register(formData);
      
      if (result.success) {
        // 自動ログイン
        const loginResult = await userAuthService.login(formData.email, formData.password);
        
        if (loginResult.success) {
          setUser(loginResult.user);
          navigate('/mypage');
        } else {
          // 登録は成功したがログインに失敗した場合
          navigate('/login');
        }
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: '登録中にエラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 200px)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '2rem' 
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        padding: '2rem', 
        width: '100%', 
        maxWidth: '600px' 
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#2d7a2d', 
          marginBottom: '1rem' 
        }}>
          新規会員登録
        </h2>

        {/* Progress indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '2rem' 
        }}>
          {[1, 2, 3].map(step => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                background: step <= currentStep ? '#4CAF50' : '#e0e0e0',
                margin: '0 2px',
                borderRadius: '2px',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>
                ステップ 1: 基本情報
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  メールアドレス <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.email ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.email && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.email}</span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  パスワード <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.password ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.password && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.password}</span>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  パスワード（確認） <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.confirmPassword ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.confirmPassword && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>
                ステップ 2: 個人情報
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    姓 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.lastName ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  {errors.lastName && (
                    <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.lastName}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    名 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.firstName ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  {errors.firstName && (
                    <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.firstName}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    セイ <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lastNameKana"
                    value={formData.lastNameKana}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.lastNameKana ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  {errors.lastNameKana && (
                    <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.lastNameKana}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    メイ <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="firstNameKana"
                    value={formData.firstNameKana}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.firstNameKana ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  {errors.firstNameKana && (
                    <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.firstNameKana}</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  電話番号 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="090-1234-5678"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.phone ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.phone && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.phone}</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    生年月日 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.birthDate ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  {errors.birthDate && (
                    <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.birthDate}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    性別 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.gender ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
                  {errors.gender && (
                    <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.gender}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>
                ステップ 3: 住所情報
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  郵便番号 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="123-4567"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.postalCode ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.postalCode && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.postalCode}</span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  都道府県 <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.prefecture ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">選択してください</option>
                  {prefectures.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                {errors.prefecture && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.prefecture}</span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  市区町村 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="例: 渋谷区"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.city ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.city && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.city}</span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  番地 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="例: 渋谷1-1-1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.street ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                {errors.street && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.street}</span>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  建物名・部屋番号
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="例: 〇〇マンション 101号室"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
              </div>
            </div>
          )}

          {errors.submit && (
            <div style={{
              background: '#fee',
              color: '#c00',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {errors.submit}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                戻る
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #2d7a2d, #4CAF50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                次へ
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #2d7a2d, #4CAF50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '登録中...' : '登録する'}
              </button>
            )}
          </div>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            すでにアカウントをお持ちの方は
          </p>
          <Link
            to="/login-new"
            style={{
              color: '#2d7a2d',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterWithUserDB;