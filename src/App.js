// Version 4.0.4 - GOOGLE FORMS INTEGRATION CACHE BUST  
// Timestamp: 2025-09-06-17:30 - Google Forms連携機能キャッシュクリア
// 管理画面簡素化完了: 車両管理・サイト設定・お知らせ管理の3機能のみ
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import VehicleListPage from './components/VehicleListPage';
// DISABLED: Authentication and User Management Features
// import Login from './components/Login';
// import EmailRegistration from './components/EmailRegistration';
// import CompleteRegistration from './components/CompleteRegistration';
// import MyPage from './components/MyPage';
// DISABLED: Password Reset Features  
// import ForgotPassword from './components/ForgotPassword';
// import ResetPassword from './components/ResetPassword';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
// import ContactForm from './components/ContactForm'; // REMOVED: Contact form moved to HomePage
import Terms from './components/Terms';
import PrivacyPolicy from './components/PrivacyPolicy';
import RentalTerms from './components/RentalTerms';
import AnnouncementDetail from './components/AnnouncementDetail';
import CampingSpace from './components/CampingSpace';
import Spaciva from './components/Spaciva';
import DuringField from './components/DuringField';
import DuringFieldCompany from './components/DuringFieldCompany';
import DuringFieldBusiness from './components/DuringFieldBusiness';
import DuringFieldWorks from './components/DuringFieldWorks';
import DuringFieldContact from './components/DuringFieldContact';
import Shuriken from './components/Shuriken';
import { getGlobalSettings, updateGlobalSettings } from './data/globalSettings';
import storageManager from './utils/storageManager';

function AppContent() {
  const navigate = useNavigate();

  // INFO SITE MODE: Simplified state management
  // DISABLED: User authentication state
  // const [user, setUser] = useState(null);

  // 初期状態で管理者認証をチェック
  const checkInitialAdminAuth = () => {
    const adminUser = localStorage.getItem('adminUser');
    const adminSession = sessionStorage.getItem('adminSession');
    const adminTimestamp = localStorage.getItem('adminLoginTime');
    
    if (adminUser === 'true' || adminSession === 'true') {
      if (adminTimestamp) {
        const loginTime = parseInt(adminTimestamp);
        const currentTime = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        if (!isNaN(loginTime) && (currentTime - loginTime) < sevenDays) {
          return true;
        }
      }
    }
    return false;
  };
  
  const [isAdmin, setIsAdmin] = useState(checkInitialAdminAuth());
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const location = useLocation();

  // ページ移動時に必ずトップにスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // 404.htmlからのリダイレクト処理
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      window.history.replaceState(null, '', redirectPath);
    }

    // ストレージのクリーンアップとデバッグ
    try {
      storageManager.initializeStorage();

      // デバッグモードの場合は詳細情報を出力
      if (process.env.NODE_ENV === 'development') {
        storageManager.debugStorage();
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }

    // DISABLED: User authentication features
    /*
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    */

    // 管理者ログイン状態を復元（リロード対応強化版）
    const checkAdminLogin = () => {
      const adminUser = localStorage.getItem('adminUser');
      const adminSession = sessionStorage.getItem('adminSession');
      const adminTimestamp = localStorage.getItem('adminLoginTime');
      const adminInfo = localStorage.getItem('adminInfo');
      
      console.log('🔍 App.js 管理者認証チェック:', { 
        adminUser, 
        adminSession, 
        adminTimestamp, 
        hasAdminInfo: !!adminInfo,
        currentTime: Date.now()
      });
      
      // セッション確認：sessionStorageまたはlocalStorageのいずれかで管理者フラグが存在
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
      
      // ログイン状態の判定（複数チェック）
      if (hasAdminSession || parsedAdminInfo) {
        const currentTime = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7日間のミリ秒
        
        // タイムスタンプチェック
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
            // 管理者状態を復元
            setIsAdmin(true);
            console.log('✅ 管理者ログイン状態を復元しました（期限内）');
            
            // アクティビティ更新
            localStorage.setItem('adminLoginTime', currentTime.toString());
            localStorage.setItem('adminUser', 'true');
            sessionStorage.setItem('adminSession', 'true');
            
            // adminInfo更新
            const updatedAdminInfo = {
              username: 'admin',
              loginTime: loginTime, // 元のログイン時刻は保持
              lastActivity: currentTime // 最新アクティビティ時刻を更新
            };
            localStorage.setItem('adminInfo', JSON.stringify(updatedAdminInfo));
            
            return true;
          } else {
            // 期限切れ - 全データクリア
            console.log('⏰ 管理者ログインが期限切れです（7日超過）');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoginTime');
            localStorage.removeItem('adminInfo');
            sessionStorage.removeItem('adminSession');
            return false;
          }
        } else {
          // タイムスタンプが無効な場合は新規設定
          console.log('🆕 タイムスタンプが見つからないため新規設定します');
          const newLoginTime = currentTime;
          localStorage.setItem('adminLoginTime', newLoginTime.toString());
          localStorage.setItem('adminUser', 'true');
          sessionStorage.setItem('adminSession', 'true');
          
          const newAdminInfo = {
            username: 'admin',
            loginTime: newLoginTime,
            lastActivity: newLoginTime
          };
          localStorage.setItem('adminInfo', JSON.stringify(newAdminInfo));
          
          setIsAdmin(true);
          console.log('✅ 管理者ログイン状態を復元しました（新規タイムスタンプ）');
          return true;
        }
      }
      
      console.log('❌ 管理者ログイン状態が見つかりません');
      return false;
    };
    
    checkAdminLogin();
    
    // グローバルサイト設定を読み込んでCSSに適用
    const globalSettings = getGlobalSettings();
    const savedSettings = localStorage.getItem('siteSettings');
    
    // グローバル設定を基準にしたマージ設定
    let settings = globalSettings;
    if (savedSettings) {
      const localSettings = JSON.parse(savedSettings);
      settings = { ...globalSettings, ...localSettings };
    }
    
    // サイト名のデフォルト設定
    if (!settings.branding || !settings.branding.siteName) {
      settings.branding = { siteName: "M's BASE Rental" };
    }
    
    console.log('🌐 適用されるサイト設定:', settings);
    setSiteSettings(settings); // 状態に保存
    
    const root = document.documentElement;
    
    // 🎨 緑色テーマを強制適用（設定に関係なく統一された緑色テーマ）
    console.log('🎨 緑色テーマを強制適用中...');
    
    // 緑色テーマの統一カラーパレットを強制適用
    const primaryColor = '#2e7d32';   // 濃い緑色（メインテーマ）
    const secondaryColor = '#4caf50'; // 明るい緑色（アクセント）
    const accentColor = '#e8f5e9';    // 薄い緑色（背景）
    const hoverColor = '#1b5e20';     // ホバー用さらに濃い緑
    
    root.style.setProperty('--gradient-1', `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`);
    root.style.setProperty('--gradient-2', `linear-gradient(135deg, ${hoverColor} 0%, ${primaryColor} 100%)`);
    root.style.setProperty('--gradient-soft', `linear-gradient(135deg, #fafafa 0%, ${accentColor} 100%)`);
    root.style.setProperty('--green', primaryColor);
    root.style.setProperty('--green-hover', hoverColor);
    root.style.setProperty('--green-dark', hoverColor);
    root.style.setProperty('--green-light', secondaryColor);
    root.style.setProperty('--green-pale', accentColor);
    root.style.setProperty('--extra-light-gray', '#fafafa');
    root.style.setProperty('--dark-gray', '#263238');
    
    console.log('✅ 緑色テーマ強制適用完了:', {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      hover: hoverColor
    });
    
    // ブランディング設定の適用
    const siteName = settings.branding?.siteName || "M's BASE Rental";
    const siteSubtitle = settings.branding?.siteSubtitle || "車・バイクレンタル";
    document.title = `${siteName} - ${siteSubtitle}`;
    console.log('📝 サイトタイトル適用:', siteName);
    
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
      navigate('/admin-login');
      setLogoClickCount(0);
    }
  };

  // DISABLED: User authentication features
  /*
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
  */

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

  // サブブランドページではメインヘッダーを非表示
  const hiddenHeaderPaths = ['/during-field', '/spaciva', '/shuriken'];
  const shouldHideHeader = hiddenHeaderPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="App">
        {!shouldHideHeader && (
          <header className="main-header">
            <div className="header-container">
              <Link to="/" className="logo-section" onClick={handleLogoClick} style={{cursor: 'pointer', textDecoration: 'none', color: 'inherit'}}>
                <h1 className="site-title">
                  {siteSettings?.branding?.siteName || 'M\'s BASE Rental'}
                </h1>
              </Link>

              <nav className="header-nav">
                {(location.pathname === '/admin' || location.pathname === '/admin-login') && isAdmin && (
                  <div className="admin-indicator">
                    <span className="admin-badge">管理者モード</span>
                  </div>
                )}
              </nav>
            </div>
          </header>
        )}

        <Routes>
          {/* INFO SITE MODE: Core Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Vehicle Information Routes */}
          <Route path="/vehicles/:type" element={<VehicleListPage user={null} />} />
          <Route path="/cars" element={<Navigate to="/vehicles/car" replace />} />
          <Route path="/motorcycles" element={<Navigate to="/vehicles/motorcycle" replace />} />
          
          {/* Static Information Pages */}
          {/* <Route path="/contact" element={<ContactForm />} /> REMOVED: Contact moved to HomePage */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/rental-terms" element={<RentalTerms />} />
          <Route path="/camping-space" element={<CampingSpace />} />
          <Route path="/spaciva" element={<Spaciva />} />
          <Route path="/during-field" element={<DuringField />} />
          <Route path="/during-field/company" element={<DuringFieldCompany />} />
          <Route path="/during-field/business" element={<DuringFieldBusiness />} />
          <Route path="/during-field/works" element={<DuringFieldWorks />} />
          <Route path="/during-field/contact" element={<DuringFieldContact />} />

          {/* Shuriken Routes */}
          <Route path="/shuriken" element={<Shuriken />} />

          {/* Admin Routes (Hidden from main navigation) */}
          <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} onSuccess={() => navigate('/admin')} />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard onSettingsUpdate={handleSiteSettingsUpdate} /> : <Navigate to="/admin-login" replace />} />
          
          {/* Legacy/Optional Routes */}
          <Route path="/announcement/:id" element={<AnnouncementDetail />} />
          
          {/* DISABLED: Authentication Routes
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<EmailRegistration />} />
          <Route path="/complete-registration/:token" element={<CompleteRegistration />} />
          <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          */}
        </Routes>

        <footer className="main-footer">
          <div className="footer-container">
            <p>&copy; {siteSettings?.branding?.copyrightYear || new Date().getFullYear()} {siteSettings?.branding?.siteName || "M's BASE Rental"}</p>
            <div className="footer-links">
              {/* <Link to="/contact">お問い合わせ</Link> REMOVED: Contact moved to HomePage */}
              <Link to="/terms">利用規約</Link>
              <Link to="/privacy">プライバシーポリシー</Link>
              <Link to="/rental-terms">レンタカー約款</Link>
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