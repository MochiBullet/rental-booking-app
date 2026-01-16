import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CampingSpace.css';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import campBanner from '../images/canp1.png';

const CampingSpace = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '0575-74-3127',
    address: '〒501-4222 岐阜県郡上市八幡町稲成372-7',
    businessHours: {
      weekday: '平日: 9:00 - 18:00',
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
    <div className="camping-space-page">
      {/* ナビゲーションヘッダー */}
      <nav className="camp-nav">
        <div className="camp-nav-container">
          <Link to="/camping-space" className="camp-nav-logo">M's FIELD</Link>
          <ul className="camp-nav-menu">
            <li><Link to="/">M's BASE</Link></li>
            <li><Link to="/spaciva">SPACIVA</Link></li>
            <li><Link to="/during-field">DURING FIELD</Link></li>
            <li><Link to="/shuriken">Shuriken</Link></li>
          </ul>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="camping-header">
        <div className="header-content">
          <div className="header-image">
            <img
              src={campBanner}
              alt="M's FIELD キャンプ場"
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="camping-container">
        {/* 紹介セクション */}
        <section className="intro-section">
          <h2>M's BASE 車中泊スペースへようこそ</h2>
          <p>
            当施設では、車中泊をされる方々に安全で快適な駐車スペースを提供しています。
            24時間利用可能で、必要な設備を完備しております。
          </p>
        </section>

        {/* 施設情報 */}
        <section className="facilities-section">
          <h2>施設・設備</h2>
          <div className="facilities-grid">
            <div className="facility-card">
              <div className="facility-icon">🚻</div>
              <h3>トイレ完備</h3>
              <p>24時間利用可能な清潔なトイレを完備</p>
            </div>
            <div className="facility-card">
              <div className="facility-icon">🔌</div>
              <h3>電源設備</h3>
              <p>有料で電源利用可能</p>
            </div>
            <div className="facility-card">
              <div className="facility-icon">🚿</div>
              <h3>水道設備</h3>
              <p>飲料水・洗い場完備</p>
            </div>
            <div className="facility-card">
              <div className="facility-icon">🗑️</div>
              <h3>ゴミ処理</h3>
              <p>分別ゴミ箱設置</p>
            </div>
          </div>
        </section>

        {/* 料金セクション */}
        <section className="pricing-section">
          <h2>ご利用料金</h2>
          <div className="pricing-single">
            <div className="pricing-card featured">
              <h3>車中泊プラン</h3>
              <div className="price">¥4,000</div>
              <p className="price-period">/ 1泊</p>
              <p className="price-description">1ブースあたり5名まで。6名以上の場合は1名あたり500円追加料金をいただきます。</p>
              <div className="power-pricing">電源利用料金: ¥1,000</div>
              <ul>
                <li>駐車スペース</li>
                <li>トイレ・水道利用</li>
                <li>ゴミ処理</li>
                <li>電源利用（別途料金）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 利用規約 */}
        <section className="rules-section">
          <h2>ご利用にあたってのお願い</h2>
          <div className="rules-grid">
            <div className="rule-item">
              <span className="rule-icon">🔇</span>
              <p>夜間（22:00〜7:00）は静かにお過ごしください</p>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🚭</span>
              <p>指定場所以外での喫煙はご遠慮ください</p>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🔥</span>
              <p>火気の使用は指定エリアのみ</p>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🗑️</span>
              <p>ゴミは分別してお捨てください</p>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🚗</span>
              <p>エンジンのかけっぱなしはご遠慮ください</p>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🏕️</span>
              <p>テント・タープの設置は事前にご相談ください</p>
            </div>
          </div>
        </section>

        {/* アクセス情報 */}
        <div className="contact-section">
          <h3 className="contact-section-title">アクセス・ご予約</h3>
          <div className="contact-info-grid">
            <div className="info-card phone-card" onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}>
              <div className="info-icon">📞</div>
              <div className="info-details">
                <h3>お電話でのお問い合わせ</h3>
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

        {/* 周辺情報 */}
        <section className="nearby-section">
          <h2>周辺施設</h2>
          <div className="nearby-grid">
            <div className="nearby-item">
              <span className="nearby-icon">🏪</span>
              <h4>コンビニ</h4>
              <p>車で3分</p>
            </div>
            <div className="nearby-item">
              <span className="nearby-icon">♨️</span>
              <h4>温泉施設</h4>
              <p>車で10分</p>
            </div>
            <div className="nearby-item">
              <span className="nearby-icon">🍜</span>
              <h4>飲食店</h4>
              <p>徒歩圏内</p>
            </div>
            <div className="nearby-item">
              <span className="nearby-icon">⛽</span>
              <h4>ガソリンスタンド</h4>
              <p>車で5分</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CampingSpace;