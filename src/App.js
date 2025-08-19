// Version 3.0 - FORCE WEBPACK REBUILD - SECURITY CREDENTIALS COMPLETELY REMOVED
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import VehicleListPage from './components/VehicleListPage';
import Login from './components/Login';
import EmailRegistration from './components/EmailRegistration';
import CompleteRegistration from './components/CompleteRegistration';
import MyPage from './components/MyPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ContactForm from './components/ContactForm';
import Terms from './components/Terms';
import PrivacyPolicy from './components/PrivacyPolicy';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AnnouncementDetail from './components/AnnouncementDetail';
import { getGlobalSettings, updateGlobalSettings } from './data/globalSettings';

function AppContent() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // 管理者ログイン状態を復元（より確実な維持）
    const checkAdminLogin = () => {
      const adminUser = localStorage.getItem('adminUser');
      const adminSession = sessionStorage.getItem('adminSession');
      const adminTimestamp = localStorage.getItem('adminLoginTime');
      
      // 複数の保存場所をチェック
      if (adminUser === 'true' || adminSession === 'true') {
        // ログイン時刻をチェック（7日間有効）
        if (adminTimestamp) {
          const loginTime = parseInt(adminTimestamp);
          const currentTime = Date.now();
          const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7日間のミリ秒
          
          if (currentTime - loginTime < sevenDays) {
            setIsAdmin(true);
            console.log('✅ 管理者ログイン状態を復元しました');
            
            // ログイン時刻を更新（アクティブな場合）
            localStorage.setItem('adminLoginTime', currentTime.toString());
            return true;
          } else {
            // 期限切れの場合はクリア
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoginTime');
            sessionStorage.removeItem('adminSession');
            console.log('⏰ 管理者ログインが期限切れです');
          }
        } else {
          // タイムスタンプがない場合は新たに設定
          localStorage.setItem('adminLoginTime', Date.now().toString());
          setIsAdmin(true);
          console.log('✅ 管理者ログイン状態を復元しました（新規タイムスタンプ設定）');
          return true;
        }
      }
      return false;
    };
    
    checkAdminLogin();
    
    // グローバルサイト設定を読み込んでCSSに適用
    const globalSettings = getGlobalSettings();
    const savedSettings = localStorage.getItem('rentalEasySiteSettings');
    
    // グローバル設定を基準にしたマージ設定
    let settings = globalSettings;
    if (savedSettings) {
      const localSettings = JSON.parse(savedSettings);
      settings = { ...globalSettings, ...localSettings };
    }
    
    console.log('🌐 適用されるサイト設定:', settings);
    setSiteSettings(settings); // 状態に保存
    
    const root = document.documentElement;
    
    // カラー設定がある場合は適用
    if (settings.theme?.primaryColor || settings.primaryColor) {
      const primaryColor = settings.theme?.primaryColor || settings.primaryColor;
      const secondaryColor = settings.theme?.secondaryColor || settings.secondaryColor;
      const accentColor = settings.theme?.accentColor || settings.accentColor;
      
      root.style.setProperty('--gradient-1', `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`);
      root.style.setProperty('--gradient-2', `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`);
      root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${primaryColor}22 0%, ${secondaryColor}22 100%)`);
      root.style.setProperty('--green', primaryColor);
      root.style.setProperty('--green-hover', primaryColor + 'dd');
      root.style.setProperty('--green-dark', primaryColor);
      root.style.setProperty('--green-light', secondaryColor);
      root.style.setProperty('--green-pale', accentColor + '22');
    }
    
    // ブランディング設定の適用
    if (settings.branding?.siteName) {
      document.title = settings.branding.siteName;
      console.log('📝 サイトタイトル適用:', settings.branding.siteName);
    }
    
    // カスタムアイコン設定の適用
    if (settings.branding?.siteIcon) {
      console.log('🖼️ カスタムアイコン適用:', settings.branding.siteIcon);
    }
  }, []);

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    
    if (logoClickTimer) {
      clearTimeout(logoClickTimer);
    }
    
    const timer = setTimeout(() => {
      setLogoClickCount(0);
    }, 3000);
    
    setLogoClickTimer(timer);
    
    if (logoClickCount === 9) {
      window.location.href = '/admin-login';
      setLogoClickCount(0);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    
    // すべての管理者関連データを削除
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminInfo');
    sessionStorage.removeItem('adminSession');
    
    console.log('🚪 ログアウトしました（全ての認証データを削除）');
  };

  // サイト設定更新の処理
  const handleSiteSettingsUpdate = (newSettings) => {
    console.log('🎨 サイト設定がリアルタイム更新されました:', newSettings);
    setSiteSettings(newSettings);
    
    // グローバル設定として保存（全ユーザーに適用）
    updateGlobalSettings(newSettings);
    
    // リアルタイムでタイトル更新
    if (newSettings.branding?.siteName) {
      document.title = newSettings.branding.siteName;
      console.log('📝 サイトタイトル更新:', newSettings.branding.siteName);
    }
    
    // アイコン更新ログ
    if (newSettings.branding?.siteIcon) {
      console.log('🖼️ カスタムアイコンが更新されました - 全ユーザーに適用');
    }
    
    // localStorageにも保存（既にSiteSettingsManagementで保存済み）
    // カスタムイベントを発生させて他のコンポーネントに通知
    window.dispatchEvent(new CustomEvent('siteSettingsUpdate', { 
      detail: newSettings 
    }));
  };

  return (
    <div className="App">
        <header className="main-header">
          <div className="header-container">
            <Link to="/" className="logo-section" onClick={handleLogoClick} style={{cursor: 'pointer', textDecoration: 'none', color: 'inherit'}}>
              <div className="logo">
                {siteSettings?.branding?.siteIconType === 'custom' && siteSettings?.branding?.siteIcon ? (
                  <img 
                    src={siteSettings.branding.siteIcon} 
                    alt="サイトアイコン" 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  'MB'
                )}
              </div>
              <h1 className="site-title">
                {siteSettings?.branding?.siteName || 'M\'s BASE Rental'}
              </h1>
            </Link>
            
            <nav className="header-nav">
              {location.pathname === '/admin' || location.pathname === '/admin-login' ? (
                // 管理者画面では認証ボタンを非表示
                <div className="admin-indicator">
                  {isAdmin && <span className="admin-badge">管理者モード</span>}
                </div>
              ) : user ? (
                <div className="user-menu">
                  <Link to="/mypage" className="mypage-link">マイページ</Link>
                  <div className="welcome-text">
                    <span className="greeting">ようこそ</span>
                    <span className="username">{user.name}様</span>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>ログアウト</button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="login-btn">ログイン</Link>
                  <Link to="/register" className="register-btn">新規登録</Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicles/:type" element={<VehicleListPage user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<EmailRegistration />} />
          <Route path="/complete-registration/:token" element={<CompleteRegistration />} />
          <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />} />
          <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} onSuccess={() => window.location.href = '/admin'} />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard onSettingsUpdate={handleSiteSettingsUpdate} /> : <Navigate to="/admin-login" />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/announcement/:id" element={<AnnouncementDetail />} />
        </Routes>

        <footer className="main-footer">
          <div className="footer-container">
            <p>&copy; 2024 M's BASE Rental - 信頼のレンタルサービス</p>
            <div className="footer-links">
              <Link to="/terms">利用規約</Link>
              <Link to="/privacy">プライバシーポリシー</Link>
              <Link to="/contact">お問い合わせ</Link>
            </div>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;