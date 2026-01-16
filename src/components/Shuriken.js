import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Shuriken.css';

// PC用画像インポート
import gif1 from '../images/shuriken/1.gif';
import gif2 from '../images/shuriken/2.gif';
import gif3 from '../images/shuriken/3.gif';
import gif4 from '../images/shuriken/4.gif';
import gif5 from '../images/shuriken/5.gif';
import gif6 from '../images/shuriken/6.gif';
import gif7 from '../images/shuriken/7.gif';
import gif8 from '../images/shuriken/8.gif';

// モバイル用画像インポート
import m1 from '../images/shuriken/m1.jpg';
import m2 from '../images/shuriken/m2.jpg';
import m3 from '../images/shuriken/m3.jpg';
import m4 from '../images/shuriken/m4.jpg';
import m5 from '../images/shuriken/m5.jpg';
import m6 from '../images/shuriken/m6.jpg';

// ローディング用ロゴ
import shurikenLogo from '../images/shuriken/logo.png';

const Shuriken = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: ''
  });

  // 見積もりBOT用のstate
  const [botAnswers, setBotAnswers] = useState({
    hasData: null,      // データあり/なし
    needDesign: null,   // デザイン相談する/しない
    printType: null,    // 印刷タイプ
    backPrint: null     // 裏面印刷
  });

  useEffect(() => {
    // 1秒後にローディング終了
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // タイル選択の処理
  const handleSelect = (key, value) => {
    setBotAnswers(prev => {
      const newAnswers = { ...prev, [key]: value };

      // ロゴのみを選択した場合、裏面印刷を「なし」に自動設定
      if (key === 'printType' && (value === 'ロゴのみ（白カード）' || value === 'ロゴのみ（黒カード）')) {
        newAnswers.backPrint = 'なし';
      }

      // カラー印刷または白印刷を選択した場合、シルバー・ゴールドが選択されていたらリセット
      if (key === 'printType' && (value === 'カラー印刷（白カード）' || value === '白印刷（入稿）')) {
        if (prev.backPrint === 'シルバー・ゴールド') {
          newAnswers.backPrint = null;
        }
      }

      // 黒カードを選択した場合、カラーが選択されていたらリセット
      if (key === 'printType' && (value === 'ロゴのみ（黒カード）' || value === 'シルバー・ゴールド（黒カード）')) {
        if (prev.backPrint === 'カラー') {
          newAnswers.backPrint = null;
        }
      }

      return newAnswers;
    });
  };

  // ロゴのみかどうか判定
  const isLogoOnly = botAnswers.printType === 'ロゴのみ（白カード）' || botAnswers.printType === 'ロゴのみ（黒カード）';

  // カラー・白印刷かどうか判定（シルバー・ゴールド裏面不可）
  const isColorOrWhitePrint = botAnswers.printType === 'カラー印刷（白カード）' || botAnswers.printType === '白印刷（入稿）';

  // 黒カードかどうか判定（カラー裏面不可）
  const isBlackCard = botAnswers.printType === 'ロゴのみ（黒カード）' || botAnswers.printType === 'シルバー・ゴールド（黒カード）';

  // 価格計算
  const calculatePrice = () => {
    let total = 0;
    let breakdown = [];

    // データ料金
    if (botAnswers.hasData === 'ない') {
      total += 1000;
      breakdown.push('データ作成: ¥1,000');
    } else if (botAnswers.hasData === 'ある') {
      breakdown.push('データ作成: ¥0');
    }

    // デザイン相談料金
    if (botAnswers.needDesign === 'はい') {
      total += 3000;
      breakdown.push('デザイン相談: ¥3,000～');
    } else if (botAnswers.needDesign === 'いいえ') {
      breakdown.push('デザイン相談: ¥0');
    }

    // 印刷タイプ料金
    const printPrices = {
      'ロゴのみ（白カード）': 3500,
      'ロゴのみ（黒カード）': 4000,
      'カラー印刷（白カード）': 5500,
      '白印刷（入稿）': 5500,
      'シルバー・ゴールド（白カード）': 10000,
      'シルバー・ゴールド（黒カード）': 10500
    };
    if (botAnswers.printType && printPrices[botAnswers.printType]) {
      total += printPrices[botAnswers.printType];
      breakdown.push(`印刷: ¥${printPrices[botAnswers.printType].toLocaleString()}`);
    }

    // 裏面印刷料金
    const backPrices = {
      'なし': 0,
      '白黒単色': 1000,
      'カラー': 2000,
      'シルバー・ゴールド': 3000
    };
    if (botAnswers.backPrint && backPrices[botAnswers.backPrint] !== undefined) {
      total += backPrices[botAnswers.backPrint];
      breakdown.push(`裏面印刷: ¥${backPrices[botAnswers.backPrint].toLocaleString()}`);
    }

    return { total, breakdown, hasDesignConsult: botAnswers.needDesign === 'はい' };
  };

  // 送信ボタン押下時（連絡先入力ポップアップを表示）
  const handleSubmit = () => {
    setShowContactForm(true);
  };

  // 最終送信処理（スプシ連携用）
  const handleFinalSubmit = () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('お名前とメールアドレスを入力してください');
      return;
    }

    const priceInfo = calculatePrice();
    const data = {
      name: contactInfo.name,
      email: contactInfo.email,
      hasData: botAnswers.hasData,
      needDesign: botAnswers.needDesign,
      printType: botAnswers.printType,
      backPrint: botAnswers.backPrint,
      estimatedPrice: priceInfo.total
    };

    // Google Spreadsheetに送信（Image方式でCORS回避）
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzUgt6asH3gy8V_HPEwTkGB6b1_dtCANrpdEMeJSXxDU6_HerUE3kL4zoCE6YA3XOZgg/exec';

    const params = new URLSearchParams({
      name: data.name,
      email: data.email,
      hasData: data.hasData,
      needDesign: data.needDesign,
      printType: data.printType,
      backPrint: data.backPrint,
      estimatedPrice: data.estimatedPrice
    });

    const img = new Image();
    img.src = `${GAS_URL}?${params.toString()}`;

    alert('お問い合わせありがとうございます！\n担当者より折り返しご連絡いたします。');

    // リセット
    setShowContactForm(false);
    setIsBotOpen(false);
    setBotAnswers({ hasData: null, needDesign: null, printType: null, backPrint: null });
    setContactInfo({ name: '', email: '' });
  };

  // 全て選択されているか
  const isComplete = botAnswers.hasData && botAnswers.needDesign && botAnswers.printType && botAnswers.backPrint;
  const priceInfo = calculatePrice();
  // PC用とモバイル用の画像ペア（モバイル用がない場合はPC用を使用）
  const images = [
    { pc: gif1, mobile: m1 },
    { pc: gif2, mobile: m2 },
    { pc: gif3, mobile: m3 },
    { pc: gif4, mobile: m4 },
    { pc: gif5, mobile: m5 },
    { pc: gif6, mobile: m6 },
    { pc: gif7, mobile: gif7 },  // モバイル用なし
    { pc: gif8, mobile: gif8 },  // モバイル用なし
  ];

  const shopInfo = {
    phone: '0575-74-3127',
    address: '〒501-4222 岐阜県郡上市八幡町稲成372-7',
  };

  // ローディング画面
  if (isLoading) {
    return (
      <div className="shuriken-loading">
        <img src={shurikenLogo} alt="shuriken" className="shuriken-loading-logo" />
      </div>
    );
  }

  return (
    <div className="shuriken-page">
      {/* ナビゲーションヘッダー */}
      <nav className="shuriken-nav">
        <div className="shuriken-nav-container">
          <Link to="/shuriken" className="shuriken-nav-logo">shuriken</Link>
          <ul className="shuriken-nav-menu">
            <li><Link to="/">M's BASE</Link></li>
            <li><Link to="/spaciva">SPACIVA</Link></li>
            <li><Link to="/during-field">DURING FIELD</Link></li>
            <li><Link to="/camping-space">車中泊</Link></li>
          </ul>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="shuriken-content">
        {/* 1-6枚目: PC・モバイル両方表示 */}
        {images.slice(0, 6).map((img, index) => (
          <div key={index} className="shuriken-image-container">
            <picture>
              <source media="(max-width: 768px)" srcSet={img.mobile} />
              <img src={img.pc} alt={`shuriken feature ${index + 1}`} />
            </picture>
          </div>
        ))}

        {/* 7枚目: PCのみ表示 */}
        <div className="shuriken-image-container desktop-only">
          <img src={gif7} alt="shuriken feature 7" />
        </div>

        {/* 最後のスライド: 8枚目（PCのみ） + お問い合わせ */}
        <div className="shuriken-last-section">
          <div className="shuriken-last-image desktop-only">
            <img src={gif8} alt="shuriken feature 8" />
          </div>

          <h2 className="shuriken-contact-title">お問い合わせ</h2>
          <div className="shuriken-contact-grid">
            <div
              className="shuriken-contact-card phone"
              onClick={() => window.open(`tel:${shopInfo.phone}`, '_self')}
            >
              <div className="shuriken-contact-icon">📞</div>
              <div className="shuriken-contact-details">
                <h3>お電話</h3>
                <p className="shuriken-contact-value">{shopInfo.phone}</p>
                <div className="shuriken-click-hint">タップして発信</div>
              </div>
            </div>

            <div className="shuriken-contact-card location">
              <div className="shuriken-contact-icon">📍</div>
              <div className="shuriken-contact-details">
                <h3>所在地</h3>
                <p className="shuriken-contact-value">{shopInfo.address}</p>
                <div className="shuriken-map-actions">
                  <button
                    className="shuriken-map-button"
                    onClick={() => {
                      const address = encodeURIComponent(shopInfo.address);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                    }}
                  >
                    🗺️ 地図で見る
                  </button>
                  <button
                    className="shuriken-map-button route"
                    onClick={() => {
                      const address = encodeURIComponent(shopInfo.address);
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

      {/* フローティング見積もりBOT */}
      <div className={`shuriken-floating-bot ${isBotOpen ? 'open' : ''}`}>
        {/* フローティングボタン */}
        <button
          className="shuriken-floating-btn"
          onClick={() => setIsBotOpen(!isBotOpen)}
        >
          {isBotOpen ? (
            <span className="close-icon">✕</span>
          ) : (
            <>
              <img src={shurikenLogo} alt="" className="floating-logo" />
              <span className="floating-text">かんたん見積もり</span>
            </>
          )}
        </button>

        {/* BOTパネル */}
        {isBotOpen && (
          <div className="shuriken-bot-panel">
            <div className="shuriken-bot-panel-content">
              <h2 className="shuriken-bot-title">かんたん見積もり</h2>

              {/* 質問1: データの有無 */}
              <div className="shuriken-bot-question">
                <h3>① 名刺のデータはありますか？</h3>
                <div className="shuriken-bot-tiles">
                  <button
                    className={`shuriken-bot-tile ${botAnswers.hasData === 'ある' ? 'selected' : ''}`}
                    onClick={() => handleSelect('hasData', 'ある')}
                  >
                    ある<span className="tile-price">¥0</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.hasData === 'ない' ? 'selected' : ''}`}
                    onClick={() => handleSelect('hasData', 'ない')}
                  >
                    ない<span className="tile-price">¥1,000</span>
                  </button>
                </div>
              </div>

              {/* 質問2: デザイン相談 */}
              <div className="shuriken-bot-question">
                <h3>② 新規でデザインを相談しますか？</h3>
                <div className="shuriken-bot-tiles">
                  <button
                    className={`shuriken-bot-tile ${botAnswers.needDesign === 'はい' ? 'selected' : ''}`}
                    onClick={() => handleSelect('needDesign', 'はい')}
                  >
                    はい<span className="tile-price">¥3,000～</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.needDesign === 'いいえ' ? 'selected' : ''}`}
                    onClick={() => handleSelect('needDesign', 'いいえ')}
                  >
                    いいえ<span className="tile-price">¥0</span>
                  </button>
                </div>
              </div>

              {/* 質問3: 印刷タイプ */}
              <div className="shuriken-bot-question">
                <h3>③ どんな印刷にしますか？</h3>
                <div className="shuriken-bot-tiles print-options">
                  <button
                    className={`shuriken-bot-tile ${botAnswers.printType === 'ロゴのみ（白カード）' ? 'selected' : ''}`}
                    onClick={() => handleSelect('printType', 'ロゴのみ（白カード）')}
                  >
                    shurikenロゴのみ<br />（白カード）<span className="tile-price">¥3,500</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.printType === 'ロゴのみ（黒カード）' ? 'selected' : ''}`}
                    onClick={() => handleSelect('printType', 'ロゴのみ（黒カード）')}
                  >
                    shurikenロゴのみ<br />（黒カード）<span className="tile-price">¥4,000</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.printType === 'カラー印刷（白カード）' ? 'selected' : ''}`}
                    onClick={() => handleSelect('printType', 'カラー印刷（白カード）')}
                  >
                    カラー印刷<br />（白カードのみ）<span className="tile-price">¥5,500</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.printType === '白印刷（入稿）' ? 'selected' : ''}`}
                    onClick={() => handleSelect('printType', '白印刷（入稿）')}
                  >
                    白印刷<br />（入稿）<span className="tile-price">¥5,500</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.printType === 'シルバー・ゴールド（白カード）' ? 'selected' : ''}`}
                    onClick={() => handleSelect('printType', 'シルバー・ゴールド（白カード）')}
                  >
                    シルバー・ゴールド<br />（白カード）<span className="tile-price">¥10,000</span>
                  </button>
                  <button
                    className={`shuriken-bot-tile ${botAnswers.printType === 'シルバー・ゴールド（黒カード）' ? 'selected' : ''}`}
                    onClick={() => handleSelect('printType', 'シルバー・ゴールド（黒カード）')}
                  >
                    シルバー・ゴールド<br />（黒カード）<span className="tile-price">¥10,500</span>
                  </button>
                </div>
              </div>

              {/* 質問4: 裏面印刷 */}
              <div className="shuriken-bot-question">
                <h3>④ 裏面も印刷しますか？</h3>
                {isLogoOnly ? (
                  <div className="shuriken-bot-disabled-message">
                    ※ロゴのみの場合、裏面印刷はできません
                  </div>
                ) : (
                  <div className="shuriken-bot-tiles back-print-options">
                    <button
                      className={`shuriken-bot-tile ${botAnswers.backPrint === 'なし' ? 'selected' : ''}`}
                      onClick={() => handleSelect('backPrint', 'なし')}
                    >
                      なし<span className="tile-price">¥0</span>
                    </button>
                    <button
                      className={`shuriken-bot-tile ${botAnswers.backPrint === '白黒単色' ? 'selected' : ''}`}
                      onClick={() => handleSelect('backPrint', '白黒単色')}
                    >
                      白黒単色<span className="tile-price">+¥1,000</span>
                    </button>
                    {!isBlackCard && (
                      <button
                        className={`shuriken-bot-tile ${botAnswers.backPrint === 'カラー' ? 'selected' : ''}`}
                        onClick={() => handleSelect('backPrint', 'カラー')}
                      >
                        カラー<span className="tile-price">+¥2,000</span>
                      </button>
                    )}
                    {!isColorOrWhitePrint && !isBlackCard && (
                      <button
                        className={`shuriken-bot-tile ${botAnswers.backPrint === 'シルバー・ゴールド' ? 'selected' : ''}`}
                        onClick={() => handleSelect('backPrint', 'シルバー・ゴールド')}
                      >
                        シルバー・ゴールド<span className="tile-price">+¥3,000</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 概算表示 */}
              {(botAnswers.hasData || botAnswers.needDesign || botAnswers.printType || botAnswers.backPrint) && (
                <div className="shuriken-bot-estimate">
                  <h3>概算金額</h3>
                  <div className="estimate-breakdown">
                    {priceInfo.breakdown.map((item, index) => (
                      <div key={index} className="estimate-item">{item}</div>
                    ))}
                  </div>
                  <div className="estimate-total">
                    合計: ¥{priceInfo.total.toLocaleString()}{priceInfo.hasDesignConsult && '～'}
                  </div>
                </div>
              )}

              {/* 送信ボタン */}
              <button
                className={`shuriken-bot-submit ${isComplete ? 'active' : ''}`}
                onClick={handleSubmit}
                disabled={!isComplete}
              >
                お問い合わせを送信
              </button>

              {/* キャンセルボタン */}
              <button
                className="shuriken-bot-cancel"
                onClick={() => setIsBotOpen(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 連絡先入力ポップアップ */}
      {showContactForm && (
        <div className="shuriken-contact-overlay" onClick={() => setShowContactForm(false)}>
          <div className="shuriken-contact-popup" onClick={(e) => e.stopPropagation()}>
            <h3>連絡先を入力してください</h3>
            <div className="shuriken-contact-form">
              <div className="shuriken-input-group">
                <label>お名前</label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="shuriken-input-group">
                <label>メールアドレス</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="shuriken-popup-buttons">
                <button className="shuriken-popup-submit" onClick={handleFinalSubmit}>
                  送信する
                </button>
                <button className="shuriken-popup-cancel" onClick={() => setShowContactForm(false)}>
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shuriken;
