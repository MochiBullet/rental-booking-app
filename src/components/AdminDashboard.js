import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
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

  const loadDashboardData = () => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    setBookings(storedBookings);
    setVehicles(storedVehicles);
    setUsers(storedUsers);
    
    const today = new Date().toDateString();
    const todayBookingsCount = storedBookings.filter(b => 
      new Date(b.bookingDate).toDateString() === today
    ).length;
    
    const activeBookingsCount = storedBookings.filter(b => 
      b.status === 'active' || b.status === 'confirmed'
    ).length;
    
    const totalRevenue = storedBookings.reduce((sum, b) => 
      sum + (b.totalPrice || 0), 0
    );
    
    setStats({
      totalBookings: storedBookings.length,
      activeBookings: activeBookingsCount,
      totalRevenue: totalRevenue,
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
    
    setNewVehicle({
      name: '',
      type: 'car',
      price: '',
      passengers: '',
      features: ''
    });
    setShowAddVehicleModal(false);
    loadDashboardData();
    
    showNotification(`✅ ${vehicle.name}が正常に追加されました`);
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
    setShowEditVehicleModal(false);
    const vehicleName = selectedVehicle.name;
    setSelectedVehicle(null);
    loadDashboardData();
    
    showNotification(`✅ ${vehicleName}の情報が更新されました`);
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Delete this vehicle?')) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      setVehicles(updatedVehicles);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      loadDashboardData();
      showNotification(`車両「${vehicle?.name}」を削除しました`, 'success');
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
      `車両「${vehicle?.name}」を${!vehicle?.available ? '有効' : '無効'}にしました`, 
      'success'
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

  // 通知システム
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    const colors = {
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.success};
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `${icons[type] || icons.success} ${message}`;
    document.body.appendChild(notification);
    
    // アニメーション開始
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);
    
    // 自動削除
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleSaveDesignSettings = () => {
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    updateCSSVariables(siteSettings);
    
    // サイト名も更新
    if (siteSettings.siteName) {
      document.title = siteSettings.siteName;
    }
    
    setShowDesignModal(false);
    showNotification('デザイン設定が保存され、リアルタイムで適用されました！', 'success');
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Cancel this booking?')) {
      const booking = bookings.find(b => b.id === bookingId);
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      );
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      loadDashboardData();
      showNotification(`予約 #${booking?.id} をキャンセルしました`, 'info');
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
    showNotification(`予約 #${booking?.id} を承認しました`, 'success');
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
          </h1>
          <div className="admin-header-info">
            <span className="admin-date">{new Date().toLocaleDateString('ja-JP')}</span>
            <span className="admin-user">Administrator</span>
          </div>
        </div>
        
        <div className="admin-content">
          {activeSection === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-details">
                    <h3>Total Bookings</h3>
                    <p className="stat-number">{stats.totalBookings}</p>
                    <span className="stat-label">All Time</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-details">
                    <h3>Active Bookings</h3>
                    <p className="stat-number">{stats.activeBookings}</p>
                    <span className="stat-label">Current</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-details">
                    <h3>Total Revenue</h3>
                    <p className="stat-number">{formatCurrency(stats.totalRevenue)}</p>
                    <span className="stat-label">All Time</span>
                  </div>
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
                        {booking.status === 'confirmed' ? 'Confirmed' : 
                         booking.status === 'active' ? 'Active' : 
                         booking.status === 'cancelled' ? 'Cancelled' : 'Pending'}
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
                            {booking.status === 'confirmed' ? 'Confirmed' : 
                             booking.status === 'active' ? 'Active' : 
                             booking.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {booking.status !== 'confirmed' && (
                              <button 
                                className="action-btn confirm"
                                onClick={() => handleConfirmBooking(booking.id)}
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button 
                                className="action-btn cancel"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
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
                <h2>Customer Management</h2>
                <div className="user-stats-summary">
                  <div className="user-stat-card">
                    <span className="stat-number">{users.length}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="user-stat-card">
                    <span className="stat-number">{users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}</span>
                    <span className="stat-label">New This Month</span>
                  </div>
                  <div className="user-stat-card">
                    <span className="stat-number">{users.filter(u => u.points && u.points > 0).length}</span>
                    <span className="stat-label">With Points</span>
                  </div>
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
                        <th>顧客ID</th>
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
                            <td>#{String(user.id).slice(-6)}</td>
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
                                <button className="action-btn view" title="詳細表示">👁️</button>
                                <button className="action-btn edit" title="編集">✏️</button>
                                <button className="action-btn message" title="メッセージ送信">💬</button>
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
    </div>
  );
};

export default AdminDashboard;