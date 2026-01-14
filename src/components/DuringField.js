import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DuringField.css';

const DuringField = () => {
  const [contactInfo] = useState({
    phone: '0575-74-3127',
    fax: '0575-74-3152',
    address: '〒501-4235 岐阜県郡上市八幡町有坂266番地1',
  });

  // 事業内容リスト
  const businessList = [
    { num: '01', title: '高速道路関連/道路工事/土工事' },
    { num: '02', title: '宅地・造成工事/擁壁工事　他' },
    { num: '03', title: 'ハイウェイメンテナンス' },
    { num: '04', title: '災害復旧工事/護岸工事' },
    { num: '05', title: 'その他' },
  ];

  // 施工実績リスト
  const worksList = [
    { title: '災害復旧工事', image: 'https://www.duringfield.com/works/01.jpg' },
    { title: '災害復旧工事（護岸工）', image: 'https://www.duringfield.com/works/02.jpg' },
    { title: '松ノ木反射板工事基礎', image: 'https://www.duringfield.com/works/03.jpg' },
    { title: '谷止工', image: 'https://www.duringfield.com/works/04.jpg' },
    { title: '標高1300m（松ノ木反射板工事）', image: 'https://www.duringfield.com/works/05.jpg' },
    { title: '林道復旧工', image: 'https://www.duringfield.com/works/06.jpg' },
  ];

  return (
    <div className="during-field-page">
      {/* ナビゲーション */}
      <nav className="df-nav">
        <div className="df-nav-container">
          <Link to="/during-field" className="df-nav-logo">DURING FIELD</Link>
          <ul className="df-nav-menu">
            <li><Link to="/during-field" className="active">Home</Link></li>
            <li><Link to="/during-field/company">会社概要</Link></li>
            <li><Link to="/during-field/business">事業内容</Link></li>
            <li><Link to="/during-field/works">施工実績</Link></li>
            <li><Link to="/during-field/contact">お問い合わせ</Link></li>
          </ul>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="df-hero">
        <div className="df-hero-overlay"></div>
        <div className="df-hero-content">
          <h1 className="df-company-name">株式会社 DURING FIELD</h1>
          <p className="df-catchphrase">
            地域に根ざし、人と人とのつながりを大切に<br />
            人々の豊かな暮らしを支えていきます
          </p>
        </div>
      </section>

      {/* ご挨拶セクション */}
      <section className="df-greeting">
        <div className="df-container">
          <p className="df-company-lead">DURING FIELD <span>Co., Ltd.</span></p>
          <div className="df-greeting-content">
            <div className="df-greeting-image">
              <img src="https://www.duringfield.com/img/top-img01.jpg" alt="DURING FIELD" />
            </div>
            <div className="df-greeting-text">
              <h2 className="df-section-title">
                <span className="eng">Greeting</span>
                <span className="ja">ご挨拶</span>
              </h2>
              <p>
                株式会社 DURING FIELDのホームページをご覧いただきましてありがとうございます！
              </p>
              <p>
                私たちは、各種造成工事・護岸工事・災害復旧工事、道路の建設・修繕工事などの土木工事全般を取り扱っております。
              </p>
              <p>
                皆さまの快適で安心・安全な暮らしを守ってまいります。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 事業内容セクション */}
      <section className="df-business">
        <div className="df-container">
          <h2 className="df-section-title white">
            <span className="eng">Business</span>
            <span className="ja">事業内容</span>
          </h2>
          <ul className="df-business-list">
            {businessList.map((item, index) => (
              <li key={index}>
                <span className="df-business-num">{item.num}</span>
                <p>{item.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 施工実績セクション */}
      <section className="df-works">
        <div className="df-container">
          <h2 className="df-section-title white">
            <span className="eng">Works</span>
            <span className="ja">施工実績</span>
          </h2>
          <ul className="df-gallery">
            {worksList.map((work, index) => (
              <li key={index}>
                <img src={work.image} alt={work.title} loading="lazy" />
                <p>{work.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section className="df-contact">
        <div className="df-container">
          <h2 className="df-section-title white">
            <span className="eng">Contact</span>
            <span className="ja">お問い合わせ</span>
          </h2>
          <p className="df-contact-lead">
            お見積もり・その他お問い合わせなど<br />
            お気軽にご連絡ください
          </p>

          <div className="df-contact-grid">
            <div className="df-contact-card phone" onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}>
              <div className="df-contact-icon">📞</div>
              <div className="df-contact-details">
                <h3>お電話でのお問い合わせ</h3>
                <p className="df-contact-value">{contactInfo.phone}</p>
                <span className="df-contact-sub">FAX: {contactInfo.fax}</span>
                <div className="df-click-hint">タップして発信</div>
              </div>
            </div>

            <div
              className="df-contact-card address"
              onClick={() => {
                const address = encodeURIComponent(contactInfo.address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
              }}
            >
              <div className="df-contact-icon">📍</div>
              <div className="df-contact-details">
                <h3>所在地</h3>
                <p className="df-contact-value address-text">{contactInfo.address}</p>
                <div className="df-click-hint">地図で見る</div>
              </div>
            </div>
          </div>

          {/* 関連サービスタイル */}
          <div className="df-related-services">
            <h3 className="df-related-title">関連サービス</h3>
            <div className="df-related-grid">
              <div
                className="df-related-card rental"
                onClick={() => window.location.href = '/#/'}
              >
                <div className="df-related-icon">🚗</div>
                <div className="df-related-details">
                  <h4>M's BASE Rental</h4>
                  <p>車・バイクレンタル</p>
                  <div className="df-click-hint">詳細を見る →</div>
                </div>
              </div>

              <div
                className="df-related-card spaciva"
                onClick={() => window.location.href = '/#/spaciva'}
              >
                <div className="df-related-icon">💆‍♀️</div>
                <div className="df-related-details">
                  <h4>SPACIVA</h4>
                  <p>美容と癒しのエステサロン</p>
                  <div className="df-click-hint">詳細を見る →</div>
                </div>
              </div>

              <div
                className="df-related-card camping"
                onClick={() => window.location.href = '/#/camping-space'}
              >
                <div className="df-related-icon">🏕️</div>
                <div className="df-related-details">
                  <h4>車中泊スペース</h4>
                  <p>快適な車中泊をサポート</p>
                  <div className="df-click-hint">詳細を見る →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="df-footer">
        <div className="df-container">
          <p className="df-footer-logo">株式会社 DURING FIELD</p>
          <p className="df-footer-address">{contactInfo.address}</p>
          <p className="df-footer-tel">TEL: {contactInfo.phone} / FAX: {contactInfo.fax}</p>
          <p className="df-copyright">&copy; 2020 株式会社 DURING FIELD.</p>
        </div>
      </footer>
    </div>
  );
};

export default DuringField;
