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
      {/* 背景スライダー */}
      <div className="background-slider">
        <div className="slider-track">
          <div className="slide" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80)'}}></div>
          <div className="slide" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=80)'}}></div>
          <div className="slide" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80)'}}></div>
          <div className="slide" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1920&q=80)'}}></div>
          <div className="slide" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80)'}}></div>
        </div>
      </div>
      <div className="hero-overlay"></div>
      
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
                <h4>カーレンタル</h4>
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