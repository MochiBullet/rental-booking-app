import React from 'react';
import { Link } from 'react-router-dom';
import './DuringField.css';

const DuringFieldContact = () => {
  const contactInfo = {
    tel: '0575-74-3127',
    fax: '0575-74-3152',
    email: 'duringfield.k@outlook.com',
    address: '〒501-4235 岐阜県郡上市八幡町有坂266番地1',
  };

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
            <li><Link to="/during-field/works">施工実績</Link></li>
            <li><Link to="/during-field/contact" className="active">お問い合わせ</Link></li>
          </ul>
        </div>
      </nav>

      {/* ページタイトル */}
      <div className="df-page-title">
        <h1><span className="eng">Contact</span>お問い合わせ</h1>
      </div>

      {/* パンくず */}
      <ol className="df-breadcrumb">
        <li><Link to="/during-field">Home</Link></li>
        <li>お問い合わせ</li>
      </ol>

      {/* お問い合わせ */}
      <section className="df-section gray">
        <div className="df-container">
          <h2 className="df-section-title">
            <span className="eng">Contact Form</span>
            <span className="ja">お問い合わせフォーム</span>
          </h2>

          <div className="df-contact-box">
            <p className="df-contact-intro">
              お見積もり・その他お問い合わせはお気軽に下記TELまたはメールよりご連絡ください。
            </p>

            <div className="df-contact-info-box">
              <div
                className="df-tel-box"
                onClick={() => window.open(`tel:${contactInfo.tel}`, '_self')}
              >
                <p className="df-label">TEL</p>
                <p className="df-value">{contactInfo.tel}</p>
              </div>

              <div className="df-fax-box">
                <p className="df-label">FAX</p>
                <p className="df-value">{contactInfo.fax}</p>
              </div>

              <div
                className="df-email-box"
                onClick={() => window.open(`mailto:${contactInfo.email}`, '_self')}
              >
                <p className="df-label">E-mail</p>
                <p className="df-value">{contactInfo.email}</p>
              </div>
            </div>

            <p className="df-contact-notice">
              お急ぎの方はお電話にてご連絡ください。<br />
              メールでのお問い合わせは返信まで数日を要する場合がございます。ご了承ください。
            </p>
          </div>

          {/* 個人情報保護方針 */}
          <div className="df-privacy-policy">
            <h3>個人情報保護方針</h3>
            <div className="df-privacy-content">
              <p>
                株式会社 DURING FIELD（以下「当社」）は、以下のとおり個人情報保護方針を定め、
                個人情報保護の仕組みを構築し、全従業員に個人情報保護の重要性の認識と取組みを徹底させることにより、
                個人情報の保護を推進致します。
              </p>

              <h4>個人情報の管理</h4>
              <p>
                当社は、お客さまの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、
                セキュリティシステムの維持・管理体制の整備・社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。
              </p>

              <h4>個人情報の利用目的</h4>
              <p>
                お客さまからお預かりした個人情報は、当社からのご連絡や業務のご案内やご質問に対する回答として、
                電子メールや資料のご送付に利用いたします。
              </p>

              <h4>個人情報の第三者への開示・提供の禁止</h4>
              <p>
                当社は、お客さまよりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、
                個人情報を第三者に開示いたしません。
              </p>
              <ul>
                <li>お客さまの同意がある場合</li>
                <li>お客さまが希望されるサービスを行なうために当社が業務を委託する業者に対して開示する場合</li>
                <li>法令に基づき開示することが必要である場合</li>
              </ul>

              <h4>個人情報の安全対策</h4>
              <p>
                当社は、個人情報の正確性及び安全性確保のために、セキュリティに万全の対策を講じています。
              </p>

              <h4>ご本人の照会</h4>
              <p>
                お客さまがご本人の個人情報の照会・修正・削除などをご希望される場合には、
                ご本人であることを確認の上、対応させていただきます。
              </p>

              <h4>法令、規範の遵守と見直し</h4>
              <p>
                当社は、保有する個人情報に関して適用される日本の法令、その他規範を遵守するとともに、
                本ポリシーの内容を適宜見直し、その改善に努めます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="df-footer">
        <div className="df-container">
          <p className="df-footer-logo">株式会社 DURING FIELD</p>
          <p className="df-footer-address">{contactInfo.address}</p>
          <p className="df-footer-tel">TEL: {contactInfo.tel} / FAX: {contactInfo.fax}</p>
          <p className="df-copyright">&copy; 2020 株式会社 DURING FIELD.</p>
        </div>
      </footer>
    </div>
  );
};

export default DuringFieldContact;
