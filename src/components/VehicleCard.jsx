import React from 'react';

const VehicleCard = ({ vehicle, onSelect }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`vehicle-card ${!vehicle.available ? 'unavailable' : ''}`}>
      <div className="vehicle-image">
        <img src={vehicle.image} alt={vehicle.name} />
        <div className="vehicle-type-badge">
          {vehicle.type === 'car' ? '🚗' : '🏍️'}
        </div>
        {!vehicle.available && (
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
            <span>{vehicle.specifications.seats}名</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">排気量:</span>
            <span>{vehicle.specifications.cc}cc</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">燃料:</span>
            <span>{vehicle.specifications.fuelType}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">ミッション:</span>
            <span>{vehicle.specifications.transmission}</span>
          </div>
        </div>
        
        <div className="vehicle-footer">
          <div className="price">
            <span className="price-label">1日あたり</span>
            <span className="price-amount">{formatPrice(vehicle.price)}</span>
          </div>
          <button 
            className="select-button"
            onClick={onSelect}
            disabled={!vehicle.available}
          >
            {vehicle.available ? '予約する' : '貸出中'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;