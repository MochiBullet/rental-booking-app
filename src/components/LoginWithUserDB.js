import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import userAuthService from '../services/userAPI';

function LoginWithUserDB({ setUser }) {
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

    try {
      // 新しいユーザーDBを使用してログイン
      const result = await userAuthService.login(formData.email, formData.password);
      
      if (result.success) {
        setUser(result.user);
        navigate('/mypage');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ログイン中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container" style={{ 
      minHeight: 'calc(100vh - 200px)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '2rem' 
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        padding: '2rem', 
        width: '100%', 
        maxWidth: '400px' 
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#2d7a2d', 
          marginBottom: '1.5rem' 
        }}>
          ログイン
        </h2>
        
        <div style={{
          background: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#2e7d32'
        }}>
          <strong>🔐 新しい認証システム</strong><br/>
          より安全なユーザーデータベースを使用しています。
          メールアドレスでログインしてください。
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#333', 
              fontWeight: '500' 
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                fontSize: '1rem' 
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#333', 
              fontWeight: '500' 
            }}>
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="パスワードを入力"
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                fontSize: '1rem' 
              }}
            />
          </div>
          
          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c00', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              marginBottom: '1rem', 
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: loading ? '#ccc' : 'linear-gradient(135deg, #2d7a2d, #4CAF50)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s ease' 
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#666', 
              textDecoration: 'none', 
              fontSize: '0.9rem',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#2d7a2d'}
            onMouseOut={(e) => e.target.style.color = '#666'}
          >
            パスワードをお忘れですか？
          </Link>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #eee' 
        }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            アカウントをお持ちでない方は
          </p>
          <Link 
            to="/register-new" 
            style={{ 
              color: '#2d7a2d', 
              textDecoration: 'none', 
              fontWeight: '600' 
            }}
          >
            新規会員登録
          </Link>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f5f5f5',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>セキュリティ機能:</strong><br/>
          • パスワード暗号化 (bcrypt)<br/>
          • JWT認証トークン<br/>
          • ログイン試行制限 (5回)<br/>
          • 30分間のアカウントロック
        </div>
      </div>
    </div>
  );
}

export default LoginWithUserDB;