import React, { useState, useEffect } from 'react';
import './Spaciva.css';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import spacivaBg from '../images/spaciva-bg.jpg';
import spacivaLogo from '../images/spaciva-logo.png';

const Spaciva = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '0575-74-3127',
    address: '〒501-4222 岐阜県郡上市八幡町稲成372-7',
    businessHours: {
      weekday: '平日: 10:00 - 20:00',
      weekend: '土日祝: 10:00 - 18:00'
    }
  });

  useEffect(() => {
    // DBから連絡先情報を取得
    const loadContactInfo = async () => {
      try {
        const settings = await siteSettingsAPI.getSettings();
        if (settings && settings.contact) {
          setContactInfo(settings.contact);
        }
      } catch (error) {
        console.error('連絡先情報の取得エラー:', error);
        // エラーの場合はデフォルト値を使用
      }
    };
    loadContactInfo();
  }, []);

  return (
    <div className="spaciva-page">
      {/* 流れる背景 */}
      <div
        className="spaciva-background"
        style={{
          backgroundImage: `url(${spacivaBg})`
        }}
      >
      </div>

      {/* ヘッダー */}
      <header className="spaciva-header">
        <div className="header-content">
          <img src={spacivaLogo} alt="SPACIVA エステティックサロン スパシーバ" className="spaciva-logo" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="spaciva-container">
        {/* 紹介セクション */}
        <section className="intro-section">
          <h2>SPACIVAへようこそ</h2>
          <p>
            最新の美容技術と心からの癒しをお届けする、プレミアムエステサロンです。
            お客様一人ひとりの美しさを引き出し、内面から輝く笑顔をサポートいたします。
          </p>
        </section>

        {/* サービスメニュー */}
        <section className="services-section">
          <h2>サービスメニュー</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">✨</div>
              <h3>フェイシャルケア</h3>
              <p>最新技術による美肌トリートメント</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌸</div>
              <h3>ボディケア</h3>
              <p>全身リラクゼーション＆美容ケア</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>ネイルケア</h3>
              <p>美しい指先を演出するネイルアート</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🧴</div>
              <h3>ヘアケア</h3>
              <p>髪質改善トリートメント</p>
            </div>
          </div>
        </section>

        {/* 料金セクション */}
        <section className="pricing-section">
          <h2>料金プラン</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>全身ボディケア</h3>
              <div className="price">¥3,300〜</div>
              <p className="price-period">/ 30分〜</p>
              <ul>
                <li>🌿アロマオイルリンパトリートメント</li>
              </ul>
            </div>
            <div className="pricing-card">
              <h3>ヘッドマッサージ</h3>
              <div className="price">¥3,300〜</div>
              <p className="price-period">/ 30分〜</p>
            </div>
            <div className="pricing-card featured">
              <div className="featured-badge">人気</div>
              <h3>フェイシャルエステ</h3>
              <div className="price">¥6,600〜</div>
              <p className="price-period">/ 60分</p>
              <ul>
                <li>🌿エイジングケア Rコース ¥8,800</li>
                <li>🌿美白ケア Aコース ¥7,700</li>
                <li>🌿リフレッシュ Uコース ¥6,600</li>
              </ul>
            </div>
          </div>
          <div className="pricing-cards">
            <div className="pricing-card outdoor-therapy">
              <h3>アウトドアセラピー</h3>
              <div className="price">¥3,300〜</div>
              <p className="price-period">木音-ボディケア / 30分〜</p>
              <ul>
                <li>🌿木音-ボディケア 30分〜 ¥3,300</li>
                <li>🌿木音-ボディ＆フェイシャルケア 90分〜 ¥9,900〜</li>
              </ul>
            </div>
          </div>
        </section>

        {/* アクセス・ご予約 */}
        <div className="contact-section">
          <h3 className="contact-section-title">アクセス・ご予約</h3>
          <div className="contact-info-grid">
            <div className="info-card phone-card" onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}>
              <div className="info-icon">📞</div>
              <div className="info-details">
                <h3>お電話でのご予約</h3>
                <p className="contact-value phone-number">{contactInfo.phone}</p>
                <span className="contact-hours">{contactInfo.businessHours?.weekday}</span>
                <span className="contact-hours">{contactInfo.businessHours?.weekend}</span>
                <div className="click-hint">📱 タップして発信</div>
              </div>
            </div>

            <div className="info-card location-card">
              <div className="info-icon">📍</div>
              <div className="info-details">
                <h3>所在地</h3>
                <p className="contact-value address-text">{contactInfo.address}</p>
                <div className="map-actions">
                  <button
                    className="map-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const address = encodeURIComponent(contactInfo.address);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                    }}
                  >
                    🗺️ 地図で見る
                  </button>
                  <button
                    className="map-button route-button"
                    onClick={(e) => {
                      e.stopPropagation();
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

export default Spaciva;