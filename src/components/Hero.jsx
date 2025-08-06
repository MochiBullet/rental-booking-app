import React, { useState, useEffect } from 'react';
import { siteSettingsManager } from '../data/siteSettings';

const Hero = ({ onViewChange }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(siteSettingsManager.getSettings());
    
    // 設定変更を監視
    const handleStorageChange = () => {
      setSettings(siteSettingsManager.getSettings());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('siteSettingsUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('siteSettingsUpdate', handleStorageChange);
    };
  }, []);

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <h2>{settings.hero.title}</h2>
        <p>{settings.hero.subtitle}</p>
        {settings.hero.description && (
          <p className="hero-description">{settings.hero.description}</p>
        )}
        <div className="hero-features">
          {settings.features.map((feature, index) => (
            <div key={index} className="feature">
              <span className="feature-text">{feature.title}</span>
              <span className="feature-description">{feature.description}</span>
            </div>
          ))}
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