import React, { useState } from 'react';
import { memberUtils } from '../data/memberData';

const MemberRegistration = ({ onRegister, onCancel }) => {
  const [formData, setFormData] = useState({
    // 必須項目のみ
    email: '',
    licenseLastFour: '', // 免許証番号下4桁
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState({});

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

  // 削除: 画像アップロード機能は不要

  const validateForm = () => {
    const newErrors = {};
    
    // メールアドレスチェック
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!memberUtils.validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    // 免許証番号下4桁チェック
    if (!formData.licenseLastFour.trim()) {
      newErrors.licenseLastFour = '免許証番号の下4桁を入力してください';
    } else if (!/^\d{4}$/.test(formData.licenseLastFour)) {
      newErrors.licenseLastFour = '4桁の数字を入力してください';
    }
    
    // 利用規約チェック
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = '利用規約に同意してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 会員番号生成: 西暦+月+免許証番号下4桁
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const memberId = `${year}${month}${formData.licenseLastFour}`;
      
      const memberData = {
        memberId: memberId,
        email: formData.email,
        licenseLastFour: formData.licenseLastFour,
        registrationDate: now.toISOString()
      };
      
      onRegister(memberData);
    }
  };

  // 削除: prefectures配列は不要
  /*
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  */

  const renderContent = () => {
    return (
      <div className="registration-step">
        <h3>会員登録（簡易版）</h3>
        
        <div className="form-group">
          <label>メールアドレス *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="example@email.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label>免許証番号（下4桁） *</label>
          <input
            type="text"
            name="licenseLastFour"
            value={formData.licenseLastFour}
            onChange={handleInputChange}
            className={errors.licenseLastFour ? 'error' : ''}
            placeholder="例: 1234"
            maxLength="4"
            pattern="\d{4}"
          />
          {errors.licenseLastFour && <span className="error-message">{errors.licenseLastFour}</span>}
          <p className="input-hint">免許証番号の下4桁を入力してください</p>
        </div>
        
        <div className="member-id-info">
          <p>会員番号は登録完了後に自動生成されます</p>
          <p className="member-id-format">形式: 西暦+月+免許証番号下4桁</p>
          <p className="member-id-example">例: 202508{formData.licenseLastFour || 'XXXX'}</p>
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
  };

  return (
    <div className="member-registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h2>会員登録</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="registration-form">
          {renderContent()}
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="submit-button">
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberRegistration;