import React, { useState, useEffect } from 'react';
import { memberUtils } from '../data/memberData';

const ReservationForm = ({ vehicle, currentMember, isMemberLoggedIn, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    notes: '',
    includeInsurance: false,
    rentalPlan: 'daily', // daily, weekly, monthly
    passengerCount: 1,
    additionalDrivers: [] // { name, licenseNumber, licenseFrontImage, licenseBackImage }
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState({});

  // 日数計算用の共通関数
  const getDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  useEffect(() => {
    const days = getDays();
    if (days > 0) {
      let basePrice = vehicle.price * days;
      let discount = 0;
      
      // Apply discount based on rental plan
      if (formData.rentalPlan === 'weekly' && days >= 7) {
        discount = basePrice * 0.15; // 15% discount for weekly
      } else if (formData.rentalPlan === 'monthly' && days >= 30) {
        discount = basePrice * 0.25; // 25% discount for monthly
      }
      
      basePrice = basePrice - discount;
      
      let insurancePrice = 0;
      if (formData.includeInsurance) {
        insurancePrice = vehicle.insurance.dailyRate * days;
        // Apply discount to insurance as well
        if (formData.rentalPlan === 'weekly' && days >= 7) {
          insurancePrice = insurancePrice * 0.85; // 15% discount
        } else if (formData.rentalPlan === 'monthly' && days >= 30) {
          insurancePrice = insurancePrice * 0.75; // 25% discount
        }
      }
      
      setTotalPrice(basePrice + insurancePrice);
    } else {
      setTotalPrice(0);
    }
  }, [formData.startDate, formData.endDate, formData.includeInsurance, formData.rentalPlan, vehicle.price, vehicle.insurance.dailyRate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = '名前を入力してください';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = '有効なメールアドレスを入力してください';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = '電話番号を入力してください';
    } else if (!/^[0-9-]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = '有効な電話番号を入力してください';
    }

    if (!formData.startDate) {
      newErrors.startDate = '開始日を選択してください';
    }

    if (!formData.endDate) {
      newErrors.endDate = '終了日を選択してください';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = '開始日は今日以降を選択してください';
      }

      if (end < start) {
        newErrors.endDate = '終了日は開始日以降を選択してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const reservationData = {
        ...formData,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        totalPrice: totalPrice,
        vehicle: vehicle
      };
      onSubmit(reservationData);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 追加運転者の管理
  const addAdditionalDriver = () => {
    setFormData(prev => ({
      ...prev,
      additionalDrivers: [...prev.additionalDrivers, {
        id: Date.now(),
        name: '',
        licenseNumber: '',
        licenseFrontImage: null,
        licenseBackImage: null
      }]
    }));
  };

  const removeAdditionalDriver = (driverId) => {
    setFormData(prev => ({
      ...prev,
      additionalDrivers: prev.additionalDrivers.filter(driver => driver.id !== driverId)
    }));
  };

  const updateAdditionalDriver = (driverId, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalDrivers: prev.additionalDrivers.map(driver =>
        driver.id === driverId ? { ...driver, [field]: value } : driver
      )
    }));
  };

  const handleDriverLicenseUpload = async (e, driverId, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズとタイプチェック
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateAdditionalDriver(driverId, imageType, event.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('ファイルのアップロードに失敗しました');
    }
  };

  // 免許証ステータスチェック
  const getLicenseStatus = () => {
    if (!isMemberLoggedIn || !currentMember?.profile?.driverLicense) {
      return {
        canReserve: false,
        type: 'no-license',
        message: '予約にはログインと免許証登録が必要です'
      };
    }

    const license = currentMember.profile.driverLicense;
    
    if (license.verificationStatus !== 'approved') {
      return {
        canReserve: false,
        type: 'not-approved',
        message: '免許証の審査が完了していないため予約できません'
      };
    }

    if (memberUtils.isLicenseExpired(license.expiryDate)) {
      return {
        canReserve: false,
        type: 'expired',
        message: '免許証の有効期限が切れているため予約できません'
      };
    }

    const daysUntilExpiry = memberUtils.getDaysUntilExpiry(license.expiryDate);
    if (daysUntilExpiry <= 30) {
      return {
        canReserve: true,
        type: 'warning',
        message: `免許証の有効期限まで残り${daysUntilExpiry}日です`
      };
    }

    return {
      canReserve: true,
      type: 'ok',
      message: ''
    };
  };

  const licenseStatus = getLicenseStatus();

  return (
    <div className="reservation-form-container">
      {/* 免許証ステータス警告バナー */}
      {!licenseStatus.canReserve && (
        <div className={`license-warning-banner ${licenseStatus.type}`}>
          <div className="warning-content">
            <span className="warning-icon">
              {licenseStatus.type === 'expired' ? '⚠️' : '🚫'}
            </span>
            <div className="warning-text">
              <strong>{licenseStatus.message}</strong>
              {licenseStatus.type === 'expired' && (
                <p>免許証を更新後、新しい画像を再アップロードしてください。</p>
              )}
              {licenseStatus.type === 'not-approved' && (
                <p>審査完了まで通常1-2営業日かかります。</p>
              )}
              {licenseStatus.type === 'no-license' && (
                <p>マイページから免許証をアップロードしてください。</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {licenseStatus.canReserve && licenseStatus.type === 'warning' && (
        <div className="license-warning-banner warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>{licenseStatus.message}</strong>
              <p>期限切れ前に免許証の更新をお願いします。</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="selected-vehicle-info">
        <h3>選択した車両</h3>
        <div className="vehicle-summary">
          <img src={vehicle.image} alt={vehicle.name} />
          <div className="vehicle-details">
            <h4>{vehicle.name}</h4>
            <p>{vehicle.category}</p>
            <p className="daily-price">1日あたり: {formatPrice(vehicle.price)}</p>
          </div>
        </div>
      </div>

      <form className="reservation-form" onSubmit={handleSubmit}>
        <h3>お客様情報</h3>
        
        <div className="form-group">
          <label htmlFor="customerName">
            お名前 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className={errors.customerName ? 'error' : ''}
          />
          {errors.customerName && <span className="error-message">{errors.customerName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="customerEmail">
            メールアドレス <span className="required">*</span>
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            className={errors.customerEmail ? 'error' : ''}
          />
          {errors.customerEmail && <span className="error-message">{errors.customerEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="customerPhone">
            電話番号 <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            placeholder="例: 090-1234-5678"
            className={errors.customerPhone ? 'error' : ''}
          />
          {errors.customerPhone && <span className="error-message">{errors.customerPhone}</span>}
        </div>

        <h3>レンタルプラン</h3>
        
        <div className="rental-plans">
          <div className={`plan-option ${formData.rentalPlan === 'daily' ? 'selected' : ''}`}>
            <input
              type="radio"
              id="daily"
              name="rentalPlan"
              value="daily"
              checked={formData.rentalPlan === 'daily'}
              onChange={handleInputChange}
            />
            <label htmlFor="daily" className="plan-label">
              <div className="plan-header">
                <span className="plan-title">🗓️ デイリープラン</span>
                <span className="plan-subtitle">基本料金</span>
              </div>
              <div className="plan-description">
                1日から気軽にご利用いただけます
              </div>
            </label>
          </div>
          
          <div className={`plan-option ${formData.rentalPlan === 'weekly' ? 'selected' : ''}`}>
            <input
              type="radio"
              id="weekly"
              name="rentalPlan"
              value="weekly"
              checked={formData.rentalPlan === 'weekly'}
              onChange={handleInputChange}
            />
            <label htmlFor="weekly" className="plan-label">
              <div className="plan-header">
                <span className="plan-title">📅 ウィークリープラン</span>
                <span className="plan-discount">15% OFF</span>
              </div>
              <div className="plan-description">
                7日以上のご利用で15%割引
              </div>
            </label>
          </div>
          
          <div className={`plan-option ${formData.rentalPlan === 'monthly' ? 'selected' : ''}`}>
            <input
              type="radio"
              id="monthly"
              name="rentalPlan"
              value="monthly"
              checked={formData.rentalPlan === 'monthly'}
              onChange={handleInputChange}
            />
            <label htmlFor="monthly" className="plan-label">
              <div className="plan-header">
                <span className="plan-title">🗓️ マンスリープラン</span>
                <span className="plan-discount">25% OFF</span>
              </div>
              <div className="plan-description">
                30日以上のご利用で25%割引
              </div>
            </label>
          </div>
        </div>

        <h3>レンタル期間</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">
              開始日 <span className="required">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={getTodayDate()}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">
              終了日 <span className="required">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || getTodayDate()}
              className={errors.endDate ? 'error' : ''}
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>
        </div>

        <h3>同乗者・追加運転者情報</h3>
        
        <div className="form-group">
          <label htmlFor="passengerCount">
            同乗者人数（運転者含む）<span className="required">*</span>
          </label>
          <select
            id="passengerCount"
            name="passengerCount"
            value={formData.passengerCount}
            onChange={handleInputChange}
            className={errors.passengerCount ? 'error' : ''}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>{num}名</option>
            ))}
          </select>
          {errors.passengerCount && <span className="error-message">{errors.passengerCount}</span>}
        </div>

        <div className="additional-drivers-section">
          <div className="section-header">
            <h4>追加運転者</h4>
            <button 
              type="button" 
              className="add-driver-button"
              onClick={addAdditionalDriver}
            >
              + 運転者を追加
            </button>
          </div>
          
          {formData.additionalDrivers.length > 0 && (
            <div className="additional-drivers-list">
              {formData.additionalDrivers.map((driver, index) => (
                <div key={driver.id} className="additional-driver-card">
                  <div className="driver-header">
                    <h5>追加運転者 {index + 1}</h5>
                    <button
                      type="button"
                      className="remove-driver-button"
                      onClick={() => removeAdditionalDriver(driver.id)}
                    >
                      削除
                    </button>
                  </div>
                  
                  <div className="driver-info">
                    <div className="form-group">
                      <label>氏名 <span className="required">*</span></label>
                      <input
                        type="text"
                        value={driver.name}
                        onChange={(e) => updateAdditionalDriver(driver.id, 'name', e.target.value)}
                        placeholder="運転者の氏名"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>免許証番号 <span className="required">*</span></label>
                      <input
                        type="text"
                        value={driver.licenseNumber}
                        onChange={(e) => updateAdditionalDriver(driver.id, 'licenseNumber', e.target.value)}
                        placeholder="12桁の番号"
                      />
                    </div>
                    
                    <div className="driver-license-upload">
                      <div className="upload-item">
                        <label>免許証表面 <span className="required">*</span></label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDriverLicenseUpload(e, driver.id, 'licenseFrontImage')}
                        />
                        {driver.licenseFrontImage && (
                          <div className="upload-preview">
                            <img src={driver.licenseFrontImage} alt="免許証表面" />
                            <span>✅ アップロード済み</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="upload-item">
                        <label>免許証裏面 <span className="required">*</span></label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDriverLicenseUpload(e, driver.id, 'licenseBackImage')}
                        />
                        {driver.licenseBackImage && (
                          <div className="upload-preview">
                            <img src={driver.licenseBackImage} alt="免許証裏面" />
                            <span>✅ アップロード済み</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {formData.additionalDrivers.length === 0 && (
            <p className="no-drivers-message">
              追加の運転者がいる場合は、上のボタンから登録してください。
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">備考</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            placeholder="特別なご要望やご質問があればお書きください"
          />
        </div>

        <div className="form-group insurance-option">
          <div className="insurance-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="includeInsurance"
                checked={formData.includeInsurance}
                onChange={handleInputChange}
              />
              <span className="toggle-slider"></span>
            </label>
            <div className="insurance-info">
              <h4>デイリー保険</h4>
              <p>{vehicle.insurance.description}</p>
              <p className="insurance-price">{formatPrice(vehicle.insurance.dailyRate)}/日</p>
            </div>
          </div>
        </div>

        <div className="price-summary">
          <div className="price-breakdown">
            <div className="price-item">
              <span>基本料金:</span>
              <span>{formatPrice(vehicle.price)} / 日</span>
            </div>
            {formData.includeInsurance && (
              <div className="price-item">
                <span>デイリー保険:</span>
                <span>{formatPrice(vehicle.insurance.dailyRate)} / 日</span>
              </div>
            )}
            {(!formData.startDate || !formData.endDate) && (
              <div className="price-placeholder">
                <p>📅 利用期間を選択すると料金が表示されます</p>
              </div>
            )}
            {formData.startDate && formData.endDate && getDays() > 0 && (
              <>
                <div className="price-item">
                  <span>利用期間:</span>
                  <span>{getDays()}日</span>
                </div>
                <div className="price-item subtotal">
                  <span>車両料金小計:</span>
                  <span>{formatPrice(vehicle.price * getDays())}</span>
                </div>
                {formData.includeInsurance && (
                  <div className="price-item subtotal">
                    <span>保険料小計:</span>
                    <span>{formatPrice(vehicle.insurance.dailyRate * getDays())}</span>
                  </div>
                )}
                <div className="price-item total">
                  <span>🧾 合計金額:</span>
                  <span className="total-amount">{formatPrice(totalPrice)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            キャンセル
          </button>
          <button 
            type="submit" 
            className={`submit-button ${!licenseStatus.canReserve ? 'disabled' : ''}`}
            disabled={!licenseStatus.canReserve}
          >
            {!licenseStatus.canReserve ? '予約不可' : '予約を確定する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;