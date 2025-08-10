// 全ユーザー共通のサイト設定
// この設定はビルド時に決定され、全ユーザーに適用されます

export const GLOBAL_SITE_SETTINGS = {
  branding: {
    siteName: "M's BASE Rental",
    siteIcon: null, // カスタムアイコンのURL（管理者が設定）
    siteIconType: 'default' // 'default' または 'custom'
  },
  theme: {
    primaryColor: '#4CAF50',
    secondaryColor: '#66BB6A', 
    accentColor: '#81C784'
  }
};

// 管理者が設定したグローバル設定を更新
export const updateGlobalSettings = (newSettings) => {
  // 実際の実装では、この関数でサーバーまたは
  // 静的ファイルにグローバル設定を保存します
  console.log('🌐 グローバル設定更新:', newSettings);
  
  // 現在はローカルストレージで代用
  localStorage.setItem('globalSiteSettings', JSON.stringify(newSettings));
  
  // 全ユーザーのローカルストレージを強制更新
  localStorage.setItem('rentalEasySiteSettings', JSON.stringify(newSettings));
  
  return true;
};

// グローバル設定を取得
export const getGlobalSettings = () => {
  // 管理者が設定した最新のグローバル設定を取得
  const globalSettings = localStorage.getItem('globalSiteSettings');
  if (globalSettings) {
    return JSON.parse(globalSettings);
  }
  
  return GLOBAL_SITE_SETTINGS;
};