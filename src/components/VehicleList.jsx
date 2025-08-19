import React, { useState } from 'react';
import VehicleCard from './VehicleCard';

const VehicleList = ({ vehicles = [], onVehicleSelect, initialFilter = 'all', hideFilters = false }) => {
  const [filterType, setFilterType] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('name');

  // 安全性のため、vehiclesが配列でない場合は空配列として扱う
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  // 初期フィルターに基づいて車両をフィルタリング
  const filteredVehicles = safeVehicles.filter(vehicle => {
    if (initialFilter === 'car') return vehicle.category === 'car';
    if (initialFilter === 'motorcycle') return vehicle.category === 'motorcycle';
    if (filterType === 'all') return true;
    return vehicle.type === filterType;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'name':
        return a.name.localeCompare(b.name, 'ja');
      case 'category':
        return a.category.localeCompare(b.category, 'ja');
      default:
        return 0;
    }
  });

  // 在庫なし時のメッセージを判定
  const getEmptyMessage = () => {
    if (safeVehicles.length === 0) {
      if (initialFilter === 'car') {
        return {
          icon: '🚗',
          title: '現在ご利用可能な車両はございません',
          message: '申し訳ございません。現在すべての車両が貸出中です。',
          subMessage: 'お急ぎの場合は、お電話にてお問い合わせください。'
        };
      } else if (initialFilter === 'motorcycle') {
        return {
          icon: '🏍️',
          title: '現在ご利用可能なバイクはございません',
          message: '申し訳ございません。現在すべてのバイクが貸出中です。',
          subMessage: 'お急ぎの場合は、お電話にてお問い合わせください。'
        };
      }
    }
    return {
      icon: '📋',
      title: '該当する車両が見つかりません',
      message: '検索条件を変更してお試しください。',
      subMessage: ''
    };
  };

  return (
    <div className="vehicle-list">
      {!hideFilters && safeVehicles.length > 0 && (
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="typeFilter">種類で絞り込み:</label>
            <select 
              id="typeFilter"
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="car">車</option>
              <option value="motorcycle">バイク</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sortBy">並び替え:</label>
            <select 
              id="sortBy"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">名前順</option>
              <option value="price">料金順</option>
              <option value="category">カテゴリ順</option>
            </select>
          </div>
        </div>
      )}

      {sortedVehicles.length > 0 ? (
        <div className="vehicle-grid">
          {sortedVehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onSelect={() => onVehicleSelect(vehicle)}
            />
          ))}
        </div>
      ) : (
        <div className="no-vehicles-container">
          <div className="no-vehicles-card">
            <div className="no-vehicles-icon">{getEmptyMessage().icon}</div>
            <h3 className="no-vehicles-title">{getEmptyMessage().title}</h3>
            <p className="no-vehicles-message">{getEmptyMessage().message}</p>
            {getEmptyMessage().subMessage && (
              <p className="no-vehicles-sub-message">{getEmptyMessage().subMessage}</p>
            )}
            <div className="no-vehicles-contact">
              <p>📞 お問い合わせ: 0120-XXX-XXXX</p>
              <p>営業時間: 9:00 - 18:00（年中無休）</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;