import React from 'react';

const Hero = ({ onViewChange }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>車・バイクレンタルサービス</h2>
        <p>お得な料金で車やバイクをレンタルできます</p>
        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">🚗</span>
            <span>豊富な車種</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏍️</span>
            <span>バイクも充実</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💰</span>
            <span>お手頃料金</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span>簡単予約</span>
          </div>
        </div>
        <div className="hero-buttons">
          <button 
            className="cta-button car-button"
            onClick={() => onViewChange('vehicles', 'car')}
          >
            🚗 車を探す
          </button>
          <button 
            className="cta-button motorcycle-button"
            onClick={() => onViewChange('vehicles', 'motorcycle')}
          >
            🏍️ バイクを探す
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;