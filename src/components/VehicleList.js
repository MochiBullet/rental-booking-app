import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './VehicleList.css';
import { vehicleAPI } from '../services/api';
import GoogleFormsEmbed from './GoogleFormsEmbed';
import { siteSettingsManager } from '../data/siteSettings';

const VehicleList = ({ user, vehicles: vehiclesProp, initialFilter }) => {
  const { type } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showGoogleForms, setShowGoogleForms] = useState(false);
  // Google Forms強制有効化（キャッシュ問題対策）
  const [siteSettings, setSiteSettings] = useState({
    googleForms: {
      enabled: true,
      formUrl: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/formResponse',
      showEmbedded: true,
      embedHeight: 800
    }
  });
  // DISABLED: Booking functionality replaced with price simulation
  // const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('daily');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [insuranceOptions, setInsuranceOptions] = useState({
    basic: true,
    collision: false,
    comprehensive: false,
    personal: false
  });
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Vehicle images mapping
  const vehicleImages = {
    // Cars
    'Toyota Camry': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop',
    'Honda Civic': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=250&fit=crop',
    'Ford Explorer': 'https://images.unsplash.com/photo-1519641766812-1cfa1137dc16?w=400&h=250&fit=crop',
    'Chevrolet Tahoe': 'https://images.unsplash.com/photo-1563720223809-b9a3d1694e2a?w=400&h=250&fit=crop',
    'Honda Odyssey': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=250&fit=crop',
    'Toyota Sienna': 'https://images.unsplash.com/photo-1533473359331-0135ef1f614e?w=400&h=250&fit=crop',
    'Mercedes S-Class': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=250&fit=crop',
    'BMW 7 Series': 'https://images.unsplash.com/photo-1555215858-9f41d89c0e7f?w=400&h=250&fit=crop',
    'Nissan Altima': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop',
    'Tesla Model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop',
    // Bikes
    'Honda PCX': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'Yamaha MT-07': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=250&fit=crop',
    'Kawasaki Ninja 400': 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=400&h=250&fit=crop',
    'Honda CB400': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'Suzuki Burgman': 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=250&fit=crop',
    'Harley-Davidson Iron 883': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'BMW R1250GS': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250&fit=crop',
    'Ducati Monster': 'https://images.unsplash.com/photo-1580341289255-5b47c98a59dd?w=400&h=250&fit=crop',
    'Vespa Primavera': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=250&fit=crop',
    'Triumph Street Triple': 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=400&h=250&fit=crop',
    'Default': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=250&fit=crop'
  };

  const plans = {
    daily: { label: 'デイリープラン', multiplier: 1, unit: '日' },
    weekly: { label: 'ウィークリープラン', multiplier: 0.85, unit: '週', discount: '15% OFF' },
    monthly: { label: 'マンスリープラン', multiplier: 0.7, unit: '月', discount: '30% OFF' },
    purchase: { label: '購入オプション', multiplier: 365, unit: '購入', discount: 'お得' }
  };

  const insurancePrices = {
    basic: 0,
    collision: 2000,
    comprehensive: 3500,
    personal: 1500
  };

  const insuranceNames = {
    basic: '基本補償',
    collision: '車両・対物補償',
    comprehensive: '完全補償',
    personal: '搭乗者傷害保険'
  };

  useEffect(() => {
    // Site Settings を読み込み
    const settings = siteSettingsManager.getSettings();
    console.log('🔍 VehicleList - Google Forms設定確認:', {
      enabled: settings?.googleForms?.enabled,
      fullSettings: settings?.googleForms
    });
    setSiteSettings(settings);
    
    // propsでvehiclesが渡されている場合はそれを使用（空配列でも使用する）
    if (vehiclesProp !== undefined) {
      console.log('✅ VehicleList: propsからvehiclesを使用:', vehiclesProp.length, '件');
      setVehicles(vehiclesProp);
      return;
    }

    // propsでvehiclesが渡されていない場合はAPIから取得
    const fetchVehicles = async () => {
      try {
        console.log('🔄 VehicleList: データベースから車両データを取得中...', type || initialFilter);
        
        // データベースから車両データを取得
        let apiVehicleData;
        const filterType = type || initialFilter;
        if (filterType && filterType !== 'all') {
          apiVehicleData = await vehicleAPI.getByType(filterType);
        } else {
          apiVehicleData = await vehicleAPI.getAll();
        }
        
        console.log('✅ VehicleList: データベースから取得成功:', apiVehicleData?.length || 0, '件');
        
        // データが空の場合は空配列を設定（エラーにしない）
        setVehicles(apiVehicleData || []);
        
      } catch (apiError) {
        console.error('❌ VehicleList: データベース接続エラー:', apiError);
        console.warn('⚠️ VehicleList: データベース接続失敗、在庫なし状態として処理します');
        
        // データベース接続失敗時は空配列を設定
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [type, initialFilter, vehiclesProp]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedVehicle, selectedPlan, selectedDuration, insuranceOptions]);


  const calculateTotalPrice = () => {
    if (!selectedVehicle) return;

    let basePrice = selectedVehicle.price;
    const plan = plans[selectedPlan];
    let duration = selectedDuration;

    // Calculate base rental price
    let rentalPrice = basePrice * plan.multiplier * duration;
    
    // Add insurance costs
    let insuranceTotal = 0;
    Object.keys(insuranceOptions).forEach(key => {
      if (insuranceOptions[key]) {
        insuranceTotal += insurancePrices[key] * duration;
      }
    });

    const total = rentalPrice + insuranceTotal;
    setTotalPrice(total);
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    // Adjust duration defaults based on plan
    if (plan === 'weekly') setSelectedDuration(1);
    else if (plan === 'monthly') setSelectedDuration(1);
    else if (plan === 'purchase') setSelectedDuration(1);
    else setSelectedDuration(1);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // Auto-calculate end date based on plan
    if (date) {
      const startDate = new Date(date);
      let endDate = new Date(date);
      
      if (selectedPlan === 'daily') {
        endDate.setDate(startDate.getDate() + selectedDuration);
      } else if (selectedPlan === 'weekly') {
        endDate.setDate(startDate.getDate() + (selectedDuration * 7));
      } else if (selectedPlan === 'monthly') {
        endDate.setMonth(startDate.getMonth() + selectedDuration);
      }
      
      setSelectedEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  const handleSimulatePrice = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowSimulationModal(true);
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    handleDateChange(today);
  };

  // DISABLED: Booking functionality - replaced with price simulation only
  /*
  const confirmBooking = () => {
    if (!user) {
      alert('予約を確定するにはログインが必要です。ログインページに移動してください。');
      return;
    }
    if (!selectedDate) {
      alert('開始日を選択してください');
      return;
    }

    const booking = {
      id: Date.now(),
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      userId: user?.id,
      userName: user?.name || 'Guest',
      pickupDate: selectedDate,
      returnDate: selectedEndDate,
      plan: selectedPlan,
      duration: selectedDuration,
      insurance: insuranceOptions,
      totalPrice: totalPrice,
      status: 'confirmed',
      bookingDate: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    // Award points if user is logged in (5% of total price)
    if (user?.id) {
      const earnedPoints = Math.floor(totalPrice * 0.05);
      
      // Update user points
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].points = (users[userIndex].points || 0) + earnedPoints;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }
      
      // Add point history
      const pointHistory = JSON.parse(localStorage.getItem('pointHistory') || '[]');
      pointHistory.push({
        id: Date.now() + 1,
        userId: user.id,
        type: 'earn',
        amount: earnedPoints,
        description: `${selectedVehicle.name}の利用で獲得`,
        date: new Date().toISOString(),
        bookingId: booking.id
      });
      localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
    }

    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
      setSelectedVehicle(null);
      resetBookingForm();
    }, 2000);
  };
  */

  const resetSimulationForm = () => {
    setSelectedPlan('daily');
    setSelectedDuration(1);
    setSelectedDate('');
    setSelectedEndDate('');
    setInsuranceOptions({
      basic: true,
      collision: false,
      comprehensive: false,
      personal: false
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-header">
        <h1>{type === 'car' ? '車両一覧' : type === 'bike' ? 'バイク一覧' : '全車両'}</h1>
        <p>プレミアムな車両ラインナップからお選びください</p>
      </div>

      <div className="vehicles-grid">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-image-container">
              <img 
                src={vehicleImages[vehicle.name] || vehicleImages['Default']} 
                alt={vehicle.name}
                className="vehicle-image"
              />
              <span className="vehicle-badge">{(vehicle.type === 'car' || vehicle.vehicleType === 'car') ? '車' : (vehicle.type === 'motorcycle' || vehicle.vehicleType === 'motorcycle') ? 'バイク' : vehicle.type || vehicle.vehicleType}</span>
              {/* Vehicle Status Display - Enhanced for Info Site Mode */}
              {vehicle.available || vehicle.isAvailable ? (
                <span className="status-badge available">利用可能</span>
              ) : vehicle.currentBooking ? (
                <span className="status-badge rented">
                  レンタル中 ({vehicle.currentBooking.endDate ? new Date(vehicle.currentBooking.endDate).toLocaleDateString() : '期間未定'}まで)
                </span>
              ) : vehicle.maintenance ? (
                <span className="status-badge maintenance">メンテナンス中</span>
              ) : (
                <span className="status-badge unavailable">利用不可</span>
              )}
            </div>
            
            <div className="vehicle-details">
              <h3>{vehicle.name}</h3>
              <div className="vehicle-features">
                <span className="feature-tag">👥 {vehicle.passengers || vehicle.specifications?.seats || 4}人乗り</span>
                {(Array.isArray(vehicle.features) ? vehicle.features : vehicle.features?.split(',') || []).slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="feature-tag">{typeof feature === 'string' ? feature.trim() : feature}</span>
                ))}
              </div>
              
              <div className="vehicle-pricing">
                <div className="price-display">
                  <span className="price-amount">{formatCurrency(vehicle.price || vehicle.pricePerDay || 0)}</span>
                  <span className="price-period">/ 日</span>
                </div>
                <button 
                  className="modern-book-btn"
                  onClick={() => handleSimulatePrice(vehicle)}
                  disabled={!(vehicle.available || vehicle.isAvailable)}
                >
                  料金シミュレーション
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showGoogleForms && selectedVehicle && (
        <div className="modern-modal-overlay">
          <div className="modern-modal" style={{ maxWidth: '900px', width: '90%' }}>
            <div className="modal-header">
              <h2>予約フォーム</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowGoogleForms(false)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <GoogleFormsEmbed 
              vehicleInfo={selectedVehicle}
              onClose={() => setShowGoogleForms(false)}
            />
          </div>
        </div>
      )}

      {showSimulationModal && selectedVehicle && (
        <div className="modern-modal-overlay">
          <div className="modern-modal">
            <>
                <div className="modal-header">
                  <h2>料金シミュレーション</h2>
                  <button className="close-btn" onClick={() => setShowSimulationModal(false)}>×</button>
                </div>

                <div className="booking-content">
                  <div className="vehicle-summary">
                    <img 
                      src={vehicleImages[selectedVehicle.name] || vehicleImages['Default']} 
                      alt={selectedVehicle.name}
                      className="summary-image"
                    />
                    <div className="summary-details">
                      <h3>{selectedVehicle.name}</h3>
                      <p>{selectedVehicle.type === 'car' ? '車' : 'バイク'} • {selectedVehicle.passengers}人乗り</p>
                    </div>
                  </div>

                  <div className="booking-form">
                    <div className="form-section">
                      <h4>プランを選択</h4>
                      <div className="plan-options">
                        {Object.entries(plans).map(([key, plan]) => (
                          <div 
                            key={key}
                            className={`plan-card ${selectedPlan === key ? 'selected' : ''}`}
                            onClick={() => handlePlanChange(key)}
                          >
                            <div className="plan-name">{plan.label}</div>
                            {plan.discount && <div className="plan-discount">{plan.discount}</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>日程を選択</h4>
                      <div className="date-inputs">
                        <div className="date-input-group">
                          <label>開始日</label>
                          <input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="modern-date-input"
                          />
                        </div>
                        <div className="date-input-group">
                          <label>終了日</label>
                          <input 
                            type="date"
                            value={selectedEndDate}
                            readOnly
                            className="modern-date-input"
                          />
                        </div>
                        <div className="duration-input-group">
                          <label>期間</label>
                          <div className="duration-selector">
                            <button onClick={() => setSelectedDuration(Math.max(1, selectedDuration - 1))}>-</button>
                            <span>{selectedDuration} {plans[selectedPlan].unit}</span>
                            <button onClick={() => setSelectedDuration(selectedDuration + 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>保険オプション</h4>
                      <div className="insurance-options">
                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.basic}
                              disabled
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">基本補償</span>
                              <span className="insurance-price">含まれています</span>
                            </div>
                          </label>
                        </div>
                        
                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.collision}
                              onChange={(e) => setInsuranceOptions({...insuranceOptions, collision: e.target.checked})}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">車両・対物補償</span>
                              <span className="insurance-price">+{formatCurrency(insurancePrices.collision)}/day</span>
                            </div>
                          </label>
                        </div>

                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.comprehensive}
                              onChange={(e) => setInsuranceOptions({...insuranceOptions, comprehensive: e.target.checked})}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">完全補償</span>
                              <span className="insurance-price">+{formatCurrency(insurancePrices.comprehensive)}/day</span>
                            </div>
                          </label>
                        </div>

                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.personal}
                              onChange={(e) => setInsuranceOptions({...insuranceOptions, personal: e.target.checked})}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">搭乗者傷害保険</span>
                              <span className="insurance-price">+{formatCurrency(insurancePrices.personal)}/day</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>車両料金 ({selectedDuration} {plans[selectedPlan].unit}間)</span>
                        <span>{formatCurrency(selectedVehicle.price * plans[selectedPlan].multiplier * selectedDuration)}</span>
                      </div>
                      {Object.entries(insuranceOptions).map(([key, enabled]) => 
                        enabled && key !== 'basic' && (
                          <div key={key} className="price-row">
                            <span>{insuranceNames[key]}</span>
                            <span>{formatCurrency(insurancePrices[key] * selectedDuration)}</span>
                          </div>
                        )
                      )}
                      <div className="price-row total">
                        <span>合計金額</span>
                        <span className="total-amount">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <div className="simulation-result">
                        <div className="final-price-display">
                          <h3>見積もり合計: {formatCurrency(totalPrice)}</h3>
                          <p className="price-note">※実際の料金は条件により変動する場合があります</p>
                        </div>
                      </div>
                      {console.log('🎯 予約ボタン表示条件:', siteSettings?.googleForms?.enabled) || siteSettings?.googleForms?.enabled && (
                        <button 
                          className="reserve-btn" 
                          onClick={() => {
                            setShowSimulationModal(false);
                            setShowGoogleForms(true);
                          }}
                          style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginRight: '10px'
                          }}
                        >
                          予約フォームへ進む →
                        </button>
                      )}
                      <button className="close-simulation-btn" onClick={() => setShowSimulationModal(false)}>
                        閉じる
                      </button>
                    </div>
                  </div>
                </div>
              </>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;