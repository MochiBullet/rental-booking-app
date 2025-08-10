import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdmin, onSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    
    // Simple admin authentication (in production, this should be handled by a backend)
    if (username === 'admin' && password === 'msbase7032') {
      try {
        setIsAdmin(true);
        localStorage.setItem('adminUser', 'true');
        
        // React Router を使ってナビゲート
        navigate('/admin');
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="admin-login-btn" disabled={isLogging}>
            {isLogging ? '🔄 ログイン中... データ同期中' : 'Login to Dashboard'}
          </button>
        </form>
        
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontFamily: 'monospace' }}>
          <strong>管理者ログイン情報:</strong><br />
          ID: admin<br />
          Password: msbase7032
        </div>
        
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;