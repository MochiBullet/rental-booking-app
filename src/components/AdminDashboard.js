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
      alert('Vehicle name and price are required');
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
      alert('Vehicle name and price are required');
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
    if (window.confirm('Delete this vehicle?')) {
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
    if (window.confirm('Cancel this booking?')) {
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
                <h2>User List</h2>
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                  />
                </div>
              </div>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Bookings</th>
                      <th>Total Spent</th>
                      <th>Status</th>
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
                            <span className="status-badge status-active">Active</span>
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
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
                <option value="Luxury">Luxury</option>
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
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
                <option value="Luxury">Luxury</option>
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
    </div>
  );
};

export default AdminDashboard;