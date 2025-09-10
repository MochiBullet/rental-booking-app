// DynamoDB クリーンアップスクリプト
// campSpaceSettings を削除して正しいDB状態に戻す

const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

async function cleanupDatabase() {
  console.log('🔄 データベースクリーンアップ開始...');
  
  try {
    // 1. campSpaceSettings を削除
    console.log('🗑️ campSpaceSettings削除中...');
    const deleteResponse = await fetch(`${API_BASE_URL}/site-settings/campSpaceSettings`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (deleteResponse.ok) {
      console.log('✅ campSpaceSettings削除完了');
    } else {
      console.log('⚠️ campSpaceSettings削除失敗または存在しない');
    }
    
    // 2. 現在のDB状態を確認
    console.log('🔍 DB状態確認中...');
    const checkResponse = await fetch(`${API_BASE_URL}/site-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (checkResponse.ok) {
      const data = await checkResponse.json();
      console.log('📊 現在のDB状態:', Object.keys(data));
      
      // campSpaceSettingsが削除されたか確認
      if (!data.campSpaceSettings) {
        console.log('✅ campSpaceSettings正常に削除されました');
      } else {
        console.log('❌ campSpaceSettingsがまだ存在します');
      }
    }
    
    console.log('✅ データベースクリーンアップ完了');
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

// Node.js環境で実行
if (typeof require !== 'undefined') {
  // Node.js
  const fetch = require('node-fetch');
  cleanupDatabase();
} else {
  // ブラウザ
  cleanupDatabase();
}