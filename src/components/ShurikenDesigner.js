import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import './ShurikenDesigner.css';
import shurikenLogo from '../images/shuriken/logo.png';

// Google Fonts リスト（無料で利用可能な日本語フォント）
const GOOGLE_FONTS = [
  // ゴシック系
  { name: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif", category: 'ゴシック' },
  { name: 'M PLUS 1p', value: "'M PLUS 1p', sans-serif", category: 'ゴシック' },
  { name: 'M PLUS Rounded 1c', value: "'M PLUS Rounded 1c', sans-serif", category: 'ゴシック' },
  { name: 'Kosugi', value: "'Kosugi', sans-serif", category: 'ゴシック' },
  { name: 'Kosugi Maru', value: "'Kosugi Maru', sans-serif", category: '丸ゴシック' },
  { name: 'Sawarabi Gothic', value: "'Sawarabi Gothic', sans-serif", category: 'ゴシック' },
  { name: 'Zen Kaku Gothic New', value: "'Zen Kaku Gothic New', sans-serif", category: 'ゴシック' },
  { name: 'Zen Maru Gothic', value: "'Zen Maru Gothic', sans-serif", category: '丸ゴシック' },
  { name: 'Murecho', value: "'Murecho', sans-serif", category: 'ゴシック' },
  { name: 'BIZ UDGothic', value: "'BIZ UDGothic', sans-serif", category: 'ゴシック' },
  { name: 'BIZ UDPGothic', value: "'BIZ UDPGothic', sans-serif", category: 'ゴシック' },
  { name: 'IBM Plex Sans JP', value: "'IBM Plex Sans JP', sans-serif", category: 'ゴシック' },
  { name: 'Kiwi Maru', value: "'Kiwi Maru', serif", category: '丸ゴシック' },
  { name: 'Reggae One', value: "'Reggae One', cursive", category: 'デザイン' },
  { name: 'RocknRoll One', value: "'RocknRoll One', sans-serif", category: 'デザイン' },
  { name: 'Stick', value: "'Stick', sans-serif", category: 'デザイン' },
  { name: 'DotGothic16', value: "'DotGothic16', sans-serif", category: 'デザイン' },
  { name: 'Rampart One', value: "'Rampart One', cursive", category: 'デザイン' },
  { name: 'Train One', value: "'Train One', cursive", category: 'デザイン' },
  // 明朝系
  { name: 'Noto Serif JP', value: "'Noto Serif JP', serif", category: '明朝' },
  { name: 'Sawarabi Mincho', value: "'Sawarabi Mincho', serif", category: '明朝' },
  { name: 'Shippori Mincho', value: "'Shippori Mincho', serif", category: '明朝' },
  { name: 'Shippori Mincho B1', value: "'Shippori Mincho B1', serif", category: '明朝' },
  { name: 'Zen Old Mincho', value: "'Zen Old Mincho', serif", category: '明朝' },
  { name: 'Zen Antique', value: "'Zen Antique', serif", category: '明朝' },
  { name: 'Zen Antique Soft', value: "'Zen Antique Soft', serif", category: '明朝' },
  { name: 'BIZ UDMincho', value: "'BIZ UDMincho', serif", category: '明朝' },
  { name: 'BIZ UDPMincho', value: "'BIZ UDPMincho', serif", category: '明朝' },
  { name: 'Hina Mincho', value: "'Hina Mincho', serif", category: '明朝' },
  // 筆記・手書き系
  { name: 'Yomogi', value: "'Yomogi', cursive", category: '手書き' },
  { name: 'Yuji Syuku', value: "'Yuji Syuku', serif", category: '筆記' },
  { name: 'Yuji Mai', value: "'Yuji Mai', serif", category: '筆記' },
  { name: 'Yuji Boku', value: "'Yuji Boku', serif", category: '筆記' },
  { name: 'Kaisei Decol', value: "'Kaisei Decol', serif", category: '手書き' },
  { name: 'Kaisei Tokumin', value: "'Kaisei Tokumin', serif", category: '明朝' },
  { name: 'Kaisei Opti', value: "'Kaisei Opti', serif", category: '明朝' },
  { name: 'Kaisei HarunoUmi', value: "'Kaisei HarunoUmi', serif", category: '明朝' },
  { name: 'Dela Gothic One', value: "'Dela Gothic One', cursive", category: 'デザイン' },
  { name: 'Mochiy Pop One', value: "'Mochiy Pop One', sans-serif", category: 'ポップ' },
  { name: 'Mochiy Pop P One', value: "'Mochiy Pop P One', sans-serif", category: 'ポップ' },
  { name: 'Potta One', value: "'Potta One', cursive", category: 'ポップ' },
  { name: 'Hachi Maru Pop', value: "'Hachi Maru Pop', cursive", category: 'ポップ' },
];

const ShurikenDesigner = () => {
  const previewRef = useRef(null);

  // テンプレート画像
  const [templateImage, setTemplateImage] = useState(null);
  const [templateScale, setTemplateScale] = useState(100); // 背景画像サイズ %

  // ロゴ/アイコン1
  const [logoImage, setLogoImage] = useState(null);
  const [logoScale, setLogoScale] = useState(60); // ロゴサイズ px
  const [logoPosition, setLogoPosition] = useState({ x: 10, y: 10 });

  // ロゴ/アイコン2
  const [logo2Image, setLogo2Image] = useState(null);
  const [logo2Scale, setLogo2Scale] = useState(60);
  const [logo2Position, setLogo2Position] = useState({ x: 280, y: 10 });

  // プレビューズーム
  const [previewZoom, setPreviewZoom] = useState(100);

  // グローバルフォント設定
  const [globalFont, setGlobalFont] = useState(GOOGLE_FONTS[0].value);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef(null);

  // テキスト要素の位置
  const [textPositions, setTextPositions] = useState({
    company: { x: 10, y: 70 },
    position: { x: 10, y: 90 },
    name: { x: 10, y: 110 },
    nameKana: { x: 10, y: 140 },
    phone: { x: 10, y: 160 },
    email: { x: 10, y: 175 },
    address: { x: 10, y: 190 },
    website: { x: 10, y: 205 },
  });

  // テキストフォーム（濃い色をデフォルトに）
  const [formData, setFormData] = useState({
    name: { text: '', color: '#000000', fontSize: 20, visible: true },
    nameKana: { text: '', color: '#333333', fontSize: 10, visible: true },
    company: { text: '', color: '#000000', fontSize: 12, visible: true },
    position: { text: '', color: '#333333', fontSize: 10, visible: true },
    phone: { text: '', color: '#222222', fontSize: 9, visible: true },
    email: { text: '', color: '#222222', fontSize: 9, visible: true },
    address: { text: '', color: '#222222', fontSize: 8, visible: true },
    website: { text: '', color: '#222222', fontSize: 8, visible: true },
  });

  // Google Fonts読み込み
  useEffect(() => {
    const link = document.createElement('link');
    // 全フォントを読み込み
    const fontFamilies = GOOGLE_FONTS.map(f => f.name.replace(/ /g, '+')).join('&family=');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setFontDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // テンプレート画像アップロード
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateImage(event.target.result);
        setTemplateScale(100);
      };
      reader.readAsDataURL(file);
    }
  };

  // ロゴ/アイコン1アップロード（クロップなし・元画像保持）
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ロゴ/アイコン2アップロード
  const handleLogo2Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo2Image(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // フォーム入力
  const handleInputChange = (field, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));
  };

  // テキスト位置更新
  const handleTextDrag = (field, e, data) => {
    // プレビュー領域内に制限
    const maxX = 354; // 364 - 10 margin
    const maxY = 210; // 220 - 10 margin
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));

    setTextPositions(prev => ({
      ...prev,
      [field]: { x: newX, y: newY }
    }));
  };

  // ロゴ1位置更新
  const handleLogoDrag = (e, data) => {
    const maxX = 364 - logoScale;
    const maxY = 220 - logoScale;
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));
    setLogoPosition({ x: newX, y: newY });
  };

  // ロゴ2位置更新
  const handleLogo2Drag = (e, data) => {
    const maxX = 364 - logo2Scale;
    const maxY = 220 - logo2Scale;
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));
    setLogo2Position({ x: newX, y: newY });
  };

  // リセット
  const handleReset = () => {
    setTemplateImage(null);
    setTemplateScale(100);
    setLogoImage(null);
    setLogoScale(60);
    setLogoPosition({ x: 10, y: 10 });
    setLogo2Image(null);
    setLogo2Scale(60);
    setLogo2Position({ x: 280, y: 10 });
    setPreviewZoom(100);
    setTextPositions({
      company: { x: 10, y: 70 },
      position: { x: 10, y: 90 },
      name: { x: 10, y: 110 },
      nameKana: { x: 10, y: 140 },
      phone: { x: 10, y: 160 },
      email: { x: 10, y: 175 },
      address: { x: 10, y: 190 },
      website: { x: 10, y: 205 },
    });
    setFormData({
      name: { text: '', color: '#000000', fontSize: 20, visible: true },
      nameKana: { text: '', color: '#333333', fontSize: 10, visible: true },
      company: { text: '', color: '#000000', fontSize: 12, visible: true },
      position: { text: '', color: '#333333', fontSize: 10, visible: true },
      phone: { text: '', color: '#222222', fontSize: 9, visible: true },
      email: { text: '', color: '#222222', fontSize: 9, visible: true },
      address: { text: '', color: '#222222', fontSize: 8, visible: true },
      website: { text: '', color: '#222222', fontSize: 8, visible: true },
    });
  };

  // テキスト表示内容を取得
  const getDisplayText = (field) => {
    const text = formData[field]?.text;
    if (!text) return null;
    if (field === 'phone') return `TEL: ${text}`;
    return text;
  };

  // フィールドラベル
  const fieldLabels = {
    name: '名前',
    nameKana: 'フリガナ',
    company: '会社名',
    position: '役職',
    phone: '電話番号',
    email: 'メール',
    address: '住所',
    website: 'Web',
  };

  const fieldPlaceholders = {
    name: '山田 太郎',
    nameKana: 'ヤマダ タロウ',
    company: '株式会社○○',
    position: '代表取締役',
    phone: '090-1234-5678',
    email: 'example@email.com',
    address: '〒000-0000 ○○県○○市...',
    website: 'https://example.com',
  };

  return (
    <div className="shuriken-designer">
      {/* ヘッダー */}
      <header className="designer-header">
        <Link to="/shuriken" className="designer-back">
          ← 戻る
        </Link>
        <h1>
          <img src={shurikenLogo} alt="" className="designer-logo" />
          名刺デザイン
        </h1>
        <div className="designer-header-spacer"></div>
      </header>

      {/* メインコンテンツ - 2カラム */}
      <div className="designer-main two-column">
        {/* 左側: フォーム */}
        <div className="designer-form-panel">
          <h3>編集</h3>

          {/* フォント選択 - カスタムドロップダウン */}
          <div className="global-font-select" ref={fontDropdownRef}>
            <label>フォント（{GOOGLE_FONTS.length}種類）</label>
            <div
              className="font-dropdown-trigger"
              onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
            >
              <span
                className="font-dropdown-selected"
                style={{ fontFamily: globalFont }}
              >
                {GOOGLE_FONTS.find(f => f.value === globalFont)?.name || 'フォントを選択'}
              </span>
              <span className="font-dropdown-arrow">{fontDropdownOpen ? '▲' : '▼'}</span>
            </div>
            {fontDropdownOpen && (
              <div className="font-dropdown-menu">
                {/* カテゴリごとにグループ化 */}
                {['ゴシック', '丸ゴシック', '明朝', '手書き', '筆記', 'ポップ', 'デザイン'].map(category => {
                  const fontsInCategory = GOOGLE_FONTS.filter(f => f.category === category);
                  if (fontsInCategory.length === 0) return null;
                  return (
                    <div key={category} className="font-category-group">
                      <div className="font-category-label">{category}</div>
                      {fontsInCategory.map(font => (
                        <div
                          key={font.name}
                          className={`font-dropdown-item ${globalFont === font.value ? 'selected' : ''}`}
                          onClick={() => {
                            setGlobalFont(font.value);
                            setFontDropdownOpen(false);
                          }}
                        >
                          <span className="font-item-name">{font.name}</span>
                          <span
                            className="font-item-sample"
                            style={{ fontFamily: font.value }}
                          >
                            あいうえお 山田太郎
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 背景画像アップロード */}
          <div className="form-section">
            <h4>背景画像</h4>
            <div className="upload-compact">
              {templateImage ? (
                <div className="upload-thumb">
                  <img src={templateImage} alt="背景" />
                  <button onClick={() => setTemplateImage(null)}>✕</button>
                </div>
              ) : (
                <label className="upload-btn">
                  <input type="file" accept="image/*" onChange={handleTemplateUpload} hidden />
                  📤 アップロード
                </label>
              )}
            </div>
            {templateImage && (
              <div className="size-slider">
                <label>サイズ: {templateScale}%</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={templateScale}
                  onChange={(e) => setTemplateScale(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* アイコン1アップロード */}
          <div className="form-section">
            <h4>アイコン1</h4>
            <div className="upload-compact">
              {logoImage ? (
                <div className="upload-thumb">
                  <img src={logoImage} alt="アイコン1" />
                  <button onClick={() => setLogoImage(null)}>✕</button>
                </div>
              ) : (
                <label className="upload-btn">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                  🖼️ アップロード
                </label>
              )}
            </div>
            {logoImage && (
              <div className="size-slider">
                <label>サイズ: {logoScale}px</label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={logoScale}
                  onChange={(e) => setLogoScale(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* アイコン2アップロード */}
          <div className="form-section">
            <h4>アイコン2</h4>
            <div className="upload-compact">
              {logo2Image ? (
                <div className="upload-thumb">
                  <img src={logo2Image} alt="アイコン2" />
                  <button onClick={() => setLogo2Image(null)}>✕</button>
                </div>
              ) : (
                <label className="upload-btn">
                  <input type="file" accept="image/*" onChange={handleLogo2Upload} hidden />
                  🖼️ アップロード
                </label>
              )}
            </div>
            {logo2Image && (
              <div className="size-slider">
                <label>サイズ: {logo2Scale}px</label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={logo2Scale}
                  onChange={(e) => setLogo2Scale(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* テキスト入力フォーム */}
          <div className="form-section">
            <h4>テキスト情報</h4>
            {Object.entries(formData).map(([field, data]) => (
              <div key={field} className="form-field">
                <div className="field-header">
                  <label>{fieldLabels[field]}</label>
                  <div className="field-controls">
                    <input
                      type="color"
                      value={data.color}
                      onChange={(e) => handleInputChange(field, 'color', e.target.value)}
                      title="文字色"
                    />
                    <input
                      type="number"
                      value={data.fontSize}
                      onChange={(e) => handleInputChange(field, 'fontSize', parseInt(e.target.value) || 10)}
                      min="6"
                      max="36"
                      title="フォントサイズ"
                      className="font-size-input"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={data.text}
                  onChange={(e) => handleInputChange(field, 'text', e.target.value)}
                  placeholder={fieldPlaceholders[field]}
                  style={{ fontFamily: globalFont }}
                />
              </div>
            ))}
          </div>

          <button className="reset-btn" onClick={handleReset}>
            リセット
          </button>

          <div className="submit-section">
            <button className="action-btn primary" onClick={() => {
              alert('この機能は準備中です。\nお問い合わせからデザインデータをお送りください。');
            }}>
              この内容で依頼する
            </button>
          </div>
        </div>

        {/* 右側: プレビュー */}
        <div className="designer-preview-panel">
          <h3>プレビュー <span className="drag-hint">（ドラッグで配置変更）</span></h3>

          {/* プレビューズームスライダー */}
          <div className="preview-zoom-control">
            <label>ズーム: {previewZoom}%</label>
            <input
              type="range"
              min="100"
              max="300"
              value={previewZoom}
              onChange={(e) => setPreviewZoom(Number(e.target.value))}
            />
          </div>

          <div className="card-preview-container" ref={previewRef}>
            <div
              className="card-preview-wrapper"
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'center center',
              }}
            >
              {/* 背景画像 */}
              {templateImage && (
                <img
                  src={templateImage}
                  alt="背景"
                  className="preview-background"
                  style={{
                    transform: `translate(-50%, -50%) scale(${templateScale / 100})`,
                  }}
                />
              )}

              {/* アイコン1 */}
              {logoImage && (
                <Draggable
                  position={logoPosition}
                  onStop={handleLogoDrag}
                  bounds="parent"
                >
                  <div
                    className="draggable-element logo-element"
                    style={{
                      width: `${logoScale}px`,
                      height: 'auto',
                    }}
                  >
                    <img src={logoImage} alt="アイコン1" />
                  </div>
                </Draggable>
              )}

              {/* アイコン2 */}
              {logo2Image && (
                <Draggable
                  position={logo2Position}
                  onStop={handleLogo2Drag}
                  bounds="parent"
                >
                  <div
                    className="draggable-element logo-element"
                    style={{
                      width: `${logo2Scale}px`,
                      height: 'auto',
                    }}
                  >
                    <img src={logo2Image} alt="アイコン2" />
                  </div>
                </Draggable>
              )}

              {/* テキスト要素 */}
              {Object.entries(formData).map(([field, data]) => {
                const displayText = getDisplayText(field);
                if (!displayText) return null;

                return (
                  <Draggable
                    key={field}
                    position={textPositions[field]}
                    onStop={(e, d) => handleTextDrag(field, e, d)}
                    bounds="parent"
                  >
                    <div
                      className="draggable-element text-element"
                      style={{
                        color: data.color,
                        fontSize: `${data.fontSize}px`,
                        fontFamily: globalFont,
                      }}
                    >
                      {displayText}
                    </div>
                  </Draggable>
                );
              })}
            </div>
          </div>
          <p className="preview-note">※ 要素をドラッグして位置を調整できます</p>
        </div>
      </div>

    </div>
  );
};

export default ShurikenDesigner;
