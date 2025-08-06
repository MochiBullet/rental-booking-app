import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple admin authentication (in production, this should be handled by a backend)
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('adminUser', 'true');
      navigate('/admin');
    } else {
      setError('Invalid username or password');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-icon">=</div>
        <h2>Admin Login</h2>
        <p className="admin-subtitle">Access the management dashboard</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          
          <button type="submit" className="admin-login-btn">
            Login to Dashboard
          </button>
        </form>
        
        <div className="admin-hint">
          <p>Default credentials:</p>
          <p>Username: <strong>admin</strong></p>
          <p>Password: <strong>admin123</strong></p>
        </div>
        
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ê Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;