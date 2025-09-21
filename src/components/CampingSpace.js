import React, { useState, useEffect } from 'react';
import './CampingSpace.css';
import { siteSettingsAPI } from '../services/siteSettingsAPI';

const CampingSpace = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '096-234-0831',
    address: '〒861-4616 熊本県上益城郡甲佐町田口488-1',
    businessHours: {
      weekday: '平日: 9:00〜18:00',
      weekend: '土日祝: 9:00〜18:00'
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
      {/* ヘッダー */}
      <header className="camping-header">
        <div className="header-content">
          <h1>M's FIELD</h1>
          <div className="header-image">
            <img
              src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
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
              <div className="price">¥2,000</div>
              <p className="price-period">/ 1泊</p>
              <ul>
                <li>駐車スペース</li>
                <li>トイレ・水道利用</li>
                <li>ゴミ処理</li>
                <li>電源利用</li>
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
        <section className="access-section">
          <h2>アクセス・ご予約</h2>
          <div className="access-content">
            <div className="access-info">
              <h3>📍 所在地</h3>
              <p>{contactInfo.address}</p>
              <button
                className="map-button"
                onClick={() => {
                  const address = encodeURIComponent(contactInfo.address);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                }}
              >
                🗺️ 地図で確認
              </button>
            </div>
            <div className="reservation-info">
              <h3>📞 ご予約・お問い合わせ</h3>
              <p className="phone-number">{contactInfo.phone}</p>
              <p className="business-hours">{contactInfo.businessHours?.weekday}</p>
              <p className="business-hours">{contactInfo.businessHours?.weekend}</p>
              <button
                className="call-button"
                onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}
              >
                📱 電話をかける
              </button>
            </div>
          </div>
        </section>

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