import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(user => user.email === formData.email);
      
      if (existingUser) {
        // Use existing user data
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
        setUser(existingUser);
        setLoading(false);
        navigate('/mypage');
      } else {
        // Create simple user for demo (backward compatibility)
        const userData = {
          id: Date.now(),
          name: formData.email.split('@')[0],
          email: formData.email,
          points: 0,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        navigate('/');
      }
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#2d7a2d', marginBottom: '1.5rem' }}>ログイン</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="パスワードを入力"
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
            />
          </div>
          
          {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #2d7a2d, #4CAF50)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>アカウントをお持ちでない方は</p>
          <Link to="/register" style={{ color: '#2d7a2d', textDecoration: 'none', fontWeight: '600' }}>新規会員登録</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
