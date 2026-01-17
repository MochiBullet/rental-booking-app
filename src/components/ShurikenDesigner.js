import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import './ShurikenDesigner.css';
import shurikenLogo from '../images/shuriken/logo.png';

// BGM生成用のカスタムフック
const useBGM = () => {
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const isPlayingRef = useRef(false);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('shuriken-bgm-muted');
    return saved === 'true';
  });

  const playMelody = useCallback(async () => {
    if (!audioContextRef.current || isMuted) return;

    // 楽しいメロディのノート（周波数）
    const melody = [
      { note: 523.25, duration: 0.15 }, // C5
      { note: 587.33, duration: 0.15 }, // D5
      { note: 659.25, duration: 0.15 }, // E5
      { note: 523.25, duration: 0.15 }, // C5
      { note: 659.25, duration: 0.2 },  // E5
      { note: 659.25, duration: 0.2 },  // E5
      { note: 587.33, duration: 0.4 },  // D5
      { note: 523.25, duration: 0.15 }, // C5
      { note: 587.33, duration: 0.15 }, // D5
      { note: 659.25, duration: 0.15 }, // E5
      { note: 523.25, duration: 0.15 }, // C5
      { note: 587.33, duration: 0.4 },  // D5
      { note: 523.25, duration: 0.4 },  // C5
      { note: 0, duration: 0.3 },       // rest
      { note: 659.25, duration: 0.15 }, // E5
      { note: 698.46, duration: 0.15 }, // F5
      { note: 783.99, duration: 0.15 }, // G5
      { note: 659.25, duration: 0.15 }, // E5
      { note: 783.99, duration: 0.2 },  // G5
      { note: 783.99, duration: 0.2 },  // G5
      { note: 698.46, duration: 0.4 },  // F5
      { note: 659.25, duration: 0.15 }, // E5
      { note: 587.33, duration: 0.15 }, // D5
      { note: 523.25, duration: 0.3 },  // C5
      { note: 587.33, duration: 0.15 }, // D5
      { note: 659.25, duration: 0.3 },  // E5
      { note: 523.25, duration: 0.5 },  // C5
      { note: 0, duration: 0.5 },       // rest
    ];

    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    let currentTime = ctx.currentTime;

    for (const { note, duration } of melody) {
      if (!isPlayingRef.current) break;

      if (note > 0) {
        // メインオシレーター
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = note;
        oscGain.gain.setValueAtTime(0.15, currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, currentTime + duration * 0.9);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(currentTime);
        osc.stop(currentTime + duration);

        // ハーモニクス（きらきら感）
        const osc2 = ctx.createOscillator();
        const osc2Gain = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = note * 2;
        osc2Gain.gain.setValueAtTime(0.05, currentTime);
        osc2Gain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration * 0.8);
        osc2.connect(osc2Gain);
        osc2Gain.connect(gain);
        osc2.start(currentTime);
        osc2.stop(currentTime + duration);
      }
      currentTime += duration;
    }

    // ループ再生
    setTimeout(() => {
      if (isPlayingRef.current && !isMuted) {
        playMelody();
      }
    }, (currentTime - ctx.currentTime) * 1000);
  }, [isMuted]);

  const startBGM = useCallback(() => {
    if (isPlayingRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = isMuted ? 0 : 0.3;
      gainNodeRef.current.connect(audioContextRef.current.destination);
      isPlayingRef.current = true;
      playMelody();
    } catch (e) {
      console.error('BGM start failed:', e);
    }
  }, [isMuted, playMelody]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('shuriken-bgm-muted', String(newMuted));

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMuted ? 0 : 0.3;
    }

    if (!newMuted && !isPlayingRef.current) {
      startBGM();
    }
  }, [isMuted, startBGM]);

  useEffect(() => {
    // ユーザーインタラクション後にBGM開始
    const handleInteraction = () => {
      if (!isPlayingRef.current && !isMuted) {
        startBGM();
      }
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      isPlayingRef.current = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isMuted, startBGM]);

  return { isMuted, toggleMute };
};

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

// デフォルトデータ（printTypeを各面に持たせる）
const getDefaultSideData = (isBlackCard = false) => ({
  printType: isBlackCard ? 'white' : 'none', // 黒カード: white, 白カード: none(カラー)
  templateImage: null,
  templateScale: 100,
  logoImage: null,
  logoScale: 60,
  logoPosition: { x: 10, y: 10 },
  logo2Image: null,
  logo2Scale: 60,
  logo2Position: { x: 280, y: 10 },
  textPositions: {
    company: { x: 15, y: 15 },
    position: { x: 15, y: 35 },
    nameKana: { x: 15, y: 70 },
    name: { x: 15, y: 85 },
    phone: { x: 15, y: 140 },
    email: { x: 15, y: 158 },
    address: { x: 15, y: 176 },
    website: { x: 15, y: 194 },
  },
  formData: {
    name: { text: '', color: '#000000', fontSize: 20, visible: true },
    nameKana: { text: '', color: '#333333', fontSize: 10, visible: true },
    company: { text: '', color: '#000000', fontSize: 12, visible: true },
    position: { text: '', color: '#333333', fontSize: 10, visible: true },
    phone: { text: '', color: '#222222', fontSize: 9, visible: true },
    email: { text: '', color: '#222222', fontSize: 9, visible: true },
    address: { text: '', color: '#222222', fontSize: 8, visible: true },
    website: { text: '', color: '#222222', fontSize: 8, visible: true },
  },
});

const STORAGE_KEY = 'shuriken-designer-data';

const ShurikenDesigner = () => {
  const previewRef = useRef(null);
  const isInitialLoad = useRef(true);

  // BGM
  const { isMuted, toggleMute } = useBGM();

  // デザインモード（free: 自由デザイン / template: テンプレート）
  const [designMode, setDesignMode] = useState('free');
  // 選択中のテンプレート（複数選択可能）
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  // 表裏切り替え（front/back）
  const [cardSide, setCardSide] = useState('front');

  // カード色（white/black）- 両面共通
  const [cardColor, setCardColor] = useState('white');
  // グローバルフォント設定 - 両面共通
  const [globalFont, setGlobalFont] = useState(GOOGLE_FONTS[0].value);

  // 表面・裏面データを別々に保持（printTypeは各面に含まれる）
  const [frontData, setFrontData] = useState(getDefaultSideData(false));
  const [backData, setBackData] = useState(getDefaultSideData(false));

  // 現在の面のデータを取得
  const currentData = cardSide === 'front' ? frontData : backData;
  const setCurrentData = cardSide === 'front' ? setFrontData : setBackData;

  // 印刷タイプ（各面から取得）
  const printType = currentData.printType;
  const frontPrintType = frontData.printType;

  // プレビューズーム - UI用
  const [previewZoom, setPreviewZoom] = useState(100);

  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef(null);

  // 現在のデータから展開（便利なエイリアス）
  const templateImage = currentData.templateImage;
  const templateScale = currentData.templateScale;
  const logoImage = currentData.logoImage;
  const logoScale = currentData.logoScale;
  const logoPosition = currentData.logoPosition;
  const logo2Image = currentData.logo2Image;
  const logo2Scale = currentData.logo2Scale;
  const logo2Position = currentData.logo2Position;
  const textPositions = currentData.textPositions;
  const formData = currentData.formData;

  // 裏面で選択可能な印刷タイプを取得
  const getAvailableBackPrintTypes = () => {
    if (cardColor === 'white') {
      // 白カード: 表面がnone(カラー)なら裏面もnoneのみ、金銀なら全選択可
      if (frontPrintType === 'none') {
        return ['none'];
      }
      return ['none', 'gold', 'silver'];
    } else {
      // 黒カード: 表面がwhiteなら裏面もwhiteのみ、金銀なら全選択可
      if (frontPrintType === 'white') {
        return ['white'];
      }
      return ['white', 'gold', 'silver'];
    }
  };

  // 表面で選択可能な印刷タイプを取得
  const getAvailableFrontPrintTypes = () => {
    if (cardColor === 'white') {
      return ['none', 'gold', 'silver']; // カラー、金、銀
    } else {
      return ['white', 'gold', 'silver']; // 白、金、銀（カラーなし）
    }
  };

  // localStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.designMode) setDesignMode(data.designMode);
        if (data.selectedTemplates) setSelectedTemplates(data.selectedTemplates);
        if (data.cardColor) setCardColor(data.cardColor);
        if (data.globalFont) setGlobalFont(data.globalFont);
        if (data.frontData) setFrontData({ ...getDefaultSideData(data.cardColor === 'black'), ...data.frontData });
        if (data.backData) setBackData({ ...getDefaultSideData(data.cardColor === 'black'), ...data.backData });
        if (data.cardSide) setCardSide(data.cardSide);
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    isInitialLoad.current = false;
  }, []);

  // localStorageに保存
  useEffect(() => {
    if (isInitialLoad.current) return;
    try {
      const data = {
        designMode,
        selectedTemplates,
        cardSide,
        cardColor,
        globalFont,
        frontData,
        backData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }, [designMode, selectedTemplates, cardSide, cardColor, globalFont, frontData, backData]);

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

  // データ更新用ヘルパー
  const updateCurrentData = (updates) => {
    setCurrentData(prev => ({ ...prev, ...updates }));
  };

  // テンプレート画像アップロード
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateCurrentData({
          templateImage: event.target.result,
          templateScale: 100,
        });
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
        updateCurrentData({ logoImage: event.target.result });
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
        updateCurrentData({ logo2Image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // フォーム入力
  const handleInputChange = (field, key, value) => {
    // 住所は最大2行まで
    if (field === 'address' && key === 'text') {
      const lines = value.split('\n');
      if (lines.length > 2) {
        value = lines.slice(0, 2).join('\n');
      }
    }
    updateCurrentData({
      formData: {
        ...formData,
        [field]: { ...formData[field], [key]: value }
      }
    });
  };

  // カード色変更時にテキスト色と印刷タイプをデフォルトに更新（両面に適用）
  const handleCardColorChange = (newColor) => {
    setCardColor(newColor);
    const defaultColors = newColor === 'white'
      ? { main: '#000000', sub: '#333333', detail: '#222222' }
      : { main: '#ffffff', sub: '#cccccc', detail: '#dddddd' };

    // 黒カードの場合はwhite、白カードの場合はnone
    const defaultPrintType = newColor === 'white' ? 'none' : 'white';

    const updateSideData = (prevData) => ({
      ...prevData,
      printType: defaultPrintType,
      formData: {
        ...prevData.formData,
        name: { ...prevData.formData.name, color: defaultColors.main },
        nameKana: { ...prevData.formData.nameKana, color: defaultColors.sub },
        company: { ...prevData.formData.company, color: defaultColors.main },
        position: { ...prevData.formData.position, color: defaultColors.sub },
        phone: { ...prevData.formData.phone, color: defaultColors.detail },
        email: { ...prevData.formData.email, color: defaultColors.detail },
        address: { ...prevData.formData.address, color: defaultColors.detail },
        website: { ...prevData.formData.website, color: defaultColors.detail },
      }
    });

    setFrontData(updateSideData);
    setBackData(updateSideData);
  };

  // 印刷タイプ変更ハンドラー
  const handlePrintTypeChange = (newType) => {
    updateCurrentData({ printType: newType });

    // 表面の印刷タイプを変更した場合、裏面の選択肢が制限される可能性がある
    if (cardSide === 'front') {
      // 裏面の印刷タイプが新しい制限に違反している場合はリセット
      const newAvailableTypes = (() => {
        if (cardColor === 'white') {
          if (newType === 'none') return ['none'];
          return ['none', 'gold', 'silver'];
        } else {
          if (newType === 'white') return ['white'];
          return ['white', 'gold', 'silver'];
        }
      })();

      if (!newAvailableTypes.includes(backData.printType)) {
        setBackData(prev => ({ ...prev, printType: newAvailableTypes[0] }));
      }
    }
  };

  // テキスト位置更新
  const handleTextDrag = (field, e, data) => {
    // プレビュー領域内に制限
    const maxX = 354; // 364 - 10 margin
    const maxY = 210; // 220 - 10 margin
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));

    updateCurrentData({
      textPositions: {
        ...textPositions,
        [field]: { x: newX, y: newY }
      }
    });
  };

  // ロゴ1位置更新
  const handleLogoDrag = (e, data) => {
    const maxX = 364 - logoScale;
    const maxY = 220 - logoScale;
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));
    updateCurrentData({ logoPosition: { x: newX, y: newY } });
  };

  // ロゴ2位置更新
  const handleLogo2Drag = (e, data) => {
    const maxX = 364 - logo2Scale;
    const maxY = 220 - logo2Scale;
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));
    updateCurrentData({ logo2Position: { x: newX, y: newY } });
  };

  // リセット（両面とも初期化）
  const handleReset = () => {
    if (!window.confirm('表面・裏面の両方をリセットします。よろしいですか？')) return;

    setDesignMode('free');
    setSelectedTemplates([]);
    setCardSide('front');
    setCardColor('white');
    setGlobalFont(GOOGLE_FONTS[0].value);
    setPreviewZoom(100);
    setFrontData(getDefaultSideData(false));
    setBackData(getDefaultSideData(false));
    localStorage.removeItem(STORAGE_KEY);
  };

  // テキスト表示内容を取得（入力がある場合のみ表示）
  const getDisplayText = (field) => {
    const text = formData[field]?.text;
    if (!text || text.trim() === '') return null;
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
          {/* デザインモード切り替え */}
          <div className="design-mode-toggle">
            <button
              className={`design-mode-btn ${designMode === 'free' ? 'active' : ''}`}
              onClick={() => setDesignMode('free')}
            >
              自由デザイン
            </button>
            <button
              className={`design-mode-btn ${designMode === 'template' ? 'active' : ''}`}
              onClick={() => setDesignMode('template')}
            >
              テンプレート
            </button>
          </div>

          <h3>編集</h3>

          {/* テンプレートモードの場合 */}
          {designMode === 'template' && (
            <div className="form-section template-section">
              <h4>テンプレート選択</h4>
              <p className="template-coming-soon">
                テンプレートは現在準備中です。<br />
                複数のテンプレートから選択できるようになります。
              </p>
            </div>
          )}

          {/* 表裏切り替え */}
          <div className="form-section card-side-section">
            <h4>編集する面</h4>
            <div className="side-toggle">
              <button
                className={`side-toggle-btn ${cardSide === 'front' ? 'active' : ''}`}
                onClick={() => setCardSide('front')}
              >
                表面
              </button>
              <button
                className={`side-toggle-btn ${cardSide === 'back' ? 'active' : ''}`}
                onClick={() => setCardSide('back')}
              >
                裏面
              </button>
            </div>
          </div>

          {/* カード色選択 */}
          <div className="form-section card-color-section">
            <h4>カードの色（両面共通）</h4>
            <div className="radio-group">
              <label className={`radio-option ${cardColor === 'white' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cardColor"
                  value="white"
                  checked={cardColor === 'white'}
                  onChange={() => handleCardColorChange('white')}
                />
                <span className="radio-label">白カード</span>
              </label>
              <label className={`radio-option ${cardColor === 'black' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cardColor"
                  value="black"
                  checked={cardColor === 'black'}
                  onChange={() => handleCardColorChange('black')}
                />
                <span className="radio-label">黒カード</span>
              </label>
            </div>
          </div>

          {/* 印刷タイプ選択 */}
          <div className="form-section print-type-section">
            <h4>印刷の種類（{cardSide === 'front' ? '表面' : '裏面'}）</h4>
            {(() => {
              const availableTypes = cardSide === 'front'
                ? getAvailableFrontPrintTypes()
                : getAvailableBackPrintTypes();

              const typeLabels = {
                none: 'カラー印刷',
                white: '白印刷',
                gold: '金色',
                silver: '銀色',
              };

              const typeClasses = {
                gold: 'gold-text',
                silver: 'silver-text',
              };

              return (
                <div className="radio-group vertical">
                  {availableTypes.map(type => (
                    <label
                      key={type}
                      className={`radio-option ${printType === type ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="printType"
                        value={type}
                        checked={printType === type}
                        onChange={() => handlePrintTypeChange(type)}
                      />
                      <span className={`radio-label ${typeClasses[type] || ''}`}>
                        {typeLabels[type]}
                      </span>
                    </label>
                  ))}
                  {cardSide === 'back' && availableTypes.length === 1 && (
                    <p className="print-type-note">
                      ※ 表面で{cardColor === 'white' ? 'カラー' : '白'}印刷を選択しているため、裏面も同じ設定です
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

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
            <h4>背景画像（{cardSide === 'front' ? '表面' : '裏面'}）</h4>
            <div className="upload-compact">
              {templateImage ? (
                <div className="upload-thumb">
                  <img src={templateImage} alt="背景" />
                  <button onClick={() => updateCurrentData({ templateImage: null })}>✕</button>
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
                  onChange={(e) => updateCurrentData({ templateScale: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          {/* アイコン1アップロード */}
          <div className="form-section">
            <h4>アイコン1（{cardSide === 'front' ? '表面' : '裏面'}）</h4>
            <div className="upload-compact">
              {logoImage ? (
                <div className="upload-thumb">
                  <img src={logoImage} alt="アイコン1" />
                  <button onClick={() => updateCurrentData({ logoImage: null })}>✕</button>
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
                  onChange={(e) => updateCurrentData({ logoScale: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          {/* アイコン2アップロード */}
          <div className="form-section">
            <h4>アイコン2（{cardSide === 'front' ? '表面' : '裏面'}）</h4>
            <div className="upload-compact">
              {logo2Image ? (
                <div className="upload-thumb">
                  <img src={logo2Image} alt="アイコン2" />
                  <button onClick={() => updateCurrentData({ logo2Image: null })}>✕</button>
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
                  onChange={(e) => updateCurrentData({ logo2Scale: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          {/* 画像アップロード注意書き */}
          {(printType === 'gold' || printType === 'silver') && (
            <div className="upload-warning">
              ※金銀を選択している場合は単色で背景透過ではない場合、印刷がうまく行かない場合があります。
            </div>
          )}

          {/* テキスト入力フォーム */}
          <div className="form-section">
            <h4>テキスト情報</h4>
            {Object.entries(formData).map(([field, data]) => (
              <div key={field} className="form-field">
                <div className="field-header">
                  <label>{fieldLabels[field]}</label>
                  <div className="field-controls">
                    {printType === 'none' ? (
                      <input
                        type="color"
                        value={data.color}
                        onChange={(e) => handleInputChange(field, 'color', e.target.value)}
                        title="文字色"
                      />
                    ) : (
                      <span
                        className={`color-locked ${printType}`}
                        title={
                          printType === 'gold' ? '金色固定' :
                          printType === 'silver' ? '銀色固定' : '白色固定'
                        }
                      >
                        {printType === 'gold' ? '🥇' :
                         printType === 'silver' ? '🥈' : '⬜'}
                      </span>
                    )}
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
                {field === 'address' ? (
                  <textarea
                    value={data.text}
                    onChange={(e) => handleInputChange(field, 'text', e.target.value)}
                    placeholder={fieldPlaceholders[field]}
                    style={{ fontFamily: globalFont }}
                    rows={2}
                  />
                ) : (
                  <input
                    type="text"
                    value={data.text}
                    onChange={(e) => handleInputChange(field, 'text', e.target.value)}
                    placeholder={fieldPlaceholders[field]}
                    style={{ fontFamily: globalFont }}
                  />
                )}
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
          <h3>
            プレビュー（{cardSide === 'front' ? '表面' : '裏面'}）
            <span className="drag-hint">ドラッグで配置変更</span>
          </h3>

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

          <div
            className="card-preview-container"
            ref={previewRef}
            style={{
              background: cardColor === 'white' ? '#1a1a2e' : '#4a4a5a',
            }}
          >
            <div
              className="card-preview-wrapper"
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'center center',
                background: cardColor === 'white' ? '#ffffff' : '#1a1a1a',
              }}
            >
              {/* 背景画像（黒カードの場合はグレースケール→白に変換） */}
              {templateImage && (
                <img
                  src={templateImage}
                  alt="背景"
                  className="preview-background"
                  style={{
                    transform: `translate(-50%, -50%) scale(${templateScale / 100})`,
                    filter: cardColor === 'black' ? 'grayscale(100%) brightness(2) contrast(0.5)' : 'none',
                  }}
                />
              )}

              {/* アイコン1（黒カードの場合はグレースケール→白に変換） */}
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
                    <img
                      src={logoImage}
                      alt="アイコン1"
                      style={{
                        filter: cardColor === 'black' ? 'grayscale(100%) brightness(2) contrast(0.5)' : 'none',
                      }}
                    />
                  </div>
                </Draggable>
              )}

              {/* アイコン2（黒カードの場合はグレースケール→白に変換） */}
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
                    <img
                      src={logo2Image}
                      alt="アイコン2"
                      style={{
                        filter: cardColor === 'black' ? 'grayscale(100%) brightness(2) contrast(0.5)' : 'none',
                      }}
                    />
                  </div>
                </Draggable>
              )}

              {/* テキスト要素 */}
              {Object.entries(formData).map(([field, data]) => {
                const displayText = getDisplayText(field);
                if (!displayText) return null;

                // 印刷タイプに応じたテキストスタイル
                const getTextStyle = () => {
                  const baseStyle = {
                    fontSize: `${data.fontSize}px`,
                    fontFamily: globalFont,
                  };

                  if (printType === 'gold') {
                    return {
                      ...baseStyle,
                      background: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    };
                  } else if (printType === 'silver') {
                    return {
                      ...baseStyle,
                      background: 'linear-gradient(135deg, #c0c0c0 0%, #ffffff 25%, #a8a8a8 50%, #e8e8e8 75%, #909090 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    };
                  } else if (printType === 'white') {
                    // 黒カード用: 白印刷
                    return {
                      ...baseStyle,
                      color: '#ffffff',
                    };
                  } else {
                    // none: カラー印刷（白カード用）
                    return {
                      ...baseStyle,
                      color: data.color,
                    };
                  }
                };

                return (
                  <Draggable
                    key={field}
                    position={textPositions[field]}
                    onStop={(e, d) => handleTextDrag(field, e, d)}
                    bounds="parent"
                  >
                    <div
                      className={`draggable-element text-element ${(printType === 'gold' || printType === 'silver') ? 'metallic-text' : ''}`}
                      style={{
                        ...getTextStyle(),
                        whiteSpace: field === 'address' ? 'pre-line' : 'nowrap',
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

      {/* BGMミュートボタン */}
      <button
        className={`bgm-mute-btn ${isMuted ? 'muted' : ''}`}
        onClick={toggleMute}
        title={isMuted ? 'BGMをオンにする' : 'BGMをオフにする'}
      >
        {isMuted ? '🔇' : '🎵'}
      </button>
    </div>
  );
};

export default ShurikenDesigner;
