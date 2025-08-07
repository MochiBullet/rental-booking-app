import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import dataSyncService from '../services/dataSync';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
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
    features: ''
  });
  const [siteSettings, setSiteSettings] = useState({
    primaryColor: '#43a047',
    secondaryColor: '#66bb6a',
    accentColor: '#81c784',
    siteName: "M's BASE Rental",
    theme: 'green'
  });
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [homeContent, setHomeContent] = useState({
    heroTitle: 'あなたの旅を、私たちがサポート',
    heroSubtitle: '安心・安全・快適なレンタルサービス',
    carTile: {
      title: '車',
      description: 'ファミリー向けから\nビジネスまで幅広く対応',
      features: ['最新モデル', '保険完備', '24時間サポート']
    },
    bikeTile: {
      title: 'バイク',
      description: '街乗りから\nツーリングまで対応',
      features: ['ヘルメット付', '整備済み', 'ロードサービス']
    },
    infoCards: [
      { icon: '📱', title: '簡単予約', description: '24時間いつでもオンラインで予約可能' },
      { icon: '🛡️', title: '安心保証', description: '充実の保険と補償制度' },
      { icon: '💰', title: '明朗会計', description: '追加料金なしの安心価格' },
      { icon: '🏆', title: '高品質', description: '定期メンテナンス済みの車両' }
    ]
  });
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
    
    // ホームコンテンツも読み込み
    const savedContent = localStorage.getItem('homeContent');
    if (savedContent) {
      setHomeContent(JSON.parse(savedContent));
    }
    
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
  };

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin-login');
      return;
    }
    loadDashboardData();
    loadSiteSettings();
  }, [navigate]);

  const loadDashboardData = async () => {
    // First try to sync data from cloud
    try {
      setIsSyncing(true);
      const syncResults = await dataSyncService.syncAllAdminData();
      setSyncStatus(syncResults);
      
      // Show sync status notification
      const syncedCount = Object.values(syncResults).filter(r => r.success).length;
      if (syncedCount > 0) {
        showNotification(`📡 ${syncedCount}個のデータセットを同期しました`, 'info', 3000);
      }
    } catch (error) {
      console.error('Data sync failed:', error);
      showNotification('⚠️ データ同期に失敗しました。ローカルデータを使用します。', 'warning', 3000);
    } finally {
      setIsSyncing(false);
    }
    
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
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
    setVehicles(storedVehicles);
    
    const today = new Date().toDateString();
    const todayBookingsCount = storedBookings.filter(b => 
      new Date(b.bookingDate).toDateString() === today
    ).length;
    
    // 予約ステータス別集計
    const confirmedBookings = storedBookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = storedBookings.filter(b => b.status === 'cancelled').length;
    const activeBookings = storedBookings.filter(b => b.status === 'active').length;
    const completedBookings = storedBookings.filter(b => b.status === 'completed').length;
    
    // 収益計算（キャンセル分を除外し、確定・完了分のみ）
    const totalRevenue = storedBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    // キャンセル損失計算
    const cancelledRevenue = storedBookings
      .filter(b => b.status === 'cancelled')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    setStats({
      totalBookings: storedBookings.length,
      confirmedBookings: confirmedBookings,
      cancelledBookings: cancelledBookings,
      activeBookings: activeBookings,
      completedBookings: completedBookings,
      totalRevenue: totalRevenue,
      cancelledRevenue: cancelledRevenue,
      totalVehicles: storedVehicles.length,
      totalUsers: storedUsers.length,
      todayBookings: todayBookingsCount
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const handleAddVehicle = () => {
    if (!newVehicle.name || !newVehicle.price) {
      showNotification('❌ 車両名と価格は必須項目です', 'error');
      return;
    }
    
    const vehicle = {
      id: Date.now(),
      ...newVehicle,
      price: parseFloat(newVehicle.price),
      passengers: parseInt(newVehicle.passengers) || 4,
      available: true,
      createdAt: new Date().toISOString()
    };
    
    const updatedVehicles = [...vehicles, vehicle];
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    
    // Sync to cloud
    dataSyncService.saveToCloud('vehicles', updatedVehicles).catch(console.error);
    
    setNewVehicle({
      name: '',
      type: 'car',
      price: '',
      passengers: '',
      features: ''
    });
    setShowAddVehicleModal(false);
    loadDashboardData();
    
    showNotification(`🚗 車両「${vehicle.name}」が正常に追加されました！`, 'save');
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle.name || !selectedVehicle.price) {
      showNotification('❌ 車両名と価格は必須項目です', 'error');
      return;
    }
    
    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id ? selectedVehicle : v
    );
    
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    
    // Sync to cloud
    dataSyncService.saveToCloud('vehicles', updatedVehicles).catch(console.error);
    
    setShowEditVehicleModal(false);
    const vehicleName = selectedVehicle.name;
    setSelectedVehicle(null);
    loadDashboardData();
    
    showNotification(`✏️ 車両「${vehicleName}」の情報が正常に更新されました！`, 'save');
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Delete this vehicle?')) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      setVehicles(updatedVehicles);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      loadDashboardData();
      showNotification(`🗑️ 車両「${vehicle?.name}」を削除しました。`, 'info');
    }
  };

  const handleToggleVehicleAvailability = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const updatedVehicles = vehicles.map(v => 
      v.id === vehicleId ? { ...v, available: !v.available } : v
    );
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    loadDashboardData();
    showNotification(
      `🔄 車両「${vehicle?.name}」を${!vehicle?.available ? '有効' : '無効'}に変更しました。`, 
      'info'
    );
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

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Cancel this booking?')) {
      const booking = bookings.find(b => b.id === bookingId);
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      );
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      // Sync to cloud
      dataSyncService.saveToCloud('bookings', updatedBookings).catch(console.error);
      
      loadDashboardData();
      showNotification(`❌ 予約 #${booking?.id} をキャンセルしました。`, 'warning');
    }
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

  // 統計カードクリックハンドラー
  const handleCardClick = (type) => {
    setDetailsType(type);
    setActiveSection('details');
    calculateMonthlyStats(type);
    showNotification(`📊 ${getTypeDisplayName(type)}の詳細データを表示中...`, 'info');
  };

  // タイプの表示名を取得
  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'confirmed': return '予約確定';
      case 'cancelled': return 'キャンセル';
      case 'active': return '進行中';
      case 'completed': return '完了済み';
      case 'revenue': return '実収益';
      case 'cancelled-revenue': return 'キャンセル損失';
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
          case 'cancelled':
            if (booking.status === 'cancelled') months[monthIndex].data++;
            break;
          case 'active':
            if (booking.status === 'active') months[monthIndex].data++;
            break;
          case 'completed':
            if (booking.status === 'completed') months[monthIndex].data++;
            break;
          case 'revenue':
            if (booking.status === 'confirmed' || booking.status === 'completed') {
              months[monthIndex].data += booking.totalPrice || 0;
            }
            break;
          case 'cancelled-revenue':
            if (booking.status === 'cancelled') {
              months[monthIndex].data += booking.totalPrice || 0;
            }
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

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">🚗</div>
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => setActiveSection('overview')}
          >
            <span className="nav-icon">📊</span>
            Overview
          </button>
          <button 
            className={activeSection === 'bookings' ? 'active' : ''}
            onClick={() => setActiveSection('bookings')}
          >
            <span className="nav-icon">📅</span>
            Bookings
          </button>
          <button 
            className={activeSection === 'vehicles' ? 'active' : ''}
            onClick={() => setActiveSection('vehicles')}
          >
            <span className="nav-icon">🚗</span>
            Vehicles
          </button>
          <button 
            className={activeSection === 'users' ? 'active' : ''}
            onClick={() => setActiveSection('users')}
          >
            <span className="nav-icon">👥</span>
            Users
          </button>
          <button 
            className={activeSection === 'analytics' ? 'active' : ''}
            onClick={() => setActiveSection('analytics')}
          >
            <span className="nav-icon">📈</span>
            Analytics
          </button>
          <button 
            className={activeSection === 'settings' ? 'active' : ''}
            onClick={() => setActiveSection('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Site Settings
          </button>
          <button 
            className={`${activeSection === 'content' ? 'active' : ''}`}
            onClick={() => setActiveSection('content')}
          >
            <span className="nav-icon">📝</span>
            Content Editor
          </button>
          <button 
            className={`${activeSection === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveSection('terms')}
          >
            <span className="nav-icon">📋</span>
            Terms Editor
          </button>
          <button 
            className={`${activeSection === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveSection('contacts')}
          >
            <span className="nav-icon">📧</span>
            Contact Management
          </button>
          <button 
            className={`${activeSection === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacy')}
          >
            <span className="nav-icon">🔒</span>
            Privacy Policy Editor
          </button>
        </nav>
        
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeSection === 'overview' && 'Dashboard Overview'}
            {activeSection === 'bookings' && 'Booking Management'}
            {activeSection === 'vehicles' && 'Vehicle Management'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'analytics' && 'Sales Analytics'}
            {activeSection === 'settings' && 'Site Settings'}
            {activeSection === 'content' && 'Content Editor'}
            {activeSection === 'terms' && 'Terms Editor'}
            {activeSection === 'contacts' && 'Contact Management'}
            {activeSection === 'privacy' && 'Privacy Policy Editor'}
            {activeSection === 'details' && `詳細分析 - ${getTypeDisplayName(detailsType)}`}
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
          {activeSection === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card confirmed clickable" onClick={() => handleCardClick('confirmed')}>
                  <div className="stat-icon">✅</div>
                  <div className="stat-details">
                    <h3>予約確定</h3>
                    <p className="stat-number">{stats.confirmedBookings}</p>
                    <span className="stat-label">Confirmed</span>
                  </div>
                  <div className="card-arrow">▶</div>
                </div>
                
                <div className="stat-card cancelled clickable" onClick={() => handleCardClick('cancelled')}>
                  <div className="stat-icon">❌</div>
                  <div className="stat-details">
                    <h3>キャンセル</h3>
                    <p className="stat-number">{stats.cancelledBookings}</p>
                    <span className="stat-label">Cancelled</span>
                  </div>
                  <div className="card-arrow">▶</div>
                </div>
                
                <div className="stat-card active clickable" onClick={() => handleCardClick('active')}>
                  <div className="stat-icon">🚀</div>
                  <div className="stat-details">
                    <h3>進行中</h3>
                    <p className="stat-number">{stats.activeBookings}</p>
                    <span className="stat-label">Active</span>
                  </div>
                  <div className="card-arrow">▶</div>
                </div>
                
                <div className="stat-card completed clickable" onClick={() => handleCardClick('completed')}>
                  <div className="stat-icon">🏁</div>
                  <div className="stat-details">
                    <h3>完了済み</h3>
                    <p className="stat-number">{stats.completedBookings}</p>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="card-arrow">▶</div>
                </div>
                
                <div className="stat-card revenue clickable" onClick={() => handleCardClick('revenue')}>
                  <div className="stat-icon">💰</div>
                  <div className="stat-details">
                    <h3>実収益</h3>
                    <p className="stat-number">{formatCurrency(stats.totalRevenue)}</p>
                    <span className="stat-label">確定・完了のみ</span>
                  </div>
                  <div className="card-arrow">▶</div>
                </div>
                
                <div className="stat-card cancelled-revenue clickable" onClick={() => handleCardClick('cancelled-revenue')}>
                  <div className="stat-icon">📉</div>
                  <div className="stat-details">
                    <h3>キャンセル損失</h3>
                    <p className="stat-number">{formatCurrency(stats.cancelledRevenue)}</p>
                    <span className="stat-label">Lost Revenue</span>
                  </div>
                  <div className="card-arrow">▶</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-details">
                    <h3>Total Vehicles</h3>
                    <p className="stat-number">{stats.totalVehicles}</p>
                    <span className="stat-label">Registered</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-details">
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                    <span className="stat-label">Registered</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📆</div>
                  <div className="stat-details">
                    <h3>Today's Bookings</h3>
                    <p className="stat-number">{stats.todayBookings}</p>
                    <span className="stat-label">New</span>
                  </div>
                </div>
              </div>
              
              <div className="recent-activities">
                <h2>Recent Bookings</h2>
                <div className="activity-list">
                  {bookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="activity-item">
                      <div className="activity-info">
                        <p className="activity-title">{booking.vehicleName}</p>
                        <p className="activity-details">
                          {booking.userName} - {new Date(booking.pickupDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span className={`activity-status status-${booking.status}`}>
                        {booking.status === 'confirmed' ? '確定' : 
                         booking.status === 'active' ? 'アクティブ' : 
                         booking.status === 'cancelled' ? 'キャンセル' : 
                         booking.status === 'completed' ? '完了済み' :
                         booking.status === 'pending' ? '保留中' : booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'bookings' && (
            <div className="bookings-section">
              <div className="section-header">
                <h2>Booking List</h2>
                <div className="filter-buttons">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Confirmed</button>
                  <button className="filter-btn">Pending</button>
                  <button className="filter-btn">Cancelled</button>
                </div>
              </div>
              
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.userName || 'Guest'}</td>
                        <td>{booking.vehicleName}</td>
                        <td>{new Date(booking.pickupDate).toLocaleDateString('ja-JP')}</td>
                        <td>{new Date(booking.returnDate).toLocaleDateString('ja-JP')}</td>
                        <td>{formatCurrency(booking.totalPrice)}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status === 'confirmed' ? '確定' : 
                             booking.status === 'active' ? 'アクティブ' : 
                             booking.status === 'cancelled' ? 'キャンセル' : 
                             booking.status === 'completed' ? '完了済み' :
                             booking.status === 'pending' ? '保留中' : booking.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {booking.status === 'pending' && (
                              <button 
                                className="action-btn confirm"
                                onClick={() => handleConfirmBooking(booking.id)}
                              >
                                承認
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button 
                                className="action-btn handover"
                                onClick={() => handleCompleteHandover(booking.id)}
                                title="引き渡し当日のみ実行可能"
                              >
                                引き渡し確定
                              </button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button 
                                className="action-btn cancel"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                キャンセル
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
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
              
              <div className="vehicles-grid">
                {vehicles.map(vehicle => (
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
            </div>
          )}
          
          {activeSection === 'users' && (
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
          
          {activeSection === 'analytics' && (
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
                    <div className="stat-row">
                      <span>Cancelled</span>
                      <span className="stat-value">
                        {bookings.filter(b => b.status === 'cancelled').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div className="settings-section">
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>🎨 サイトデザイン設定</h3>
                  <p>サイト全体のカラーテーマとデザインをカスタマイズできます。</p>
                  <button 
                    className="design-btn"
                    onClick={() => setShowDesignModal(true)}
                  >
                    デザインを変更
                  </button>
                </div>
                
                <div className="settings-card">
                  <h3>⚙️ サイト基本設定</h3>
                  <div className="setting-item">
                    <label>サイト名</label>
                    <input 
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                    />
                  </div>
                  <div className="setting-item">
                    <label>現在のテーマ</label>
                    <select 
                      value={siteSettings.theme}
                      onChange={(e) => setSiteSettings({...siteSettings, theme: e.target.value})}
                    >
                      <option value="green">Green (現在)</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                    </select>
                  </div>
                  <button className="save-settings-btn" onClick={handleSaveDesignSettings}>
                    設定を保存
                  </button>
                </div>
                
                <div className="settings-card">
                  <h3>🚗 車両管理設定</h3>
                  <div className="setting-item">
                    <label>デフォルト価格 (円/日)</label>
                    <input type="number" placeholder="8000" />
                  </div>
                  <div className="setting-item">
                    <label>在庫アラート</label>
                    <input type="number" placeholder="5" />
                    <small>この台数以下になるとアラート表示</small>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>📊 分析設定</h3>
                  <div className="setting-item">
                    <label>レポート送信</label>
                    <div className="checkbox-group">
                      <label><input type="checkbox" /> 日次レポート</label>
                      <label><input type="checkbox" /> 週次レポート</label>
                      <label><input type="checkbox" /> 月次レポート</label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>💳 ポイント設定</h3>
                  <div className="setting-item">
                    <label>ポイント還元率 (%)</label>
                    <input type="number" defaultValue="5" min="0" max="10" />
                  </div>
                  <div className="setting-item">
                    <label>新規登録ボーナス</label>
                    <input type="number" defaultValue="1000" />
                    <small>ポイント</small>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>🔒 システム設定</h3>
                  <div className="setting-actions">
                    <button className="danger-btn">データベースリセット</button>
                    <button className="export-btn">データエクスポート</button>
                    <button className="backup-btn">バックアップ作成</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'content' && (
            <div className="content-section">
              <div className="content-editor">
                <h2>ホームページコンテンツ編集</h2>
                
                <div className="editor-section">
                  <h3>ヒーローセクション</h3>
                  <div className="form-group">
                    <label>メインタイトル</label>
                    <input 
                      type="text"
                      value={homeContent.heroTitle}
                      onChange={(e) => setHomeContent({...homeContent, heroTitle: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>サブタイトル</label>
                    <input 
                      type="text"
                      value={homeContent.heroSubtitle}
                      onChange={(e) => setHomeContent({...homeContent, heroSubtitle: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="editor-section">
                  <h3>車タイル設定</h3>
                  <div className="form-group">
                    <label>タイトル</label>
                    <input 
                      type="text"
                      value={homeContent.carTile.title}
                      onChange={(e) => setHomeContent({...homeContent, carTile: {...homeContent.carTile, title: e.target.value}})}
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文</label>
                    <textarea 
                      value={homeContent.carTile.description}
                      onChange={(e) => setHomeContent({...homeContent, carTile: {...homeContent.carTile, description: e.target.value}})}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>特徴（カンマ区切り）</label>
                    <input 
                      type="text"
                      value={homeContent.carTile.features.join(', ')}
                      onChange={(e) => setHomeContent({...homeContent, carTile: {...homeContent.carTile, features: e.target.value.split(', ')}})}
                    />
                  </div>
                </div>
                
                <div className="editor-section">
                  <h3>バイクタイル設定</h3>
                  <div className="form-group">
                    <label>タイトル</label>
                    <input 
                      type="text"
                      value={homeContent.bikeTile.title}
                      onChange={(e) => setHomeContent({...homeContent, bikeTile: {...homeContent.bikeTile, title: e.target.value}})}
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文</label>
                    <textarea 
                      value={homeContent.bikeTile.description}
                      onChange={(e) => setHomeContent({...homeContent, bikeTile: {...homeContent.bikeTile, description: e.target.value}})}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>特徴（カンマ区切り）</label>
                    <input 
                      type="text"
                      value={homeContent.bikeTile.features.join(', ')}
                      onChange={(e) => setHomeContent({...homeContent, bikeTile: {...homeContent.bikeTile, features: e.target.value.split(', ')}})}
                    />
                  </div>
                </div>
                
                <div className="editor-section">
                  <h3>情報カード設定</h3>
                  {homeContent.infoCards.map((card, index) => (
                    <div key={index} className="info-card-editor">
                      <h4>カード {index + 1}</h4>
                      <div className="form-group">
                        <label>アイコン</label>
                        <input 
                          type="text"
                          value={card.icon}
                          onChange={(e) => {
                            const newCards = [...homeContent.infoCards];
                            newCards[index].icon = e.target.value;
                            setHomeContent({...homeContent, infoCards: newCards});
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>タイトル</label>
                        <input 
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...homeContent.infoCards];
                            newCards[index].title = e.target.value;
                            setHomeContent({...homeContent, infoCards: newCards});
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>説明</label>
                        <input 
                          type="text"
                          value={card.description}
                          onChange={(e) => {
                            const newCards = [...homeContent.infoCards];
                            newCards[index].description = e.target.value;
                            setHomeContent({...homeContent, infoCards: newCards});
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="form-actions">
                  <button className="save-btn" onClick={() => {
                    localStorage.setItem('homeContent', JSON.stringify(homeContent));
                    
                    // Sync to cloud
                    dataSyncService.saveToCloud('homeContent', homeContent).catch(console.error);
                    
                    showNotification('📝 ホームページコンテンツが正常に保存されました！ページをリロードして確認してください。', 'save', 5000);
                  }}>
                    コンテンツを保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'details' && detailsType && (
            <div className="details-section">
              <div className="details-header">
                <button 
                  className="back-to-overview-btn"
                  onClick={() => setActiveSection('overview')}
                >
                  ← Overview に戻る
                </button>
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
          
          {activeSection === 'terms' && (
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
          
          {activeSection === 'contacts' && (
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
          
          {activeSection === 'privacy' && (
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
            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddVehicle}>Save</button>
              <button className="cancel-btn" onClick={() => setShowAddVehicleModal(false)}>Cancel</button>
            </div>
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
    </div>
  );
};

export default AdminDashboard;