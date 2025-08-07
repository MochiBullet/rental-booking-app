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

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState(null);

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
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const root = document.documentElement;
      root.style.setProperty('--gradient-1', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 50%, ${settings.accentColor} 100%)`);
      root.style.setProperty('--gradient-2', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`);
      root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${settings.primaryColor}22 0%, ${settings.secondaryColor}22 100%)`);
      root.style.setProperty('--green', settings.primaryColor);
      root.style.setProperty('--green-hover', settings.primaryColor + 'dd');
      root.style.setProperty('--green-dark', settings.primaryColor);
      root.style.setProperty('--green-light', settings.secondaryColor);
      root.style.setProperty('--green-pale', settings.accentColor + '22');
      
      if (settings.siteName) {
        document.title = settings.siteName;
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

  return (
    <Router>
      <div className="App">
        <header className="main-header">
          <div className="header-container">
            <Link to="/" className="logo-section" onClick={handleLogoClick} style={{cursor: 'pointer', textDecoration: 'none', color: 'inherit'}}>
              <div className="logo">MB</div>
              <h1 className="site-title">M's BASE Rental</h1>
            </Link>
            
            <nav className="header-nav">
              {user ? (
                <div className="user-menu">
                  <Link to="/mypage" className="mypage-link">マイページ</Link>
                  <span className="welcome-text">ようこそ、{user.name}様</span>
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
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
        </Routes>

        <footer className="main-footer">
          <div className="footer-container">
            <p>&copy; 2024 M's BASE Rental - 信頼のレンタルサービス</p>
            <div className="footer-links">
              <a href="#">利用規約</a>
              <a href="#">プライバシーポリシー</a>
              <a href="#">お問い合わせ</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;