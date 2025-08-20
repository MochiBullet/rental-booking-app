/**
 * DynamoDBとLocalStorageからsiteIcon設定を完全にクリアするスクリプト
 * 本番環境でMBロゴが表示される問題を解決
 */

// LocalStorageをクリアする関数（ブラウザで実行）
const clearLocalStorageIcon = () => {
  const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
  if (settings.branding) {
    delete settings.branding.siteIcon;
    delete settings.branding.siteIconType;
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    console.log('✅ LocalStorageのsiteIcon設定をクリアしました');
  }
};

// DynamoDB APIを使ってsiteIcon設定をクリア
const clearDynamoDBIcon = async () => {
  const API_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod/site-settings/siteSettings';
  
  try {
    // 現在の設定を取得
    const response = await fetch(API_URL);
    const data = await response.json();
    
    if (data.settingValue && data.settingValue.branding) {
      // siteIcon関連を削除
      delete data.settingValue.branding.siteIcon;
      delete data.settingValue.branding.siteIconType;
      
      // 更新をDynamoDBに送信
      const updateResponse = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: data.settingValue
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ DynamoDBのsiteIcon設定をクリアしました');
      }
    }
  } catch (error) {
    console.error('❌ DynamoDB更新エラー:', error);
  }
};

// ブラウザのコンソールで実行する完全クリア関数
window.clearAllIconSettings = async () => {
  console.log('🔄 すべてのsiteIcon設定をクリア中...');
  
  // LocalStorageクリア
  clearLocalStorageIcon();
  
  // DynamoDBクリア
  await clearDynamoDBIcon();
  
  // ページをリロード
  console.log('✅ 完了！ページをリロードします...');
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
};

// Node.js環境でDynamoDBをクリア
if (typeof window === 'undefined') {
  const fetch = require('node-fetch');
  
  (async () => {
    console.log('🔄 DynamoDBのsiteIcon設定をクリア中...');
    await clearDynamoDBIcon();
    console.log('✅ 完了！');
  })();
} else {
  console.log('📋 以下のコマンドを実行してください:');
  console.log('clearAllIconSettings()');
}