import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h2 className="hero-title">あなたの旅を、私たちがサポート</h2>
        <p className="hero-subtitle">安心・安全・快適なレンタルサービス</p>
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
              <h3 className="tile-title">車</h3>
              <p className="tile-description">
                ファミリー向けから<br/>
                ビジネスまで幅広く対応
              </p>
              <div className="tile-features">
                <span className="feature">✓ 最新モデル</span>
                <span className="feature">✓ 保険完備</span>
                <span className="feature">✓ 24時間サポート</span>
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
              <h3 className="tile-title">バイク</h3>
              <p className="tile-description">
                街乗りから<br/>
                ツーリングまで対応
              </p>
              <div className="tile-features">
                <span className="feature">✓ ヘルメット付</span>
                <span className="feature">✓ 整備済み</span>
                <span className="feature">✓ ロードサービス</span>
              </div>
              <button className="tile-button">バイクを見る →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">📱</div>
            <h4>簡単予約</h4>
            <p>24時間いつでもオンラインで予約可能</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🛡️</div>
            <h4>安心保証</h4>
            <p>充実の保険と補償制度</p>
          </div>
          <div className="info-card">
            <div className="info-icon">💰</div>
            <h4>明朗会計</h4>
            <p>追加料金なしの安心価格</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🏆</div>
            <h4>高品質</h4>
            <p>定期メンテナンス済みの車両</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;