import React from 'react';

const VehicleCard = ({ vehicle, onSelect }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  // DynamoDBのデータ構造に対応
  const isAvailable = vehicle.isAvailable !== undefined ? vehicle.isAvailable : vehicle.available;
  const vehicleImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : vehicle.image || '/placeholder-vehicle.jpg';
  const dailyPrice = vehicle.pricePerDay || vehicle.price || 0;
  const hourlyPrice = vehicle.pricePerHour || Math.round(dailyPrice / 8);

  return (
    <div className={`vehicle-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="vehicle-image">
        <img src={vehicleImage} alt={vehicle.name} />
        <div className="vehicle-type-badge">
          {(vehicle.vehicleType || vehicle.type) === 'car' ? '🚗' : '🏍️'}
        </div>
        {!isAvailable && (
          <div className="unavailable-overlay">
            <span>貸出中</span>
          </div>
        )}
      </div>
      
      <div className="vehicle-info">
        <h3>{vehicle.name}</h3>
        <p className="category">{vehicle.category}</p>
        <p className="description">{vehicle.description}</p>
        
        <div className="specifications">
          <div className="spec-item">
            <span className="spec-label">定員:</span>
            <span>{vehicle.capacity || vehicle.specifications?.seats || 1}名</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">排気量:</span>
            <span>{vehicle.engineSize || vehicle.specifications?.cc || 0}cc</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">燃料:</span>
            <span>{vehicle.fuelType || vehicle.specifications?.fuelType || 'ガソリン'}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">ミッション:</span>
            <span>{vehicle.transmission || vehicle.specifications?.transmission || 'AT'}</span>
          </div>
        </div>
        
        <div className="vehicle-footer">
          <div className="price">
            <span className="price-label">1日あたり</span>
            <span className="price-amount">{formatPrice(dailyPrice)}</span>
            <span className="price-hourly">時間 {formatPrice(hourlyPrice)}</span>
          </div>
          <button 
            className="select-button"
            onClick={onSelect}
            disabled={!isAvailable}
          >
            {isAvailable ? '予約する' : '貸出中'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;