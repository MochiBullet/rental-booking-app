// ストレージ管理ユーティリティ
// リロード時の画面真っ白問題を防ぐためのメモリ管理

const STORAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB制限
const CLEANUP_THRESHOLD = 4 * 1024 * 1024; // 4MBでクリーンアップ開始

export const storageManager = {
  // ストレージサイズ計算
  calculateStorageSize: (storage) => {
    let total = 0;
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        try {
          total += storage[key].length + key.length;
        } catch (e) {
          console.warn(`Error calculating size for key: ${key}`, e);
        }
      }
    }
    return total;
  },

  // 古いまたは大きなデータをクリーンアップ
  cleanupStorage: (storage) => {
    const currentSize = storageManager.calculateStorageSize(storage);

    if (currentSize > CLEANUP_THRESHOLD) {
      console.warn(`Storage size (${currentSize} bytes) exceeds threshold. Cleaning up...`);

      // 優先度の低いキーから削除
      const nonEssentialKeys = [
        'vehicleCache',
        'tempData',
        'oldSessions',
        'debugData'
      ];

      nonEssentialKeys.forEach(key => {
        try {
          storage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e);
        }
      });

      // 30日以上古いデータを削除
      for (let key in storage) {
        if (key.includes('_timestamp')) {
          try {
            const timestamp = parseInt(storage[key]);
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - timestamp > thirtyDays) {
              storage.removeItem(key);
              // 関連データも削除
              const dataKey = key.replace('_timestamp', '');
              storage.removeItem(dataKey);
            }
          } catch (e) {
            console.warn(`Failed to clean old data for ${key}:`, e);
          }
        }
      }
    }
  },

  // 安全なsetItem（サイズチェック付き）
  setItem: (storage, key, value) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const newSize = stringValue.length + key.length;
      const currentSize = storageManager.calculateStorageSize(storage);

      if (currentSize + newSize > STORAGE_SIZE_LIMIT) {
        console.error('Storage quota exceeded. Cleaning up...');
        storageManager.cleanupStorage(storage);

        // 再度サイズチェック
        const sizeAfterCleanup = storageManager.calculateStorageSize(storage);
        if (sizeAfterCleanup + newSize > STORAGE_SIZE_LIMIT) {
          throw new Error('Storage quota exceeded even after cleanup');
        }
      }

      storage.setItem(key, stringValue);
      // タイムスタンプも保存
      storage.setItem(`${key}_timestamp`, Date.now().toString());

    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);

      // QuotaExceededError の場合は緊急クリーンアップ
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('Emergency storage cleanup initiated...');

        // 最低限必要なデータ以外をすべて削除
        const essentialKeys = ['adminUser', 'adminSession', 'authToken', 'siteSettings'];
        for (let key in storage) {
          if (!essentialKeys.includes(key) && !key.includes('admin')) {
            try {
              storage.removeItem(key);
            } catch (e) {
              console.warn(`Failed to remove ${key} during emergency cleanup:`, e);
            }
          }
        }

        // 再試行
        try {
          const retryValue = typeof value === 'string' ? value : JSON.stringify(value);
          storage.setItem(key, retryValue);
        } catch (retryError) {
          console.error('Failed to save even after emergency cleanup:', retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  },

  // 安全なgetItem
  getItem: (storage, key) => {
    try {
      const value = storage.getItem(key);
      if (!value) return null;

      // JSONパース試行
      try {
        return JSON.parse(value);
      } catch {
        // パース失敗時は文字列として返す
        return value;
      }
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  },

  // 初期化時のクリーンアップ
  initializeStorage: () => {
    try {
      // localStorage と sessionStorage の両方をチェック
      storageManager.cleanupStorage(localStorage);
      storageManager.cleanupStorage(sessionStorage);

      console.log('Storage initialized:', {
        localStorageSize: storageManager.calculateStorageSize(localStorage),
        sessionStorageSize: storageManager.calculateStorageSize(sessionStorage)
      });
    } catch (error) {
      console.error('Storage initialization failed:', error);
    }
  },

  // デバッグ情報出力
  debugStorage: () => {
    const localSize = storageManager.calculateStorageSize(localStorage);
    const sessionSize = storageManager.calculateStorageSize(sessionStorage);

    console.group('Storage Debug Info');
    console.log('LocalStorage size:', localSize, 'bytes');
    console.log('SessionStorage size:', sessionSize, 'bytes');

    // 大きなキーをリストアップ
    const largeKeys = [];
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        if (size > 10000) {
          largeKeys.push({ key, size });
        }
      }
    }

    if (largeKeys.length > 0) {
      console.table(largeKeys.sort((a, b) => b.size - a.size));
    }

    console.groupEnd();
  }
};

// ページロード時に自動初期化
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    storageManager.initializeStorage();
  });

  // 定期的なクリーンアップ（30分ごと）
  setInterval(() => {
    storageManager.cleanupStorage(localStorage);
    storageManager.cleanupStorage(sessionStorage);
  }, 30 * 60 * 1000);
}

export default storageManager;