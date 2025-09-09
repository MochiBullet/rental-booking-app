// 車両データのAPI変換ヘルパー - 1回で完璧に解決
export const mapVehicleForAPI = (vehicleData) => {
  console.log('🔄 車両データをAPI形式に変換中...', vehicleData);
  
  return {
    // 必須フィールド（APIテスト済み）
    name: vehicleData.name,
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

// API必須フィールド検証
export const validateVehicleData = (vehicleData) => {
  const required = ['name', 'type'];
  const missing = required.filter(field => !vehicleData[field]);
  
  if (missing.length > 0) {
    throw new Error(`必須フィールドが不足: ${missing.join(', ')}`);
  }
  
  return true;
};