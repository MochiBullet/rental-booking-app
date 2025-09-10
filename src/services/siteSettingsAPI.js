const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

class SiteSettingsAPI {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/site-settings`;
  }

  async getAllSettings() {
    try {
      console.log('🔄 DB全設定取得開始...');
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`❌ DB取得エラー ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 DB応答データ:', data);
      
      // 🚨 COMMIT 512a7b3 復元: campSpaceSettingsを完全に無視して正しい構造を強制
      const { initialSiteSettings } = await import('../data/siteSettings.js');
      let combinedSettings = { ...initialSiteSettings };
      
      // siteSettingsがあるが、campSpaceSettingsが含まれている場合は無視
      if (data.siteSettings) {
        if (data.siteSettings.campSpaceSettings) {
          console.log('🗑️ campSpaceSettings検出 - 完全無視してCommit 512a7b3構造を使用');
          // campSpaceSettingsが含まれている場合は初期設定を使用
          combinedSettings = { ...initialSiteSettings };
        } else {
          // 正常なsiteSettingsのみをマージ
          combinedSettings = {
            ...initialSiteSettings,
            ...data.siteSettings
          };
          console.log('📋 正常なsiteSettings使用:', Object.keys(data.siteSettings));
        }
      }
      
      // タイル設定を個別取得または初期設定を使用
      if (data.tiles) {
        combinedSettings.tiles = data.tiles;
        console.log('🎨 DB tiles設定使用:', Object.keys(data.tiles));
      } else {
        // tilesが直接レスポンスに含まれていない場合は個別取得を試行
        try {
          const tilesData = await this.getSetting('tiles');
          console.log('🔍 tiles個別取得レスポンス:', tilesData);
          
          if (tilesData && Object.keys(tilesData).length > 0) {
            combinedSettings.tiles = tilesData;
            console.log('🔄 tiles個別取得成功:', Object.keys(tilesData));
          } else {
            console.log('⚠️ tilesデータが空または存在しない - 初期設定使用');
          }
        } catch (tilesError) {
          console.log('⚠️ tiles個別取得失敗:', tilesError.message);
        }
      }
      
      console.log('✅ Commit 512a7b3構造で統合完了:', Object.keys(combinedSettings));
      console.log('🎨 タイル設定詳細:', combinedSettings.tiles);
      return combinedSettings;
      
    } catch (error) {
      console.error('❌ DB取得失敗:', error);
      // フォールバック: 初期設定を使用
      const { initialSiteSettings } = await import('../data/siteSettings.js');
      console.log('📦 初期設定フォールバック使用');
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
      
      // settingValueを返す
      const result = data.settingValue;
      console.log(`📋 個別設定結果 ${settingKey}:`, result);
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
      console.log(`🔄 DB保存開始: ${settingKey}`);
      
      const dataSize = JSON.stringify(settingValue).length;
      const dataSizeKB = Math.round(dataSize / 1024);
      console.log(`📊 データサイズ: ${dataSizeKB}KB`);
      
      // API Gateway制限チェック
      if (dataSizeKB > 500) {
        throw new Error(`データサイズ制限超過: ${dataSizeKB}KB > 500KB`);
      }
      
      const requestBody = {
        settingKey: settingKey,
        settingValue: settingValue,
        value: settingValue
      };

      console.log(`📤 DB保存リクエスト送信中...`);
      const response = await fetch(`${this.baseUrl}/${settingKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        timeout: 10000
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ DB保存失敗 ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ DB保存成功: ${settingKey} (${dataSizeKB}KB)`);
      
      // 成功後にLocalStorageにバックアップ
      this.saveToLocalStorage(settingKey, settingValue);
      
      return data;
    } catch (error) {
      console.error(`❌ DB保存エラー: ${settingKey}`, error);
      // エラー時もLocalStorageに保存してフォールバック
      this.saveToLocalStorage(settingKey, settingValue);
      throw error; // エラーを上位に伝播
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