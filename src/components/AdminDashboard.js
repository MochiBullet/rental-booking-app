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
    type: 'Sedan',
    price: '',
    passengers: '',
    features: ''
  });

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin-login');
      return;
    }
    loadDashboardData();
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
      alert('�!h�<o�gY');
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
      type: 'Sedan',
      price: '',
      passengers: '',
      features: ''
    });
    setShowAddVehicleModal(false);
    loadDashboardData();
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle.name || !selectedVehicle.price) {
      alert('�!h�<o�gY');
      return;
    }
    
    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id ? selectedVehicle : v
    );
    
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    setShowEditVehicleModal(false);
    setSelectedVehicle(null);
    loadDashboardData();
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Sn�!�JdWf���WDgYK')) {
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      setVehicles(updatedVehicles);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      loadDashboardData();
    }
  };

  const handleToggleVehicleAvailability = (vehicleId) => {
    const updatedVehicles = vehicles.map(v => 
      v.id === vehicleId ? { ...v, available: !v.available } : v
    );
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    loadDashboardData();
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Sn������Wf���WDgYK')) {
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      );
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      loadDashboardData();
    }
  };

  const handleConfirmBooking = (bookingId) => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed' } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    loadDashboardData();
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
          <div className="logo-icon">=�</div>
          <h2>����</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => setActiveSection('overview')}
          >
            <span className="nav-icon">=�</span>
            ��
          </button>
          <button 
            className={activeSection === 'bookings' ? 'active' : ''}
            onClick={() => setActiveSection('bookings')}
          >
            <span className="nav-icon">=�</span>
            ��
          </button>
          <button 
            className={activeSection === 'vehicles' ? 'active' : ''}
            onClick={() => setActiveSection('vehicles')}
          >
            <span className="nav-icon">=�</span>
            �!�
          </button>
          <button 
            className={activeSection === 'users' ? 'active' : ''}
            onClick={() => setActiveSection('users')}
          >
            <span className="nav-icon">=e</span>
            �����
          </button>
          <button 
            className={activeSection === 'analytics' ? 'active' : ''}
            onClick={() => setActiveSection('analytics')}
          >
            <span className="nav-icon">=�</span>
            �
          </button>
        </nav>
        
        <button className="admin-logout-btn" onClick={handleLogout}>
          ���
        </button>
      </div>
      
      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeSection === 'overview' && '�÷���ɂ�'}
            {activeSection === 'bookings' && '��'}
            {activeSection === 'vehicles' && '�!�'}
            {activeSection === 'users' && '�����'}
            {activeSection === 'analytics' && '�
�'}
          </h1>
          <div className="admin-header-info">
            <span className="admin-date">{new Date().toLocaleDateString('ja-JP')}</span>
            <span className="admin-user">�</span>
          </div>
        </div>
        
        <div className="admin-content">
          {activeSection === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">=�</div>
                  <div className="stat-details">
                    <h3>ψp</h3>
                    <p className="stat-number">{stats.totalBookings}</p>
                    <span className="stat-label">h�</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-details">
                    <h3>��ƣֈ</h3>
                    <p className="stat-number">{stats.activeBookings}</p>
                    <span className="stat-label">�(2L-</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">=�</div>
                  <div className="stat-details">
                    <h3>��
</h3>
                    <p className="stat-number">{formatCurrency(stats.totalRevenue)}</p>
                    <span className="stat-label">h�</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">=�</div>
                  <div className="stat-details">
                    <h3>{2�!</h3>
                    <p className="stat-number">{stats.totalVehicles}</p>
                    <span className="stat-label">�</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">=e</div>
                  <div className="stat-details">
                    <h3>{2����</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                    <span className="stat-label">�</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">=�</div>
                  <div className="stat-details">
                    <h3>,�n�</h3>
                    <p className="stat-number">{stats.todayBookings}</p>
                    <span className="stat-label">�</span>
                  </div>
                </div>
              </div>
              
              <div className="recent-activities">
                <h2> �n�</h2>
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
                        {booking.status === 'confirmed' ? '��' : 
                         booking.status === 'active' ? '��ƣ�' : 
                         booking.status === 'cancelled' ? '����' : '�Y'}
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
                <h2>� �</h2>
                <div className="filter-buttons">
                  <button className="filter-btn active">Yyf</button>
                  <button className="filter-btn">��</button>
                  <button className="filter-btn">�Y-</button>
                  <button className="filter-btn">����</button>
                </div>
              </div>
              
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>�ID</th>
                      <th>g�</th>
                      <th>�!</th>
                      <th>���</th>
                      <th>B��</th>
                      <th>��</th>
                      <th>�����</th>
                      <th>�\</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.userName || '���'}</td>
                        <td>{booking.vehicleName}</td>
                        <td>{new Date(booking.pickupDate).toLocaleDateString('ja-JP')}</td>
                        <td>{new Date(booking.returnDate).toLocaleDateString('ja-JP')}</td>
                        <td>{formatCurrency(booking.totalPrice)}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status === 'confirmed' ? '��' : 
                             booking.status === 'active' ? '��ƣ�' : 
                             booking.status === 'cancelled' ? '����' : '�Y'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {booking.status !== 'confirmed' && (
                              <button 
                                className="action-btn confirm"
                                onClick={() => handleConfirmBooking(booking.id)}
                              >
                                ��
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button 
                                className="action-btn cancel"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                ����
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
                <h2>�! �</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddVehicleModal(true)}
                >
                  + ���!��
                </button>
              </div>
              
              <div className="vehicles-grid">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="vehicle-admin-card">
                    <div className="vehicle-admin-header">
                      <h3>{vehicle.name}</h3>
                      <span className={`availability-badge ${vehicle.available ? 'available' : 'unavailable'}`}>
                        {vehicle.available ? ')(��' : ')(�'}
                      </span>
                    </div>
                    <div className="vehicle-admin-details">
                      <p><strong>���:</strong> {vehicle.type}</p>
                      <p><strong>��:</strong> {formatCurrency(vehicle.price)}/�</p>
                      <p><strong>��:</strong> {vehicle.passengers}�</p>
                      <p><strong>y�:</strong> {vehicle.features || 'jW'}</p>
                    </div>
                    <div className="vehicle-admin-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowEditVehicleModal(true);
                        }}
                      >
                        ��
                      </button>
                      <button 
                        className={`toggle-btn ${vehicle.available ? 'disable' : 'enable'}`}
                        onClick={() => handleToggleVehicleAvailability(vehicle.id)}
                      >
                        {vehicle.available ? '!�' : '	�'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        Jd
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
                <h2>���� �</h2>
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="�����"..." 
                  />
                </div>
              </div>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>M</th>
                      <th>�����</th>
                      <th>{2�</th>
                      <th>�p</th>
                      <th>�/UM</th>
                      <th>�����</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => {
                      const userBookings = bookings.filter(b => b.userId === user.id);
                      const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                      
                      return (
                        <tr key={user.id}>
                          <td>#{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString('ja-JP')}</td>
                          <td>{userBookings.length}</td>
                          <td>{formatCurrency(totalSpent)}</td>
                          <td>
                            <span className="status-badge status-active">��ƣ�</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeSection === 'analytics' && (
            <div className="analytics-section">
              <div className="analytics-header">
                <h2>�
�</h2>
                <div className="date-range-selector">
                  <button className="range-btn active">�</button>
                  <button className="range-btn">H</button>
                  <button className="range-btn">N�3�</button>
                  <button className="range-btn">�t</button>
                </div>
              </div>
              
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>��
��</h3>
                  <div className="chart-placeholder">
                    <div className="chart-bar" style={{height: '60%'}}></div>
                    <div className="chart-bar" style={{height: '80%'}}></div>
                    <div className="chart-bar" style={{height: '70%'}}></div>
                    <div className="chart-bar" style={{height: '90%'}}></div>
                    <div className="chart-bar" style={{height: '85%'}}></div>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>�!%��</h3>
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
                  <h3>���</h3>
                  <div className="booking-stats">
                    <div className="stat-row">
                      <span>��</span>
                      <span className="stat-value">
                        {bookings.filter(b => b.status === 'completed').length}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>2L-</span>
                      <span className="stat-value">
                        {bookings.filter(b => b.status === 'active').length}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>����</span>
                      <span className="stat-value">
                        {bookings.filter(b => b.status === 'cancelled').length}
                      </span>
                    </div>
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
            <h2>���!��</h2>
            <div className="form-group">
              <label>�!</label>
              <input 
                type="text"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                placeholder="�: Toyota Camry"
              />
            </div>
            <div className="form-group">
              <label>���</label>
              <select 
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
              >
                <option value="Sedan">���</option>
                <option value="SUV">SUV</option>
                <option value="Van">��</option>
                <option value="Luxury">��</option>
              </select>
            </div>
            <div className="form-group">
              <label>���M	</label>
              <input 
                type="number"
                value={newVehicle.price}
                onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})}
                placeholder="5000"
              />
            </div>
            <div className="form-group">
              <label>��</label>
              <input 
                type="number"
                value={newVehicle.passengers}
                onChange={(e) => setNewVehicle({...newVehicle, passengers: e.target.value})}
                placeholder="4"
              />
            </div>
            <div className="form-group">
              <label>y�</label>
              <textarea 
                value={newVehicle.features}
                onChange={(e) => setNewVehicle({...newVehicle, features: e.target.value})}
                placeholder="GPS, Bluetooth, �ï���"
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddVehicle}>�X</button>
              <button className="cancel-btn" onClick={() => setShowAddVehicleModal(false)}>����</button>
            </div>
          </div>
        </div>
      )}
      
      {showEditVehicleModal && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>�!��</h2>
            <div className="form-group">
              <label>�!</label>
              <input 
                type="text"
                value={selectedVehicle.name}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>���</label>
              <select 
                value={selectedVehicle.type}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, type: e.target.value})}
              >
                <option value="Sedan">���</option>
                <option value="SUV">SUV</option>
                <option value="Van">��</option>
                <option value="Luxury">��</option>
              </select>
            </div>
            <div className="form-group">
              <label>���M	</label>
              <input 
                type="number"
                value={selectedVehicle.price}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>��</label>
              <input 
                type="number"
                value={selectedVehicle.passengers}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, passengers: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>y�</label>
              <textarea 
                value={selectedVehicle.features || ''}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, features: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleEditVehicle}>��</button>
              <button className="cancel-btn" onClick={() => {
                setShowEditVehicleModal(false);
                setSelectedVehicle(null);
              }}>����</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;