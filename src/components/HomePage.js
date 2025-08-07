import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { siteSettingsManager } from '../data/siteSettings';

function HomePage() {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [homeContent, setHomeContent] = useState({
    heroTitle: 'あなたの旅を、私たちがサポート',
    heroSubtitle: '安心・安全・快適なレンタルサービス',
    carTile: {
      title: '車',
      description: 'ファミリー向けから\nビジネスまで幅広く対応',
      features: ['最新モデル', '保険完備', '24時間サポート']
    },
    bikeTile: {
      title: 'バイク',
      description: '街乗りから\nツーリングまで対応',
      features: ['ヘルメット付', '整備済み', 'ロードサービス']
    },
    infoCards: [
      { icon: '📱', title: '簡単予約', description: '24時間いつでもオンラインで予約可能' },
      { icon: '🛡️', title: '安心保証', description: '充実の保険と補償制度' },
      { icon: '💰', title: '明朗会計', description: '追加料金なしの安心価格' },
      { icon: '🏆', title: '高品質', description: '定期メンテナンス済みの車両' }
    ]
  });

  // デフォルト背景画像（美しいレンタカー関連の画像URL）
  const defaultImages = [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80', // 美しい車の風景
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1920&q=80', // モダンな車
    'https://images.unsplash.com/photo-1568844293986-8d0400bd4f1b?w=1920&q=80', // 高級車
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80', // バイク
  ];

  useEffect(() => {
    // サイト設定を読み込み
    setSiteSettings(siteSettingsManager.getSettings());
    
    const savedContent = localStorage.getItem('homeContent');
    if (savedContent) {
      setHomeContent(JSON.parse(savedContent));
    }

    // カスタムイベントリスナーを追加（管理者画面からの更新を受け取る）
    const handleSettingsUpdate = () => {
      setSiteSettings(siteSettingsManager.getSettings());
    };
    
    window.addEventListener('siteSettingsUpdate', handleSettingsUpdate);
    return () => window.removeEventListener('siteSettingsUpdate', handleSettingsUpdate);
  }, []);

  // 背景画像スライダーのロジック
  useEffect(() => {
    const images = getBackgroundImages();
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, [siteSettings]);

  const getBackgroundImages = () => {
    if (siteSettings?.hero?.backgroundImages?.length > 0 && !siteSettings.hero.useDefaultImages) {
      return siteSettings.hero.backgroundImages;
    }
    return defaultImages;
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        {/* 背景画像スライダー */}
        <div className="background-slider">
          {getBackgroundImages().map((image, index) => (
            <div
              key={index}
              className={`background-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
          ))}
        </div>
        
        {/* オーバーレイ */}
        <div className="hero-overlay" />
        
        {/* コンテンツ */}
        <div className="hero-content">
          <h2 className="hero-title">{homeContent.heroTitle}</h2>
          <p className="hero-subtitle">{homeContent.heroSubtitle}</p>
        </div>
        
        {/* スライダーインジケーター */}
        <div className="slider-indicators">
          {getBackgroundImages().map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="selection-container">
        <h3 className="selection-title">レンタルする車両を選択してください</h3>
        
        <div className="vehicle-tiles">
          <div className="vehicle-tile car-tile" onClick={() => navigate('/vehicles/car')}>
            <div className="tile-content">
              <div className="tile-icon">
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <rect x="20" y="40" width="60" height="25" rx="5" fill="#2d7a2d"/>
                  <rect x="25" y="30" width="50" height="15" rx="3" fill="#3a9a3a"/>
                  <circle cx="30" cy="65" r="8" fill="#1a5a1a"/>
                  <circle cx="70" cy="65" r="8" fill="#1a5a1a"/>
                </svg>
              </div>
              <h3 className="tile-title">{homeContent.carTile.title}</h3>
              <p className="tile-description">
                {homeContent.carTile.description.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < homeContent.carTile.description.split('\n').length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </p>
              <div className="tile-features">
                {homeContent.carTile.features.map((feature, i) => (
                  <span key={i} className="feature">✓ {feature}</span>
                ))}
              </div>
              <button className="tile-button">車を見る →</button>
            </div>
          </div>

          <div className="vehicle-tile bike-tile" onClick={() => navigate('/vehicles/bike')}>
            <div className="tile-content">
              <div className="tile-icon">
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <circle cx="25" cy="65" r="10" fill="#1a5a1a"/>
                  <circle cx="75" cy="65" r="10" fill="#1a5a1a"/>
                  <path d="M25 65 L40 45 L60 45 L75 65" stroke="#2d7a2d" strokeWidth="4" fill="none"/>
                  <path d="M40 45 L35 35" stroke="#3a9a3a" strokeWidth="3"/>
                  <path d="M55 45 L60 30" stroke="#3a9a3a" strokeWidth="3"/>
                </svg>
              </div>
              <h3 className="tile-title">{homeContent.bikeTile.title}</h3>
              <p className="tile-description">
                {homeContent.bikeTile.description.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < homeContent.bikeTile.description.split('\n').length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </p>
              <div className="tile-features">
                {homeContent.bikeTile.features.map((feature, i) => (
                  <span key={i} className="feature">✓ {feature}</span>
                ))}
              </div>
              <button className="tile-button">バイクを見る →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-cards">
          {homeContent.infoCards.map((card, i) => (
            <div key={i} className="info-card">
              <div className="info-icon">{card.icon}</div>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;