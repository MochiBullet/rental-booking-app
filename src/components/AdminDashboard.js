import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingWheel from './LoadingWheel';
import './AdminDashboard.css';
import dataSyncService from '../services/dataSync';
import SiteSettingsManagement from './SiteSettingsManagement';
import { vehicleAPI } from '../services/api';
import { announcementsAPI } from '../services/announcementsAPI';

const AdminDashboard = ({ onSettingsUpdate }) => {
  const navigate = useNavigate();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeSection, setActiveSection] = useState('vehicles');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  // 統合認証チェック（リロード対応）
  useEffect(() => {
    const checkAdminAuthentication = () => {
      console.log('🔐 AdminDashboard統合認証チェック開始...');
      console.log('🌐 現在のURL:', window.location.href);
      console.log('⏰ チェック時刻:', new Date().toISOString());
      
      const adminUser = localStorage.getItem('adminUser');
      const adminSession = sessionStorage.getItem('adminSession');
      const adminTimestamp = localStorage.getItem('adminLoginTime');
      const adminInfo = localStorage.getItem('adminInfo');
      
      console.log('🔍 認証データ確認:', { 
        adminUser, 
        adminSession, 
        adminTimestamp, 
        hasAdminInfo: !!adminInfo,
        currentTime: Date.now()
      });
      
      // セッション確認（複数の認証方法をチェック）
      const hasAdminSession = adminSession === 'true' || adminUser === 'true';
      
      // 管理者情報オブジェクトの確認
      let parsedAdminInfo = null;
      if (adminInfo) {
        try {
          parsedAdminInfo = JSON.parse(adminInfo);
        } catch (e) {
          console.warn('adminInfo parse error:', e);
          localStorage.removeItem('adminInfo');
        }
      }
      
      // 認証状態判定（いずれかの方法で認証されている場合）
      if (hasAdminSession || parsedAdminInfo) {
        const currentTime = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7日間
        
        // タイムスタンプ取得（複数ソースから）
        let loginTime = null;
        if (adminTimestamp) {
          loginTime = parseInt(adminTimestamp);
        } else if (parsedAdminInfo?.loginTime) {
          loginTime = parsedAdminInfo.loginTime;
        }
        
        if (loginTime && !isNaN(loginTime)) {
          // 期限チェック（7日以内）
          const timeDiff = currentTime - loginTime;
          console.log('⏰ ログイン経過時間:', Math.floor(timeDiff / (1000 * 60 * 60 * 24)), '日');
          
          if (timeDiff < sevenDays) {
            // 認証成功 - セッション更新
            console.log('✅ AdminDashboard管理者認証成功 - アクセス許可');
            
            localStorage.setItem('adminUser', 'true');
            sessionStorage.setItem('adminSession', 'true');
            localStorage.setItem('adminLoginTime', currentTime.toString());
            
            // adminInfo更新
            const updatedAdminInfo = {
              username: 'admin',
              loginTime: loginTime, // 元のログイン時刻を保持
              lastActivity: currentTime // 最新活動時刻を更新
            };
            localStorage.setItem('adminInfo', JSON.stringify(updatedAdminInfo));
            
            setIsAuthChecking(false);
            setIsAuthenticating(false);
            
            // データロード開始
            loadDashboardData();
            loadSiteSettings();
            return true;
          } else {
            // 期限切れ
            console.log('⏰ AdminDashboard管理者ログインが期限切れです（7日超過）');
          }
        } else {
          // タイムスタンプが無効 - 新規設定
          console.log('🆕 AdminDashboardタイムスタンプ新規設定');
          const newLoginTime = currentTime;
          
          localStorage.setItem('adminUser', 'true');
          sessionStorage.setItem('adminSession', 'true');
          localStorage.setItem('adminLoginTime', newLoginTime.toString());
          
          const newAdminInfo = {
            username: 'admin',
            loginTime: newLoginTime,
            lastActivity: newLoginTime
          };
          localStorage.setItem('adminInfo', JSON.stringify(newAdminInfo));
          
          setIsAuthChecking(false);
          setIsAuthenticating(false);
          
          // データロード開始
          loadDashboardData();
          loadSiteSettings();
          return true;
        }
      }
      
      // 認証失敗 - 全データクリア後リダイレクト
      console.log('❌ AdminDashboard認証失敗 - ログインページにリダイレクト');
      console.log('🔍 認証失敗理由詳細:', {
        hasAdminSession,
        parsedAdminInfo,
        adminTimestamp,
        currentTime: Date.now()
      });
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminLoginTime');
      localStorage.removeItem('adminInfo');
      sessionStorage.removeItem('adminSession');
      
      setIsAuthChecking(false);
      navigate('/admin-login');
      return false;
    };
    
    // 認証チェック実行
    checkAdminAuthentication();
  }, [navigate]);
  
  // 管理者の活動時刻を定期的に更新（ログイン状態維持のため）
  useEffect(() => {
    const updateAdminActivity = () => {
      const adminInfo = localStorage.getItem('adminInfo');
      if (adminInfo) {
        try {
          const info = JSON.parse(adminInfo);
          info.lastActivity = Date.now();
          localStorage.setItem('adminInfo', JSON.stringify(info));
          localStorage.setItem('adminLoginTime', Date.now().toString());
        } catch (e) {
          console.warn('adminInfo parse error:', e);
        }
      }
    };
    
    // 初回実行
    updateAdminActivity();
    
    // 5分ごとに活動時刻を更新
    const interval = setInterval(updateAdminActivity, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const [detailsType, setDetailsType] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    licenseNumber: '',
    points: 0
  });
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    totalVehicles: 0,
    totalUsers: 0,
    todayBookings: 0
  });
  
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'car',
    price: '',
    passengers: '',
    features: '',
    image: '' // 車両画像のBase64データ
  });
  const [siteSettings, setSiteSettings] = useState({
    primaryColor: '#43a047',
    secondaryColor: '#66bb6a',
    accentColor: '#81c784',
    siteName: "M's BASE Rental",
    theme: 'green'
  });
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    published: true
  });
  const [isSavingVehicle, setIsSavingVehicle] = useState(false); // 重複送信防止
  const [lastSaveTime, setLastSaveTime] = useState(0); // デバウンス用
  // Removed hardcoded homeContent - now managed via SiteSettingsManagement
  const [termsContent, setTermsContent] = useState({
    title: 'M\'s BASE Rental 利用規約',
    sections: []
  });
  const [showAddTermsModal, setShowAddTermsModal] = useState(false);
  const [showEditTermsModal, setShowEditTermsModal] = useState(false);
  const [selectedTermsSection, setSelectedTermsSection] = useState(null);
  const [newTermsSection, setNewTermsSection] = useState({
    title: '',
    content: ''
  });
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState({
    title: 'M\'s BASE Rental プライバシーポリシー',
    sections: []
  });
  const [showAddPrivacyModal, setShowAddPrivacyModal] = useState(false);
  const [showEditPrivacyModal, setShowEditPrivacyModal] = useState(false);
  const [selectedPrivacySection, setSelectedPrivacySection] = useState(null);
  const [newPrivacySection, setNewPrivacySection] = useState({
    title: '',
    content: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // CSS変数を更新する関数を先に定義
  const updateCSSVariables = (settings) => {
    const root = document.documentElement;
    root.style.setProperty('--gradient-1', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 50%, ${settings.accentColor} 100%)`);
    root.style.setProperty('--gradient-2', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`);
    root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${settings.primaryColor}22 0%, ${settings.secondaryColor}22 100%)`);
    root.style.setProperty('--green', settings.primaryColor);
    root.style.setProperty('--green-hover', settings.primaryColor + 'dd');
    root.style.setProperty('--green-dark', settings.primaryColor);
    root.style.setProperty('--green-light', settings.secondaryColor);
    root.style.setProperty('--green-pale', settings.accentColor + '22');
  };

  const loadAnnouncements = async () => {
    try {
      console.log('📢 お知らせデータを読み込み中...');
      const result = await announcementsAPI.getAllAnnouncements();
      if (result.success) {
        setAnnouncements(result.announcements);
        console.log('✅ お知らせデータ読み込み完了:', result.announcements.length, '件');
      } else {
        console.error('Failed to load announcements:', result.error);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    }
  };

  const loadSiteSettings = () => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSiteSettings(settings);
      // 保存された設定をCSSに適用
      updateCSSVariables(settings);
      // サイト名も適用
      if (settings.siteName) {
        document.title = settings.siteName;
      }
    }
    
    // Removed hardcoded homeContent loading - now managed via SiteSettingsManagement
    
    // 約款コンテンツも読み込み
    const savedTerms = localStorage.getItem('termsContent');
    if (savedTerms) {
      setTermsContent(JSON.parse(savedTerms));
    }
    
    // プライバシーポリシーコンテンツも読み込み
    const savedPrivacy = localStorage.getItem('privacyPolicyContent');
    if (savedPrivacy) {
      setPrivacyPolicyContent(JSON.parse(savedPrivacy));
    }
    
    // お知らせデータの読み込み（DynamoDBから）
    loadAnnouncements();
  };

  // この重複したuseEffectは削除（上記の統合認証チェックに統合済み）

  const loadDashboardData = async () => {
    try {
      setIsSyncing(true);
      
      console.log('🔄 データベースから管理者データを読み込み中...');
      
      // データベースから車両データを取得
      let vehiclesData = [];
      try {
        vehiclesData = await vehicleAPI.getAll();
        console.log('✅ データベースから車両データ取得完了:', vehiclesData?.length || 0, '件');
      } catch (vehicleError) {
        console.warn('⚠️ 車両データベース接続エラー:', vehicleError.message);
        // フォールバック: 空配列を使用（在庫なし状態）
        vehiclesData = [];
      }
      
      // 予約とユーザーは一時的にローカルストレージから取得（後で移行予定）
      const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 既存ユーザーの会員番号を一括生成（未設定の場合のみ）
    let usersUpdated = false;
    const updatedUsers = storedUsers.map(user => {
      if (!user.memberNumber && user.licenseNumber && user.licenseNumber.length >= 4) {
        const registrationDate = user.createdAt ? new Date(user.createdAt) : new Date();
        const memberNumber = generateMemberNumber(user.licenseNumber, registrationDate);
        usersUpdated = true;
        return { ...user, memberNumber };
      }
      return user;
    });
    
    // 更新があった場合はlocalStorageに保存
    if (usersUpdated) {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } else {
      setUsers(storedUsers);
    }
    
    setBookings(storedBookings);
    setVehicles(vehiclesData);
    
    const today = new Date().toDateString();
    const todayBookingsCount = storedBookings.filter(b => 
      new Date(b.bookingDate).toDateString() === today
    ).length;
    
    // 予約ステータス別集計
    const confirmedBookings = storedBookings.filter(b => b.status === 'confirmed').length;
    const activeBookings = storedBookings.filter(b => b.status === 'active').length;
    const completedBookings = storedBookings.filter(b => b.status === 'completed').length;
    
    
    setStats({
      totalBookings: storedBookings.length,
      confirmedBookings: confirmedBookings,
      activeBookings: activeBookings,
      completedBookings: completedBookings,
      totalVehicles: vehiclesData.length,
      totalUsers: storedUsers.length,
      todayBookings: todayBookingsCount
    });
    
    } catch (error) {
      console.error('❌ 管理者データ読み込みエラー:', error);
      showNotification(`❌ データ読み込みに失敗しました: ${error.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    // すべての管理者関連の認証情報をクリア
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminInfo');
    sessionStorage.removeItem('adminSession');
    
    console.log('🚪 管理者ログアウト - すべての認証情報をクリアしました');
    
    showNotification('ログアウトしました。お疲れ様でした。', 'info');
    
    // ホームページにリダイレクト
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  // 車両画像圧縮処理関数（APIサイズ制限対応）
  const compressVehicleImage = (file, maxWidth = 600, maxHeight = 400, quality = 0.6) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // アスペクト比を保持してリサイズ
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 白い背景を追加（透明な背景を避けるため）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // Base64形式で出力
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        let compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        
        // サイズが200KB超の場合、さらに圧縮
        if (compressedSize > 200000) {
          console.log('🔄 画像サイズが大きすぎます。追加圧縮中...', compressedSize);
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4); // より強い圧縮
          compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
          
          // それでも150KB超の場合、さらに小さく
          if (compressedSize > 150000) {
            const smallerCanvas = document.createElement('canvas');
            const smallerCtx = smallerCanvas.getContext('2d');
            const smallerWidth = width * 0.7;
            const smallerHeight = height * 0.7;
            
            smallerCanvas.width = smallerWidth;
            smallerCanvas.height = smallerHeight;
            
            smallerCtx.fillStyle = '#FFFFFF';
            smallerCtx.fillRect(0, 0, smallerWidth, smallerHeight);
            smallerCtx.drawImage(img, 0, 0, smallerWidth, smallerHeight);
            
            compressedDataUrl = smallerCanvas.toDataURL('image/jpeg', 0.3);
            compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
          }
        }
        
        console.log('🖼️ 車両画像圧縮完了:', {
          originalSize: file.size,
          compressedSize: compressedSize,
          dimensions: `${width}x${height}`,
          compression: `${Math.round((1 - compressedSize / file.size) * 100)}%削減`
        });
        
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 車両画像アップロード処理
  const handleVehicleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('❌ 画像ファイルを選択してください', 'error');
      return;
    }
    
    try {
      console.log('🔄 車両画像をアップロード中...', file.name);
      const compressedImage = await compressVehicleImage(file);
      
      // 最終サイズチェック
      const finalSize = Math.round((compressedImage.length * 3) / 4);
      if (finalSize > 300000) { // 300KB制限
        showNotification('❌ 画像サイズが大きすぎます。別の画像を選択してください', 'error');
        return;
      }
      
      setNewVehicle(prev => ({
        ...prev,
        image: compressedImage
      }));
      
      showNotification(`✅ 車両画像をアップロードしました (${Math.round(finalSize/1000)}KB)`, 'success');
    } catch (error) {
      console.error('❌ 車両画像アップロードエラー:', error);
      showNotification('❌ 画像のアップロードに失敗しました', 'error');
    }
  };

  // 編集中車両の画像アップロード処理
  const handleEditVehicleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('❌ 画像ファイルを選択してください', 'error');
      return;
    }
    
    try {
      console.log('🔄 編集中車両の画像をアップロード中...', file.name);
      const compressedImage = await compressVehicleImage(file);
      
      // 最終サイズチェック
      const finalSize = Math.round((compressedImage.length * 3) / 4);
      if (finalSize > 300000) { // 300KB制限
        showNotification('❌ 画像サイズが大きすぎます。別の画像を選択してください', 'error');
        return;
      }
      
      setSelectedVehicle(prev => ({
        ...prev,
        image: compressedImage
      }));
      
      showNotification(`✅ 車両画像を更新しました (${Math.round(finalSize/1000)}KB)`, 'success');
    } catch (error) {
      console.error('❌ 車両画像アップロードエラー:', error);
      showNotification('❌ 画像のアップロードに失敗しました', 'error');
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.price) {
      showNotification('❌ 車両名と価格は必須項目です', 'error');
      return;
    }
    
    // 重複送信を防止（デバウンス機能付き）
    const now = Date.now();
    if (isSavingVehicle || (now - lastSaveTime < 2000)) {
      console.log('🚫 車両追加処理中です。しばらくお待ちください');
      return;
    }
    
    setIsSavingVehicle(true);
    setLastSaveTime(now);
    
    try {
      const vehicle = {
        name: newVehicle.name,
        type: newVehicle.type,
        vehicleType: newVehicle.type, // APIが期待するフィールド名
        price: parseFloat(newVehicle.price),
        pricePerDay: parseFloat(newVehicle.price), // APIが期待するフィールド名
        passengers: parseInt(newVehicle.passengers) || 4,
        capacity: parseInt(newVehicle.passengers) || 4, // APIが期待するフィールド名
        available: true,
        isAvailable: true, // APIが期待するフィールド名
        createdAt: new Date().toISOString(),
        features: newVehicle.features ? newVehicle.features.split(',').map(f => f.trim()) : [],
        image: newVehicle.image || null,
        images: newVehicle.image ? [newVehicle.image] : [], // APIが期待するフィールド名
        // 複数フィールドで画像データを送信（確実な保存のため）
        vehicleImages: newVehicle.image ? [newVehicle.image] : []
      };
      
      // デバッグ: 送信データサイズを確認
      const jsonString = JSON.stringify(vehicle);
      const dataSize = new Blob([jsonString]).size;
      console.log('🔍 送信データサイズ:', {
        size: dataSize,
        sizeKB: Math.round(dataSize / 1000),
        hasImage: !!vehicle.image,
        imageSize: vehicle.image ? Math.round((vehicle.image.length * 3) / 4) : 0
      });
      
      // デバッグ: 送信するデータ構造を詳細出力
      console.log('📋 送信データ詳細:', {
        name: vehicle.name,
        type: vehicle.type,
        price: vehicle.price,
        passengers: vehicle.passengers,
        features: vehicle.features,
        hasImage: !!vehicle.image,
        imageLength: vehicle.image ? vehicle.image.length : 0
      });
      
      // デバッグ用：画像なしバージョンも準備
      const vehicleWithoutImage = { ...vehicle };
      delete vehicleWithoutImage.image;
      delete vehicleWithoutImage.images;
      
      // API Gateway制限（6MB）を考慮したサイズ制限
      let vehicleToSend = vehicle;
      if (dataSize > 4000000) { // 4MB制限（安全マージン）
        console.warn('⚠️ ペイロードサイズが大きすぎます。画像を除外して送信します');
        vehicleToSend = vehicleWithoutImage;
        showNotification('⚠️ 画像サイズが大きすぎるため、画像なしで車両を追加します', 'warning');
      } else if (dataSize > 2000000) { // 2MB以上で警告
        console.warn('⚠️ ペイロードサイズが大きいです:', Math.round(dataSize/1000), 'KB');
        showNotification('⚠️ データサイズが大きいため処理に時間がかかる可能性があります', 'warning');
      }
      
      
      console.log('🔄 データベースに車両を追加中...', vehicleToSend);
      
      // データベースに直接保存
      const savedVehicle = await vehicleAPI.create(vehicleToSend);
      console.log('✅ データベースに車両追加完了:', savedVehicle);
      
      // ローカル状態も更新（UIの即時反映のため）
      const updatedVehicles = [...vehicles, savedVehicle];
      setVehicles(updatedVehicles);
      
      setNewVehicle({
        name: '',
        type: 'car',
        price: '',
        passengers: '',
        features: '',
        image: '' // 画像データもリセット
      });
      setShowAddVehicleModal(false);
      loadDashboardData();
      
      showNotification(`🚗 車両「${vehicle.name}」がデータベースに正常に追加されました！`, 'save');
    } catch (error) {
      console.error('❌ 車両追加エラー:', error);
      showNotification(`❌ 車両追加に失敗しました: ${error.message}`, 'error');
    } finally {
      setIsSavingVehicle(false); // 処理完了時に状態をリセット
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle.name || !selectedVehicle.price) {
      showNotification('❌ 車両名と価格は必須項目です', 'error');
      return;
    }
    
    try {
      const vehicleData = {
        name: selectedVehicle.name,
        type: selectedVehicle.type,
        vehicleType: selectedVehicle.type,
        price: parseFloat(selectedVehicle.price),
        pricePerDay: parseFloat(selectedVehicle.price),
        passengers: parseInt(selectedVehicle.passengers) || 4,
        capacity: parseInt(selectedVehicle.passengers) || 4,
        available: selectedVehicle.available,
        isAvailable: selectedVehicle.available,
        features: selectedVehicle.features ? 
          (Array.isArray(selectedVehicle.features) ? selectedVehicle.features : selectedVehicle.features.split(',').map(f => f.trim())) : [],
        image: selectedVehicle.image || null,
        images: selectedVehicle.image ? [selectedVehicle.image] : [],
        // 複数フィールドで画像データを送信（確実な保存のため）
        vehicleImages: selectedVehicle.image ? [selectedVehicle.image] : []
      };
      
      console.log('🔄 データベースで車両を更新中...', vehicleData);
      
      // データベースで車両を更新
      const updatedVehicle = await vehicleAPI.update(selectedVehicle.id, vehicleData);
      console.log('✅ データベースで車両更新完了:', updatedVehicle);
      
      // ローカル状態も更新（UIの即時反映のため）
      const updatedVehicles = vehicles.map(v => 
        v.id === selectedVehicle.id ? updatedVehicle : v
      );
      setVehicles(updatedVehicles);
      
      setShowEditVehicleModal(false);
      const vehicleName = selectedVehicle.name;
      setSelectedVehicle(null);
      loadDashboardData();
      
      showNotification(`✏️ 車両「${vehicleName}」の情報がデータベースで正常に更新されました！`, 'save');
    } catch (error) {
      console.error('❌ 車両更新エラー:', error);
      showNotification(`❌ 車両更新に失敗しました: ${error.message}`, 'error');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('この車両を削除しますか？')) {
      try {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        
        console.log('🔄 データベースから車両を削除中...', vehicleId);
        
        // データベースから車両を削除
        await vehicleAPI.delete(vehicleId);
        console.log('✅ データベースから車両削除完了:', vehicleId);
        
        // ローカル状態も更新（UIの即時反映のため）
        const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
        setVehicles(updatedVehicles);
        
        loadDashboardData();
        showNotification(`🗑️ 車両「${vehicle?.name}」をデータベースから削除しました。`, 'info');
      } catch (error) {
        console.error('❌ 車両削除エラー:', error);
        showNotification(`❌ 車両削除に失敗しました: ${error.message}`, 'error');
      }
    }
  };

  const handleToggleVehicleAvailability = async (vehicleId) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const updatedAvailability = !vehicle.available;
      
      console.log('🔄 データベースで車両可用性を変更中...', vehicleId, updatedAvailability);
      
      // データベースで車両可用性を更新
      const updatedVehicle = await vehicleAPI.update(vehicleId, { 
        ...vehicle, 
        available: updatedAvailability 
      });
      console.log('✅ データベースで車両可用性更新完了:', updatedVehicle);
      
      // ローカル状態も更新（UIの即時反映のため）
      const updatedVehicles = vehicles.map(v => 
        v.id === vehicleId ? { ...v, available: updatedAvailability } : v
      );
      setVehicles(updatedVehicles);
      
      loadDashboardData();
      showNotification(
        `🔄 車両「${vehicle?.name}」をデータベースで${updatedAvailability ? '有効' : '無効'}に変更しました。`, 
        'info'
      );
    } catch (error) {
      console.error('❌ 車両可用性変更エラー:', error);
      showNotification(`❌ 車両可用性変更に失敗しました: ${error.message}`, 'error');
    }
  };


  const handleColorChange = (colorType, value) => {
    const newSettings = { ...siteSettings, [colorType]: value };
    setSiteSettings(newSettings);
    // リアルタイムでCSSを更新
    updateCSSVariables(newSettings);
  };

  const handlePresetChange = (preset) => {
    setSiteSettings(preset);
    // リアルタイムでCSSを更新
    updateCSSVariables(preset);
  };

  // 改善された通知システム
  const showNotification = (message, type = 'success', duration = 4000) => {
    // 既存の通知があれば削除
    const existingToast = document.querySelector('.success-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const notification = document.createElement('div');
    const icons = {
      success: '🎉',
      save: '💾',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    const colors = {
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      save: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    };

    notification.className = 'success-toast';
    notification.style.background = colors[type] || colors.success;
    
    notification.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.success}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // アニメーション開始
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // 自動削除
    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 400);
    }, duration);
  };

  const handleSaveDesignSettings = () => {
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    updateCSSVariables(siteSettings);
    
    // Sync to cloud
    dataSyncService.saveToCloud('siteSettings', siteSettings).catch(console.error);
    
    // サイト名も更新
    if (siteSettings.siteName) {
      document.title = siteSettings.siteName;
    }
    
    setShowDesignModal(false);
    showNotification('🎨 デザイン設定が正常に保存されました！サイトに即座反映されます。', 'save', 5000);
  };


  const handleConfirmBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed' } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    loadDashboardData();
    showNotification(`✅ 予約 #${booking?.id} を承認しました！お客様に通知されます。`, 'success');
  };

  // 車両引き渡し確定ハンドラー
  const handleCompleteHandover = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    const today = new Date().toDateString();
    const pickupDate = new Date(booking.pickupDate).toDateString();
    
    if (pickupDate !== today) {
      showNotification('❌ 引き渡し確定は引き渡し当日のみ可能です。', 'error');
      return;
    }
    
    if (window.confirm('この予約の車両引き渡しを確定しますか？')) {
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'completed', handoverDate: new Date().toISOString() } : b
      );
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      // Sync to cloud
      dataSyncService.saveToCloud('bookings', updatedBookings).catch(console.error);
      
      loadDashboardData();
      showNotification(`🏁 予約 #${booking?.id} の車両引き渡しを確定しました！`, 'success');
    }
  };

  // 統計機能削除済み - 簡素化された管理画面

  // EMERGENCY CACHE BUSTING: v3.0.3 - Overview COMPLETELY REMOVED - 2025-09-06 16:10
  // CONFIRMED: No overview section exists in this file - Browser cache issue
  // タイプの表示名を取得（統計機能削除により不要だが後方互換性のため残存）
  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'confirmed': return '予約確定';
      case 'active': return '進行中';
      case 'completed': return '完了済み';
      default: return type;
    }
  };

  // 月ごとの集計を計算
  const calculateMonthlyStats = (type) => {
    const now = new Date();
    const months = [];
    
    // 過去12ヶ月のデータを生成
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      months.push({
        key: monthKey,
        name: date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }),
        data: 0
      });
    }

    // 予約データから月ごとの集計を計算
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.bookingDate || booking.pickupDate);
      const monthKey = bookingDate.toISOString().slice(0, 7);
      const monthIndex = months.findIndex(m => m.key === monthKey);
      
      if (monthIndex !== -1) {
        switch (type) {
          case 'confirmed':
            if (booking.status === 'confirmed') months[monthIndex].data++;
            break;
          case 'active':
            if (booking.status === 'active') months[monthIndex].data++;
            break;
          case 'completed':
            if (booking.status === 'completed') months[monthIndex].data++;
            break;
        }
      }
    });

    setMonthlyStats({ type, months });
  };

  // 会員番号生成関数
  const generateMemberNumber = (licenseNumber, registrationDate = new Date()) => {
    if (!licenseNumber || licenseNumber.length < 4) {
      return null; // 免許証番号が不十分な場合はnullを返す
    }
    
    const year = registrationDate.getFullYear();
    const month = String(registrationDate.getMonth() + 1).padStart(2, '0');
    const lastFourDigits = licenseNumber.slice(-4);
    
    return `${year}${month}${lastFourDigits}`;
  };

  // 郵便番号から住所を取得する関数
  const fetchAddressFromPostalCode = async (postalCode) => {
    if (!postalCode || postalCode.length !== 7) return;
    
    setIsAddressLoading(true);
    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
      const data = await response.json();
      
      if (data.status === 200 && data.results && data.results.length > 0) {
        const address = data.results[0];
        
        // 新規ユーザー追加時
        if (showAddUserModal) {
          setNewUser(prev => ({
            ...prev,
            prefecture: address.address1,
            city: address.address2,
            address: address.address3
          }));
        }
        
        // ユーザー編集時
        if (showEditUserModal && selectedUser) {
          setSelectedUser(prev => ({
            ...prev,
            prefecture: address.address1,
            city: address.address2,
            address: address.address3
          }));
        }
        
        showNotification('📍 住所を自動入力しました', 'success');
      } else {
        showNotification('❌ 該当する住所が見つかりませんでした', 'error');
      }
    } catch (error) {
      console.error('住所取得エラー:', error);
      showNotification('❌ 住所の取得に失敗しました', 'error');
    } finally {
      setIsAddressLoading(false);
    }
  };

  // ユーザー管理ハンドラー
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      showNotification('❌ 氏名とメールアドレスは必須項目です', 'error');
      return;
    }
    
    // メールアドレスの重複チェック
    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      showNotification('❌ このメールアドレスは既に登録されています', 'error');
      return;
    }
    
    const now = new Date();
    const memberNumber = generateMemberNumber(newUser.licenseNumber, now);
    
    const user = {
      id: Date.now(),
      ...newUser,
      memberNumber: memberNumber,
      points: parseInt(newUser.points) || 0,
      createdAt: now.toISOString(),
      isActive: true
    };
    
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Sync to cloud
    dataSyncService.saveToCloud('users', updatedUsers).catch(console.error);
    
    setNewUser({
      name: '',
      email: '',
      phone: '',
      postalCode: '',
      prefecture: '',
      city: '',
      address: '',
      building: '',
      licenseNumber: '',
      points: 0
    });
    setShowAddUserModal(false);
    loadDashboardData();
    
    showNotification(`👤 ユーザー「${user.name}」が正常に追加されました！`, 'success');
  };

  const handleEditUser = () => {
    if (!selectedUser.name || !selectedUser.email) {
      showNotification('❌ 氏名とメールアドレスは必須項目です', 'error');
      return;
    }
    
    // メールアドレスの重複チェック（自分以外）
    const existingUser = users.find(u => u.email === selectedUser.email && u.id !== selectedUser.id);
    if (existingUser) {
      showNotification('❌ このメールアドレスは既に登録されています', 'error');
      return;
    }
    
    // 免許証番号が変更された場合は会員番号を再生成
    const originalUser = users.find(u => u.id === selectedUser.id);
    let updatedUser = { ...selectedUser, points: parseInt(selectedUser.points) || 0 };
    
    if (originalUser.licenseNumber !== selectedUser.licenseNumber) {
      const registrationDate = originalUser.createdAt ? new Date(originalUser.createdAt) : new Date();
      updatedUser.memberNumber = generateMemberNumber(selectedUser.licenseNumber, registrationDate);
    }
    
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? updatedUser : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setShowEditUserModal(false);
    const userName = selectedUser.name;
    setSelectedUser(null);
    loadDashboardData();
    
    showNotification(`✏️ ユーザー「${userName}」の情報が正常に更新されました！`, 'success');
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (window.confirm(`ユーザー「${user?.name}」を削除しますか？この操作は取り消せません。`)) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      loadDashboardData();
      showNotification(`🗑️ ユーザー「${user?.name}」を削除しました。`, 'info');
    }
  };

  const handleViewUser = (userId) => {
    const user = users.find(u => u.id === userId);
    const userBookings = bookings.filter(b => b.userId === userId);
    const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    alert(`ユーザー詳細情報:
会員番号: ${user.memberNumber || '未設定'}
氏名: ${user.name}
メール: ${user.email}
電話: ${user.phone || 'なし'}
住所: ${user.address || 'なし'}
免許証番号: ${user.licenseNumber || 'なし'}
ポイント: ${user.points || 0}
登録日: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : 'なし'}
利用回数: ${userBookings.length}回
累計利用額: ${formatCurrency(totalSpent)}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  // 認証チェック中の表示
  if (isAuthenticating || isAuthChecking) {
    return (
      <div className="admin-dashboard">
        <div className="auth-loading">
          <LoadingWheel size={100} message="" />
          <h2>認証確認中...</h2>
          <p>管理者権限を確認しています</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">🚗</div>
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={activeSection === 'vehicles' ? 'active' : ''}
            onClick={() => setActiveSection('vehicles')}
          >
            <span className="nav-icon">🚗</span>
            車両管理
          </button>
          <button 
            className={activeSection === 'announcements' ? 'active' : ''}
            onClick={() => setActiveSection('announcements')}
          >
            <span className="nav-icon">📢</span>
            お知らせ管理
          </button>
          <button 
            className={activeSection === 'branding' ? 'active' : ''}
            onClick={() => setActiveSection('branding')}
          >
            <span className="nav-icon">🏢</span>
            ブランディング
          </button>
          <button 
            className={activeSection === 'tile-edit' ? 'active' : ''}
            onClick={() => setActiveSection('tile-edit')}
          >
            <span className="nav-icon">🎨</span>
            カード編集
          </button>
          <button 
            className={activeSection === 'background-edit' ? 'active' : ''}
            onClick={() => setActiveSection('background-edit')}
          >
            <span className="nav-icon">🌄</span>
            背景画像編集
          </button>
          <button 
            className={activeSection === 'page-edit' ? 'active' : ''}
            onClick={() => setActiveSection('page-edit')}
          >
            <span className="nav-icon">📄</span>
            カード内ページ編集
          </button>
          <button 
            className={activeSection === 'contact' ? 'active' : ''}
            onClick={() => setActiveSection('contact')}
          >
            <span className="nav-icon">📞</span>
            連絡先情報
          </button>
          <button 
            className={activeSection === 'terms' ? 'active' : ''}
            onClick={() => setActiveSection('terms')}
          >
            <span className="nav-icon">📋</span>
            利用規約
          </button>
          <button 
            className={activeSection === 'privacy' ? 'active' : ''}
            onClick={() => setActiveSection('privacy')}
          >
            <span className="nav-icon">🔒</span>
            プライバシー
          </button>
          <button 
            className={activeSection === 'rental-terms' ? 'active' : ''}
            onClick={() => setActiveSection('rental-terms')}
          >
            <span className="nav-icon">🚙</span>
            レンタカー約款
          </button>
        </nav>
        
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeSection === 'vehicles' && '🚗 車両管理'}
            {activeSection === 'announcements' && '📢 お知らせ管理'}
            {activeSection === 'branding' && '🏢 ブランディング設定'}
            {activeSection === 'tile-edit' && '🎨 カード編集'}
            {activeSection === 'background-edit' && '🌄 背景画像編集'}
            {activeSection === 'page-edit' && '📄 カード内ページ編集'}
            {activeSection === 'contact' && '📞 連絡先情報設定'}
            {activeSection === 'terms' && '📋 利用規約設定'}
            {activeSection === 'privacy' && '🔒 プライバシーポリシー設定'}
            {activeSection === 'rental-terms' && '🚙 レンタカー約款設定'}
            {activeSection === 'settings' && '⚙️ サイト設定'} {/* 後方互換性のため残す */}
          </h1>
          <div className="admin-header-info">
            <div className="sync-status">
              {isSyncing && <span className="sync-indicator syncing">🔄 同期中...</span>}
              {!isSyncing && syncStatus && (
                <button 
                  className="sync-btn"
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      await dataSyncService.forceSyncAll();
                      await loadDashboardData();
                      showNotification('📡 手動同期が完了しました', 'success');
                    } catch (error) {
                      showNotification('❌ 同期に失敗しました', 'error');
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  disabled={isSyncing}
                >
                  📡 データ同期
                </button>
              )}
            </div>
            <span className="admin-date">{new Date().toLocaleDateString('ja-JP')}</span>
            <span className="admin-user">Administrator</span>
          </div>
        </div>
        
        <div className="admin-content">
          
          
          {activeSection === 'vehicles' && (
            <div className="vehicles-section">
              <div className="section-header">
                <h2>Vehicle List</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddVehicleModal(true)}
                >
                  + Add New Vehicle
                </button>
              </div>
              
              {/* 車 (Car) セクション */}
              <div className="vehicle-category">
                <h3 className="category-title">🚗 車 ({vehicles.filter(v => v.type === 'car').length}台)</h3>
                <div className="vehicles-grid">
                  {vehicles.filter(vehicle => vehicle.type === 'car').map(vehicle => (
                    <div key={vehicle.id} className="vehicle-admin-card">
                      <div className="vehicle-admin-header">
                        <h3>{vehicle.name}</h3>
                        <span className={`availability-badge ${vehicle.available ? 'available' : 'unavailable'}`}>
                          {vehicle.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="vehicle-admin-details">
                        <p><strong>Type:</strong> {vehicle.type}</p>
                        <p><strong>Price:</strong> {formatCurrency(vehicle.price)}/day</p>
                        <p><strong>Capacity:</strong> {vehicle.passengers} passengers</p>
                        <p><strong>Features:</strong> {vehicle.features || 'None'}</p>
                      </div>
                      <div className="vehicle-admin-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowEditVehicleModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className={`toggle-btn ${vehicle.available ? 'disable' : 'enable'}`}
                          onClick={() => handleToggleVehicleAvailability(vehicle.id)}
                        >
                          {vehicle.available ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {vehicles.filter(v => v.type === 'car').length === 0 && (
                  <div className="no-vehicles-message">
                    <p>車が登録されていません</p>
                  </div>
                )}
              </div>

              {/* バイク (Bike) セクション */}
              <div className="vehicle-category">
                <h3 className="category-title">🏍️ バイク ({vehicles.filter(v => v.type === 'bike' || v.type === 'motorcycle').length}台)</h3>
                <div className="vehicles-grid">
                  {vehicles.filter(vehicle => vehicle.type === 'bike' || vehicle.type === 'motorcycle').map(vehicle => (
                    <div key={vehicle.id} className="vehicle-admin-card">
                      <div className="vehicle-admin-header">
                        <h3>{vehicle.name}</h3>
                        <span className={`availability-badge ${vehicle.available ? 'available' : 'unavailable'}`}>
                          {vehicle.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="vehicle-admin-details">
                        <p><strong>Type:</strong> {vehicle.type}</p>
                        <p><strong>Price:</strong> {formatCurrency(vehicle.price)}/day</p>
                        <p><strong>Capacity:</strong> {vehicle.passengers} passengers</p>
                        <p><strong>Features:</strong> {vehicle.features || 'None'}</p>
                      </div>
                      <div className="vehicle-admin-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowEditVehicleModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className={`toggle-btn ${vehicle.available ? 'disable' : 'enable'}`}
                          onClick={() => handleToggleVehicleAvailability(vehicle.id)}
                        >
                          {vehicle.available ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {vehicles.filter(v => v.type === 'bike' || v.type === 'motorcycle').length === 0 && (
                  <div className="no-vehicles-message">
                    <p>バイクが登録されていません</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* USERS SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {false && activeSection === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>ユーザー管理</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddUserModal(true)}
                >
                  ➕ 新規ユーザー追加
                </button>
              </div>
              <div className="user-stats-summary">
                <div className="user-stat-card">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">総ユーザー数</span>
                </div>
                <div className="user-stat-card">
                  <span className="stat-number">{users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}</span>
                  <span className="stat-label">今月の新規登録</span>
                </div>
                <div className="user-stat-card">
                  <span className="stat-number">{users.filter(u => u.points && u.points > 0).length}</span>
                  <span className="stat-label">ポイント保有者</span>
                </div>
              </div>
              
              <div className="users-table-container">
                <div className="table-controls">
                  <div className="search-bar">
                    <input 
                      type="text" 
                      placeholder="顧客名またはメールアドレスで検索..." 
                    />
                    <button className="search-btn">🔍</button>
                  </div>
                  <div className="filter-options">
                    <select className="filter-select">
                      <option value="all">全ての顧客</option>
                      <option value="active">アクティブ</option>
                      <option value="new">新規登録</option>
                      <option value="vip">VIP顧客</option>
                    </select>
                    <button className="export-btn">📊 エクスポート</button>
                  </div>
                </div>
                
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>会員番号</th>
                        <th>氏名</th>
                        <th>メールアドレス</th>
                        <th>電話番号</th>
                        <th>登録日</th>
                        <th>利用回数</th>
                        <th>累計利用額</th>
                        <th>保有ポイント</th>
                        <th>ステータス</th>
                        <th>アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => {
                        const userBookings = bookings.filter(b => b.userId === user.id);
                        const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                        const userStatus = totalSpent > 100000 ? 'VIP' : totalSpent > 50000 ? 'Premium' : 'Regular';
                        
                        return (
                          <tr key={user.id}>
                            <td>
                              <span className="member-number">
                                {user.memberNumber || '未設定'}
                              </span>
                            </td>
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {user.name ? user.name.charAt(0) : '?'}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{user.name || 'Unknown'}</div>
                                  {user.nameKana && <div className="user-kana">{user.nameKana}</div>}
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.phone || '未設定'}</td>
                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}</td>
                            <td>{userBookings.length}回</td>
                            <td>{formatCurrency(totalSpent)}</td>
                            <td>
                              <span className="points-display">
                                {user.points || 0}pt
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge status-${userStatus.toLowerCase()}`}>
                                {userStatus}
                              </span>
                            </td>
                            <td>
                              <div className="user-actions">
                                <button 
                                  className="action-btn view" 
                                  title="詳細表示"
                                  onClick={() => handleViewUser(user.id)}
                                >
                                  👁️
                                </button>
                                <button 
                                  className="action-btn edit" 
                                  title="編集"
                                  onClick={() => {
                                    setSelectedUser({...user});
                                    setShowEditUserModal(true);
                                  }}
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="action-btn delete" 
                                  title="削除"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* ANALYTICS SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {false && activeSection === 'analytics' && (
            <div className="analytics-section">
              <div className="analytics-header">
                <h2>Sales Analytics</h2>
                <div className="date-range-selector">
                  <button className="range-btn active">This Month</button>
                  <button className="range-btn">Last Month</button>
                  <button className="range-btn">Last 3 Months</button>
                  <button className="range-btn">This Year</button>
                </div>
              </div>
              
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>Monthly Revenue Trend</h3>
                  <div className="chart-placeholder">
                    <div className="chart-bar" style={{height: '60%'}}></div>
                    <div className="chart-bar" style={{height: '80%'}}></div>
                    <div className="chart-bar" style={{height: '70%'}}></div>
                    <div className="chart-bar" style={{height: '90%'}}></div>
                    <div className="chart-bar" style={{height: '85%'}}></div>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Vehicle Popularity</h3>
                  <div className="popularity-list">
                    {vehicles.slice(0, 5).map((vehicle, index) => (
                      <div key={vehicle.id} className="popularity-item">
                        <span className="rank">{index + 1}</span>
                        <span className="vehicle-name">{vehicle.name}</span>
                        <div className="popularity-bar">
                          <div 
                            className="popularity-fill"
                            style={{width: `${100 - (index * 15)}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Booking Status</h3>
                  <div className="booking-stats">
                    <div className="stat-row">
                      <span>Completed</span>
                      <span className="stat-value">
                        {bookings.filter(b => b.status === 'completed').length}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>Active</span>
                      <span className="stat-value">
                        {bookings.filter(b => b.status === 'active').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} />
          )}
          
          {activeSection === 'branding' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="branding" />
          )}
          
          {activeSection === 'hero' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="hero" />
          )}
          
          {activeSection === 'tile-edit' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="tile-edit" />
          )}
          
          {activeSection === 'background-edit' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="background-edit" />
          )}
          
          {activeSection === 'page-edit' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="page-edit" />
          )}
          
          {activeSection === 'contact' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="contact" />
          )}
          
          {activeSection === 'terms' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="terms" />
          )}
          
          {activeSection === 'privacy' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="privacy" />
          )}
          
          {activeSection === 'rental-terms' && (
            <SiteSettingsManagement onSettingsUpdate={onSettingsUpdate} activeSection="rental-terms" />
          )}
          
          {activeSection === 'announcements' && (
            <div className="announcements-section">
              <div className="section-header">
                <h2>お知らせ一覧</h2>
                <button 
                  className="add-btn"
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({
                      title: '',
                      date: new Date().toISOString().split('T')[0],
                      content: '',
                      published: true
                    });
                    setShowAnnouncementModal(true);
                  }}
                >
                  + 新しいお知らせを追加
                </button>
              </div>
              
              <div className="announcements-list">
                {announcements.length === 0 ? (
                  <div className="empty-state">
                    <p>お知らせがありません</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>日付</th>
                        <th>タイトル</th>
                        <th>内容</th>
                        <th>公開状態</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((announcement, index) => (
                        <tr key={announcement.id || index}>
                          <td>{announcement.date}</td>
                          <td>{announcement.title}</td>
                          <td className="content-preview">
                            {announcement.content ? announcement.content.substring(0, 50) + '...' : ''}
                          </td>
                          <td>
                            <span className={`status-badge ${announcement.published ? 'active' : 'inactive'}`}>
                              {announcement.published ? '公開中' : '非公開'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => {
                                  setEditingAnnouncement(announcement);
                                  setAnnouncementForm({
                                    title: announcement.title,
                                    date: announcement.date,
                                    content: announcement.content || '',
                                    published: announcement.published
                                  });
                                  setShowAnnouncementModal(true);
                                }}
                              >
                                編集
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={async () => {
                                  if (window.confirm('このお知らせを削除しますか？')) {
                                    const result = await announcementsAPI.deleteAnnouncement(announcement.id);
                                    if (result.success) {
                                      // 削除後にデータを再取得
                                      await loadAnnouncements();
                                      showNotification('📢 お知らせを削除しました', 'info');
                                    } else {
                                      showNotification('❌ 削除に失敗しました', 'error');
                                    }
                                  }
                                }}
                              >
                                削除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          
          {/* CONTENT SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {/* Removed hardcoded content editor - now managed via SiteSettingsManagement */}

          {/* DETAILS SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {false && activeSection === 'details' && detailsType && (
            <div className="details-section">
              <div className="details-header">
                {/* OVERVIEW BUTTON COMPLETELY REMOVED - v3.0.3 */}
                <h2>{getTypeDisplayName(detailsType)}の詳細分析</h2>
                <p className="details-subtitle">過去12ヶ月の月別推移</p>
              </div>

              <div className="monthly-chart">
                <div className="chart-container">
                  <div className="chart-bars">
                    {monthlyStats.months && monthlyStats.months.map((month, index) => {
                      const maxValue = Math.max(...monthlyStats.months.map(m => m.data), 1);
                      const height = (month.data / maxValue) * 200;
                      const isRevenue = detailsType.includes('revenue');
                      
                      return (
                        <div key={month.key} className="chart-bar-group">
                          <div 
                            className={`chart-bar ${detailsType}`}
                            style={{ height: `${height}px` }}
                          >
                            <div className="bar-value">
                              {isRevenue ? formatCurrency(month.data) : month.data}
                            </div>
                          </div>
                          <div className="chart-label">
                            {month.name.split(' ')[1]}月
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="details-summary">
                <div className="summary-grid">
                  <div className="summary-card">
                    <h3>合計</h3>
                    <p className="summary-number">
                      {monthlyStats.months && 
                        (detailsType.includes('revenue') ? 
                          formatCurrency(monthlyStats.months.reduce((sum, m) => sum + m.data, 0)) :
                          monthlyStats.months.reduce((sum, m) => sum + m.data, 0))
                      }
                    </p>
                  </div>
                  <div className="summary-card">
                    <h3>月平均</h3>
                    <p className="summary-number">
                      {monthlyStats.months && 
                        (detailsType.includes('revenue') ? 
                          formatCurrency(monthlyStats.months.reduce((sum, m) => sum + m.data, 0) / 12) :
                          Math.round(monthlyStats.months.reduce((sum, m) => sum + m.data, 0) / 12))
                      }
                    </p>
                  </div>
                  <div className="summary-card">
                    <h3>最高記録</h3>
                    <p className="summary-number">
                      {monthlyStats.months && 
                        (detailsType.includes('revenue') ? 
                          formatCurrency(Math.max(...monthlyStats.months.map(m => m.data))) :
                          Math.max(...monthlyStats.months.map(m => m.data)))
                      }
                    </p>
                  </div>
                  <div className="summary-card">
                    <h3>今月</h3>
                    <p className="summary-number">
                      {monthlyStats.months && monthlyStats.months[11] &&
                        (detailsType.includes('revenue') ? 
                          formatCurrency(monthlyStats.months[11].data) :
                          monthlyStats.months[11].data)
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="details-table">
                <h3>月別詳細データ</h3>
                <table>
                  <thead>
                    <tr>
                      <th>月</th>
                      <th>{detailsType.includes('revenue') ? '金額' : '件数'}</th>
                      <th>前月比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.months && monthlyStats.months.map((month, index) => {
                      const prevMonth = index > 0 ? monthlyStats.months[index - 1] : null;
                      const change = prevMonth ? month.data - prevMonth.data : 0;
                      const changePercent = prevMonth && prevMonth.data > 0 ? 
                        Math.round((change / prevMonth.data) * 100) : 0;
                      
                      return (
                        <tr key={month.key}>
                          <td>{month.name}</td>
                          <td>
                            {detailsType.includes('revenue') ? 
                              formatCurrency(month.data) : month.data
                            }
                          </td>
                          <td className={change >= 0 ? 'positive' : 'negative'}>
                            {change >= 0 ? '+' : ''}{changePercent}%
                            {change >= 0 ? ' ↗' : ' ↘'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* TERMS SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {false && activeSection === 'terms' && (
            <div className="terms-section">
              <div className="terms-editor">
                <h2>約款内容編集</h2>
                
                <div className="editor-section">
                  <h3>約款タイトル</h3>
                  <div className="form-group">
                    <label>タイトル</label>
                    <input 
                      type="text"
                      value={termsContent.title}
                      onChange={(e) => setTermsContent({...termsContent, title: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="editor-section">
                  <div className="section-header">
                    <h3>約款セクション</h3>
                    <button 
                      className="add-btn"
                      onClick={() => setShowAddTermsModal(true)}
                    >
                      + 新しいセクションを追加
                    </button>
                  </div>
                  
                  <div className="terms-sections-list">
                    {termsContent.sections.map((section, index) => (
                      <div key={section.id || index} className="terms-section-item">
                        <div className="section-info">
                          <h4>{section.title}</h4>
                          <p className="section-preview">{section.content.substring(0, 100)}...</p>
                        </div>
                        <div className="section-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              setSelectedTermsSection({...section, index});
                              setShowEditTermsModal(true);
                            }}
                          >
                            編集
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              if (window.confirm('このセクションを削除しますか？')) {
                                const updatedSections = termsContent.sections.filter((_, i) => i !== index);
                                const updatedTerms = {...termsContent, sections: updatedSections};
                                setTermsContent(updatedTerms);
                                showNotification('📋 約款セクションを削除しました', 'info');
                              }
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="save-btn" onClick={() => {
                    const updatedTerms = {
                      ...termsContent,
                      lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem('termsContent', JSON.stringify(updatedTerms));
                    setTermsContent(updatedTerms);
                    
                    // Sync to cloud
                    dataSyncService.saveToCloud('termsContent', updatedTerms).catch(console.error);
                    
                    showNotification('📋 約款内容が正常に保存されました！', 'save', 5000);
                  }}>
                    約款を保存
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* CONTACTS SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {false && activeSection === 'contacts' && (
            <div className="contacts-section">
              <div className="section-header">
                <h2>お問い合わせ管理</h2>
              </div>
              
              <div className="contacts-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>名前</th>
                      <th>メール</th>
                      <th>カテゴリ</th>
                      <th>件名</th>
                      <th>送信日</th>
                      <th>ステータス</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JSON.parse(localStorage.getItem('contacts') || '[]').map(contact => (
                      <tr key={contact.id}>
                        <td>#{contact.id}</td>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td>{contact.category}</td>
                        <td>{contact.subject}</td>
                        <td>{new Date(contact.submittedAt).toLocaleDateString('ja-JP')}</td>
                        <td>
                          <span className={`status-badge status-${contact.status}`}>
                            {contact.status === 'pending' ? '未対応' : 
                             contact.status === 'resolved' ? '対応済み' : contact.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-btn view"
                            onClick={() => {
                              alert(`お問い合わせ内容:\\n\\n件名: ${contact.subject}\\n\\nメッセージ:\\n${contact.message}\\n\\n電話: ${contact.phone || 'なし'}`);
                            }}
                          >
                            詳細
                          </button>
                          <button 
                            className="action-btn confirm"
                            onClick={() => {
                              const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
                              const updatedContacts = contacts.map(c => 
                                c.id === contact.id ? { ...c, status: 'resolved' } : c
                              );
                              localStorage.setItem('contacts', JSON.stringify(updatedContacts));
                              dataSyncService.saveToCloud('contacts', updatedContacts).catch(console.error);
                              loadDashboardData();
                              showNotification('📧 お問い合わせを対応済みにしました', 'success');
                            }}
                          >
                            対応済み
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* PRIVACY SECTION REMOVED - SIMPLIFIED ADMIN PANEL */}
          {false && activeSection === 'privacy' && (
            <div className="privacy-section">
              <div className="privacy-editor">
                <h2>プライバシーポリシー編集</h2>
                
                <div className="editor-section">
                  <h3>プライバシーポリシータイトル</h3>
                  <div className="form-group">
                    <label>タイトル</label>
                    <input 
                      type="text"
                      value={privacyPolicyContent.title}
                      onChange={(e) => setPrivacyPolicyContent({...privacyPolicyContent, title: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="editor-section">
                  <div className="section-header">
                    <h3>プライバシーポリシーセクション</h3>
                    <button 
                      className="add-btn"
                      onClick={() => setShowAddPrivacyModal(true)}
                    >
                      + 新しいセクションを追加
                    </button>
                  </div>
                  
                  <div className="privacy-sections-list">
                    {privacyPolicyContent.sections.map((section, index) => (
                      <div key={section.id || index} className="privacy-section-item">
                        <div className="section-info">
                          <h4>{section.title}</h4>
                          <p className="section-preview">{section.content.substring(0, 100)}...</p>
                        </div>
                        <div className="section-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              setSelectedPrivacySection({...section, index});
                              setShowEditPrivacyModal(true);
                            }}
                          >
                            編集
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              if (window.confirm('このセクションを削除しますか？')) {
                                const updatedSections = privacyPolicyContent.sections.filter((_, i) => i !== index);
                                const updatedPolicy = {...privacyPolicyContent, sections: updatedSections};
                                setPrivacyPolicyContent(updatedPolicy);
                                showNotification('🔒 プライバシーポリシーセクションを削除しました', 'info');
                              }
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="save-btn" onClick={() => {
                    const updatedPolicy = {
                      ...privacyPolicyContent,
                      lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem('privacyPolicyContent', JSON.stringify(updatedPolicy));
                    setPrivacyPolicyContent(updatedPolicy);
                    
                    // Sync to cloud
                    dataSyncService.saveToCloud('privacyPolicyContent', updatedPolicy).catch(console.error);
                    
                    showNotification('🔒 プライバシーポリシーが正常に保存されました！', 'save', 5000);
                  }}>
                    プライバシーポリシーを保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showAddVehicleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Vehicle</h2>
            <form onSubmit={(e) => {
              e.preventDefault(); // フォーム送信を防止
              handleAddVehicle();
            }}>
            <div className="form-group">
              <label>Vehicle Name</label>
              <input 
                type="text"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                placeholder="e.g., Toyota Camry"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (per day)</label>
              <input 
                type="number"
                value={newVehicle.price}
                onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})}
                placeholder="5000"
              />
            </div>
            <div className="form-group">
              <label>Passenger Capacity</label>
              <input 
                type="number"
                value={newVehicle.passengers}
                onChange={(e) => setNewVehicle({...newVehicle, passengers: e.target.value})}
                placeholder="4"
              />
            </div>
            <div className="form-group">
              <label>Features</label>
              <textarea 
                value={newVehicle.features}
                onChange={(e) => setNewVehicle({...newVehicle, features: e.target.value})}
                placeholder="GPS, Bluetooth, Backup Camera"
              />
            </div>
            
            {/* 車両画像アップロード */}
            <div className="form-group">
              <label>車両画像</label>
              <input 
                type="file"
                id="vehicleImageUpload"
                accept="image/*"
                onChange={handleVehicleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="vehicleImageUpload" className="upload-button" style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'transform 0.2s ease',
                marginBottom: '10px'
              }}>
                📷 画像をアップロード
              </label>
              {newVehicle.image && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={newVehicle.image}
                    alt="車両プレビュー"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '2px solid #e9ecef'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    ✅ 画像がアップロードされました
                  </p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                type="submit"
                className="save-btn" 
                disabled={isSavingVehicle}
                style={{
                  opacity: isSavingVehicle ? 0.6 : 1,
                  cursor: isSavingVehicle ? 'not-allowed' : 'pointer'
                }}
              >
                {isSavingVehicle ? '保存中...' : 'Save'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowAddVehicleModal(false)}>Cancel</button>
            </div>
            </form>
          </div>
        </div>
      )}
      
      {showEditVehicleModal && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Vehicle</h2>
            <div className="form-group">
              <label>Vehicle Name</label>
              <input 
                type="text"
                value={selectedVehicle.name}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={selectedVehicle.type}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, type: e.target.value})}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (per day)</label>
              <input 
                type="number"
                value={selectedVehicle.price}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Passenger Capacity</label>
              <input 
                type="number"
                value={selectedVehicle.passengers}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, passengers: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Features</label>
              <textarea 
                value={selectedVehicle.features || ''}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, features: e.target.value})}
              />
            </div>
            
            {/* 車両画像編集 */}
            <div className="form-group">
              <label>車両画像</label>
              <input 
                type="file"
                id="editVehicleImageUpload"
                accept="image/*"
                onChange={handleEditVehicleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="editVehicleImageUpload" className="upload-button" style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'transform 0.2s ease',
                marginBottom: '10px'
              }}>
                📷 画像を変更
              </label>
              {selectedVehicle.image && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={selectedVehicle.image}
                    alt="車両プレビュー"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '2px solid #e9ecef'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    現在の車両画像
                  </p>
                </div>
              )}
              {!selectedVehicle.image && (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  画像がアップロードされていません
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleEditVehicle}>Update</button>
              <button className="cancel-btn" onClick={() => {
                setShowEditVehicleModal(false);
                setSelectedVehicle(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {showDesignModal && (
        <div className="modal-overlay">
          <div className="modal-content design-modal">
            <h2>🎨 サイトデザイン設定</h2>
            
            <div className="design-sections">
              <div className="color-section">
                <h3>カラーテーマ</h3>
                <div className="color-inputs">
                  <div className="color-input-group">
                    <label>メインカラー</label>
                    <div className="color-input-wrapper">
                      <input 
                        type="color"
                        value={siteSettings.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="color-picker"
                      />
                      <input 
                        type="text"
                        value={siteSettings.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="color-text"
                      />
                    </div>
                  </div>
                  
                  <div className="color-input-group">
                    <label>セカンダリーカラー</label>
                    <div className="color-input-wrapper">
                      <input 
                        type="color"
                        value={siteSettings.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="color-picker"
                      />
                      <input 
                        type="text"
                        value={siteSettings.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="color-text"
                      />
                    </div>
                  </div>
                  
                  <div className="color-input-group">
                    <label>アクセントカラー</label>
                    <div className="color-input-wrapper">
                      <input 
                        type="color"
                        value={siteSettings.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="color-picker"
                      />
                      <input 
                        type="text"
                        value={siteSettings.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="color-text"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="preset-section">
                <h3>プリセットテーマ</h3>
                <div className="theme-presets">
                  <button 
                    className="preset-btn green-theme"
                    onClick={() => handlePresetChange({
                      ...siteSettings,
                      primaryColor: '#43a047',
                      secondaryColor: '#66bb6a',
                      accentColor: '#81c784',
                      theme: 'green'
                    })}
                  >
                    <div className="preset-colors">
                      <span style={{backgroundColor: '#43a047'}}></span>
                      <span style={{backgroundColor: '#66bb6a'}}></span>
                      <span style={{backgroundColor: '#81c784'}}></span>
                    </div>
                    <span>Green (デフォルト)</span>
                  </button>
                  
                  <button 
                    className="preset-btn blue-theme"
                    onClick={() => handlePresetChange({
                      ...siteSettings,
                      primaryColor: '#1976d2',
                      secondaryColor: '#42a5f5',
                      accentColor: '#90caf9',
                      theme: 'blue'
                    })}
                  >
                    <div className="preset-colors">
                      <span style={{backgroundColor: '#1976d2'}}></span>
                      <span style={{backgroundColor: '#42a5f5'}}></span>
                      <span style={{backgroundColor: '#90caf9'}}></span>
                    </div>
                    <span>Blue</span>
                  </button>
                  
                  <button 
                    className="preset-btn purple-theme"
                    onClick={() => handlePresetChange({
                      ...siteSettings,
                      primaryColor: '#7b1fa2',
                      secondaryColor: '#ab47bc',
                      accentColor: '#ce93d8',
                      theme: 'purple'
                    })}
                  >
                    <div className="preset-colors">
                      <span style={{backgroundColor: '#7b1fa2'}}></span>
                      <span style={{backgroundColor: '#ab47bc'}}></span>
                      <span style={{backgroundColor: '#ce93d8'}}></span>
                    </div>
                    <span>Purple</span>
                  </button>
                  
                  <button 
                    className="preset-btn orange-theme"
                    onClick={() => handlePresetChange({
                      ...siteSettings,
                      primaryColor: '#f57c00',
                      secondaryColor: '#ff9800',
                      accentColor: '#ffb74d',
                      theme: 'orange'
                    })}
                  >
                    <div className="preset-colors">
                      <span style={{backgroundColor: '#f57c00'}}></span>
                      <span style={{backgroundColor: '#ff9800'}}></span>
                      <span style={{backgroundColor: '#ffb74d'}}></span>
                    </div>
                    <span>Orange</span>
                  </button>
                </div>
              </div>
              
              <div className="preview-section">
                <h3>プレビュー</h3>
                <div className="design-preview">
                  <div 
                    className="preview-header"
                    style={{
                      background: `linear-gradient(135deg, ${siteSettings.primaryColor} 0%, ${siteSettings.secondaryColor} 100%)`
                    }}
                  >
                    <div className="preview-logo">MB</div>
                    <span>{siteSettings.siteName}</span>
                  </div>
                  <div className="preview-content">
                    <div 
                      className="preview-button"
                      style={{
                        background: `linear-gradient(135deg, ${siteSettings.primaryColor} 0%, ${siteSettings.secondaryColor} 100%)`
                      }}
                    >
                      サンプルボタン
                    </div>
                    <div 
                      className="preview-card"
                      style={{
                        borderTopColor: siteSettings.primaryColor
                      }}
                    >
                      <h4 style={{color: siteSettings.primaryColor}}>サンプルカード</h4>
                      <p>新しいカラーテーマのプレビューです</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions design-actions">
              <button className="save-btn" onClick={handleSaveDesignSettings}>
                変更を適用
              </button>
              <button className="cancel-btn" onClick={() => setShowDesignModal(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ユーザー追加モーダル */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>新規ユーザー追加</h2>
            <div className="form-group">
              <label>氏名 *</label>
              <input 
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="山田太郎"
              />
            </div>
            <div className="form-group">
              <label>メールアドレス *</label>
              <input 
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="yamada@example.com"
              />
            </div>
            <div className="form-group">
              <label>電話番号</label>
              <input 
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                placeholder="090-1234-5678"
              />
            </div>
            <div className="form-group">
              <label>郵便番号</label>
              <div className="postal-code-field">
                <input 
                  type="text"
                  value={newUser.postalCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser({...newUser, postalCode: value});
                    if (value.length === 7 && /^\d{7}$/.test(value)) {
                      fetchAddressFromPostalCode(value);
                    }
                  }}
                  placeholder="1234567"
                  maxLength="7"
                />
                <button
                  type="button"
                  className="address-search-btn"
                  onClick={() => fetchAddressFromPostalCode(newUser.postalCode)}
                  disabled={newUser.postalCode.length !== 7 || isAddressLoading}
                >
                  {isAddressLoading ? '🔄' : '住所検索'}
                </button>
              </div>
              <small>ハイフンなしで7桁入力</small>
            </div>
            <div className="form-group">
              <label>都道府県</label>
              <input 
                type="text"
                value={newUser.prefecture}
                onChange={(e) => setNewUser({...newUser, prefecture: e.target.value})}
                placeholder="東京都"
                className={isAddressLoading ? 'loading' : ''}
              />
            </div>
            <div className="form-group">
              <label>市区町村</label>
              <input 
                type="text"
                value={newUser.city}
                onChange={(e) => setNewUser({...newUser, city: e.target.value})}
                placeholder="渋谷区"
                className={isAddressLoading ? 'loading' : ''}
              />
            </div>
            <div className="form-group">
              <label>町域・番地</label>
              <input 
                type="text"
                value={newUser.address}
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                placeholder="道玄坂1-2-3"
                className={isAddressLoading ? 'loading' : ''}
              />
            </div>
            <div className="form-group">
              <label>建物名・部屋番号</label>
              <input 
                type="text"
                value={newUser.building}
                onChange={(e) => setNewUser({...newUser, building: e.target.value})}
                placeholder="○○ビル 101号室"
              />
            </div>
            <div className="form-group">
              <label>免許証番号</label>
              <input 
                type="text"
                value={newUser.licenseNumber}
                onChange={(e) => setNewUser({...newUser, licenseNumber: e.target.value})}
                placeholder="123456789012"
              />
            </div>
            <div className="form-group">
              <label>初期ポイント</label>
              <input 
                type="number"
                value={newUser.points}
                onChange={(e) => setNewUser({...newUser, points: e.target.value})}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddUser}>ユーザー追加</button>
              <button className="cancel-btn" onClick={() => setShowAddUserModal(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* ユーザー編集モーダル */}
      {showEditUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ユーザー情報編集</h2>
            <div className="form-group">
              <label>氏名 *</label>
              <input 
                type="text"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>メールアドレス *</label>
              <input 
                type="email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>電話番号</label>
              <input 
                type="tel"
                value={selectedUser.phone || ''}
                onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                placeholder="090-1234-5678"
              />
            </div>
            <div className="form-group">
              <label>郵便番号</label>
              <div className="postal-code-field">
                <input 
                  type="text"
                  value={selectedUser.postalCode || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedUser({...selectedUser, postalCode: value});
                    if (value.length === 7 && /^\d{7}$/.test(value)) {
                      fetchAddressFromPostalCode(value);
                    }
                  }}
                  placeholder="1234567"
                  maxLength="7"
                />
                <button
                  type="button"
                  className="address-search-btn"
                  onClick={() => fetchAddressFromPostalCode(selectedUser.postalCode)}
                  disabled={(selectedUser.postalCode || '').length !== 7 || isAddressLoading}
                >
                  {isAddressLoading ? '🔄' : '住所検索'}
                </button>
              </div>
              <small>ハイフンなしで7桁入力</small>
            </div>
            <div className="form-group">
              <label>都道府県</label>
              <input 
                type="text"
                value={selectedUser.prefecture || ''}
                onChange={(e) => setSelectedUser({...selectedUser, prefecture: e.target.value})}
                placeholder="東京都"
                className={isAddressLoading ? 'loading' : ''}
              />
            </div>
            <div className="form-group">
              <label>市区町村</label>
              <input 
                type="text"
                value={selectedUser.city || ''}
                onChange={(e) => setSelectedUser({...selectedUser, city: e.target.value})}
                placeholder="渋谷区"
                className={isAddressLoading ? 'loading' : ''}
              />
            </div>
            <div className="form-group">
              <label>町域・番地</label>
              <input 
                type="text"
                value={selectedUser.address || ''}
                onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                placeholder="道玄坂1-2-3"
                className={isAddressLoading ? 'loading' : ''}
              />
            </div>
            <div className="form-group">
              <label>建物名・部屋番号</label>
              <input 
                type="text"
                value={selectedUser.building || ''}
                onChange={(e) => setSelectedUser({...selectedUser, building: e.target.value})}
                placeholder="○○ビル 101号室"
              />
            </div>
            <div className="form-group">
              <label>免許証番号</label>
              <input 
                type="text"
                value={selectedUser.licenseNumber || ''}
                onChange={(e) => setSelectedUser({...selectedUser, licenseNumber: e.target.value})}
                placeholder="123456789012"
              />
            </div>
            <div className="form-group">
              <label>保有ポイント</label>
              <input 
                type="number"
                value={selectedUser.points || 0}
                onChange={(e) => setSelectedUser({...selectedUser, points: e.target.value})}
                min="0"
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleEditUser}>変更を保存</button>
              <button className="cancel-btn" onClick={() => {
                setShowEditUserModal(false);
                setSelectedUser(null);
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 約款セクション追加モーダル */}
      {showAddTermsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>新しい約款セクションを追加</h2>
            <div className="form-group">
              <label>セクションタイトル</label>
              <input 
                type="text"
                value={newTermsSection.title}
                onChange={(e) => setNewTermsSection({...newTermsSection, title: e.target.value})}
                placeholder="第1条（適用）"
              />
            </div>
            <div className="form-group">
              <label>セクション内容</label>
              <textarea 
                value={newTermsSection.content}
                onChange={(e) => setNewTermsSection({...newTermsSection, content: e.target.value})}
                rows="6"
                placeholder="約款の内容を入力してください..."
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={() => {
                if (!newTermsSection.title || !newTermsSection.content) {
                  showNotification('❌ タイトルと内容は必須項目です', 'error');
                  return;
                }
                const newSection = {
                  id: Date.now(),
                  ...newTermsSection
                };
                const updatedSections = [...termsContent.sections, newSection];
                setTermsContent({...termsContent, sections: updatedSections});
                setNewTermsSection({ title: '', content: '' });
                setShowAddTermsModal(false);
                showNotification('📋 新しい約款セクションが追加されました', 'success');
              }}>セクションを追加</button>
              <button className="cancel-btn" onClick={() => {
                setShowAddTermsModal(false);
                setNewTermsSection({ title: '', content: '' });
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 約款セクション編集モーダル */}
      {showEditTermsModal && selectedTermsSection && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>約款セクションを編集</h2>
            <div className="form-group">
              <label>セクションタイトル</label>
              <input 
                type="text"
                value={selectedTermsSection.title}
                onChange={(e) => setSelectedTermsSection({...selectedTermsSection, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>セクション内容</label>
              <textarea 
                value={selectedTermsSection.content}
                onChange={(e) => setSelectedTermsSection({...selectedTermsSection, content: e.target.value})}
                rows="6"
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={() => {
                if (!selectedTermsSection.title || !selectedTermsSection.content) {
                  showNotification('❌ タイトルと内容は必須項目です', 'error');
                  return;
                }
                const updatedSections = termsContent.sections.map((section, i) => 
                  i === selectedTermsSection.index ? 
                    { id: section.id, title: selectedTermsSection.title, content: selectedTermsSection.content } : 
                    section
                );
                setTermsContent({...termsContent, sections: updatedSections});
                setShowEditTermsModal(false);
                setSelectedTermsSection(null);
                showNotification('📋 約款セクションが更新されました', 'success');
              }}>変更を保存</button>
              <button className="cancel-btn" onClick={() => {
                setShowEditTermsModal(false);
                setSelectedTermsSection(null);
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* プライバシーポリシーセクション追加モーダル */}
      {showAddPrivacyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>新しいプライバシーポリシーセクションを追加</h2>
            <div className="form-group">
              <label>セクションタイトル</label>
              <input 
                type="text"
                value={newPrivacySection.title}
                onChange={(e) => setNewPrivacySection({...newPrivacySection, title: e.target.value})}
                placeholder="第1条（個人情報の定義）"
              />
            </div>
            <div className="form-group">
              <label>セクション内容</label>
              <textarea 
                value={newPrivacySection.content}
                onChange={(e) => setNewPrivacySection({...newPrivacySection, content: e.target.value})}
                rows="6"
                placeholder="プライバシーポリシーの内容を入力してください..."
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={() => {
                if (!newPrivacySection.title || !newPrivacySection.content) {
                  showNotification('❌ タイトルと内容は必須項目です', 'error');
                  return;
                }
                const newSection = {
                  id: Date.now(),
                  ...newPrivacySection
                };
                const updatedSections = [...privacyPolicyContent.sections, newSection];
                setPrivacyPolicyContent({...privacyPolicyContent, sections: updatedSections});
                setNewPrivacySection({ title: '', content: '' });
                setShowAddPrivacyModal(false);
                showNotification('🔒 新しいプライバシーポリシーセクションが追加されました', 'success');
              }}>セクションを追加</button>
              <button className="cancel-btn" onClick={() => {
                setShowAddPrivacyModal(false);
                setNewPrivacySection({ title: '', content: '' });
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* プライバシーポリシーセクション編集モーダル */}
      {showEditPrivacyModal && selectedPrivacySection && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>プライバシーポリシーセクションを編集</h2>
            <div className="form-group">
              <label>セクションタイトル</label>
              <input 
                type="text"
                value={selectedPrivacySection.title}
                onChange={(e) => setSelectedPrivacySection({...selectedPrivacySection, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>セクション内容</label>
              <textarea 
                value={selectedPrivacySection.content}
                onChange={(e) => setSelectedPrivacySection({...selectedPrivacySection, content: e.target.value})}
                rows="6"
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={() => {
                if (!selectedPrivacySection.title || !selectedPrivacySection.content) {
                  showNotification('❌ タイトルと内容は必須項目です', 'error');
                  return;
                }
                const updatedSections = privacyPolicyContent.sections.map((section, i) => 
                  i === selectedPrivacySection.index ? 
                    { id: section.id, title: selectedPrivacySection.title, content: selectedPrivacySection.content } : 
                    section
                );
                setPrivacyPolicyContent({...privacyPolicyContent, sections: updatedSections});
                setShowEditPrivacyModal(false);
                setSelectedPrivacySection(null);
                showNotification('🔒 プライバシーポリシーセクションが更新されました', 'success');
              }}>変更を保存</button>
              <button className="cancel-btn" onClick={() => {
                setShowEditPrivacyModal(false);
                setSelectedPrivacySection(null);
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* お知らせ追加/編集モーダル */}
      {showAnnouncementModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingAnnouncement ? 'お知らせを編集' : '新しいお知らせを追加'}</h2>
            <div className="form-group">
              <label>日付</label>
              <input 
                type="date"
                value={announcementForm.date}
                onChange={(e) => setAnnouncementForm({...announcementForm, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>タイトル</label>
              <input 
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                placeholder="お知らせのタイトルを入力"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea 
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                rows="6"
                placeholder="お知らせの内容を入力"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={announcementForm.published}
                  onChange={(e) => setAnnouncementForm({...announcementForm, published: e.target.checked})}
                />
                <span>公開する</span>
              </label>
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={async () => {
                if (!announcementForm.title) {
                  showNotification('❌ タイトルは必須項目です', 'error');
                  return;
                }
                
                if (editingAnnouncement) {
                  // 更新処理
                  const result = await announcementsAPI.updateAnnouncement(editingAnnouncement.id, announcementForm);
                  if (result.success) {
                    // 更新後にデータを再取得
                    await loadAnnouncements();
                    showNotification('📢 お知らせを更新しました', 'success');
                  } else {
                    showNotification('❌ 更新に失敗しました', 'error');
                  }
                } else {
                  // 新規作成処理
                  const result = await announcementsAPI.createAnnouncement(announcementForm);
                  if (result.success) {
                    // 作成後にデータを再取得
                    await loadAnnouncements();
                    showNotification('📢 新しいお知らせを追加しました', 'success');
                  } else {
                    showNotification('❌ 追加に失敗しました', 'error');
                  }
                }
                
                setShowAnnouncementModal(false);
                setEditingAnnouncement(null);
              }}>
                {editingAnnouncement ? '更新' : '追加'}
              </button>
              <button className="cancel-btn" onClick={() => {
                setShowAnnouncementModal(false);
                setEditingAnnouncement(null);
              }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;