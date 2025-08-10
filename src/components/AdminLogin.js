import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdmin, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    
    // Simple admin authentication (in production, this should be handled by a backend)
    if (username === 'admin' && password === 'msbase7032') {
      try {
        setIsAdmin(true);
        localStorage.setItem('adminUser', 'true');
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Failed to set admin status:', error);
      }
    } else {
      setError('Invalid username or password');
      setTimeout(() => setError(''), 3000);
    }
    
    setIsLogging(false);
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
          
          <button type="submit" className="admin-login-btn" disabled={isLogging}>
            {isLogging ? '🔄 ログイン中... データ同期中' : 'Login to Dashboard'}
          </button>
        </form>
        
        
        <button 
          className="back-btn"
          onClick={() => window.location.href = '/'}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;