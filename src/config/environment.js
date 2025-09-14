// 環境設定管理

// デフォルト値を設定（環境変数が設定されていない場合のフォールバック）
const ENV = {
  // 本番環境ではこれらの値を使用しないこと
  ADMIN_USERNAME: process.env.REACT_APP_ADMIN_USERNAME || null,
  ADMIN_PASSWORD: process.env.REACT_APP_ADMIN_PASSWORD || null,
  TEST_EMAIL: process.env.REACT_APP_TEST_EMAIL || null,
  TEST_PASSWORD: process.env.REACT_APP_TEST_PASSWORD || null,
  
  // 環境判定
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // APIエンドポイント（今後のバックエンド統合用）
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // セキュリティ設定
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30分
  RATE_LIMIT_REQUESTS: 10,
  RATE_LIMIT_WINDOW: 60000, // 1分
};

// 本番環境でデバッグ情報を表示しない
if (ENV.IS_PRODUCTION) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.debug = () => {};
}

// 環境変数の検証
if (!ENV.IS_PRODUCTION && !ENV.ADMIN_USERNAME) {
  console.warn('⚠️ 管理者認証情報が設定されていません。.envファイルを確認してください。');
}

export default ENV;