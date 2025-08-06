import React, { useState } from 'react';

const Header = ({ currentView, onViewChange, reservationCount, isAdminLoggedIn, onAdminLogin, isMemberLoggedIn, currentMember, onMemberLogin }) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const currentTime = Date.now();
    
    // 前回のクリックから2秒以内の場合のみカウント
    if (currentTime - lastClickTime < 2000) {
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      // 10回連続クリックで管理者ログイン画面を表示
      if (newClickCount >= 10) {
        onAdminLogin();
        setClickCount(0); // リセット
      }
    } else {
      // 2秒以上間が空いた場合は通常のホーム遷移とカウントリセット
      onViewChange('home');
      setClickCount(1);
    }
    
    setLastClickTime(currentTime);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          <h1 onClick={handleLogoClick}>RentalEasy</h1>
        </div>
        <ul className="nav-menu">
          <li>
            <button 
              className={currentView === 'home' ? 'active' : ''}
              onClick={() => onViewChange('home')}
            >
              ホーム
            </button>
          </li>
          <li>
            <button 
              className={currentView === 'vehicles' ? 'active' : ''}
              onClick={() => onViewChange('vehicles')}
            >
              車両一覧
            </button>
          </li>
          <li>
            <button 
              className={currentView === 'contact' ? 'active' : ''}
              onClick={() => onViewChange('contact')}
            >
              お問い合わせ
            </button>
          </li>
          {reservationCount > 0 && (
            <li className="reservation-count">
              <span className="badge">{reservationCount}</span>
            </li>
          )}
          {isMemberLoggedIn ? (
            <li>
              <button 
                className="member-profile-button"
                onClick={() => onViewChange('mypage')}
              >
                👤 {currentMember?.profile?.name}さん
              </button>
            </li>
          ) : (
            <li>
              <button 
                className="member-login-button"
                onClick={onMemberLogin}
              >
                👤 会員ログイン
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;