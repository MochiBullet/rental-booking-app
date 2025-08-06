import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import VehicleList from './components/VehicleList';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  return (
    <Router>
      <div className="App">
        <header className="main-header">
          <div className="header-container">
            <div className="logo-section" onClick={handleLogoClick}>
              <svg className="logo" viewBox="0 0 50 50" width="40" height="40">
                <circle cx="25" cy="25" r="20" fill="#2d7a2d"/>
                <path d="M15 25 L35 25 M20 20 L30 20 M20 30 L30 30" stroke="white" strokeWidth="2"/>
              </svg>
              <h1 className="site-title">GreenRide</h1>
            </div>
            
            <nav className="header-nav">
              {user ? (
                <div className="user-menu">
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
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
        </Routes>

        <footer className="main-footer">
          <div className="footer-container">
            <p>&copy; 2024 GreenRide - 信頼のレンタルサービス</p>
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