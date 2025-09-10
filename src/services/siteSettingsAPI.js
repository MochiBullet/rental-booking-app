const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

class SiteSettingsAPI {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/site-settings`;
  }

  async getAllSettings() {
    try {
      console.log('🌐 DB設定取得開始');
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 DB設定応答:', data);
      
      if (data.siteSettings) {
        console.log('✅ DB設定使用');
        return data.siteSettings;
      } else {
        console.log('📋 初期設定使用');
        const { initialSiteSettings } = await import('../data/siteSettings.js');
        return initialSiteSettings;
      }
    } catch (error) {
      console.error('❌ DB設定取得失敗:', error);
      // フォールバック: LocalStorageから取得
      const localSettings = this.getLocalStorageSettings();
      if (localSettings.siteSettings) {
        console.log('📦 LocalStorageフォールバック使用');
        return localSettings.siteSettings;
      }
      // 最終フォールバック: 初期設定
      const { initialSiteSettings } = await import('../data/siteSettings.js');
      return initialSiteSettings;
    }
  }

  async getSetting(settingKey) {
    try {
      console.log(`🔍 個別設定取得開始: ${settingKey}`);
      const response = await fetch(`${this.baseUrl}/${settingKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`❌ 個別設定取得失敗: ${settingKey} - HTTP ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 個別設定応答 ${settingKey}:`, data);
      
      // 複数の応答形式に対応
      let result;
      if (data.settingValue !== undefined) {
        result = data.settingValue;
        console.log(`📋 settingValue形式で取得: ${settingKey}`, result);
      } else if (data.siteSettings && settingKey === 'tiles') {
        // tilesの場合、siteSettingsの中を検索
        result = data.siteSettings.tiles || data.siteSettings;
        console.log(`📋 siteSettings.tiles形式で取得: ${settingKey}`, result);
      } else if (data[settingKey]) {
        result = data[settingKey];
        console.log(`📋 直接キー形式で取得: ${settingKey}`, result);
      } else {
        result = data;
        console.log(`📋 直接データとして取得: ${settingKey}`, result);
      }
      
      console.log(`📋 個別設定最終結果 ${settingKey}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch setting ${settingKey}:`, error);
      // フォールバック: LocalStorageから取得
      const localSettings = this.getLocalStorageSettings();
      const fallbackValue = localSettings[settingKey];
      console.log(`📦 LocalStorageフォールバック ${settingKey}:`, fallbackValue);
      return fallbackValue;
    }
  }

  async saveSetting(settingKey, settingValue) {
    try {
      console.log(`💾 ${settingKey} DB保存開始`);
      
      const requestBody = {
        settingKey: settingKey,
        settingValue: settingValue,
        value: settingValue
      };

      const response = await fetch(`${this.baseUrl}/${settingKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ ${settingKey} DB保存成功:`, result);
      
      // DB保存成功後にLocalStorageにも保存（バックアップ）
      this.saveToLocalStorage(settingKey, settingValue);
      
      return result;
    } catch (error) {
      console.error(`❌ ${settingKey} DB保存失敗:`, error);
      // フォールバック: LocalStorageに保存
      this.saveToLocalStorage(settingKey, settingValue);
      throw error;
    }
  }

  async saveAllSettings(settings) {
    const promises = Object.entries(settings).map(([key, value]) => 
      this.saveSetting(key, value)
    );

    try {
      await Promise.all(promises);
      console.log('✅ All settings saved to DynamoDB');
    } catch (error) {
      console.error('⚠️ Some settings failed to save to DynamoDB:', error);
      // フォールバック: LocalStorageに一括保存
      Object.entries(settings).forEach(([key, value]) => {
        this.saveToLocalStorage(key, value);
      });
    }
  }

  async deleteSetting(settingKey) {
    try {
      const response = await fetch(`${this.baseUrl}/${settingKey}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // LocalStorageからも削除
      this.removeFromLocalStorage(settingKey);
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete setting ${settingKey}:`, error);
      throw error;
    }
  }

  // LocalStorage フォールバック機能
  getLocalStorageSettings() {
    try {
      const settings = {};
      const keys = ['siteSettings', 'homeContent', 'termsContent', 'privacyPolicyContent'];
      
      keys.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          settings[key] = JSON.parse(stored);
        }
      });
      
      return settings;
    } catch (error) {
      console.error('Failed to get LocalStorage settings:', error);
      return {};
    }
  }

  saveToLocalStorage(settingKey, settingValue) {
    try {
      localStorage.setItem(settingKey, JSON.stringify(settingValue));
    } catch (error) {
      console.error(`Failed to save ${settingKey} to LocalStorage:`, error);
    }
  }

  removeFromLocalStorage(settingKey) {
    try {
      localStorage.removeItem(settingKey);
    } catch (error) {
      console.error(`Failed to remove ${settingKey} from LocalStorage:`, error);
    }
  }

  // 移行ツール: LocalStorageからDynamoDBへデータ移行
  async migrateFromLocalStorage() {
    console.log('🔄 Starting migration from LocalStorage to DynamoDB...');
    
    const localSettings = this.getLocalStorageSettings();
    
    if (Object.keys(localSettings).length === 0) {
      console.log('No LocalStorage settings to migrate.');
      return;
    }

    try {
      await this.saveAllSettings(localSettings);
      console.log('✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }

  // DB初期化ツール: M's BASE Rental の正しい設定でDBを初期化
  async initializeDatabase() {
    try {
      console.log('🔄 DB初期化開始...');
      
      // 初期設定をインポート
      const { initialSiteSettings } = await import('../data/siteSettings.js');
      
      // 重要な設定をDBに保存
      await this.saveSetting('siteSettings', {
        branding: initialSiteSettings.branding,
        hero: initialSiteSettings.hero,
        contact: initialSiteSettings.contact,
        services: initialSiteSettings.services,
        terms: initialSiteSettings.terms,
        privacy: initialSiteSettings.privacy,
        rentalTerms: initialSiteSettings.rentalTerms,
        announcements: initialSiteSettings.announcements,
        googleForms: initialSiteSettings.googleForms
      });

      // タイル設定を個別保存
      await this.saveSetting('tiles', initialSiteSettings.tiles);
      
      console.log('✅ DB初期化完了');
      return true;
      
    } catch (error) {
      console.error('❌ DB初期化失敗:', error);
      return false;
    }
  }
}

export const siteSettingsAPI = new SiteSettingsAPI();
export default siteSettingsAPI;