import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { siteSettingsManager, announcementManager } from '../data/siteSettings';

function HomePage() {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
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

  // デフォルトタイル画像
  const defaultTileImages = {
    car: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80', // 美しい車
    bike: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' // スポーツバイク
  };

  useEffect(() => {
    // サイト設定を読み込み
    setSiteSettings(siteSettingsManager.getSettings());
    
    // お知らせを読み込み
    setAnnouncements(announcementManager.getPublishedAnnouncements());
    
    const savedContent = localStorage.getItem('homeContent');
    if (savedContent) {
      setHomeContent(JSON.parse(savedContent));
    }

    // カスタムイベントリスナーを追加（管理者画面からの更新を受け取る）
    const handleSettingsUpdate = () => {
      setSiteSettings(siteSettingsManager.getSettings());
      setAnnouncements(announcementManager.getPublishedAnnouncements());
    };
    
    window.addEventListener('siteSettingsUpdate', handleSettingsUpdate);
    return () => window.removeEventListener('siteSettingsUpdate', handleSettingsUpdate);
  }, []);

  const getBackgroundImages = () => {
    if (siteSettings?.hero?.backgroundImages?.length > 0 && !siteSettings.hero.useDefaultImages) {
      return siteSettings.hero.backgroundImages;
    }
    return defaultImages;
  };

  // 画像を2セット分作成（シームレスループ用）
  const getDoubledImages = () => {
    const images = getBackgroundImages();
    return [...images, ...images]; // 画像を2回繰り返す
  };

  // タイル画像を取得する関数
  const getTileImage = (type) => {
    if (siteSettings?.tiles?.useDefaultImages === false) {
      if (type === 'car' && siteSettings?.tiles?.carImage) {
        return siteSettings.tiles.carImage;
      }
      if (type === 'bike' && siteSettings?.tiles?.bikeImage) {
        return siteSettings.tiles.bikeImage;
      }
    }
    return defaultTileImages[type];
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        {/* 背景画像スライダー（無限スクロール） */}
        <div className="background-slider">
          <div className="slider-track">
            {getDoubledImages().map((image, index) => (
              <div
                key={index}
                className="background-image"
                style={{
                  backgroundImage: `url(${image})`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* オーバーレイ */}
        <div className="hero-overlay" />
        
        {/* コンテンツ */}
        <div className="hero-content">
          <h2 className="hero-title">{homeContent.heroTitle}</h2>
          <p className="hero-subtitle">{homeContent.heroSubtitle}</p>
        </div>
      </div>

      <div className="selection-container">
        {/* お知らせセクション */}
        {announcements.length > 0 && (
          <div className="announcements-section">
            <h3 className="announcements-title">📢 お知らせ</h3>
            <div className="announcements-list">
              {announcements.slice(0, 5).map((announcement) => (
                <div key={announcement.id} className="announcement-item" onClick={() => navigate(`/announcement/${announcement.id}`)}>
                  <span className="announcement-date">{announcement.date}</span>
                  <span className="announcement-title">{announcement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <h3 className="selection-title">レンタルする車両を選択してください</h3>
        
        <div className="vehicle-tiles">
          <div className="vehicle-tile car-tile" onClick={() => navigate('/vehicles/car')}>
            <div className="tile-image">
              <img 
                src={getTileImage('car')} 
                alt="車レンタル" 
                className="tile-img"
              />
            </div>
            <div className="tile-content">
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
            <div className="tile-image">
              <img 
                src={getTileImage('bike')} 
                alt="バイクレンタル" 
                className="tile-img"
              />
            </div>
            <div className="tile-content">
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