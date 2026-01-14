import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DuringField.css';

const DuringFieldWorks = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const worksList = [
    { title: 'ボトルユニット', image: 'https://www.duringfield.com/works/01/01.jpg' },
    { title: '仮設道路(施工中)', image: 'https://www.duringfield.com/works/01/02.jpg' },
    { title: '災害復旧工事', image: 'https://www.duringfield.com/works/01.jpg' },
    { title: '災害復旧工事（護岸工）', image: 'https://www.duringfield.com/works/02.jpg' },
    { title: '松ノ木反射板工事基礎（実績）', image: 'https://www.duringfield.com/works/03.jpg' },
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
            <li><Link to="/during-field">Home</Link></li>
            <li><Link to="/during-field/company">会社概要</Link></li>
            <li><Link to="/during-field/business">事業内容</Link></li>
            <li><Link to="/during-field/works" className="active">施工実績</Link></li>
            <li><Link to="/during-field/contact">お問い合わせ</Link></li>
          </ul>
        </div>
      </nav>

      {/* ページタイトル */}
      <div className="df-page-title">
        <h1><span className="eng">Works</span>施工実績</h1>
      </div>

      {/* パンくず */}
      <ol className="df-breadcrumb">
        <li><Link to="/during-field">Home</Link></li>
        <li>施工実績</li>
      </ol>

      {/* 施工実績 */}
      <section className="df-section gray">
        <div className="df-container">
          <h2 className="df-section-title">
            <span className="eng">Works</span>
            <span className="ja">施工実績</span>
          </h2>

          <div className="df-works-notice">
            <p>安全祈願！ただいま施行中！</p>
          </div>

          <div className="df-works-main-image">
            <img src="https://www.duringfield.com/img/kigan.jpg" alt="安全祈願" />
          </div>

          <ul className="df-gallery-page">
            {worksList.map((work, index) => (
              <li key={index} onClick={() => setSelectedImage(work)}>
                <img src={work.image} alt={work.title} loading="lazy" />
                <p>{work.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 画像モーダル */}
      {selectedImage && (
        <div className="df-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="df-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="df-modal-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage.image} alt={selectedImage.title} />
            <p>{selectedImage.title}</p>
          </div>
        </div>
      )}

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

export default DuringFieldWorks;
