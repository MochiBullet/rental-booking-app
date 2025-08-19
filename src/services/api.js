// API通信サービス
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
      name: vehicle.name,
      type: vehicle.vehicleType,
      vehicleType: vehicle.vehicleType,
      price: vehicle.pricePerDay,
      pricePerDay: vehicle.pricePerDay,
      pricePerHour: vehicle.pricePerHour,
      available: vehicle.isAvailable,
      isAvailable: vehicle.isAvailable,
      category: vehicle.category,
      description: vehicle.description,
      image: vehicle.images && vehicle.images[0] ? vehicle.images[0] : `https://via.placeholder.com/300x200?text=${encodeURIComponent(vehicle.name || 'Vehicle')}`,
      images: vehicle.images,
      specifications: {
        seats: vehicle.capacity,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        cc: vehicle.engineSize
      },
      passengers: vehicle.capacity,
      insurance: vehicle.insurance,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      location: vehicle.location,
      licensePlate: vehicle.licensePlate,
      features: vehicle.features || [],
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    };
  }

  // 共通のリクエスト処理
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
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
      return data;
    } catch (error) {
      console.error(`API Request Failed:`, error);
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
      name: vehicleData.name,
      vehicleType: vehicleData.type || vehicleData.vehicleType,
      description: vehicleData.description || '',
      pricePerHour: parseFloat(vehicleData.pricePerHour || Math.round((vehicleData.price || vehicleData.pricePerDay || 0) / 8)),
      pricePerDay: parseFloat(vehicleData.price || vehicleData.pricePerDay || 0),
      capacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
      fuelType: vehicleData.specifications?.fuelType || vehicleData.fuelType || 'ガソリン',
      transmission: vehicleData.specifications?.transmission || vehicleData.transmission || 'AT',
      features: vehicleData.features || [],
      images: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
      isAvailable: vehicleData.available !== undefined ? vehicleData.available : (vehicleData.isAvailable !== undefined ? vehicleData.isAvailable : true),
      category: vehicleData.category || '',
      brand: vehicleData.brand || '',
      model: vehicleData.model || '',
      year: vehicleData.year || new Date().getFullYear(),
      location: vehicleData.location || '東京都',
      licensePlate: vehicleData.licensePlate || '',
      engineSize: vehicleData.specifications?.cc || vehicleData.engineSize || 1500,
      insurance: vehicleData.insurance || {
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
      name: vehicleData.name,
      vehicleType: vehicleData.type || vehicleData.vehicleType,
      description: vehicleData.description || '',
      pricePerHour: parseFloat(vehicleData.pricePerHour || Math.round((vehicleData.price || vehicleData.pricePerDay || 0) / 8)),
      pricePerDay: parseFloat(vehicleData.price || vehicleData.pricePerDay || 0),
      capacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
      fuelType: vehicleData.specifications?.fuelType || vehicleData.fuelType || 'ガソリン',
      transmission: vehicleData.specifications?.transmission || vehicleData.transmission || 'AT',
      features: vehicleData.features || [],
      images: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
      isAvailable: vehicleData.available !== undefined ? vehicleData.available : (vehicleData.isAvailable !== undefined ? vehicleData.isAvailable : true),
      category: vehicleData.category || '',
      brand: vehicleData.brand || '',
      model: vehicleData.model || '',
      year: vehicleData.year || new Date().getFullYear(),
      location: vehicleData.location || '東京都',
      licensePlate: vehicleData.licensePlate || '',
      engineSize: vehicleData.specifications?.cc || vehicleData.engineSize || 1500,
      insurance: vehicleData.insurance
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