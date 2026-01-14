import React from 'react';
import { Link } from 'react-router-dom';
import './DuringField.css';

const DuringFieldBusiness = () => {
  const businessList = [
    { num: '01', title: '高速道路関連/道路工事/土工事' },
    { num: '02', title: '宅地・造成工事/擁壁工事　他' },
    { num: '03', title: 'ハイウェイメンテナンス' },
    { num: '04', title: '災害復旧工事/護岸工事' },
    { num: '05', title: 'その他' },
  ];

  return (
    <div className="during-field-page">
      {/* ナビゲーション */}
      <nav className="df-nav">
        <div className="df-nav-container">
          <Link to="/during-field" className="df-nav-logo">DURING FIELD</Link>
          <ul className="df-nav-menu">
            <li><Link to="/during-field">Home</Link></li>
            <li><Link to="/during-field/company">会社概要</Link></li>
            <li><Link to="/during-field/business" className="active">事業内容</Link></li>
            <li><Link to="/during-field/works">施工実績</Link></li>
            <li><Link to="/during-field/contact">お問い合わせ</Link></li>
          </ul>
        </div>
      </nav>

      {/* ページタイトル */}
      <div className="df-page-title">
        <h1><span className="eng">Business</span>事業内容</h1>
      </div>

      {/* パンくず */}
      <ol className="df-breadcrumb">
        <li><Link to="/during-field">Home</Link></li>
        <li>事業内容</li>
      </ol>

      {/* 事業内容 */}
      <section className="df-section gray">
        <div className="df-container">
          <h2 className="df-section-title">
            <span className="eng">Business</span>
            <span className="ja">事業内容</span>
          </h2>
          <div className="df-business-content">
            <div className="df-business-image">
              <img src="https://www.duringfield.com/img/business01.jpg" alt="事業内容" />
            </div>
            <div className="df-business-detail">
              <ul className="df-business-list-page">
                {businessList.map((item, index) => (
                  <li key={index}>
                    <span className="df-business-num">{item.num}</span>
                    <p>{item.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="df-footer">
        <div className="df-container">
          <p className="df-footer-logo">株式会社 DURING FIELD</p>
          <p className="df-footer-address">〒501-4235 岐阜県郡上市八幡町有坂266番地1</p>
          <p className="df-footer-tel">TEL: 0575-74-3127 / FAX: 0575-74-3152</p>
          <p className="df-copyright">&copy; 2020 株式会社 DURING FIELD.</p>
        </div>
      </footer>
    </div>
  );
};

export default DuringFieldBusiness;
