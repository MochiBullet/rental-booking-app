const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

class SiteSettingsAPI {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/site-settings`;
  }

  async getAllSettings() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.settings || {};
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
      // フォールバック: LocalStorageから取得
      return this.getLocalStorageSettings();
    }
  }

  async getSetting(settingKey) {
    try {
      const response = await fetch(`${this.baseUrl}/${settingKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.settingValue;
    } catch (error) {
      console.error(`Failed to fetch setting ${settingKey}:`, error);
      // フォールバック: LocalStorageから取得
      const localSettings = this.getLocalStorageSettings();
      return localSettings[settingKey];
    }
  }

  async saveSetting(settingKey, settingValue) {
    try {
      // データサイズを計算
      const dataSize = JSON.stringify(settingValue).length;
      const dataSizeKB = Math.round(dataSize / 1024);
      
      console.log(`📊 データサイズ: ${dataSizeKB}KB (${dataSize} bytes)`);
      
      // 大きすぎる場合は警告
      if (dataSizeKB > 500) {
        console.warn(`⚠️ データサイズが大きすぎます: ${dataSizeKB}KB`);
        throw new Error(`データサイズが制限を超えています: ${dataSizeKB}KB > 500KB`);
      }
      
      // Lambda関数で期待される可能性のある異なるペイロード形式を試す
      const requestBody = {
        settingKey: settingKey,
        settingValue: settingValue,
        value: settingValue // 既存の形式も残す
      };

      console.log('🔄 API Request:', {
        url: `${this.baseUrl}/${settingKey}`,
        method: 'PUT',
        bodySize: `${Math.round(JSON.stringify(requestBody).length / 1024)}KB`
      });

      const response = await fetch(`${this.baseUrl}/${settingKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        let errorDetails = {};
        try {
          const errorText = await response.text();
          console.error('❌ API Error Response Body:', errorText);
          
          // JSONパースを試行
          try {
            errorDetails = JSON.parse(errorText);
          } catch (parseError) {
            errorDetails = { rawError: errorText };
          }
        } catch (textError) {
          console.error('❌ Failed to read error response:', textError);
        }
        
        console.error('❌ Complete Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries([...response.headers]),
          errorDetails
        });
        
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${JSON.stringify(errorDetails)}`);
      }

      const data = await response.json();
      console.log('✅ API Success Response:', data);
      
      // LocalStorageにもバックアップ保存
      this.saveToLocalStorage(settingKey, settingValue);
      
      return data;
    } catch (error) {
      console.error(`❌ Failed to save setting ${settingKey}:`, error);
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
}

export const siteSettingsAPI = new SiteSettingsAPI();
export default siteSettingsAPI;