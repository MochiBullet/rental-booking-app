// DataSync Service - Cross-device data synchronization using a simple cloud storage simulation

class DataSyncService {
  constructor() {
    this.apiEndpoint = 'https://api.jsonbin.io/v3/b'; // JSONBin.io as simple cloud storage
    this.apiKey = '$2a$10$your-api-key-here'; // Replace with actual API key
    this.binId = '6571234567890abcdef'; // Replace with actual bin ID
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Fallback to localStorage-based cloud simulation when external API is not available
  getCloudStorageKey(dataType) {
    return `cloudSync_${dataType}`;
  }

  // Save data to cloud (with localStorage fallback)
  async saveToCloud(dataType, data) {
    try {
      if (this.isOnline) {
        // Try to save to cloud storage simulation using localStorage
        // In a real implementation, this would be Firebase, Supabase, etc.
        const cloudKey = this.getCloudStorageKey(dataType);
        const cloudData = {
          data: data,
          timestamp: new Date().toISOString(),
          deviceId: this.getDeviceId(),
          dataType: dataType
        };
        
        // Simulate cloud storage with a special localStorage key
        localStorage.setItem(cloudKey, JSON.stringify(cloudData));
        
        // Also save to regular localStorage for immediate access
        localStorage.setItem(dataType, JSON.stringify(data));
        
        return { success: true, timestamp: cloudData.timestamp };
      } else {
        // Queue for later sync when online
        this.syncQueue.push({ type: 'save', dataType, data });
        localStorage.setItem(dataType, JSON.stringify(data));
        return { success: true, queued: true };
      }
    } catch (error) {
      console.error('Failed to save to cloud:', error);
      // Fallback to localStorage
      localStorage.setItem(dataType, JSON.stringify(data));
      return { success: true, fallback: true };
    }
  }

  // Load data from cloud (with localStorage fallback)
  async loadFromCloud(dataType) {
    try {
      const cloudKey = this.getCloudStorageKey(dataType);
      const cloudData = localStorage.getItem(cloudKey);
      
      if (cloudData) {
        const parsed = JSON.parse(cloudData);
        // Check if cloud data is more recent than local data
        const localData = localStorage.getItem(dataType);
        
        if (localData) {
          const localTimestamp = JSON.parse(localData).lastUpdated || '1970-01-01T00:00:00.000Z';
          const cloudTimestamp = parsed.timestamp || '1970-01-01T00:00:00.000Z';
          
          if (new Date(cloudTimestamp) > new Date(localTimestamp)) {
            // Cloud data is newer, update local storage
            localStorage.setItem(dataType, JSON.stringify(parsed.data));
            return { success: true, data: parsed.data, source: 'cloud' };
          }
        } else {
          // No local data, use cloud data
          localStorage.setItem(dataType, JSON.stringify(parsed.data));
          return { success: true, data: parsed.data, source: 'cloud' };
        }
      }
      
      // Fallback to localStorage
      const localData = localStorage.getItem(dataType);
      if (localData) {
        return { success: true, data: JSON.parse(localData), source: 'local' };
      }
      
      return { success: true, data: null, source: 'none' };
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      // Fallback to localStorage
      const localData = localStorage.getItem(dataType);
      return { 
        success: true, 
        data: localData ? JSON.parse(localData) : null, 
        source: 'local_fallback' 
      };
    }
  }

  // Sync all admin data types
  async syncAllAdminData() {
    const dataTypes = [
      'bookings',
      'vehicles', 
      'users',
      'siteSettings',
      'homeContent',
      'termsContent',
      'privacyPolicyContent',
      'contacts'
    ];
    
    const syncResults = {};
    
    for (const dataType of dataTypes) {
      try {
        const result = await this.loadFromCloud(dataType);
        syncResults[dataType] = result;
      } catch (error) {
        console.error(`Failed to sync ${dataType}:`, error);
        syncResults[dataType] = { success: false, error: error.message };
      }
    }
    
    return syncResults;
  }

  // Get unique device identifier
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Process queued sync operations when coming back online
  async processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    
    console.log(`Processing ${this.syncQueue.length} queued sync operations...`);
    
    for (const operation of this.syncQueue) {
      try {
        if (operation.type === 'save') {
          await this.saveToCloud(operation.dataType, operation.data);
        }
      } catch (error) {
        console.error('Failed to process queued sync operation:', error);
      }
    }
    
    this.syncQueue = [];
  }

  // Manual sync trigger for admin
  async forceSyncAll() {
    console.log('Starting manual sync of all admin data...');
    
    const dataTypes = ['bookings', 'vehicles', 'users', 'siteSettings', 'homeContent', 'termsContent', 'privacyPolicyContent', 'contacts'];
    const syncPromises = dataTypes.map(async (dataType) => {
      const localData = localStorage.getItem(dataType);
      if (localData) {
        return this.saveToCloud(dataType, JSON.parse(localData));
      }
    });
    
    const results = await Promise.all(syncPromises);
    console.log('Manual sync completed:', results);
    return results;
  }

  // Check sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queuedOperations: this.syncQueue.length,
      deviceId: this.getDeviceId(),
      lastSyncTime: localStorage.getItem('lastSyncTime')
    };
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
export default dataSyncService;