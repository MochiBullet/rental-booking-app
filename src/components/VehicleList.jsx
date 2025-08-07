import React, { useState } from 'react';
import VehicleCard from './VehicleCard';

const VehicleList = ({ vehicles, onVehicleSelect, initialFilter = 'all' }) => {
  const [filterType, setFilterType] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('name');

  const filteredVehicles = vehicles.filter(vehicle => {
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

  return (
    <div className="vehicle-list">
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

      <div className="vehicle-grid">
        {sortedVehicles.map(vehicle => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onSelect={() => onVehicleSelect(vehicle)}
          />
        ))}
      </div>

      {sortedVehicles.length === 0 && (
        <div className="no-vehicles">
          <p>条件に合う車両が見つかりません。</p>
        </div>
      )}
    </div>
  );
};

export default VehicleList;