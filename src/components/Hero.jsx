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
        
        <div className="vehicle-selection">
          <h3 className="selection-title">車両を選択してください</h3>
          <div className="vehicle-tiles">
            <div 
              className="vehicle-tile car-tile"
              onClick={() => onViewChange('cars')}
            >
              <div className="tile-icon">🚗</div>
              <div className="tile-content">
                <h4>車両レンタル</h4>
                <p>軽自動車からSUVまで<br/>豊富な車種をご用意</p>
                <div className="tile-features">
                  <span>• 軽自動車</span>
                  <span>• コンパクトカー</span>
                  <span>• SUV</span>
                  <span>• ワンボックス</span>
                </div>
              </div>
              <div className="tile-arrow">→</div>
            </div>
            
            <div 
              className="vehicle-tile motorcycle-tile"
              onClick={() => onViewChange('motorcycles')}
            >
              <div className="tile-icon">🏍️</div>
              <div className="tile-content">
                <h4>バイクレンタル</h4>
                <p>原付からスポーツバイクまで<br/>多彩なラインナップ</p>
                <div className="tile-features">
                  <span>• 原付・スクーター</span>
                  <span>• 中型バイク</span>
                  <span>• 大型バイク</span>
                  <span>• スポーツバイク</span>
                </div>
              </div>
              <div className="tile-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;