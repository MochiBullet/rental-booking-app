import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import html2canvas from 'html2canvas';
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
const SCROLL_POSITION_KEY = 'shuriken-designer-scroll';

const ShurikenDesigner = () => {
  const previewRef = useRef(null);
  const isInitialLoad = useRef(true);

  // 金銀切り替え時の再マウント用カウンター
  const [metallicRenderKey, setMetallicRenderKey] = useState(0);

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

  // 画像キャプチャ用
  const [captureMode, setCaptureMode] = useState(null); // null, 'preview', 'print'
  const [capturedImages, setCapturedImages] = useState(null);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // お客様情報入力用
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // 確認モーダル用の表示面
  const [modalPreviewSide, setModalPreviewSide] = useState('front');

  // GAS WebアプリのURL（設定が必要）
  const GAS_WEBAPP_URL = process.env.REACT_APP_GAS_WEBAPP_URL || '';

  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef(null);
  const frontPreviewRef = useRef(null);
  const backPreviewRef = useRef(null);

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
      // 金銀切り替えリロード後のスクロール位置復帰
      const savedScroll = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScroll) {
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
        }, 100);
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

    const updateSideData = (prevData) => {
      // 金銀は保持、カラー印刷(none)で黒カードに変更した場合は白印刷に変更
      let newPrintType = prevData.printType;
      if (prevData.printType === 'gold' || prevData.printType === 'silver') {
        // 金銀は保持
        newPrintType = prevData.printType;
      } else if (newColor === 'black' && prevData.printType === 'none') {
        // 黒カードでカラー印刷は不可なので白印刷に変更
        newPrintType = 'white';
      } else if (newColor === 'white' && prevData.printType === 'white') {
        // 白カードで白印刷ならカラーに戻す
        newPrintType = 'none';
      }

      return {
        ...prevData,
        printType: newPrintType,
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
      };
    };

    setFrontData(updateSideData);
    setBackData(updateSideData);
  };

  // 印刷タイプ変更ハンドラー
  const handlePrintTypeChange = (newType) => {
    const oldType = printType;

    // 金銀間の直接切り替え時はデータ保存後にリロード
    const wasMetallic = oldType === 'gold' || oldType === 'silver';
    const isNewMetallic = newType === 'gold' || newType === 'silver';
    if (wasMetallic && isNewMetallic && oldType !== newType) {
      // 先にlocalStorageに保存してからリロード
      const newData = { ...currentData, printType: newType };
      const savedData = {
        designMode,
        selectedTemplates,
        cardSide,
        cardColor,
        globalFont,
        frontData: cardSide === 'front' ? newData : frontData,
        backData: cardSide === 'back' ? newData : backData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
      // スクロール位置を保存してリロード
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
      window.location.reload();
      return;
    }

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

  // レンダリング完了を待つヘルパー関数
  const waitForRender = () => {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100);
        });
      });
    });
  };

  // DOMを実際の画像に変換してからキャプチャする
  // metallicType: 'gold', 'silver', または 'print'（印刷用黒色）
  const preRenderMetallicElements = async (container, metallicType) => {
    const restorationData = [];

    // metallicType が指定されていない場合はスキップ
    if (!metallicType || (metallicType !== 'gold' && metallicType !== 'silver' && metallicType !== 'print')) {
      return restorationData;
    }

    const isGold = metallicType === 'gold';
    const isPrint = metallicType === 'print';

    // 金銀マスク画像を処理
    const metallicImages = container.querySelectorAll('.metallic-masked-image');
    for (const element of metallicImages) {
      const computedStyle = window.getComputedStyle(element);
      const maskImageUrl = computedStyle.maskImage || computedStyle.WebkitMaskImage;
      if (!maskImageUrl || maskImageUrl === 'none') continue;

      const urlMatch = maskImageUrl.match(/url\(["']?([^"')]+)["']?\)/);
      if (!urlMatch) continue;

      const imageSrc = urlMatch[1];
      const rect = element.getBoundingClientRect();
      const originalHTML = element.innerHTML;
      const originalStyles = {
        background: element.style.background,
        maskImage: element.style.maskImage,
        WebkitMaskImage: element.style.WebkitMaskImage,
      };

      // Canvas で描画
      const dataUrl = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width || rect.width * 2 || 200;
          canvas.height = img.height || rect.height * 2 || 200;

          // 塗りつぶし色（印刷モードは黒、それ以外はグラデーション）
          if (isPrint) {
            ctx.fillStyle = '#000000';
          } else {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            if (isGold) {
              gradient.addColorStop(0, '#D4AF37');
              gradient.addColorStop(0.25, '#FFD700');
              gradient.addColorStop(0.5, '#FFF8DC');
              gradient.addColorStop(0.75, '#FFD700');
              gradient.addColorStop(1, '#B8860B');
            } else {
              gradient.addColorStop(0, '#C0C0C0');
              gradient.addColorStop(0.25, '#E8E8E8');
              gradient.addColorStop(0.5, '#FFFFFF');
              gradient.addColorStop(0.75, '#E8E8E8');
              gradient.addColorStop(1, '#A0A0A0');
            }
            ctx.fillStyle = gradient;
          }
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = imageSrc;
      });

      if (dataUrl) {
        const imgEl = document.createElement('img');
        imgEl.src = dataUrl;
        imgEl.style.width = '100%';
        imgEl.style.height = '100%';
        imgEl.style.objectFit = 'contain';
        element.innerHTML = '';
        element.appendChild(imgEl);
        element.style.background = 'none';
        element.style.maskImage = 'none';
        element.style.WebkitMaskImage = 'none';

        restorationData.push({ element, originalHTML, originalStyles, type: 'image' });
      }
    }

    // 金銀テキストを処理
    const metallicTexts = container.querySelectorAll('.metallic-text');
    for (const element of metallicTexts) {
      const text = element.textContent;
      if (!text || text.trim() === '') continue;

      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize) * 2; // 高解像度用
      const fontFamily = computedStyle.fontFamily;
      const fontWeight = computedStyle.fontWeight;

      const originalHTML = element.innerHTML;
      const originalStyles = {
        background: element.style.background,
        WebkitBackgroundClip: element.style.WebkitBackgroundClip,
        WebkitTextFillColor: element.style.WebkitTextFillColor,
        backgroundClip: element.style.backgroundClip,
      };

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(text);
      canvas.width = Math.ceil(metrics.width) + 16;
      canvas.height = Math.ceil(fontSize * 1.4);

      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

      // 塗りつぶし色（印刷モードは黒、それ以外はグラデーション）
      if (isPrint) {
        ctx.fillStyle = '#000000';
      } else {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (isGold) {
          gradient.addColorStop(0, '#bf953f');
          gradient.addColorStop(0.25, '#fcf6ba');
          gradient.addColorStop(0.5, '#b38728');
          gradient.addColorStop(0.75, '#fbf5b7');
          gradient.addColorStop(1, '#aa771c');
        } else {
          gradient.addColorStop(0, '#c0c0c0');
          gradient.addColorStop(0.25, '#ffffff');
          gradient.addColorStop(0.5, '#a8a8a8');
          gradient.addColorStop(0.75, '#e8e8e8');
          gradient.addColorStop(1, '#909090');
        }
        ctx.fillStyle = gradient;
      }
      ctx.textBaseline = 'top';
      ctx.fillText(text, 8, 8);

      const imgEl = document.createElement('img');
      imgEl.src = canvas.toDataURL('image/png');
      imgEl.style.height = `${parseFloat(computedStyle.fontSize) * 1.15}px`;
      imgEl.style.display = 'block';
      imgEl.style.verticalAlign = 'middle';

      element.innerHTML = '';
      element.appendChild(imgEl);
      element.style.background = 'none';
      element.style.WebkitBackgroundClip = 'unset';
      element.style.WebkitTextFillColor = 'unset';
      element.style.backgroundClip = 'unset';

      restorationData.push({ element, originalHTML, originalStyles, type: 'text' });
    }

    return restorationData;
  };

  // 元の状態に戻す
  const restoreMetallicElements = (restorationData) => {
    for (const data of restorationData) {
      data.element.innerHTML = data.originalHTML;
      if (data.type === 'image') {
        data.element.style.background = data.originalStyles.background;
        data.element.style.maskImage = data.originalStyles.maskImage;
        data.element.style.WebkitMaskImage = data.originalStyles.WebkitMaskImage;
      } else {
        data.element.style.background = data.originalStyles.background;
        data.element.style.WebkitBackgroundClip = data.originalStyles.WebkitBackgroundClip;
        data.element.style.WebkitTextFillColor = data.originalStyles.WebkitTextFillColor;
        data.element.style.backgroundClip = data.originalStyles.backgroundClip;
      }
    }
  };

  // 画像キャプチャ処理
  const handleCapture = async () => {
    if (!previewRef.current) return;

    setIsCapturing(true);

    try {
      const results = {
        front: { preview: null, print: null },
        back: { preview: null, print: null },
      };

      // 現在の面とズームを保存
      const originalSide = cardSide;
      const originalZoom = previewZoom;

      // ズームを100%に固定（キャプチャ用）
      setPreviewZoom(100);

      const html2canvasOptions = {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      };

      // 表面をキャプチャ
      setCardSide('front');
      await waitForRender();
      await new Promise(resolve => setTimeout(resolve, 500));

      const wrapper = previewRef.current.querySelector('.card-preview-wrapper');

      // 表面の印刷タイプを取得して金銀要素を事前に画像化
      const frontMetallicType = frontData.printType;
      const restorationData = await preRenderMetallicElements(wrapper, frontMetallicType);
      await new Promise(resolve => setTimeout(resolve, 100));

      // 表面プレビュー版キャプチャ（お客様用：金銀効果付き）
      const frontPreviewCanvas = await html2canvas(wrapper, html2canvasOptions);
      results.front.preview = frontPreviewCanvas.toDataURL('image/png');

      // 元に戻す
      restoreMetallicElements(restorationData);

      // 表面印刷版キャプチャ（店舗用：金銀→黒、透過維持）
      // 金銀の場合は事前レンダリングで黒色に変換
      const frontPrintType = frontData.printType;
      const needsPrintRender = frontPrintType === 'gold' || frontPrintType === 'silver';

      let frontPrintRestorationData = [];
      if (needsPrintRender) {
        frontPrintRestorationData = await preRenderMetallicElements(wrapper, 'print');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setCaptureMode('print');
      await waitForRender();
      await new Promise(resolve => setTimeout(resolve, 300));

      const frontPrintCanvas = await html2canvas(wrapper, html2canvasOptions);
      results.front.print = frontPrintCanvas.toDataURL('image/png');

      if (needsPrintRender) {
        restoreMetallicElements(frontPrintRestorationData);
      }
      setCaptureMode(null);

      // 裏面に内容があるかチェック
      const hasBackContent = backData.templateImage ||
        backData.logoImage ||
        backData.logo2Image ||
        Object.values(backData.formData).some(field => field.text && field.text.trim() !== '');

      if (hasBackContent) {
        // 裏面をキャプチャ
        setCardSide('back');
        await waitForRender();
        await new Promise(resolve => setTimeout(resolve, 500));

        // 裏面の印刷タイプを取得して金銀要素を事前に画像化
        const backMetallicType = backData.printType;
        const backRestorationData = await preRenderMetallicElements(wrapper, backMetallicType);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 裏面プレビュー版キャプチャ（お客様用）
        const backPreviewCanvas = await html2canvas(wrapper, html2canvasOptions);
        results.back.preview = backPreviewCanvas.toDataURL('image/png');

        // 元に戻す
        restoreMetallicElements(backRestorationData);

        // 裏面印刷版キャプチャ（店舗用：金銀→黒、透過維持）
        const backPrintType = backData.printType;
        const needsBackPrintRender = backPrintType === 'gold' || backPrintType === 'silver';

        let backPrintRestorationData = [];
        if (needsBackPrintRender) {
          backPrintRestorationData = await preRenderMetallicElements(wrapper, 'print');
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setCaptureMode('print');
        await waitForRender();
        await new Promise(resolve => setTimeout(resolve, 300));

        const backPrintCanvas = await html2canvas(wrapper, html2canvasOptions);
        results.back.print = backPrintCanvas.toDataURL('image/png');

        if (needsBackPrintRender) {
          restoreMetallicElements(backPrintRestorationData);
        }
        setCaptureMode(null);
      }

      // 元の状態に戻す
      setCardSide(originalSide);
      setPreviewZoom(originalZoom);

      setCapturedImages(results);
      setModalPreviewSide('front');
      setShowCaptureModal(true);
    } catch (error) {
      console.error('キャプチャエラー:', error);
      alert('画像の生成に失敗しました。');
    } finally {
      setIsCapturing(false);
      setCaptureMode(null);
    }
  };

  // GASに送信
  const handleSubmitToGAS = async () => {
    if (!capturedImages) return;

    // 入力バリデーション
    if (!customerName.trim()) {
      alert('お名前を入力してください。');
      return;
    }
    if (!customerEmail.trim()) {
      alert('メールアドレスを入力してください。');
      return;
    }
    // 簡易メールバリデーション
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      alert('正しいメールアドレスを入力してください。');
      return;
    }

    // GAS URLが設定されていない場合
    if (!GAS_WEBAPP_URL) {
      alert('送信先が設定されていません。\n管理者にお問い合わせください。');
      return;
    }

    setIsSubmitting(true);

    try {
      // 送信データを作成
      const submitData = {
        customerInfo: {
          name: customerName.trim(),
          email: customerEmail.trim(),
        },
        images: {
          frontPreview: capturedImages.front.preview,
          frontPrint: capturedImages.front.print,
          backPreview: capturedImages.back.preview || null,
          backPrint: capturedImages.back.print || null,
        },
        designData: {
          cardColor: cardColor,
          printType: frontData.printType,
          backPrintType: backData.printType,
          hasBackPrint: !!(capturedImages.back.preview),
          totalPrice: calculateTotalPrice(),
          frontFormData: frontData.formData,
          backFormData: backData.formData,
          globalFont: globalFont,
        },
        timestamp: new Date().toISOString(),
      };

      // hidden formで送信（CORS回避）
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GAS_WEBAPP_URL;
      form.target = 'gas-iframe';
      form.style.display = 'none';
      form.enctype = 'application/x-www-form-urlencoded';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify(submitData);
      form.appendChild(input);

      // iframe作成
      let iframe = document.getElementById('gas-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'gas-iframe';
        iframe.name = 'gas-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // 送信完了を待つ
      await new Promise(resolve => setTimeout(resolve, 2500));

      alert('送信が完了しました！\n担当者より連絡いたします。');
      setShowCaptureModal(false);
      setCustomerName('');
      setCustomerEmail('');

    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信に失敗しました。\nしばらく経ってからお試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 合計金額を計算
  const calculateTotalPrice = () => {
    let price = 0;

    // カード料金
    if (cardColor === 'black') {
      price += 500;
    }

    // 印刷タイプ料金（表面）
    if (frontData.printType === 'gold' || frontData.printType === 'silver') {
      price += 10000;
    } else if (frontData.printType === 'none') {
      price += 5500; // カラー印刷
    }

    // 裏面印刷
    const hasBackContent = backData.templateImage ||
      backData.logoImage ||
      backData.logo2Image ||
      Object.values(backData.formData).some(field => field.text && field.text.trim() !== '');

    if (hasBackContent) {
      price += 2000;
      // 裏面が金銀の場合追加料金
      if (backData.printType === 'gold' || backData.printType === 'silver') {
        price += 3000;
      }
    }

    return price;
  };

  // 印刷用の色を取得（金銀→黒、黒カード→白カードで黒）
  const getPrintModeStyles = () => {
    if (captureMode !== 'print') return {};

    const currentPrintType = currentData.printType;
    const isCurrentMetallic = currentPrintType === 'gold' || currentPrintType === 'silver';

    return {
      cardBackground: '#ffffff', // 常に白カード
      textColor: '#000000', // 常に黒文字
      imageFilter: isCurrentMetallic ? 'grayscale(100%) brightness(0)' : 'grayscale(100%) brightness(0)',
    };
  };

  const printStyles = getPrintModeStyles();

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

  // 金銀選択時かどうか
  const isMetallic = printType === 'gold' || printType === 'silver';

  // 画像に適用するフィルターを取得
  const getImageFilter = () => {
    // 印刷モードでは黒に変換
    if (captureMode === 'print') {
      return 'grayscale(100%) brightness(0)';
    }
    // 金銀選択時はマスクで塗りつぶすのでフィルターは使わない
    if (isMetallic) {
      return 'none';
    }
    // 黒カードでカラー/白印刷の場合は白に変換
    if (cardColor === 'black') {
      return 'grayscale(100%) brightness(2) contrast(0.5)';
    }
    // 白カードでカラー印刷の場合はフィルターなし
    return 'none';
  };

  // 金銀の塗りつぶしグラデーション（光沢感付き）
  const getMetallicFill = () => {
    // 印刷モードでは黒一色
    if (captureMode === 'print') {
      return '#000000';
    }
    if (printType === 'gold') {
      if (cardColor === 'black') {
        // 黒カード用：より明るい金色
        return 'linear-gradient(135deg, #FFD700 0%, #FFEC8B 20%, #FFFACD 40%, #FFFFFF 50%, #FFFACD 60%, #FFD700 80%, #DAA520 100%)';
      }
      return 'linear-gradient(135deg, #D4AF37 0%, #FFD700 25%, #FFF8DC 45%, #FFD700 55%, #B8860B 75%, #D4AF37 100%)';
    }
    if (printType === 'silver') {
      if (cardColor === 'black') {
        // 黒カード用：より明るく輝くシルバー（白に近い）
        return `linear-gradient(135deg,
          #C0C0C0 0%,
          #E8E8E8 5%,
          #FFFFFF 12%,
          #F0F0F0 18%,
          #FFFFFF 25%,
          #E0E0E0 32%,
          #FFFFFF 40%,
          #FFFFFF 50%,
          #FFFFFF 60%,
          #E8E8E8 68%,
          #FFFFFF 75%,
          #F5F5F5 82%,
          #FFFFFF 88%,
          #E0E0E0 94%,
          #C0C0C0 100%)`;
      }
      // 白カード用：コントラストのある光沢
      return `linear-gradient(135deg,
        #6B6B6B 0%,
        #9A9A9A 8%,
        #FFFFFF 15%,
        #C0C0C0 22%,
        #8A8A8A 30%,
        #E8E8E8 38%,
        #FFFFFF 45%,
        #F5F5F5 50%,
        #FFFFFF 55%,
        #D0D0D0 62%,
        #909090 70%,
        #FFFFFF 78%,
        #B8B8B8 85%,
        #7A7A7A 92%,
        #6B6B6B 100%)`;
    }
    return 'none';
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

          {/* 金額明細 */}
          <div className="price-breakdown">
            <h4>金額明細</h4>
            <div className="price-items">
              <div className="price-item">
                <span className="price-label">カード</span>
                <span className="price-value">
                  {cardColor === 'white' ? '白カード' : '黒カード'}
                </span>
                <span className="price-amount">
                  ¥{cardColor === 'white' ? '0' : '500'}
                </span>
              </div>
              <div className="price-item">
                <span className="price-label">表面印刷</span>
                <span className="price-value">
                  {frontData.printType === 'gold' || frontData.printType === 'silver' ? '金銀印刷' : 'カラー印刷'}
                </span>
                <span className="price-amount">
                  ¥{frontData.printType === 'gold' || frontData.printType === 'silver' ? '10,000' : '5,500'}
                </span>
              </div>
              {(() => {
                // 裏面に何かコンテンツがあるかチェック
                const hasBackContent = backData.templateImage ||
                  backData.logoImage ||
                  backData.logo2Image ||
                  Object.values(backData.formData).some(field => field.text && field.text.trim() !== '');

                if (hasBackContent) {
                  const isBackMetallic = backData.printType === 'gold' || backData.printType === 'silver';
                  return (
                    <div className="price-item">
                      <span className="price-label">裏面印刷</span>
                      <span className="price-value">
                        {isBackMetallic ? '金銀印刷' : '通常印刷'}
                      </span>
                      <span className="price-amount">
                        ¥{isBackMetallic ? '3,000' : '2,000'}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="price-total">
                <span className="price-label">合計</span>
                <span className="price-amount">
                  ¥{(() => {
                    let total = 0;
                    // カード代
                    total += cardColor === 'black' ? 500 : 0;
                    // 表面印刷
                    total += (frontData.printType === 'gold' || frontData.printType === 'silver') ? 10000 : 5500;
                    // 裏面印刷
                    const hasBackContent = backData.templateImage ||
                      backData.logoImage ||
                      backData.logo2Image ||
                      Object.values(backData.formData).some(field => field.text && field.text.trim() !== '');
                    if (hasBackContent) {
                      const isBackMetallic = backData.printType === 'gold' || backData.printType === 'silver';
                      total += isBackMetallic ? 3000 : 2000;
                    }
                    return total.toLocaleString();
                  })()}
                </span>
              </div>
            </div>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            リセット
          </button>

          <div className="submit-section">
            <button
              className="action-btn primary"
              onClick={handleCapture}
              disabled={isCapturing}
            >
              {isCapturing ? '画像生成中...' : 'この内容で依頼する'}
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
              background: captureMode === 'print' ? '#ffffff' : (cardColor === 'white' ? '#1a1a2e' : '#4a4a5a'),
            }}
          >
            <div
              className="card-preview-wrapper"
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'center center',
                background: captureMode === 'print' ? '#ffffff' : (cardColor === 'white' ? '#ffffff' : '#1a1a1a'),
              }}
            >
              {/* 背景画像（金銀選択時はマスクで塗りつぶし） */}
              {templateImage && (
                <div
                  key={`bg-wrapper-${printType}-${cardColor}-${templateImage.substring(0, 50)}`}
                  className="preview-background-wrapper"
                  style={{
                    transform: `translate(-50%, -50%) scale(${templateScale / 100})`,
                  }}
                >
                  {isMetallic ? (
                    <div
                      key={`bg-metallic-${printType}-${cardColor}-${metallicRenderKey}`}
                      className="preview-background metallic-masked-image"
                      style={{
                        WebkitMaskImage: `url(${templateImage})`,
                        maskImage: `url(${templateImage})`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        background: getMetallicFill(),
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  ) : (
                    <img
                      src={templateImage}
                      alt="背景"
                      className="preview-background"
                      style={{
                        filter: getImageFilter(),
                      }}
                    />
                  )}
                </div>
              )}

              {/* アイコン1（金銀選択時はマスクで塗りつぶし） */}
              {logoImage && (
                <Draggable
                  key={`logo1-drag-${printType}-${cardColor}`}
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
                    {isMetallic ? (
                      <div
                        key={`logo1-metallic-${printType}-${cardColor}-${metallicRenderKey}`}
                        className="metallic-masked-image"
                        style={{
                          WebkitMaskImage: `url(${logoImage})`,
                          maskImage: `url(${logoImage})`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                          background: getMetallicFill(),
                          width: '100%',
                          paddingBottom: '100%',
                        }}
                      />
                    ) : (
                      <img
                        src={logoImage}
                        alt="アイコン1"
                        style={{
                          filter: getImageFilter(),
                        }}
                      />
                    )}
                  </div>
                </Draggable>
              )}

              {/* アイコン2（金銀選択時はマスクで塗りつぶし） */}
              {logo2Image && (
                <Draggable
                  key={`logo2-drag-${printType}-${cardColor}`}
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
                    {isMetallic ? (
                      <div
                        key={`logo2-metallic-${printType}-${cardColor}-${metallicRenderKey}`}
                        className="metallic-masked-image"
                        style={{
                          WebkitMaskImage: `url(${logo2Image})`,
                          maskImage: `url(${logo2Image})`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                          background: getMetallicFill(),
                          width: '100%',
                          paddingBottom: '100%',
                        }}
                      />
                    ) : (
                      <img
                        src={logo2Image}
                        alt="アイコン2"
                        style={{
                          filter: getImageFilter(),
                        }}
                      />
                    )}
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

                  // 印刷モードでは常に黒文字
                  if (captureMode === 'print') {
                    return {
                      ...baseStyle,
                      color: '#000000',
                      background: 'none',
                      WebkitBackgroundClip: 'unset',
                      WebkitTextFillColor: '#000000',
                    };
                  }

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

      {/* キャプチャ結果モーダル */}
      {showCaptureModal && capturedImages && (
        <div className="capture-modal-overlay" onClick={() => !isSubmitting && setShowCaptureModal(false)}>
          <div className="capture-modal" onClick={(e) => e.stopPropagation()}>
            <h2>デザイン確認・送信</h2>
            <p className="capture-modal-description">
              デザイン内容をご確認ください
            </p>

            {/* 表面/裏面 切り替えタブ */}
            {capturedImages.back.preview && (
              <div className="modal-side-tabs">
                <button
                  className={`modal-side-tab ${modalPreviewSide === 'front' ? 'active' : ''}`}
                  onClick={() => setModalPreviewSide('front')}
                >
                  表面
                </button>
                <button
                  className={`modal-side-tab ${modalPreviewSide === 'back' ? 'active' : ''}`}
                  onClick={() => setModalPreviewSide('back')}
                >
                  裏面
                </button>
              </div>
            )}

            <div className="capture-images-grid">
              <div className="capture-section">
                {!capturedImages.back.preview && <h3>表面</h3>}
                <div className="capture-image-single">
                  <img
                    src={modalPreviewSide === 'front' ? capturedImages.front.preview : capturedImages.back.preview}
                    alt={modalPreviewSide === 'front' ? '表面' : '裏面'}
                  />
                </div>
              </div>
            </div>

            <div className="capture-modal-price">
              <span>合計金額:</span>
              <span className="price-value">¥{calculateTotalPrice().toLocaleString()}</span>
            </div>

            {/* お客様情報入力 */}
            <div className="customer-info-section">
              <h3>お客様情報</h3>
              <div className="customer-input-group">
                <label>
                  <span>お名前 <span className="required">*</span></span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="山田 太郎"
                    disabled={isSubmitting}
                  />
                </label>
                <label>
                  <span>メールアドレス <span className="required">*</span></span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@email.com"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>

            <div className="capture-modal-actions">
              <button
                className="capture-btn primary"
                onClick={handleSubmitToGAS}
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : 'この内容で注文する'}
              </button>
              <button
                className="capture-btn secondary"
                onClick={() => setShowCaptureModal(false)}
                disabled={isSubmitting}
              >
                戻って編集する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* キャプチャ中のオーバーレイ */}
      {isCapturing && (
        <div className="capture-loading-overlay">
          <div className="capture-loading-content">
            <img src={shurikenLogo} alt="" className="capture-loading-logo" />
            <p>画像を生成しています...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShurikenDesigner;
