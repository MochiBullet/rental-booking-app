// ユーザー認証API サービス
// 新しいユーザーDBとの連携用

// ユーザーDB APIエンドポイント
const USER_API_URL = process.env.REACT_APP_USER_API_URL || 'https://ub3o5hhdz5.execute-api.ap-southeast-2.amazonaws.com/prod';

class UserAuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // ヘッダー設定
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // トークン保存
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // トークン削除
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // ユーザー登録
  async register(userData) {
    try {
      const response = await fetch(`${USER_API_URL}/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          profile: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            firstNameKana: userData.firstNameKana,
            lastNameKana: userData.lastNameKana,
            phone: userData.phone,
            birthDate: userData.birthDate,
            gender: userData.gender
          },
          address: {
            postalCode: userData.postalCode,
            prefecture: userData.prefecture,
            city: userData.city,
            street: userData.street,
            building: userData.building
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '登録に失敗しました');
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
        message: '登録が完了しました'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'ネットワークエラーが発生しました'
      };
    }
  }

  // ログイン
  async login(email, password) {
    try {
      const response = await fetch(`${USER_API_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        
        // アカウントロックの場合
        if (response.status === 423) {
          throw new Error(`アカウントがロックされています。${error.lockedUntil ? '解除時刻: ' + new Date(error.lockedUntil).toLocaleString() : ''}`);
        }
        
        // 認証失敗
        if (response.status === 401) {
          const remainingAttempts = error.remainingAttempts;
          if (remainingAttempts !== undefined && remainingAttempts > 0) {
            throw new Error(`ログインに失敗しました。残り試行回数: ${remainingAttempts}回`);
          }
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }
        
        throw new Error(error.message || 'ログインに失敗しました');
      }

      const data = await response.json();
      
      // トークンを保存
      this.setToken(data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // ユーザー情報を保存
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'ネットワークエラーが発生しました'
      };
    }
  }

  // ログアウト
  logout() {
    this.clearToken();
    localStorage.removeItem('currentUser');
  }

  // パスワード忘れリクエスト
  async forgotPassword(email) {
    try {
      const response = await fetch(`${USER_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'パスワードリセットリクエストに失敗しました');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        resetToken: data.resetToken // 開発用
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'ネットワークエラーが発生しました'
      };
    }
  }

  // パスワードリセット
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${USER_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'パスワードリセットに失敗しました');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.message || 'ネットワークエラーが発生しました'
      };
    }
  }

  // 現在のユーザー取得
  async getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    if (!this.token) {
      return null;
    }

    try {
      // JWTからユーザーIDを抽出（簡易実装）
      const tokenParts = this.token.split('.');
      if (tokenParts.length !== 3) {
        return null;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.userId;
      
      if (!userId) {
        return null;
      }

      const response = await fetch(`${USER_API_URL}/users/${userId}`, {
        headers: this.getHeaders(true)
      });

      if (!response.ok) {
        this.clearToken();
        return null;
      }

      const user = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // ユーザー情報更新
  async updateUser(userId, updates) {
    try {
      const response = await fetch(`${USER_API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '更新に失敗しました');
      }

      const data = await response.json();
      
      // ローカルストレージのユーザー情報も更新
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        message: '更新が完了しました'
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: error.message || 'ネットワークエラーが発生しました'
      };
    }
  }

  // トークンリフレッシュ
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${USER_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        this.clearToken();
        return false;
      }

      const data = await response.json();
      this.setToken(data.token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearToken();
      return false;
    }
  }

  // トークン有効性チェック
  isTokenValid() {
    if (!this.token) {
      return false;
    }

    try {
      const tokenParts = this.token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() < exp;
    } catch (error) {
      return false;
    }
  }
}

// シングルトンインスタンス
const userAuthService = new UserAuthService();

export default userAuthService;