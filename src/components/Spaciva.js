import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Spaciva.css';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import spacivaBg from '../images/spaciva-bg2.jpg';
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
      {/* ナビゲーションヘッダー */}
      <nav className="spaciva-nav">
        <div className="spaciva-nav-container">
          <Link to="/spaciva" className="spaciva-nav-logo">SPACIVA</Link>
          <ul className="spaciva-nav-menu">
            <li><Link to="/">M's BASE</Link></li>
            <li><Link to="/during-field">DURING FIELD</Link></li>
            <li><Link to="/camping-space">車中泊</Link></li>
          </ul>
        </div>
      </nav>

      {/* 流れる背景 */}
      <div
        className="spaciva-background"
        style={{
          backgroundImage: `url(${spacivaBg})`
        }}
      >
      </div>

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
              <div className="service-icon">🛁</div>
              <h3>ヘッドスパ</h3>
              <p>頭皮の血行促進とリラクゼーション</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🦷</div>
              <h3>ホワイトニング</h3>
              <p>歯の美白とオーラルケア</p>
            </div>
          </div>
        </section>

        {/* 料金セクション */}
        <section className="pricing-section">
          <h2>料金プラン</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>全身ボディケア</h3>
              <div className="price">¥4,400〜</div>
              <p className="price-period">/ 30分〜</p>
              <ul>
                <li>🌿アロマオイルリンパトリートメント</li>
              </ul>
            </div>
            <div className="pricing-card">
              <h3>ヘッドマッサージ</h3>
              <div className="price">¥4,400〜</div>
              <p className="price-period">/ 30分〜</p>
            </div>
            <div className="pricing-card">
              <h3>ハンドマッサージ</h3>
              <div className="price">¥4,400〜</div>
              <p className="price-period">/ 30分〜</p>
            </div>
            <div className="pricing-card">
              <h3>ホワイトニング</h3>
              <div className="price">¥5,500</div>
              <p className="price-period">/ 1回（30-40分程度）</p>
            </div>
          </div>
          <div className="pricing-cards">
            <div className="pricing-card featured">
              <div className="featured-badge">人気</div>
              <h3>フェイシャルエステ60分</h3>
              <div className="price">¥8,800〜</div>
              <p className="price-period">/ 60分</p>
              <ul>
                <li>🌿エイジングケア Rコース ¥13,400</li>
                <li>🌿美白ケア Aコース ¥11,000</li>
                <li>🌿リフレッシュ Uコース ¥8,800</li>
              </ul>
            </div>
            <div className="pricing-card outdoor-therapy">
              <h3>アウトドアセラピー</h3>
              <div className="price">¥4,400〜</div>
              <p className="price-period">/ 30分〜</p>
              <ul>
                <li>🌿木音-ボディケア 30分〜 ¥4,400</li>
                <li>🌿木音-ボディ＆フェイシャルケア 90分〜 ¥13,400</li>
              </ul>
            </div>
          </div>
          <div className="pricing-note">
            <p>⭐メニューの組み合わせも可能です</p>
          </div>
        </section>

        {/* アクセス・ご予約 */}
        <div className="contact-section">
          <h3 className="contact-section-title">アクセス・ご予約</h3>
          <div className="contact-info-grid">
            <div className="info-card line-card" onClick={() => window.open('https://lin.ee/mPNgeBD', '_blank')}>
              <div className="info-icon">💬</div>
              <div className="info-details">
                <h3>ご予約は公式ラインから</h3>
                <p className="contact-value line-text">LINE公式アカウント</p>
                <span className="contact-hours">24時間受付可能</span>
                <div className="click-hint">📱 タップしてLINEを開く</div>
              </div>
            </div>

            <div className="info-card instagram-card" onClick={() => window.open('https://www.instagram.com/spaciva_gujo/', '_blank')}>
              <div className="info-icon">📷</div>
              <div className="info-details">
                <h3>公式Instagram</h3>
                <p className="contact-value instagram-text">@spaciva_gujo</p>
                <span className="contact-hours">最新情報・美容情報を配信中</span>
                <div className="click-hint">📱 タップしてInstagramを開く</div>
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

          {/* 関連サービス */}
          <div className="spaciva-related-services">
            <h3 className="spaciva-related-title">関連サービス</h3>
            <div className="spaciva-related-grid">
              <div
                className="spaciva-related-card rental"
                onClick={() => window.location.href = '/#/'}
              >
                <div className="spaciva-related-icon">🚗</div>
                <div className="spaciva-related-details">
                  <h4>M's BASE Rental</h4>
                  <p>車・バイクレンタル</p>
                </div>
              </div>

              <div
                className="spaciva-related-card during-field"
                onClick={() => window.location.href = '/#/during-field'}
              >
                <div className="spaciva-related-icon">🏗️</div>
                <div className="spaciva-related-details">
                  <h4>DURING FIELD</h4>
                  <p>土木建設工事</p>
                </div>
              </div>

              <div
                className="spaciva-related-card camping"
                onClick={() => window.location.href = '/#/camping-space'}
              >
                <div className="spaciva-related-icon">🏕️</div>
                <div className="spaciva-related-details">
                  <h4>車中泊スペース</h4>
                  <p>快適な車中泊</p>
                </div>
              </div>

              <div
                className="spaciva-related-card shuriken"
                onClick={() => window.location.href = '/#/shuriken'}
              >
                <div className="spaciva-related-icon">📇</div>
                <div className="spaciva-related-details">
                  <h4>shuriken</h4>
                  <p>電子名刺</p>
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