import React, { useState, useEffect } from 'react';

const ReservationForm = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    notes: '',
    includeInsurance: false
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
      let insurancePrice = 0;
      
      if (formData.includeInsurance) {
        insurancePrice = vehicle.insurance.dailyRate * days;
      }
      
      setTotalPrice(basePrice + insurancePrice);
    } else {
      setTotalPrice(0);
    }
  }, [formData.startDate, formData.endDate, formData.includeInsurance, vehicle.price, vehicle.insurance.dailyRate]);

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

  return (
    <div className="reservation-form-container">
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
          <button type="submit" className="submit-button">
            予約を確定する
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;