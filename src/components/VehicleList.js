import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VehicleList.css';

function VehicleList({ user }) {
  const { type } = useParams();
  const navigate = useNavigate();
  
  const vehicles = {
    car: [
      { id: 1, name: 'Toyota Prius', category: 'エコカー', price: 6000, seats: 5, fuel: 'ハイブリッド', image: '🚗' },
      { id: 2, name: 'Honda Fit', category: 'コンパクト', price: 5000, seats: 5, fuel: 'ガソリン', image: '🚙' },
      { id: 3, name: 'Nissan Serena', category: 'ミニバン', price: 8000, seats: 8, fuel: 'ガソリン', image: '🚐' },
      { id: 4, name: 'Mazda CX-5', category: 'SUV', price: 7500, seats: 5, fuel: 'ディーゼル', image: '🚙' },
      { id: 5, name: 'Toyota Alphard', category: '高級ミニバン', price: 12000, seats: 7, fuel: 'ガソリン', image: '🚐' },
    ],
    bike: [
      { id: 6, name: 'Honda PCX', category: 'スクーター', price: 3000, cc: 125, type: 'AT', image: '🛵' },
      { id: 7, name: 'Yamaha MT-07', category: 'ネイキッド', price: 5000, cc: 700, type: 'MT', image: '🏍️' },
      { id: 8, name: 'Kawasaki Ninja 400', category: 'スポーツ', price: 5500, cc: 400, type: 'MT', image: '🏍️' },
      { id: 9, name: 'Honda CB400', category: 'ネイキッド', price: 4500, cc: 400, type: 'MT', image: '🏍️' },
      { id: 10, name: 'Suzuki Burgman', category: 'ビッグスクーター', price: 4000, cc: 400, type: 'AT', image: '🛵' },
    ]
  };

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '18:00'
  });

  const currentVehicles = vehicles[type] || [];

  const handleBooking = (vehicle) => {
    if (!user) {
      alert('予約にはログインが必要です');
      navigate('/login');
      return;
    }
    setSelectedVehicle(vehicle);
  };

  const submitBooking = () => {
    const days = calculateDays();
    const totalPrice = selectedVehicle.price * days;
    alert(`予約が完了しました！\n車両: ${selectedVehicle.name}\n期間: ${days}日間\n合計金額: ¥${totalPrice.toLocaleString()}`);
    setSelectedVehicle(null);
    setBookingData({ startDate: '', endDate: '', startTime: '10:00', endTime: '18:00' });
  };

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 1;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  return (
    <div className="vehicle-list-page">
      <div className="list-header">
        <button className="back-button" onClick={() => navigate('/')}>← 戻る</button>
        <h2 className="list-title">{type === 'car' ? '車' : 'バイク'}のラインナップ</h2>
      </div>

      <div className="vehicles-grid">
        {currentVehicles.map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-image">{vehicle.image}</div>
            <div className="vehicle-info">
              <h3 className="vehicle-name">{vehicle.name}</h3>
              <span className="vehicle-category">{vehicle.category}</span>
              
              <div className="vehicle-specs">
                {type === 'car' ? (
                  <>
                    <div className="spec">
                      <span className="spec-label">定員</span>
                      <span className="spec-value">{vehicle.seats}名</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">燃料</span>
                      <span className="spec-value">{vehicle.fuel}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="spec">
                      <span className="spec-label">排気量</span>
                      <span className="spec-value">{vehicle.cc}cc</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">タイプ</span>
                      <span className="spec-value">{vehicle.type}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="vehicle-price">
                <span className="price-label">1日あたり</span>
                <span className="price-value">¥{vehicle.price.toLocaleString()}</span>
              </div>

              <button className="book-button" onClick={() => handleBooking(vehicle)}>
                この{type === 'car' ? '車' : 'バイク'}を予約
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedVehicle && (
        <div className="booking-modal">
          <div className="modal-content">
            <h3>予約内容の確認</h3>
            <div className="booking-vehicle">
              <span className="booking-icon">{selectedVehicle.image}</span>
              <span className="booking-name">{selectedVehicle.name}</span>
            </div>

            <div className="booking-form">
              <div className="date-group">
                <label>
                  開始日
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </label>
                <label>
                  開始時刻
                  <select 
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                  >
                    {[...Array(14)].map((_, i) => (
                      <option key={i} value={`${i+8}:00`}>{i+8}:00</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="date-group">
                <label>
                  終了日
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </label>
                <label>
                  返却時刻
                  <select 
                    value={bookingData.endTime}
                    onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                  >
                    {[...Array(14)].map((_, i) => (
                      <option key={i} value={`${i+8}:00`}>{i+8}:00</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="price-summary">
                <div className="price-row">
                  <span>レンタル日数</span>
                  <span>{calculateDays()}日間</span>
                </div>
                <div className="price-row">
                  <span>1日あたり</span>
                  <span>¥{selectedVehicle.price.toLocaleString()}</span>
                </div>
                <div className="price-row total">
                  <span>合計金額</span>
                  <span>¥{(selectedVehicle.price * calculateDays()).toLocaleString()}</span>
                </div>
              </div>

              <div className="modal-buttons">
                <button 
                  className="confirm-button"
                  onClick={submitBooking}
                  disabled={!bookingData.startDate || !bookingData.endDate}
                >
                  予約を確定する
                </button>
                <button className="cancel-button" onClick={() => setSelectedVehicle(null)}>
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleList;