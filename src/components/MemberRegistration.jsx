import React, { useState } from 'react';
import { memberUtils } from '../data/memberData';

const MemberRegistration = ({ onRegister, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // アカウント情報
    email: '',
    password: '',
    confirmPassword: '',
    
    // 基本情報
    name: '',
    nameKana: '',
    phone: '',
    birthDate: '',
    
    // 住所情報
    zipCode: '',
    prefecture: '',
    city: '',
    street: '',
    
    // 緊急連絡先
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    
    // 免許証情報
    licenseNumber: '',
    licenseExpiryDate: '',
    licenseFrontImage: null,
    licenseBackImage: null,
    
    // 設定
    newsletterSubscription: true,
    smsNotification: false,
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [imageType]: 'ファイルサイズは5MB以下にしてください'
      }));
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        [imageType]: '画像ファイルを選択してください'
      }));
      return;
    }

    setIsUploading(true);
    
    try {
      // Base64に変換
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          [imageType]: event.target.result
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [imageType]: 'ファイルのアップロードに失敗しました'
      }));
      setIsUploading(false);
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1: // アカウント情報
        if (!formData.email.trim()) {
          newErrors.email = 'メールアドレスを入力してください';
        } else if (!memberUtils.validateEmail(formData.email)) {
          newErrors.email = '有効なメールアドレスを入力してください';
        }
        
        if (!formData.password) {
          newErrors.password = 'パスワードを入力してください';
        } else if (!memberUtils.validatePassword(formData.password)) {
          newErrors.password = 'パスワードは8文字以上で入力してください';
        }
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'パスワードが一致しません';
        }
        break;
        
      case 2: // 基本情報
        if (!formData.name.trim()) {
          newErrors.name = '氏名を入力してください';
        }
        if (!formData.nameKana.trim()) {
          newErrors.nameKana = 'フリガナを入力してください';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = '電話番号を入力してください';
        }
        if (!formData.birthDate) {
          newErrors.birthDate = '生年月日を選択してください';
        } else {
          const age = memberUtils.calculateAge(formData.birthDate);
          if (age < 18) {
            newErrors.birthDate = '18歳以上の方のみご利用いただけます';
          }
        }
        break;
        
      case 3: // 住所情報
        if (!formData.zipCode.trim()) {
          newErrors.zipCode = '郵便番号を入力してください';
        }
        if (!formData.prefecture.trim()) {
          newErrors.prefecture = '都道府県を選択してください';
        }
        if (!formData.city.trim()) {
          newErrors.city = '市区町村を入力してください';
        }
        if (!formData.street.trim()) {
          newErrors.street = '番地を入力してください';
        }
        break;
        
      case 4: // 緊急連絡先
        if (!formData.emergencyName.trim()) {
          newErrors.emergencyName = '緊急連絡先名を入力してください';
        }
        if (!formData.emergencyPhone.trim()) {
          newErrors.emergencyPhone = '緊急連絡先電話番号を入力してください';
        }
        if (!formData.emergencyRelationship.trim()) {
          newErrors.emergencyRelationship = '続柄を入力してください';
        }
        break;
        
      case 5: // 免許証情報
        if (!formData.licenseNumber.trim()) {
          newErrors.licenseNumber = '免許証番号を入力してください';
        }
        if (!formData.licenseExpiryDate) {
          newErrors.licenseExpiryDate = '免許証有効期限を選択してください';
        } else {
          const expiryDate = new Date(formData.licenseExpiryDate);
          const today = new Date();
          if (expiryDate <= today) {
            newErrors.licenseExpiryDate = '有効期限が切れている免許証は使用できません';
          }
        }
        if (!formData.licenseFrontImage) {
          newErrors.licenseFrontImage = '免許証表面の画像をアップロードしてください';
        }
        if (!formData.licenseBackImage) {
          newErrors.licenseBackImage = '免許証裏面の画像をアップロードしてください';
        }
        break;
        
      case 6: // 確認・規約
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = '利用規約に同意してください';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep(6)) {
      const memberData = {
        email: formData.email,
        password: formData.password,
        profile: {
          name: formData.name,
          nameKana: formData.nameKana,
          phone: formData.phone,
          birthDate: formData.birthDate,
          address: {
            zipCode: formData.zipCode,
            prefecture: formData.prefecture,
            city: formData.city,
            street: formData.street
          },
          emergencyContact: {
            name: formData.emergencyName,
            phone: formData.emergencyPhone,
            relationship: formData.emergencyRelationship
          },
          driverLicense: {
            number: formData.licenseNumber,
            expiryDate: formData.licenseExpiryDate,
            frontImage: formData.licenseFrontImage,
            backImage: formData.licenseBackImage,
            verificationStatus: 'pending'
          }
        },
        preferences: {
          newsletterSubscription: formData.newsletterSubscription,
          smsNotification: formData.smsNotification
        }
      };
      
      onRegister(memberData);
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="registration-step">
            <h3>アカウント情報</h3>
            <div className="form-group">
              <label>メールアドレス *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label>パスワード *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="8文字以上"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label>パスワード確認 *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="registration-step">
            <h3>基本情報</h3>
            <div className="form-row">
              <div className="form-group">
                <label>氏名 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label>フリガナ *</label>
                <input
                  type="text"
                  name="nameKana"
                  value={formData.nameKana}
                  onChange={handleInputChange}
                  className={errors.nameKana ? 'error' : ''}
                  placeholder="カタカナで入力"
                />
                {errors.nameKana && <span className="error-message">{errors.nameKana}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>電話番号 *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="090-1234-5678"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label>生年月日 *</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={errors.birthDate ? 'error' : ''}
                />
                {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="registration-step">
            <h3>住所情報</h3>
            <div className="form-row">
              <div className="form-group">
                <label>郵便番号 *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={errors.zipCode ? 'error' : ''}
                  placeholder="123-4567"
                />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>
              
              <div className="form-group">
                <label>都道府県 *</label>
                <select
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleInputChange}
                  className={errors.prefecture ? 'error' : ''}
                >
                  <option value="">選択してください</option>
                  {prefectures.map(prefecture => (
                    <option key={prefecture} value={prefecture}>{prefecture}</option>
                  ))}
                </select>
                {errors.prefecture && <span className="error-message">{errors.prefecture}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label>市区町村 *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
            
            <div className="form-group">
              <label>番地・建物名 *</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className={errors.street ? 'error' : ''}
              />
              {errors.street && <span className="error-message">{errors.street}</span>}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="registration-step">
            <h3>緊急連絡先</h3>
            <div className="form-group">
              <label>緊急連絡先名 *</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleInputChange}
                className={errors.emergencyName ? 'error' : ''}
              />
              {errors.emergencyName && <span className="error-message">{errors.emergencyName}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>緊急連絡先電話番号 *</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className={errors.emergencyPhone ? 'error' : ''}
                  placeholder="090-1234-5678"
                />
                {errors.emergencyPhone && <span className="error-message">{errors.emergencyPhone}</span>}
              </div>
              
              <div className="form-group">
                <label>続柄 *</label>
                <select
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleInputChange}
                  className={errors.emergencyRelationship ? 'error' : ''}
                >
                  <option value="">選択してください</option>
                  <option value="配偶者">配偶者</option>
                  <option value="親">親</option>
                  <option value="子">子</option>
                  <option value="兄弟姉妹">兄弟姉妹</option>
                  <option value="友人">友人</option>
                  <option value="その他">その他</option>
                </select>
                {errors.emergencyRelationship && <span className="error-message">{errors.emergencyRelationship}</span>}
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="registration-step">
            <h3>免許証情報</h3>
            <div className="form-row">
              <div className="form-group">
                <label>免許証番号 *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className={errors.licenseNumber ? 'error' : ''}
                  placeholder="12桁の番号"
                />
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>
              
              <div className="form-group">
                <label>有効期限 *</label>
                <input
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleInputChange}
                  className={errors.licenseExpiryDate ? 'error' : ''}
                />
                {errors.licenseExpiryDate && <span className="error-message">{errors.licenseExpiryDate}</span>}
              </div>
            </div>
            
            <div className="license-upload-section">
              <div className="upload-group">
                <label>免許証表面画像 *</label>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'licenseFrontImage')}
                    className="file-input"
                    id="license-front"
                  />
                  <label htmlFor="license-front" className="upload-button">
                    {isUploading ? '📤 アップロード中...' : '📷 画像を選択'}
                  </label>
                  {formData.licenseFrontImage && (
                    <div className="image-preview">
                      <img 
                        src={formData.licenseFrontImage} 
                        alt="免許証表面" 
                        className="preview-image" 
                      />
                      <p>✅ アップロード完了</p>
                    </div>
                  )}
                </div>
                {errors.licenseFrontImage && <span className="error-message">{errors.licenseFrontImage}</span>}
              </div>
              
              <div className="upload-group">
                <label>免許証裏面画像 *</label>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'licenseBackImage')}
                    className="file-input"
                    id="license-back"
                  />
                  <label htmlFor="license-back" className="upload-button">
                    {isUploading ? '📤 アップロード中...' : '📷 画像を選択'}
                  </label>
                  {formData.licenseBackImage && (
                    <div className="image-preview">
                      <img 
                        src={formData.licenseBackImage} 
                        alt="免許証裏面" 
                        className="preview-image" 
                      />
                      <p>✅ アップロード完了</p>
                    </div>
                  )}
                </div>
                {errors.licenseBackImage && <span className="error-message">{errors.licenseBackImage}</span>}
              </div>
            </div>
            
            <div className="license-notice">
              <p>⚠️ 注意事項</p>
              <ul>
                <li>免許証の四隅がすべて写るように撮影してください</li>
                <li>文字がはっきり読めるように撮影してください</li>
                <li>ファイルサイズは5MB以下にしてください</li>
                <li>アップロード後、確認・承認に1-2営業日かかります</li>
              </ul>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="registration-step">
            <h3>確認・規約同意</h3>
            <div className="registration-summary">
              <h4>登録内容確認</h4>
              <div className="summary-section">
                <h5>基本情報</h5>
                <p>氏名: {formData.name}</p>
                <p>メール: {formData.email}</p>
                <p>電話: {formData.phone}</p>
              </div>
              
              <div className="summary-section">
                <h5>住所</h5>
                <p>{formData.zipCode} {formData.prefecture} {formData.city} {formData.street}</p>
              </div>
              
              <div className="summary-section">
                <h5>免許証情報</h5>
                <p>番号: {formData.licenseNumber}</p>
                <p>有効期限: {formData.licenseExpiryDate}</p>
                <p>画像: {formData.licenseFrontImage && formData.licenseBackImage ? '✅ アップロード済み' : '❌ 未アップロード'}</p>
              </div>
            </div>
            
            <div className="preferences-section">
              <h4>設定</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="newsletterSubscription"
                  checked={formData.newsletterSubscription}
                  onChange={handleInputChange}
                />
                メールマガジンを受け取る
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="smsNotification"
                  checked={formData.smsNotification}
                  onChange={handleInputChange}
                />
                SMS通知を受け取る
              </label>
            </div>
            
            <div className="terms-section">
              <label className="checkbox-label required">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className={errors.termsAccepted ? 'error' : ''}
                />
                利用規約に同意する *
              </label>
              {errors.termsAccepted && <span className="error-message">{errors.termsAccepted}</span>}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="member-registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h2>👤 会員登録</h2>
          <div className="step-indicator">
            <span>ステップ {step} / 6</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="registration-form">
          {renderStepContent()}
          
          <div className="form-actions">
            {step > 1 && (
              <button type="button" onClick={handlePrevious} className="previous-button">
                ← 前へ
              </button>
            )}
            
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            
            {step < 6 ? (
              <button type="button" onClick={handleNext} className="next-button">
                次へ →
              </button>
            ) : (
              <button type="submit" className="submit-button">
                登録完了
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberRegistration;