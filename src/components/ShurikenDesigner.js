import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import Draggable from 'react-draggable';
import './ShurikenDesigner.css';
import shurikenLogo from '../images/shuriken/logo.png';

// Google Fonts リスト
const GOOGLE_FONTS = [
  { name: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif" },
  { name: 'Noto Serif JP', value: "'Noto Serif JP', serif" },
  { name: 'M PLUS 1p', value: "'M PLUS 1p', sans-serif" },
  { name: 'Kosugi Maru', value: "'Kosugi Maru', sans-serif" },
  { name: 'Sawarabi Mincho', value: "'Sawarabi Mincho', serif" },
  { name: 'Sawarabi Gothic', value: "'Sawarabi Gothic', sans-serif" },
  { name: 'Zen Kaku Gothic New', value: "'Zen Kaku Gothic New', sans-serif" },
  { name: 'Shippori Mincho', value: "'Shippori Mincho', serif" },
];

const ShurikenDesigner = () => {
  const previewRef = useRef(null);

  // テンプレート画像
  const [templateImage, setTemplateImage] = useState(null);
  const [templateScale, setTemplateScale] = useState(100); // 背景画像サイズ %

  // ロゴ/写真用の状態
  const [logoImage, setLogoImage] = useState(null);
  const [logoCrop, setLogoCrop] = useState({ x: 0, y: 0 });
  const [logoZoom, setLogoZoom] = useState(1);
  const [showLogoCropper, setShowLogoCropper] = useState(false);
  const [croppedLogoImage, setCroppedLogoImage] = useState(null);
  const [logoScale, setLogoScale] = useState(60); // ロゴサイズ px
  const [logoPosition, setLogoPosition] = useState({ x: 10, y: 10 });

  // グローバルフォント設定
  const [globalFont, setGlobalFont] = useState(GOOGLE_FONTS[0].value);

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
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700&family=M+PLUS+1p:wght@400;700&family=Kosugi+Maru&family=Sawarabi+Mincho&family=Sawarabi+Gothic&family=Zen+Kaku+Gothic+New:wght@400;700&family=Shippori+Mincho:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
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

  // ロゴ/写真アップロード
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target.result);
        setShowLogoCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // クロップ完了時
  const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
    // クロップ領域を保存
  }, []);

  // クロップ確定
  const confirmCrop = async () => {
    if (logoImage) {
      setCroppedLogoImage(logoImage);
    }
    setShowLogoCropper(false);
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

  // ロゴ位置更新
  const handleLogoDrag = (e, data) => {
    const maxX = 364 - logoScale;
    const maxY = 220 - logoScale;
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));

    setLogoPosition({ x: newX, y: newY });
  };

  // リセット
  const handleReset = () => {
    setTemplateImage(null);
    setTemplateScale(100);
    setLogoImage(null);
    setCroppedLogoImage(null);
    setLogoScale(60);
    setLogoPosition({ x: 10, y: 10 });
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

          {/* フォント選択 */}
          <div className="global-font-select">
            <label>フォント</label>
            <select
              value={globalFont}
              onChange={(e) => setGlobalFont(e.target.value)}
              style={{ fontFamily: globalFont }}
            >
              {GOOGLE_FONTS.map(font => (
                <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
            </select>
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

          {/* ロゴ画像アップロード */}
          <div className="form-section">
            <h4>ロゴ・写真</h4>
            <div className="upload-compact">
              {croppedLogoImage || logoImage ? (
                <div className="upload-thumb">
                  <img src={croppedLogoImage || logoImage} alt="ロゴ" />
                  <button onClick={() => { setLogoImage(null); setCroppedLogoImage(null); }}>✕</button>
                </div>
              ) : (
                <label className="upload-btn">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                  🖼️ アップロード
                </label>
              )}
            </div>
            {(croppedLogoImage || logoImage) && (
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
          <div className="card-preview-container" ref={previewRef}>
            <div className="card-preview-wrapper">
              {/* 背景画像 */}
              {templateImage && (
                <img
                  src={templateImage}
                  alt="背景"
                  className="preview-background"
                  style={{
                    transform: `scale(${templateScale / 100})`,
                    transformOrigin: 'center center',
                  }}
                />
              )}

              {/* ロゴ */}
              {(croppedLogoImage || logoImage) && (
                <Draggable
                  position={logoPosition}
                  onStop={handleLogoDrag}
                  bounds="parent"
                >
                  <div
                    className="draggable-element logo-element"
                    style={{
                      width: `${logoScale}px`,
                      height: `${logoScale}px`,
                    }}
                  >
                    <img src={croppedLogoImage || logoImage} alt="ロゴ" />
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

      {/* ロゴクロッパーモーダル */}
      {showLogoCropper && logoImage && (
        <div className="cropper-modal">
          <div className="cropper-container">
            <h3>画像の位置を調整</h3>
            <div className="cropper-area">
              <Cropper
                image={logoImage}
                crop={logoCrop}
                zoom={logoZoom}
                aspect={1}
                onCropChange={setLogoCrop}
                onZoomChange={setLogoZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="cropper-controls">
              <label>ズーム</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={logoZoom}
                onChange={(e) => setLogoZoom(Number(e.target.value))}
              />
            </div>
            <div className="cropper-actions">
              <button className="confirm-btn" onClick={confirmCrop}>
                確定
              </button>
              <button className="cancel-btn" onClick={() => {
                setShowLogoCropper(false);
                setLogoImage(null);
              }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShurikenDesigner;
