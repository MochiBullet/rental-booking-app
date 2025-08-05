import React from 'react';

function TestApp() {
  return (
    <div style={{padding: '20px', textAlign: 'center'}}>
      <h1>車・バイクレンタル予約サイト</h1>
      <p>テスト用ページです</p>
      <button onClick={() => alert('ボタンが動作しています!')}>
        テストボタン
      </button>
    </div>
  );
}

export default TestApp;