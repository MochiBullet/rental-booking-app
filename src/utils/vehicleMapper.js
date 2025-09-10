// 車両データのAPI変換ヘルパー - CREATE用（name必須）
export const mapVehicleForCreate = (vehicleData) => {
  console.log('🔄 車両データをCREATE API形式に変換中...', vehicleData);
  
  return {
    // 必須フィールド（APIテスト済み）
    name: vehicleData.name, // CREATE時は必須
    vehicleType: vehicleData.type || vehicleData.vehicleType,
    pricePerHour: parseFloat(vehicleData.pricePerHour || Math.round((vehicleData.price || vehicleData.pricePerDay || 0) / 8)),
    capacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
    
    // オプションフィールド
    vehicleName: vehicleData.name,
    vehicleDescription: vehicleData.description || '',
    pricePerDay: parseFloat(vehicleData.price || vehicleData.pricePerDay || 0),
    vehicleCapacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
    fuelType: vehicleData.specifications?.fuelType || vehicleData.fuelType || 'ガソリン',
    transmission: vehicleData.specifications?.transmission || vehicleData.transmission || 'AT',
    vehicleFeatures: vehicleData.features || [],
    vehicleImages: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
    images: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
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
};

// 車両データのAPI変換ヘルパー - UPDATE用（DynamoDB予約語除外）
export const mapVehicleForUpdate = (vehicleData) => {
  console.log('🔄 車両データをUPDATE API形式に変換中（DynamoDB予約語除外）...', vehicleData);
  
  return {
    // UPDATE時は予約語「name」「capacity」を除外
    vehicleType: vehicleData.type || vehicleData.vehicleType,
    pricePerHour: parseFloat(vehicleData.pricePerHour || Math.round((vehicleData.price || vehicleData.pricePerDay || 0) / 8)),
    // capacity: DynamoDB予約語のため除外
    
    // オプションフィールド（nameは除外）
    vehicleName: vehicleData.name, // こちらは予約語ではない
    vehicleDescription: vehicleData.description || '',
    pricePerDay: parseFloat(vehicleData.price || vehicleData.pricePerDay || 0),
    vehicleCapacity: parseInt(vehicleData.specifications?.seats || vehicleData.passengers || 4),
    fuelType: vehicleData.specifications?.fuelType || vehicleData.fuelType || 'ガソリン',
    transmission: vehicleData.specifications?.transmission || vehicleData.transmission || 'AT',
    vehicleFeatures: vehicleData.features || [],
    vehicleImages: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
    images: vehicleData.images || (vehicleData.image ? [vehicleData.image] : []),
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
};

// 後方互換性のため
export const mapVehicleForAPI = mapVehicleForCreate;

// API必須フィールド検証
export const validateVehicleData = (vehicleData) => {
  const required = ['name', 'type'];
  const missing = required.filter(field => !vehicleData[field]);
  
  if (missing.length > 0) {
    throw new Error(`必須フィールドが不足: ${missing.join(', ')}`);
  }
  
  return true;
};