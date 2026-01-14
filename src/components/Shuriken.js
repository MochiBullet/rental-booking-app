import React from 'react';
import './Shuriken.css';

// 画像インポート
import gif1 from '../images/shuriken/1.gif';
import gif2 from '../images/shuriken/2.gif';
import gif3 from '../images/shuriken/3.gif';
import gif4 from '../images/shuriken/4.gif';
import gif5 from '../images/shuriken/5.gif';
import gif6 from '../images/shuriken/6.gif';
import gif7 from '../images/shuriken/7.gif';
import gif8 from '../images/shuriken/8.gif';

const Shuriken = () => {
  const images = [gif1, gif2, gif3, gif4, gif5, gif6, gif7, gif8];

  const contactInfo = {
    phone: '0575-74-3127',
    address: '〒501-4222 岐阜県郡上市八幡町稲成372-7',
  };

  return (
    <div className="shuriken-page">
      {/* メインコンテンツ */}
      <div className="shuriken-content">
        {images.slice(0, 7).map((img, index) => (
          <div key={index} className="shuriken-image-container">
            <img src={img} alt={`shuriken feature ${index + 1}`} />
          </div>
        ))}

        {/* 最後のスライド: 8枚目 + お問い合わせ */}
        <div className="shuriken-last-section">
          <div className="shuriken-last-image">
            <img src={gif8} alt="shuriken feature 8" />
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
