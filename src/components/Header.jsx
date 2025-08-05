import React from 'react';

const Header = ({ currentView, onViewChange, reservationCount }) => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          <h1 onClick={() => onViewChange('home')}>RentalEasy</h1>
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
        </ul>
      </nav>
    </header>
  );
};

export default Header;