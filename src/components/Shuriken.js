import React from 'react';
import { Link } from 'react-router-dom';
import './Shuriken.css';

// PC用画像インポート
import gif1 from '../images/shuriken/1.gif';
import gif2 from '../images/shuriken/2.gif';
import gif3 from '../images/shuriken/3.gif';
import gif4 from '../images/shuriken/4.gif';
import gif5 from '../images/shuriken/5.gif';
import gif6 from '../images/shuriken/6.gif';
import gif7 from '../images/shuriken/7.gif';
import gif8 from '../images/shuriken/8.gif';

// モバイル用画像インポート
import m1 from '../images/shuriken/m1.jpg';
import m2 from '../images/shuriken/m2.jpg';
import m3 from '../images/shuriken/m3.jpg';
import m4 from '../images/shuriken/m4.jpg';
import m5 from '../images/shuriken/m5.jpg';
import m6 from '../images/shuriken/m6.jpg';

const Shuriken = () => {
  // PC用とモバイル用の画像ペア（モバイル用がない場合はPC用を使用）
  const images = [
    { pc: gif1, mobile: m1 },
    { pc: gif2, mobile: m2 },
    { pc: gif3, mobile: m3 },
    { pc: gif4, mobile: m4 },
    { pc: gif5, mobile: m5 },
    { pc: gif6, mobile: m6 },
    { pc: gif7, mobile: gif7 },  // モバイル用なし
    { pc: gif8, mobile: gif8 },  // モバイル用なし
  ];

  const contactInfo = {
    phone: '0575-74-3127',
    address: '〒501-4222 岐阜県郡上市八幡町稲成372-7',
  };

  return (
    <div className="shuriken-page">
      {/* ナビゲーションヘッダー */}
      <nav className="shuriken-nav">
        <div className="shuriken-nav-container">
          <Link to="/shuriken" className="shuriken-nav-logo">shuriken</Link>
          <ul className="shuriken-nav-menu">
            <li><Link to="/">M's BASE</Link></li>
            <li><Link to="/spaciva">SPACIVA</Link></li>
            <li><Link to="/during-field">DURING FIELD</Link></li>
          </ul>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="shuriken-content">
        {images.slice(0, 7).map((img, index) => (
          <div key={index} className="shuriken-image-container">
            <picture>
              <source media="(max-width: 768px)" srcSet={img.mobile} />
              <img src={img.pc} alt={`shuriken feature ${index + 1}`} />
            </picture>
          </div>
        ))}

        {/* 最後のスライド: 8枚目 + お問い合わせ */}
        <div className="shuriken-last-section">
          <div className="shuriken-last-image">
            <picture>
              <source media="(max-width: 768px)" srcSet={images[7].mobile} />
              <img src={images[7].pc} alt="shuriken feature 8" />
            </picture>
          </div>
          <h2 className="shuriken-contact-title">お問い合わせ</h2>
          <div className="shuriken-contact-grid">
            <div
              className="shuriken-contact-card phone"
              onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}
            >
              <div className="shuriken-contact-icon">📞</div>
              <div className="shuriken-contact-details">
                <h3>お電話</h3>
                <p className="shuriken-contact-value">{contactInfo.phone}</p>
                <div className="shuriken-click-hint">タップして発信</div>
              </div>
            </div>

            <div className="shuriken-contact-card location">
              <div className="shuriken-contact-icon">📍</div>
              <div className="shuriken-contact-details">
                <h3>所在地</h3>
                <p className="shuriken-contact-value">{contactInfo.address}</p>
                <div className="shuriken-map-actions">
                  <button
                    className="shuriken-map-button"
                    onClick={() => {
                      const address = encodeURIComponent(contactInfo.address);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                    }}
                  >
                    🗺️ 地図で見る
                  </button>
                  <button
                    className="shuriken-map-button route"
                    onClick={() => {
                      const address = encodeURIComponent(contactInfo.address);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                    }}
                  >
                    🚗 ルート検索
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shuriken;
