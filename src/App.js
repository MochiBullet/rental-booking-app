import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import VehicleList from './components/VehicleList';
import Login from './components/Login';
import Register from './components/Register';
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
    
    // 管理者ログイン状態を復元
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser === 'true') {
      setIsAdmin(true);
    }
    
    // サイト設定を読み込んでCSSに適用
    const savedSettings = localStorage.getItem('rentalEasySiteSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSiteSettings(settings); // 状態に保存
      const root = document.documentElement;
      
      // カラー設定がある場合は適用（後方互換性）
      if (settings.primaryColor) {
        root.style.setProperty('--gradient-1', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 50%, ${settings.accentColor} 100%)`);
        root.style.setProperty('--gradient-2', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`);
        root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${settings.primaryColor}22 0%, ${settings.secondaryColor}22 100%)`);
        root.style.setProperty('--green', settings.primaryColor);
        root.style.setProperty('--green-hover', settings.primaryColor + 'dd');
        root.style.setProperty('--green-dark', settings.primaryColor);
        root.style.setProperty('--green-light', settings.secondaryColor);
        root.style.setProperty('--green-pale', settings.accentColor + '22');
      }
      
      // ブランディング設定の適用
      if (settings.branding?.siteName) {
        document.title = settings.branding.siteName;
      }
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminUser');
  };

  // サイト設定更新の処理
  const handleSiteSettingsUpdate = (newSettings) => {
    setSiteSettings(newSettings);
    
    // リアルタイムでタイトル更新
    if (newSettings.branding?.siteName) {
      document.title = newSettings.branding.siteName;
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
                  <Link to="/register" className="register-btn">会員登録</Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicles/:type" element={<VehicleList user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<EmailRegistration />} />
          <Route path="/complete-registration/:token" element={<CompleteRegistration />} />
          <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />} />
          <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard onSettingsUpdate={handleSiteSettingsUpdate} /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
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