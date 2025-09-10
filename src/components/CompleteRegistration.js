import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CompleteRegistration.css';

const CompleteRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // Personal Information
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    phone: '',
    birthDate: '',
    gender: '',
    
    // Address
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    
    // License Information
    licenseNumber: '',
    licenseTypes: [],  // 複数の免許種類を配列で保持
    issueDate: '',
    expiryDate: '',
    licenseColor: 'blue',
    
    // Account
    password: '',
    confirmPassword: '',
    
    // Files
    licenseFront: null,
    licenseBack: null,
    
    // Marketing
    newsletter: true,
    smsNotification: false
  });

  const [errors, setErrors] = useState({});
  // 会員番号生成関数
  const generateMemberNumber = (licenseNumber, registrationDate = new Date()) => {
    if (!licenseNumber || licenseNumber.length < 4) {
      return null;
    }
    
    const year = registrationDate.getFullYear();
    const month = String(registrationDate.getMonth() + 1).padStart(2, '0');
    const lastFourDigits = licenseNumber.slice(-4);
    
    return `${year}${month}${lastFourDigits}`;
  };

  const [uploadedImages, setUploadedImages] = useState({
    front: null,
    back: null
  });
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // 郵便番号から住所を取得する関数
  const fetchAddressFromPostalCode = async (postalCode) => {
    if (!postalCode || postalCode.length !== 7) return;
    
    setIsAddressLoading(true);
    try {
      // 日本郵便の郵便番号検索API（zipcloud）を使用
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
      const data = await response.json();
      
      if (data.status === 200 && data.results && data.results.length > 0) {
        const address = data.results[0];
        setFormData(prev => ({
          ...prev,
          prefecture: address.address1,
          city: address.address2,
          address: address.address3
        }));
      } else {
        // 郵便番号が見つからない場合の処理
        console.log('該当する住所が見つかりませんでした');
      }
    } catch (error) {
      console.error('住所取得エラー:', error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  useEffect(() => {
    // Verify token
    const preRegistrations = JSON.parse(localStorage.getItem('preRegistrations') || '[]');
    const registration = preRegistrations.find(r => r.token === token);
    
    if (registration && registration.status === 'pending') {
      setIsValid(true);
      setFormData(prev => ({ ...prev, email: registration.email }));
    }
    setIsLoading(false);
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // 郵便番号が7桁入力された場合、自動で住所を取得
    if (name === 'postalCode' && value.length === 7 && /^\d{7}$/.test(value)) {
      fetchAddressFromPostalCode(value);
    }
  };

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => ({
          ...prev,
          [side]: reader.result
        }));
        setFormData(prev => ({
          ...prev,
          [side === 'front' ? 'licenseFront' : 'licenseBack']: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCamera = async (side) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element for camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Create modal for camera
      const modal = document.createElement('div');
      modal.className = 'camera-modal';
      modal.innerHTML = `
        <div class="camera-container">
          <video id="camera-preview"></video>
          <div class="camera-controls">
            <button id="capture-btn">撮影</button>
            <button id="cancel-btn">キャンセル</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      const videoElement = document.getElementById('camera-preview');
      videoElement.srcObject = stream;
      
      document.getElementById('capture-btn').onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        setUploadedImages(prev => ({
          ...prev,
          [side]: imageData
        }));
        setFormData(prev => ({
          ...prev,
          [side === 'front' ? 'licenseFront' : 'licenseBack']: imageData
        }));
        
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      document.getElementById('cancel-btn').onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
    } catch (err) {
      alert('カメラへのアクセスが拒否されました');
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch(stepNumber) {
      case 1:
        if (!formData.lastName) newErrors.lastName = '姓を入力してください';
        if (!formData.firstName) newErrors.firstName = '名を入力してください';
        if (!formData.lastNameKana) newErrors.lastNameKana = '姓（カナ）を入力してください';
        if (!formData.firstNameKana) newErrors.firstNameKana = '名（カナ）を入力してください';
        if (!formData.phone) newErrors.phone = '電話番号を入力してください';
        if (!formData.birthDate) newErrors.birthDate = '生年月日を選択してください';
        if (!formData.gender) newErrors.gender = '性別を選択してください';
        break;
        
      case 2:
        if (!formData.postalCode) newErrors.postalCode = '郵便番号を入力してください';
        if (!formData.prefecture) newErrors.prefecture = '都道府県を選択してください';
        if (!formData.city) newErrors.city = '市区町村を入力してください';
        if (!formData.address) newErrors.address = '番地を入力してください';
        break;
        
      case 3:
        if (!formData.licenseNumber) newErrors.licenseNumber = '免許証番号を入力してください';
        if (!formData.licenseTypes || formData.licenseTypes.length === 0) newErrors.licenseTypes = '保有免許を少なくとも1つ選択してください';
        if (!formData.issueDate) newErrors.issueDate = '交付日を入力してください';
        if (!formData.expiryDate) newErrors.expiryDate = '有効期限を入力してください';
        if (!formData.licenseFront) newErrors.licenseFront = '免許証（表面）をアップロードしてください';
        if (!formData.licenseBack) newErrors.licenseBack = '免許証（裏面）をアップロードしてください';
        break;
        
      case 4:
        if (!formData.password) newErrors.password = 'パスワードを入力してください';
        if (formData.password && formData.password.length < 8) {
          newErrors.password = 'パスワードは8文字以上で入力してください';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'パスワードが一致しません';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create user account
      const now = new Date();
      const memberNumber = generateMemberNumber(formData.licenseNumber, now);
      
      const newUser = {
        id: Date.now(),
        email: formData.email,
        name: `${formData.lastName} ${formData.firstName}`,
        nameKana: `${formData.lastNameKana} ${formData.firstNameKana}`,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        memberNumber: memberNumber,
        address: {
          postalCode: formData.postalCode,
          prefecture: formData.prefecture,
          city: formData.city,
          address: formData.address,
          building: formData.building
        },
        license: {
          number: formData.licenseNumber,
          types: formData.licenseTypes,  // 複数の免許種類
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          color: formData.licenseColor,
          images: {
            front: formData.licenseFront,
            back: formData.licenseBack
          }
        },
        points: 1000, // Welcome bonus
        createdAt: new Date().toISOString(),
        newsletter: formData.newsletter,
        smsNotification: formData.smsNotification
      };
      
      // Save user
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update pre-registration status
      const preRegistrations = JSON.parse(localStorage.getItem('preRegistrations') || '[]');
      const regIndex = preRegistrations.findIndex(r => r.token === token);
      if (regIndex !== -1) {
        preRegistrations[regIndex].status = 'completed';
        localStorage.setItem('preRegistrations', JSON.stringify(preRegistrations));
      }
      
      // Auto login
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setIsLoading(false);
      
      // Navigate to my page
      navigate('/mypage');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="complete-registration-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="complete-registration-container">
        <div className="error-card">
          <h2>無効なリンク</h2>
          <p>このリンクは無効か、既に使用されています。</p>
          <button onClick={() => navigate('/register')} className="return-btn">
            新規登録へ
          </button>
        </div>
      </div>
    );
  }

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
    <div className="complete-registration-container">
      <div className="registration-form-card">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        
        <div className="step-indicators">
          {[1, 2, 3, 4].map(num => (
            <div 
              key={num} 
              className={`step-indicator ${step >= num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
            >
              {step > num ? '✓' : num}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h2>基本情報</h2>
              <p className="step-description">お客様の基本情報を入力してください</p>
              
              <div className="form-row">
                <div className="form-field">
                  <label>姓 *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="山田"
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>
                <div className="form-field">
                  <label>名 *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="太郎"
                  />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>姓（カナ） *</label>
                  <input
                    type="text"
                    name="lastNameKana"
                    value={formData.lastNameKana}
                    onChange={handleInputChange}
                    placeholder="ヤマダ"
                  />
                  {errors.lastNameKana && <span className="error">{errors.lastNameKana}</span>}
                </div>
                <div className="form-field">
                  <label>名（カナ） *</label>
                  <input
                    type="text"
                    name="firstNameKana"
                    value={formData.firstNameKana}
                    onChange={handleInputChange}
                    placeholder="タロウ"
                  />
                  {errors.firstNameKana && <span className="error">{errors.firstNameKana}</span>}
                </div>
              </div>
              
              <div className="form-field">
                <label>電話番号 *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="090-1234-5678"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>生年月日 *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.birthDate && <span className="error">{errors.birthDate}</span>}
                </div>
                <div className="form-field">
                  <label>性別 *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
                  {errors.gender && <span className="error">{errors.gender}</span>}
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="form-step">
              <h2>住所情報</h2>
              <p className="step-description">お住まいの住所を入力してください</p>
              
              <div className="form-field">
                <label>郵便番号 *</label>
                <div className="postal-code-field">
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="1234567"
                    maxLength="7"
                  />
                  <button
                    type="button"
                    className="address-search-btn"
                    onClick={() => fetchAddressFromPostalCode(formData.postalCode)}
                    disabled={formData.postalCode.length !== 7 || isAddressLoading}
                  >
                    {isAddressLoading ? (
                      <span className="car-wheel-spinner small">🔄</span>
                    ) : (
                      '住所検索'
                    )}
                  </button>
                </div>
                <div className="postal-code-hint">
                  ハイフンなしで7桁の数字を入力してください（例：1234567）
                </div>
                {errors.postalCode && <span className="error">{errors.postalCode}</span>}
              </div>
              
              <div className="form-field">
                <label>都道府県 *</label>
                <select 
                  name="prefecture" 
                  value={formData.prefecture} 
                  onChange={handleInputChange}
                  className={isAddressLoading ? 'loading' : ''}
                >
                  <option value="">{isAddressLoading ? '検索中...' : '選択してください'}</option>
                  {prefectures.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                {errors.prefecture && <span className="error">{errors.prefecture}</span>}
              </div>
              
              <div className="form-field">
                <label>市区町村 *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder={isAddressLoading ? '自動入力中...' : '渋谷区'}
                  className={isAddressLoading ? 'loading' : ''}
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>
              
              <div className="form-field">
                <label>町域 *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={isAddressLoading ? '自動入力中...' : '道玄坂'}
                  className={isAddressLoading ? 'loading' : ''}
                />
                {errors.address && <span className="error">{errors.address}</span>}
              </div>
              
              <div className="form-field">
                <label>建物名・部屋番号</label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  placeholder="〇〇マンション 101号室"
                />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="form-step">
              <h2>運転免許証情報</h2>
              <p className="step-description">運転免許証の情報を入力し、画像をアップロードしてください</p>
              
              <div className="form-field">
                <label>免許証番号 *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012"
                  maxLength="12"
                />
                {errors.licenseNumber && <span className="error">{errors.licenseNumber}</span>}
              </div>
              
              <div className="form-field">
                <label>保有免許 *</label>
                <div className="license-types-container">
                  <div className="license-category">
                    <h4>自動車免許</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="regular"
                        checked={formData.licenseTypes.includes('regular')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>普通免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="regular_at"
                        checked={formData.licenseTypes.includes('regular_at')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>普通免許（AT限定）</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="semi_medium"
                        checked={formData.licenseTypes.includes('semi_medium')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>準中型免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="semi_medium_5t"
                        checked={formData.licenseTypes.includes('semi_medium_5t')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>準中型免許（5t限定）</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="medium"
                        checked={formData.licenseTypes.includes('medium')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>中型免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="medium_8t"
                        checked={formData.licenseTypes.includes('medium_8t')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>中型免許（8t限定）</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="large"
                        checked={formData.licenseTypes.includes('large')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>大型免許</span>
                    </label>
                  </div>
                  
                  <div className="license-category">
                    <h4>二輪免許</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="moped"
                        checked={formData.licenseTypes.includes('moped')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>原動機付自転車免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="small_motorcycle"
                        checked={formData.licenseTypes.includes('small_motorcycle')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>小型限定普通二輪免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="small_motorcycle_at"
                        checked={formData.licenseTypes.includes('small_motorcycle_at')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>小型限定普通二輪免許（AT限定）</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="motorcycle"
                        checked={formData.licenseTypes.includes('motorcycle')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>普通二輪免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="motorcycle_at"
                        checked={formData.licenseTypes.includes('motorcycle_at')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>普通二輪免許（AT限定）</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="large_motorcycle"
                        checked={formData.licenseTypes.includes('large_motorcycle')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>大型二輪免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="large_motorcycle_at"
                        checked={formData.licenseTypes.includes('large_motorcycle_at')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>大型二輪免許（AT限定）</span>
                    </label>
                  </div>
                  
                  <div className="license-category">
                    <h4>特殊免許</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="large_special"
                        checked={formData.licenseTypes.includes('large_special')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>大型特殊免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="small_special"
                        checked={formData.licenseTypes.includes('small_special')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>小型特殊免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="towing"
                        checked={formData.licenseTypes.includes('towing')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>けん引免許</span>
                    </label>
                  </div>
                  
                  <div className="license-category">
                    <h4>第二種免許</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="regular_second"
                        checked={formData.licenseTypes.includes('regular_second')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>普通第二種免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="medium_second"
                        checked={formData.licenseTypes.includes('medium_second')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>中型第二種免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="large_second"
                        checked={formData.licenseTypes.includes('large_second')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>大型第二種免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="large_special_second"
                        checked={formData.licenseTypes.includes('large_special_second')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>大型特殊第二種免許</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        value="towing_second"
                        checked={formData.licenseTypes.includes('towing_second')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: [...prev.licenseTypes, value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              licenseTypes: prev.licenseTypes.filter(t => t !== value)
                            }));
                          }
                        }}
                      />
                      <span>けん引第二種免許</span>
                    </label>
                  </div>
                </div>
                {errors.licenseTypes && <span className="error">{errors.licenseTypes}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>交付日 *</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.issueDate && <span className="error">{errors.issueDate}</span>}
                </div>
                <div className="form-field">
                  <label>有効期限 *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
                </div>
              </div>
              
              <div className="form-field">
                <label>免許証の色 *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="licenseColor"
                      value="green"
                      checked={formData.licenseColor === 'green'}
                      onChange={handleInputChange}
                    />
                    <span>グリーン</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="licenseColor"
                      value="blue"
                      checked={formData.licenseColor === 'blue'}
                      onChange={handleInputChange}
                    />
                    <span>ブルー</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="licenseColor"
                      value="gold"
                      checked={formData.licenseColor === 'gold'}
                      onChange={handleInputChange}
                    />
                    <span>ゴールド</span>
                  </label>
                </div>
              </div>
              
              <div className="license-upload-section">
                <h3>免許証画像のアップロード</h3>
                
                <div className="upload-grid">
                  <div className="upload-card">
                    <h4>表面 *</h4>
                    {uploadedImages.front ? (
                      <div className="image-preview">
                        <img src={uploadedImages.front} alt="License Front" />
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => {
                            setUploadedImages(prev => ({ ...prev, front: null }));
                            setFormData(prev => ({ ...prev, licenseFront: null }));
                          }}
                        >
                          削除
                        </button>
                      </div>
                    ) : (
                      <div className="upload-buttons">
                        <label className="upload-btn">
                          📁 ファイルを選択
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'front')}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          className="camera-btn"
                          onClick={() => handleCamera('front')}
                        >
                          📷 カメラで撮影
                        </button>
                      </div>
                    )}
                    {errors.licenseFront && <span className="error">{errors.licenseFront}</span>}
                  </div>
                  
                  <div className="upload-card">
                    <h4>裏面 *</h4>
                    {uploadedImages.back ? (
                      <div className="image-preview">
                        <img src={uploadedImages.back} alt="License Back" />
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => {
                            setUploadedImages(prev => ({ ...prev, back: null }));
                            setFormData(prev => ({ ...prev, licenseBack: null }));
                          }}
                        >
                          削除
                        </button>
                      </div>
                    ) : (
                      <div className="upload-buttons">
                        <label className="upload-btn">
                          📁 ファイルを選択
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'back')}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          className="camera-btn"
                          onClick={() => handleCamera('back')}
                        >
                          📷 カメラで撮影
                        </button>
                      </div>
                    )}
                    {errors.licenseBack && <span className="error">{errors.licenseBack}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="form-step">
              <h2>アカウント設定</h2>
              <p className="step-description">パスワードと通知設定を行ってください</p>
              
              <div className="form-field">
                <label>メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>
              
              <div className="form-field">
                <label>パスワード *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="8文字以上で入力"
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
              
              <div className="form-field">
                <label>パスワード（確認） *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="もう一度入力"
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
              
              <div className="notification-settings">
                <h3>通知設定</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                  />
                  <span>お得なキャンペーン情報をメールで受け取る</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="smsNotification"
                    checked={formData.smsNotification}
                    onChange={handleInputChange}
                  />
                  <span>予約リマインダーをSMSで受け取る</span>
                </label>
              </div>
              
              <div className="welcome-bonus">
                <h3>🎁 新規登録特典</h3>
                <p>登録完了で1,000ポイントプレゼント！</p>
              </div>
            </div>
          )}
          
          <div className="form-navigation">
            {step > 1 && (
              <button type="button" onClick={handlePrevStep} className="prev-btn">
                前へ
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={handleNextStep} className="next-btn">
                次へ
              </button>
            ) : (
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? '登録中...' : '登録完了'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistration;