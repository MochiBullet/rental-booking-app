import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memberId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // テストユーザーログインチェック（管理者用）
      if (formData.memberId === 'admin' && formData.password === 'admin0123') {
        const testUser = {
          id: 'admin',
          name: 'テスト管理者',
          points: 9999,
          registeredAt: new Date().toISOString(),
          status: 'admin'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        setUser(testUser);
        setLoading(false);
        navigate('/mypage');
        return;
      }

      // まずローカルストレージをチェック（デモ用）
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const localMember = members.find(member => member.id === formData.memberId);
      
      if (localMember) {
        // ローカルでのパスワードチェック（平文比較）
        if (localMember.password === formData.password) {
          localStorage.setItem('currentUser', JSON.stringify(localMember));
          setUser(localMember);
          setLoading(false);
          navigate('/mypage');
          return;
        } else {
          setError('会員IDまたはパスワードが正しくありません。');
          setLoading(false);
          return;
        }
      }

      // バックエンドAPIを呼び出し
      const response = await fetch('https://9v7h3mj14g.execute-api.ap-southeast-2.amazonaws.com/prod/members/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.memberId,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(data.member));
        setUser(data.member);
        navigate('/mypage');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'ログインに失敗しました。');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ネットワークエラーが発生しました。もう一度お試しください。');
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
    <div className="login-container" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#2d7a2d', marginBottom: '1.5rem' }}>ログイン</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="memberId" style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>会員ID</label>
            <input
              type="text"
              id="memberId"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              placeholder="会員IDを入力"
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
            />
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
              会員ID形式: 西暦 + 月 + 免許証番号下4桁
            </div>
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
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>アカウントをお持ちでない方は</p>
          <Link to="/register" style={{ color: '#2d7a2d', textDecoration: 'none', fontWeight: '600' }}>新規会員登録</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
