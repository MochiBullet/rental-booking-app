// API通信サービス
const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
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

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
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
    return response.vehicles || [];
  }

  async getVehicle(vehicleId) {
    const response = await this.request(`/vehicles/${vehicleId}`);
    return response;
  }

  async createVehicle(vehicleData) {
    return await this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(vehicleId, vehicleData) {
    return await this.request(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(vehicleId) {
    return await this.request(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
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