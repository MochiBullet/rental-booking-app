// API通信サービス
// 正しいAPI URL (更新: 2025-08-20)
const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // DynamoDBの車両データをフロントエンドの形式に変換
  transformVehicleData(vehicle) {
    if (!vehicle || !vehicle.vehicleId) return vehicle;
    
    return {
      id: vehicle.vehicleId,
      vehicleId: vehicle.vehicleId,
      name: vehicle.vehicleName || vehicle.name,
      type: vehicle.vehicleType,
      vehicleType: vehicle.vehicleType,
      price: vehicle.pricePerDay,
      pricePerDay: vehicle.pricePerDay,
      pricePerHour: vehicle.pricePerHour,
      available: vehicle.isAvailable,
      isAvailable: vehicle.isAvailable,
      category: vehicle.vehicleCategory || vehicle.category,
      description: vehicle.vehicleDescription || vehicle.description,
      image: (() => {
        // 優先順位: vehicleImages[0] > images[0] > デフォルトSVG
        const primaryImage = (vehicle.vehicleImages && vehicle.vehicleImages[0]) || (vehicle.images && vehicle.images[0]);
        
        // placeholder URLをフィルタリング
        if (primaryImage && !primaryImage.includes('via.placeholder.com') && !primaryImage.includes('placeholder.com')) {
          return primaryImage;
        }
        
        // SVGデフォルト画像を生成
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f0f0f0"/><text x="150" y="100" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">${vehicle.vehicleName || vehicle.name || 'Vehicle'}</text></svg>`)}`;
      })(),
      images: vehicle.vehicleImages || vehicle.images,
      specifications: {
        seats: vehicle.vehicleCapacity || vehicle.capacity,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        cc: vehicle.engineSize
      },
      passengers: vehicle.vehicleCapacity || vehicle.capacity,
      insurance: vehicle.vehicleInsurance || vehicle.insurance,
      brand: vehicle.vehicleBrand || vehicle.brand,
      model: vehicle.vehicleModel || vehicle.model,
      year: vehicle.vehicleYear || vehicle.year,
      location: vehicle.vehicleLocation || vehicle.location,
      licensePlate: vehicle.licensePlate,
      features: vehicle.vehicleFeatures || vehicle.features || [],
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    };
  }

  // 共通のリクエスト処理
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // タイムアウト設定（5秒）
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API request timeout')), 5000)
    );

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      // ペイロードサイズをログ出力（POST/PUTの場合）
      if (config.body && (options.method === 'POST' || options.method === 'PUT')) {
        const payloadSize = new Blob([config.body]).size;
        console.log(`📦 Payload size: ${Math.round(payloadSize / 1000)}KB (${payloadSize} bytes)`);
        if (payloadSize > 5000000) {
          console.warn('⚠️ Large payload detected! May cause API Gateway timeout.');
        }
      }
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response:`, data);
      
      // 車両データ取得の場合、詳細構造をログ出力
      if (endpoint.includes('/vehicles')) {
        console.log('🔍 車両API詳細レスポンス:', JSON.stringify(data, null, 2));
      }
      
      return data;
    } catch (error) {
      console.error(`API Request Failed:`, error);
      console.error(`URL: ${url}`);
      console.error(`Config:`, config);
      // CORSエラーの可能性を明示
      if (error.message === 'Failed to fetch') {
        console.error('⚠️ CORS error or network issue. Check browser console for details.');
      }
      throw error;
    }
  }

  // Vehicles API
  async getVehicles(type = null) {
    const endpoint = type ? `/vehicles?type=${type}` : '/vehicles';
    const response = await this.request(endpoint);
    const vehicles = response.vehicles || [];
    
    // DynamoDBの形式をフロントエンドの期待する形式に変換
    return vehicles.map(vehicle => this.transformVehicleData(vehicle));
  }

  async getVehicle(vehicleId) {
    const response = await this.request(`/vehicles/${vehicleId}`);
    
    // DynamoDBの形式をフロントエンドの期待する形式に変換
    return this.transformVehicleData(response);
  }

  async createVehicle(vehicleData) {
    // フロントエンドの形式をDynamoDBの形式に変換
    const dynamoDBData = {
      vehicleName: vehicleData.name,
      vehicleType: vehicleData.type || vehicleData.vehicleType,
      vehicleDescription: vehicleData.description || '',
      pricePerHour: parseFloat(vehicleData.pricePerHour || Math.round((vehicleData.price || vehicleData.pricePerDay || 0) / 8)),
      pricePerDay: parseFloat(vehicleData.price || vehicleData.pricePerDay || 0),
      vehicleCapacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
      fuelType: vehicleData.specifications?.fuelType || vehicleData.fuelType || 'ガソリン',
      transmission: vehicleData.specifications?.transmission || vehicleData.transmission || 'AT',
      vehicleFeatures: vehicleData.features || [],
      vehicleImages: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
      isAvailable: vehicleData.available !== undefined ? vehicleData.available : (vehicleData.isAvailable !== undefined ? vehicleData.isAvailable : true),
      vehicleCategory: vehicleData.category || '',
      vehicleBrand: vehicleData.brand || '',
      vehicleModel: vehicleData.model || '',
      vehicleYear: vehicleData.year || new Date().getFullYear(),
      vehicleLocation: vehicleData.location || '東京都',
      licensePlate: vehicleData.licensePlate || '',
      engineSize: vehicleData.specifications?.cc || vehicleData.engineSize || 1500,
      vehicleInsurance: vehicleData.insurance || {
        description: '車両・対物・対人保険込み',
        dailyRate: Math.round((vehicleData.price || vehicleData.pricePerDay || 0) * 0.1)
      }
    };
    
    const response = await this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(dynamoDBData),
    });
    
    // レスポンスをフロントエンドの形式に変換
    return this.transformVehicleData(response);
  }

  async updateVehicle(vehicleId, vehicleData) {
    // フロントエンドの形式をDynamoDBの形式に変換
    const dynamoDBData = {
      vehicleName: vehicleData.name,
      vehicleType: vehicleData.type || vehicleData.vehicleType,
      vehicleDescription: vehicleData.description || '',
      pricePerHour: parseFloat(vehicleData.pricePerHour || Math.round((vehicleData.price || vehicleData.pricePerDay || 0) / 8)),
      pricePerDay: parseFloat(vehicleData.price || vehicleData.pricePerDay || 0),
      vehicleCapacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
      fuelType: vehicleData.specifications?.fuelType || vehicleData.fuelType || 'ガソリン',
      transmission: vehicleData.specifications?.transmission || vehicleData.transmission || 'AT',
      vehicleFeatures: vehicleData.features || [],
      vehicleImages: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
      isAvailable: vehicleData.available !== undefined ? vehicleData.available : (vehicleData.isAvailable !== undefined ? vehicleData.isAvailable : true),
      vehicleCategory: vehicleData.category || '',
      vehicleBrand: vehicleData.brand || '',
      vehicleModel: vehicleData.model || '',
      vehicleYear: vehicleData.year || new Date().getFullYear(),
      vehicleLocation: vehicleData.location || '東京都',
      licensePlate: vehicleData.licensePlate || '',
      engineSize: vehicleData.specifications?.cc || vehicleData.engineSize || 1500,
      vehicleInsurance: vehicleData.insurance
    };

    // undefinedな値を削除
    Object.keys(dynamoDBData).forEach(key => {
      if (dynamoDBData[key] === undefined) {
        delete dynamoDBData[key];
      }
    });
    
    const response = await this.request(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(dynamoDBData),
    });
    
    // レスポンスをフロントエンドの形式に変換
    return this.transformVehicleData(response);
  }

  async deleteVehicle(vehicleId) {
    const response = await this.request(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
    
    // レスポンスに車両データが含まれている場合は変換
    if (response && response.vehicle) {
      return {
        ...response,
        vehicle: this.transformVehicleData(response.vehicle)
      };
    }
    
    return response;
  }

  // Members API
  async getMembers() {
    const response = await this.request('/members');
    return response.members || [];
  }

  async getMember(memberId) {
    return await this.request(`/members/${memberId}`);
  }

  async getMemberByEmail(email) {
    return await this.request(`/members?email=${email}`);
  }

  async createMember(memberData) {
    return await this.request('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(memberId, memberData) {
    return await this.request(`/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(memberId) {
    return await this.request(`/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Reservations API
  async getReservations(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.memberId) queryParams.append('memberId', params.memberId);
    if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
    if (params.status) queryParams.append('status', params.status);
    
    const endpoint = queryParams.toString() ? `/reservations?${queryParams}` : '/reservations';
    const response = await this.request(endpoint);
    return response.reservations || [];
  }

  async getReservation(reservationId) {
    return await this.request(`/reservations/${reservationId}`);
  }

  async createReservation(reservationData) {
    return await this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async updateReservation(reservationId, reservationData) {
    return await this.request(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData),
    });
  }

  async deleteReservation(reservationId) {
    return await this.request(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }
}

// シングルトンインスタンス
const apiService = new ApiService();

export default apiService;

// 個別のエクスポート（従来の互換性のため）
export const vehicleAPI = {
  getAll: () => apiService.getVehicles(),
  getByType: (type) => apiService.getVehicles(type),
  getById: (id) => apiService.getVehicle(id),
  create: (data) => apiService.createVehicle(data),
  update: (id, data) => apiService.updateVehicle(id, data),
  delete: (id) => apiService.deleteVehicle(id)
};

export const memberAPI = {
  getAll: () => apiService.getMembers(),
  getById: (id) => apiService.getMember(id),
  getByEmail: (email) => apiService.getMemberByEmail(email),
  create: (data) => apiService.createMember(data),
  update: (id, data) => apiService.updateMember(id, data),
  delete: (id) => apiService.deleteMember(id)
};

export const reservationAPI = {
  getAll: (params = {}) => apiService.getReservations(params),
  getById: (id) => apiService.getReservation(id),
  getByMember: (memberId) => apiService.getReservations({ memberId }),
  getByVehicle: (vehicleId) => apiService.getReservations({ vehicleId }),
  create: (data) => apiService.createReservation(data),
  update: (id, data) => apiService.updateReservation(id, data),
  delete: (id) => apiService.deleteReservation(id)
};