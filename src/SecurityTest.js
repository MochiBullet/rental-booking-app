import React, { useState } from 'react';
import { authenticateWithBackend, validateAdminCredentials } from './utils/security';

const SecurityTest = () => {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, success, message, data = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runSecurityTests = async () => {
    setIsRunning(true);
    setResults([]);

    // テスト1: 正常なバックエンド認証
    try {
      const result = await authenticateWithBackend('admin', 'msbase7032');
      addResult(
        'バックエンド認証（正常）',
        result.success,
        result.success ? '認証成功' : result.error,
        result.success ? { token: result.token?.substring(0, 20) + '...' } : null
      );
    } catch (error) {
      addResult('バックエンド認証（正常）', false, error.message);
    }

    // テスト2: 無効パスワードでのバックエンド認証
    try {
      const result = await authenticateWithBackend('admin', 'wrongpassword');
      addResult(
        'バックエンド認証（無効パスワード）',
        !result.success,
        result.success ? '認証が通ってしまった（危険）' : '正常に拒否された',
        result
      );
    } catch (error) {
      addResult('バックエンド認証（無効パスワード）', true, '正常にエラーが発生');
    }

    // テスト3: validateAdminCredentials統合テスト
    try {
      const result = await validateAdminCredentials('admin', 'msbase7032');
      addResult(
        '統合認証（validateAdminCredentials）',
        result.valid,
        result.valid ? `認証成功 (モード: ${result.mode})` : result.reason,
        result.valid ? { mode: result.mode } : null
      );
    } catch (error) {
      addResult('統合認証', false, error.message);
    }

    // テスト4: 環境変数確認
    const apiUrl = process.env.REACT_APP_API_URL;
    addResult(
      '環境変数確認',
      !!apiUrl,
      apiUrl ? `API URL設定済み: ${apiUrl}` : 'API URLが設定されていません',
      { apiUrl }
    );

    setIsRunning(false);
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px'
    }}>
      <h2 style={{ color: '#2e7d32', textAlign: 'center' }}>
        🔐 M's BASE Rental - セキュリティテスト
      </h2>

      <button
        onClick={runSecurityTests}
        disabled={isRunning}
        style={{
          padding: '1rem 2rem',
          backgroundColor: isRunning ? '#ccc' : '#2e7d32',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isRunning ? 'default' : 'pointer',
          fontSize: '1rem',
          marginBottom: '2rem',
          display: 'block',
          margin: '0 auto 2rem auto'
        }}
      >
        {isRunning ? '🔄 テスト実行中...' : '🚀 セキュリティテスト実行'}
      </button>

      <div style={{ marginTop: '2rem' }}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              margin: '1rem 0',
              borderRadius: '5px',
              backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
              border: `1px solid ${result.success ? '#4caf50' : '#f44336'}`
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {result.success ? '✅' : '❌'} {result.test}
              <span style={{ float: 'right', fontSize: '0.8rem' }}>
                {result.timestamp}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              {result.message}
            </div>
            {result.data && (
              <div style={{
                fontSize: '0.8rem',
                backgroundColor: '#f0f0f0',
                padding: '0.5rem',
                borderRadius: '3px',
                marginTop: '0.5rem'
              }}>
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '1.1rem',
          marginTop: '3rem'
        }}>
          🔧 テストを実行してセキュリティ機能を確認してください
        </div>
      )}
    </div>
  );
};

export default SecurityTest;