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
  const [googleFormsSettings] = useState({
    enabled: true,
    formUrl: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/formResponse',
    showEmbedded: true,
    embedHeight: 800
  });
  // DISABLED: Booking functionality replaced with price simulation
  // const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [insuranceRequired, setInsuranceRequired] = useState(false);
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

  // 連泊割引システム
  const getDiscountRate = (days) => {
    if (days >= 30) return 0.8; // 80%オフ
    if (days >= 21) return 0.6; // 60%オフ
    if (days >= 14) return 0.45; // 45%オフ
    if (days >= 7) return 0.3; // 30%オフ
    if (days >= 3) return 0.15; // 15%オフ
    return 0; // 割引なし
  };

  const getDiscountLabel = (days) => {
    if (days >= 30) return '80%オフ';
    if (days >= 21) return '60%オフ';
    if (days >= 14) return '45%オフ';
    if (days >= 7) return '30%オフ';
    if (days >= 3) return '15%オフ';
    return '';
  };

  // 期間に応じた保険料金システム
  const getInsurancePrice = (days) => {
    if (days >= 21) return 500;  // 21日以上: 500円/日
    if (days >= 14) return 700;  // 14日以上: 700円/日
    if (days >= 7) return 1000;  // 7日以上: 1,000円/日
    return 2000; // 7日未満: 2,000円/日（デフォルト）
  };

  useEffect(() => {
    // Site Settings を読み込み
    const settings = siteSettingsManager.getSettings();
    console.log('🔍 VehicleList - Google Forms設定確認:', {
      enabled: settings?.googleForms?.enabled,
      fullSettings: settings?.googleForms
    });
    // setSiteSettings(settings); // 変数名変更のため削除
    
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
  }, [selectedVehicle, selectedDuration, insuranceRequired]);

  const calculateTotalPrice = () => {
    if (!selectedVehicle) return;

    let basePrice = selectedVehicle.price;
    let duration = selectedDuration;

    // 基本料金計算
    let rentalPrice = basePrice * duration;
    
    // 連泊割引適用
    const discountRate = getDiscountRate(duration);
    if (discountRate > 0) {
      rentalPrice = rentalPrice * (1 - discountRate);
    }
    
    // 保険料金追加（期間に応じた料金）
    let insuranceTotal = 0;
    if (insuranceRequired) {
      insuranceTotal = getInsurancePrice(duration) * duration;
    }

    const total = rentalPrice + insuranceTotal;
    setTotalPrice(total);
  };


  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // Auto-calculate end date based on duration
    if (date) {
      const startDate = new Date(date);
      let endDate = new Date(date);
      endDate.setDate(startDate.getDate() + selectedDuration);
      setSelectedEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  // 期間変更時の処理
  const handleDurationChange = (newDuration) => {
    setSelectedDuration(newDuration);
    if (selectedDate) {
      const startDate = new Date(selectedDate);
      let endDate = new Date(selectedDate);
      endDate.setDate(startDate.getDate() + newDuration);
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
        <p>お好みの車両をお選びください</p>
      </div>

      <div className="vehicles-grid">
        {vehicles.filter(vehicle => 
          vehicle.isAvailable !== false && vehicle.available !== false
        ).map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-image-container">
              <img 
                src={(() => {
                  // Debug: ログ出力で画像データ構造を確認（車とバイクの違いを確認）
                  console.log('🔍 Debug vehicle image data:', {
                    name: vehicle.name,
                    type: vehicle.type,
                    vehicleType: vehicle.vehicleType,
                    image: vehicle.image,
                    images: vehicle.images,
                    vehicleImages: vehicle.vehicleImages,
                    isBike: vehicle.type === 'bike' || vehicle.type === 'motorcycle' || vehicle.vehicleType === 'bike' || vehicle.vehicleType === 'motorcycle'
                  });
                  
                  // 画像の優先順位を修正: vehicleImages/images配列を優先
                  const uploadedImage = (vehicle.vehicleImages && vehicle.vehicleImages[0]) || 
                                       (vehicle.images && vehicle.images[0]) || 
                                       vehicle.image;
                  
                  // バイクの場合の特別処理
                  const isBike = vehicle.type === 'bike' || vehicle.type === 'motorcycle' || 
                                vehicle.vehicleType === 'bike' || vehicle.vehicleType === 'motorcycle';
                  
                  if (isBike && uploadedImage) {
                    console.log('🏍️ バイク画像検出:', vehicle.name, uploadedImage.substring(0, 100));
                  }
                                       
                  const imageUrl = uploadedImage || vehicleImages[vehicle.name] || vehicleImages['Default'];
                  // Allow data: URLs for SVG, but filter out via.placeholder.com and other problematic URLs
                  if (imageUrl && (imageUrl.includes('via.placeholder.com') || (imageUrl.includes('300x200?text=') && !imageUrl.startsWith('data:')))) {
                    console.warn('Invalid image URL detected:', imageUrl, 'for vehicle:', vehicle.name);
                    return vehicleImages['Default'];
                  }
                  return imageUrl;
                })()} 
                alt={vehicle.name}
                className="vehicle-image"
                loading="lazy"
              />
              <span className="vehicle-badge">{(vehicle.type === 'car' || vehicle.vehicleType === 'car') ? '車' : (vehicle.type === 'bike' || vehicle.type === 'motorcycle' || vehicle.vehicleType === 'bike' || vehicle.vehicleType === 'motorcycle') ? 'バイク' : vehicle.type || vehicle.vehicleType}</span>
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
                      src={(() => {
                        // 画像の優先順位を修正: vehicleImages/images配列を優先
                        const uploadedImage = (selectedVehicle.vehicleImages && selectedVehicle.vehicleImages[0]) || 
                                             (selectedVehicle.images && selectedVehicle.images[0]) || 
                                             selectedVehicle.image;
                                             
                        const imageUrl = uploadedImage || vehicleImages[selectedVehicle.name] || vehicleImages['Default'];
                        // Allow data: URLs for SVG, but filter out via.placeholder.com and other problematic URLs
                        if (imageUrl && (imageUrl.includes('via.placeholder.com') || (imageUrl.includes('300x200?text=') && !imageUrl.startsWith('data:')))) {
                          return vehicleImages['Default'];
                        }
                        return imageUrl;
                      })()} 
                      alt={selectedVehicle.name}
                      className="summary-image"
                      loading="lazy"
                    />
                    <div className="summary-details">
                      <h3>{selectedVehicle.name}</h3>
                      <p>{selectedVehicle.type === 'car' ? '車' : 'バイク'} • {selectedVehicle.passengers}人乗り</p>
                    </div>
                  </div>

                  <div className="booking-form">

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
                          <label>レンタル期間</label>
                          <div className="duration-selector">
                            <button onClick={() => handleDurationChange(Math.max(1, selectedDuration - 1))}>-</button>
                            <span>{selectedDuration} 日間</span>
                            <button onClick={() => handleDurationChange(selectedDuration + 1)}>+</button>
                          </div>
                          {getDiscountLabel(selectedDuration) && (
                            <div className="discount-badge">
                              {getDiscountLabel(selectedDuration)} 適用！
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>補償プラン</h4>
                      <div className="insurance-options">
                        <div className="simple-insurance-toggle">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceRequired}
                              onChange={(e) => setInsuranceRequired(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">安心補償プラン</span>
                              <span className="insurance-price">+{formatCurrency(getInsurancePrice(selectedDuration))}/日</span>
                              <span className="insurance-description">
                                車両・対物・傷害補償を含む包括的な補償
                                {selectedDuration >= 7 && (
                                  <span className="insurance-discount"> (長期割引適用)</span>
                                )}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>基本料金 ({selectedDuration}日間)</span>
                        <span>{formatCurrency(selectedVehicle.price * selectedDuration)}</span>
                      </div>
                      {getDiscountRate(selectedDuration) > 0 && (
                        <div className="price-row discount">
                          <span>連泊割引 ({getDiscountLabel(selectedDuration)})</span>
                          <span>-{formatCurrency(selectedVehicle.price * selectedDuration * getDiscountRate(selectedDuration))}</span>
                        </div>
                      )}
                      {insuranceRequired && (
                        <div className="price-row">
                          <span>安心補償プラン ({selectedDuration}日間 × {formatCurrency(getInsurancePrice(selectedDuration))}/日)</span>
                          <span>{formatCurrency(getInsurancePrice(selectedDuration) * selectedDuration)}</span>
                        </div>
                      )}
                      <div className="price-row total">
                        <span>合計金額</span>
                        <span className="total-amount">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <div className="simulation-result">
                        <div className="final-price-display sticky-estimate">
                          <h3>見積もり合計: {formatCurrency(totalPrice)}</h3>
                          <p className="estimate-notice">
                            ※本画面はお見積りのみであり、実際のご予約は画面下部「予約フォームへ進む」よりご予約いただきますよう、お願いいたします。
                          </p>
                        </div>
                      </div>
                      {/* Google Forms予約ボタンを強制表示 */}
                      {true && (
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