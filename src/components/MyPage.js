import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadUserData();
  }, [user, navigate]);

  const loadUserData = () => {
    // Load bookings
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = allBookings.filter(booking => booking.userId === user.id);
    setBookings(userBookings);
    
    // Load point history (generate if doesn't exist)
    let userPointHistory = JSON.parse(localStorage.getItem('pointHistory') || '[]')
      .filter(history => history.userId === user.id);
    
    if (userPointHistory.length === 0) {
      userPointHistory = generatePointHistory(user, userBookings);
      const allPointHistory = JSON.parse(localStorage.getItem('pointHistory') || '[]');
      allPointHistory.push(...userPointHistory);
      localStorage.setItem('pointHistory', JSON.stringify(allPointHistory));
    }
    
    setPointHistory(userPointHistory);
    setIsLoading(false);
  };

  const generatePointHistory = (user, userBookings) => {
    const history = [
      {
        id: Date.now() + 1,
        userId: user.id,
        type: 'welcome',
        amount: 1000,
        description: '新規登録ボーナス',
        date: user.createdAt,
        remaining: 1000
      }
    ];
    
    let currentPoints = 1000;
    
    userBookings.forEach((booking, index) => {
      const earnedPoints = Math.floor(booking.totalPrice * 0.05);
      currentPoints += earnedPoints;
      
      history.push({
        id: Date.now() + index + 2,
        userId: user.id,
        type: 'earn',
        amount: earnedPoints,
        description: `${booking.vehicleName}の利用で獲得`,
        date: booking.bookingDate,
        remaining: currentPoints,
        bookingId: booking.id
      });
    });
    
    return history;
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { text: '確定', class: 'status-confirmed' },
      active: { text: '利用中', class: 'status-active' },
      completed: { text: '完了', class: 'status-completed' },
      cancelled: { text: 'キャンセル', class: 'status-cancelled' }
    };
    return badges[status] || { text: status, class: 'status-default' };
  };

  const getPointIcon = (type) => {
    const icons = {
      welcome: '🎁',
      earn: '💰',
      use: '🛒',
      expire: '⏰',
      bonus: '✨'
    };
    return icons[type] || '📝';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalPoints = () => {
    return pointHistory.reduce((total, history) => {
      return history.type === 'earn' || history.type === 'welcome' || history.type === 'bonus' 
        ? total + history.amount 
        : total - history.amount;
    }, 0);
  };

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.pickupDate) > new Date() && booking.status === 'confirmed'
  );

  const recentBookings = bookings
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
    .slice(0, 3);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mypage-container">
        <div className="loading-spinner">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.name.substring(0, 1)}
          </div>
          <div className="user-details">
            <h1>こんにちは、{user.name}さん</h1>
            <p className="user-email">{user.email}</p>
            <div className="user-stats">
              <span className="stat-item">
                <span className="stat-value">{bookings.length}</span>
                <span className="stat-label">総利用回数</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{calculateTotalPoints()}</span>
                <span className="stat-label">保有ポイント</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="quick-actions">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/vehicles/all')}
          >
            新しく予約する
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setActiveTab('profile')}
          >
            プロフィール編集
          </button>
        </div>
      </div>

      <div className="mypage-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概要
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          予約履歴
        </button>
        <button 
          className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          ポイント
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          プロフィール
        </button>
      </div>

      <div className="mypage-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {upcomingBookings.length > 0 && (
              <div className="section">
                <h2>今後の予約</h2>
                <div className="upcoming-bookings">
                  {upcomingBookings.map(booking => (
                    <div key={booking.id} className="booking-card upcoming">
                      <div className="booking-info">
                        <h3>{booking.vehicleName}</h3>
                        <p className="booking-dates">
                          {formatDate(booking.pickupDate)} ～ {formatDate(booking.returnDate)}
                        </p>
                        <span className={`status-badge ${getStatusBadge(booking.status).class}`}>
                          {getStatusBadge(booking.status).text}
                        </span>
                      </div>
                      <div className="booking-actions">
                        <button className="btn-details">詳細</button>
                        <button className="btn-modify">変更</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section">
              <h2>最近の利用履歴</h2>
              <div className="recent-bookings">
                {recentBookings.length > 0 ? (
                  recentBookings.map(booking => (
                    <div key={booking.id} className="booking-item">
                      <div className="booking-icon">🚗</div>
                      <div className="booking-details">
                        <h4>{booking.vehicleName}</h4>
                        <p>{formatDate(booking.bookingDate)}</p>
                      </div>
                      <div className="booking-amount">
                        {formatCurrency(booking.totalPrice)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>まだ利用履歴がありません</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/vehicles/all')}
                    >
                      初回予約をする
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="section">
              <h2>ポイント残高</h2>
              <div className="points-summary">
                <div className="points-card">
                  <div className="points-amount">
                    <span className="points-value">{calculateTotalPoints()}</span>
                    <span className="points-unit">pt</span>
                  </div>
                  <p className="points-note">
                    100ポイント = 100円として利用可能
                  </p>
                  <div className="recent-points">
                    <h4>最近のポイント獲得</h4>
                    {pointHistory.slice(0, 3).map(point => (
                      <div key={point.id} className="point-item">
                        <span className="point-icon">{getPointIcon(point.type)}</span>
                        <span className="point-desc">{point.description}</span>
                        <span className="point-amount">+{point.amount}pt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <div className="bookings-header">
              <h2>予約履歴</h2>
              <div className="booking-filters">
                <select className="filter-select">
                  <option value="all">すべて</option>
                  <option value="confirmed">確定</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
            
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.vehicleName}</h3>
                    <span className={`status-badge ${getStatusBadge(booking.status).class}`}>
                      {getStatusBadge(booking.status).text}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label">利用期間:</span>
                      <span className="value">
                        {formatDate(booking.pickupDate)} ～ {formatDate(booking.returnDate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">プラン:</span>
                      <span className="value">{booking.plan}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">期間:</span>
                      <span className="value">{booking.duration}日間</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">合計金額:</span>
                      <span className="value amount">{formatCurrency(booking.totalPrice)}</span>
                    </div>
                  </div>
                  
                  <div className="booking-actions">
                    <button className="btn-secondary">詳細を見る</button>
                    {booking.status === 'confirmed' && (
                      <button className="btn-outline">変更・キャンセル</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="points-tab">
            <div className="points-header">
              <div className="points-balance">
                <h2>現在の保有ポイント</h2>
                <div className="balance-amount">
                  <span className="balance-value">{calculateTotalPoints()}</span>
                  <span className="balance-unit">ポイント</span>
                </div>
                <p className="balance-note">1ポイント = 1円として利用可能</p>
              </div>
            </div>
            
            <div className="points-content">
              <div className="points-info">
                <h3>ポイントの貯め方</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon">🚗</div>
                    <h4>利用で貯まる</h4>
                    <p>利用金額の5%がポイントとして還元されます</p>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">🎂</div>
                    <h4>誕生日ボーナス</h4>
                    <p>お誕生日月に500ポイントをプレゼント</p>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">📱</div>
                    <h4>アプリ評価</h4>
                    <p>アプリストアでの評価で200ポイント獲得</p>
                  </div>
                </div>
              </div>
              
              <div className="points-history">
                <h3>ポイント履歴</h3>
                <div className="history-list">
                  {pointHistory.map(point => (
                    <div key={point.id} className="history-item">
                      <div className="history-icon">{getPointIcon(point.type)}</div>
                      <div className="history-details">
                        <p className="history-desc">{point.description}</p>
                        <p className="history-date">{formatDate(point.date)}</p>
                      </div>
                      <div className="history-amount">
                        <span className={`amount ${point.type === 'use' ? 'negative' : 'positive'}`}>
                          {point.type === 'use' ? '-' : '+'}{point.amount}pt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="profile-header">
              <h2>プロフィール情報</h2>
              <button className="btn-edit">編集</button>
            </div>
            
            <div className="profile-sections">
              <div className="profile-section">
                <h3>基本情報</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>会員番号</label>
                    <span className="member-number">{user.memberNumber || '未設定'}</span>
                  </div>
                  <div className="profile-field">
                    <label>お名前</label>
                    <span>{user.name}</span>
                  </div>
                  <div className="profile-field">
                    <label>フリガナ</label>
                    <span>{user.nameKana || '未設定'}</span>
                  </div>
                  <div className="profile-field">
                    <label>メールアドレス</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="profile-field">
                    <label>電話番号</label>
                    <span>{user.phone || '未設定'}</span>
                  </div>
                  <div className="profile-field">
                    <label>生年月日</label>
                    <span>{user.birthDate ? new Date(user.birthDate).toLocaleDateString('ja-JP') : '未設定'}</span>
                  </div>
                  <div className="profile-field">
                    <label>性別</label>
                    <span>{user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : '未設定'}</span>
                  </div>
                </div>
              </div>
              
              {user.address && (
                <div className="profile-section">
                  <h3>住所情報</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>郵便番号</label>
                      <span>{user.address.postalCode}</span>
                    </div>
                    <div className="profile-field">
                      <label>住所</label>
                      <span>
                        {user.address.prefecture}{user.address.city}{user.address.address}
                        {user.address.building && ` ${user.address.building}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {user.license && (
                <div className="profile-section">
                  <h3>運転免許証情報</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>免許証番号</label>
                      <span>{user.license.number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</span>
                    </div>
                    <div className="profile-field">
                      <label>免許の種類</label>
                      <span>{user.license.type}</span>
                    </div>
                    <div className="profile-field">
                      <label>有効期限</label>
                      <span>{new Date(user.license.expiryDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="profile-field">
                      <label>免許証の色</label>
                      <span className={`license-color ${user.license.color}`}>
                        {user.license.color === 'gold' ? 'ゴールド' : 
                         user.license.color === 'blue' ? 'ブルー' : 'グリーン'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;