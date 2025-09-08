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
      
      // デバッグ用：コンソールにクリック回数を表示
      console.log(`Admin click count: ${newClickCount}/10`);
      
      // 10回連続クリックで管理者ログイン画面を表示
      if (newClickCount >= 10) {
        console.log('Admin access triggered!');
        if (!isAdminLoggedIn) {
          onAdminLogin(); // 管理者ログインしていない場合のみログイン
        } else {
          onViewChange('admin'); // 既にログイン済みの場合は管理画面に移動
        }
        setClickCount(0); // リセット
      }
    } else {
      // 2秒以上間が空いた場合
      console.log('Click timeout - reset count');
      if (clickCount === 0) {
        // カウントが0の場合は通常のホーム遷移
        onViewChange('home');
      }
      setClickCount(1);
      console.log('Admin click count: 1/10');
    }
    
    setLastClickTime(currentTime);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          <h1 onClick={handleLogoClick}>M's BASE Rental</h1>
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
              className={currentView === 'cars' ? 'active' : ''}
              onClick={() => onViewChange('cars')}
            >
              🚗 車両
            </button>
          </li>
          <li>
            <button 
              className={currentView === 'motorcycles' ? 'active' : ''}
              onClick={() => onViewChange('motorcycles')}
            >
              🏍️ バイク
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
          {isAdminLoggedIn && (
            <li>
              <button 
                className="admin-menu-button"
                onClick={() => onViewChange('admin')}
              >
                🔧 管理者メニュー
              </button>
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
            <>
              <li>
                <button 
                  className="member-register-button"
                  onClick={() => onViewChange('member-register')}
                >
                  📝 会員登録
                </button>
              </li>
              <li>
                <button 
                  className="member-login-button"
                  onClick={onMemberLogin}
                >
                  👤 ログイン
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;