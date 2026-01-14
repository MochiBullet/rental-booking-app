import React from 'react';
import { Link } from 'react-router-dom';
import './DuringField.css';

const DuringFieldCompany = () => {
  const companyInfo = {
    name: '株式会社 DURING FIELD',
    representative: '加納　浩二　Kanou Kouji',
    established: '令和2年4月',
    address: '〒501-4235 岐阜県郡上市八幡町有坂266番地1',
    tel: '0575-74-3127',
    fax: '0575-74-3152',
    business: '建設業',
    capital: '500万円',
  };

  const history = [
    { year: '平成5年', event: '中野建設　加納武雄により創業' },
    { year: '令和2年', event: '法人化' },
  ];

  return (
    <div className="during-field-page">
      {/* ナビゲーション */}
      <nav className="df-nav">
        <div className="df-nav-container">
          <Link to="/during-field" className="df-nav-logo">DURING FIELD</Link>
          <ul className="df-nav-menu">
            <li><Link to="/during-field">Home</Link></li>
            <li><Link to="/during-field/company" className="active">会社概要</Link></li>
            <li><Link to="/during-field/business">事業内容</Link></li>
            <li><Link to="/during-field/works">施工実績</Link></li>
            <li><Link to="/during-field/contact">お問い合わせ</Link></li>
          </ul>
        </div>
      </nav>

      {/* ページタイトル */}
      <div className="df-page-title">
        <h1><span className="eng">Company</span>会社概要</h1>
      </div>

      {/* パンくず */}
      <ol className="df-breadcrumb">
        <li><Link to="/during-field">Home</Link></li>
        <li>会社概要</li>
      </ol>

      {/* 企業理念 */}
      <section className="df-section">
        <div className="df-container">
          <h2 className="df-section-title">
            <span className="eng">Policy</span>
            <span className="ja">企業理念</span>
          </h2>
          <p className="df-policy-text">
            人と人との繋がりを大切にし、<br />
            人と共に成長・発展を目指す
          </p>
        </div>
      </section>

      {/* 社長挨拶 */}
      <section className="df-section gray">
        <div className="df-container">
          <h3 className="df-subtitle">社長挨拶</h3>
          <div className="df-greeting-box">
            <p>
              私の父の代から建設業を家業にし、交通インフラを中心に皆様の暮らしを支えるために邁進してまいりました。
              令和2年に二代目である私が代表となり新たに「株式会社 DURING FIELD」として法人を設立いたしましました。
            </p>
            <p>
              今後も安全誠実な現場作業に努めていき、弊社スタッフと共に成長し発展をしたいと考えております。
            </p>
            <p>
              長い見通しが立てにくい不透明な時代ですが、今後も顧客の皆さま、社員とそのご家族、地域の皆さまという
              人と人の繋がりを大切に、地域の発展のために尽力いたしますので、どうぞよろしくお願いいたします。
            </p>
          </div>
        </div>
      </section>

      {/* 会社概要 */}
      <section className="df-section">
        <div className="df-container">
          <h2 className="df-section-title">
            <span className="eng">Company Info</span>
            <span className="ja">会社概要</span>
          </h2>
          <div className="df-info-grid">
            <div className="df-info-table-wrapper">
              <table className="df-info-table">
                <tbody>
                  <tr><th>社名</th><td>{companyInfo.name}</td></tr>
                  <tr><th>代表</th><td>{companyInfo.representative}</td></tr>
                  <tr><th>設立</th><td>{companyInfo.established}</td></tr>
                  <tr><th>所在地</th><td>{companyInfo.address}</td></tr>
                  <tr><th>TEL</th><td>{companyInfo.tel}</td></tr>
                  <tr><th>FAX</th><td>{companyInfo.fax}</td></tr>
                  <tr><th>業種</th><td>{companyInfo.business}</td></tr>
                  <tr><th>資本金</th><td>{companyInfo.capital}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="df-history-wrapper">
              <h3 className="df-subtitle">会社沿革</h3>
              <table className="df-history-table">
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index}>
                      <th>{item.year}</th>
                      <td>{item.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* アクセスマップ */}
      <section className="df-section gray">
        <div className="df-container">
          <h2 className="df-section-title">
            <span className="eng">Access Map</span>
            <span className="ja">アクセスマップ</span>
          </h2>
          <div className="df-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3237.525163133299!2d136.93579161526114!3d35.76247408017539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6002f10198dfd867%3A0x495b72fa63a0257e!2z44CSNTAxLTQyMzUg5bKQ6Zic55yM6YOh5LiK5biC5YWr5bmh55S65pyJ5Z2C77yS77yW77yW4oiS77yR!5e0!3m2!1sja!2sjp!4v1599029198920!5m2!1sja!2sjp"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="DURING FIELD 所在地"
            ></iframe>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="df-footer">
        <div className="df-container">
          <p className="df-footer-logo">株式会社 DURING FIELD</p>
          <p className="df-footer-address">{companyInfo.address}</p>
          <p className="df-footer-tel">TEL: {companyInfo.tel} / FAX: {companyInfo.fax}</p>
          <p className="df-copyright">&copy; 2020 株式会社 DURING FIELD.</p>
        </div>
      </footer>
    </div>
  );
};

export default DuringFieldCompany;
