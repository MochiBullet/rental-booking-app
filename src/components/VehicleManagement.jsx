import React, { useState } from 'react';
import { vehicleCategories } from '../data/vehicleData';

const VehicleManagement = ({ vehicles, onVehicleUpdate }) => {
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'car',
    category: '',
    price: '',
    description: '',
    specifications: {
      seats: '',
      transmission: 'AT',
      fuelType: 'ガソリン',
      cc: ''
    },
    insurance: {
      dailyRate: '',
      description: '車両・対物・対人保険込み'
    },
    available: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'car',
      category: '',
      price: '',
      description: '',
      specifications: {
        seats: '',
        transmission: 'AT',
        fuelType: 'ガソリン',
        cc: ''
      },
      insurance: {
        dailyRate: '',
        description: '車両・対物・対人保険込み'
      },
      available: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('specifications.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: type === 'number' ? parseInt(value) || '' : value
        }
      }));
    } else if (name.startsWith('insurance.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          [field]: field === 'dailyRate' ? parseInt(value) || '' : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || '' : value)
      }));
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle.id);
    setFormData({
      ...vehicle,
      price: vehicle.price.toString(),
      specifications: {
        ...vehicle.specifications,
        seats: vehicle.specifications.seats.toString(),
        cc: vehicle.specifications.cc.toString()
      },
      insurance: {
        ...vehicle.insurance,
        dailyRate: vehicle.insurance.dailyRate.toString()
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const vehicleData = {
      ...formData,
      id: editingVehicle || Date.now(),
      price: parseInt(formData.price),
      specifications: {
        ...formData.specifications,
        seats: parseInt(formData.specifications.seats),
        cc: parseInt(formData.specifications.cc)
      },
      insurance: {
        ...formData.insurance,
        dailyRate: parseInt(formData.insurance.dailyRate)
      },
      image: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f0f0f0"/><text x="150" y="100" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">${formData.name}</text></svg>`)}`
    };

    onVehicleUpdate(vehicleData);
    
    setEditingVehicle(null);
    setIsAdding(false);
    resetForm();
  };

  const handleCancel = () => {
    setEditingVehicle(null);
    setIsAdding(false);
    resetForm();
  };

  const handleDelete = (vehicleId) => {
    if (window.confirm('この車両を削除しますか？')) {
      onVehicleUpdate({ id: vehicleId, action: 'delete' });
    }
  };

  const toggleAvailability = (vehicle) => {
    onVehicleUpdate({
      ...vehicle,
      available: !vehicle.available
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="vehicle-management">
      <div className="management-header">
        <h2>🚗 車両管理</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="add-button"
          disabled={isAdding || editingVehicle}
        >
          ➕ 新しい車両を追加
        </button>
      </div>

      {(isAdding || editingVehicle) && (
        <div className="vehicle-form-container">
          <form onSubmit={handleSubmit} className="vehicle-form">
            <h3>{editingVehicle ? '車両編集' : '新しい車両追加'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>車両名 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>タイプ *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="car">車</option>
                  <option value="motorcycle">バイク</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>カテゴリ *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">選択してください</option>
                  {vehicleCategories[formData.type]?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>1日料金 (円) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>説明</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-section">
              <h4>車両仕様</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>定員数</label>
                  <input
                    type="number"
                    name="specifications.seats"
                    value={formData.specifications.seats}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>排気量 (cc)</label>
                  <input
                    type="number"
                    name="specifications.cc"
                    value={formData.specifications.cc}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>トランスミッション</label>
                  <select
                    name="specifications.transmission"
                    value={formData.specifications.transmission}
                    onChange={handleInputChange}
                  >
                    <option value="AT">AT</option>
                    <option value="MT">MT</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>燃料タイプ</label>
                  <select
                    name="specifications.fuelType"
                    value={formData.specifications.fuelType}
                    onChange={handleInputChange}
                  >
                    <option value="ガソリン">ガソリン</option>
                    <option value="ハイブリッド">ハイブリッド</option>
                    <option value="電気">電気</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>保険情報</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>保険料/日 (円)</label>
                  <input
                    type="number"
                    name="insurance.dailyRate"
                    value={formData.insurance.dailyRate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>保険内容</label>
                  <input
                    type="text"
                    name="insurance.description"
                    value={formData.insurance.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                />
                利用可能
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-button">
                キャンセル
              </button>
              <button type="submit" className="submit-button">
                {editingVehicle ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="vehicles-list">
        <div className="vehicles-grid">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className={`vehicle-admin-card ${!vehicle.available ? 'unavailable' : ''}`}>
              <div className="vehicle-admin-header">
                <h3>{vehicle.name}</h3>
                <div className="vehicle-actions">
                  <button
                    onClick={() => toggleAvailability(vehicle)}
                    className={`availability-toggle ${vehicle.available ? 'available' : 'unavailable'}`}
                  >
                    {vehicle.available ? '✅' : '❌'}
                  </button>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="edit-button"
                    disabled={isAdding || editingVehicle}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="delete-button"
                    disabled={isAdding || editingVehicle}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="vehicle-admin-info">
                <p><strong>タイプ:</strong> {vehicle.type === 'car' ? '車' : 'バイク'}</p>
                <p><strong>カテゴリ:</strong> {vehicle.category}</p>
                <p><strong>料金:</strong> {formatPrice(vehicle.price)}/日</p>
                <p><strong>保険料:</strong> {formatPrice(vehicle.insurance.dailyRate)}/日</p>
                <p><strong>定員:</strong> {vehicle.specifications.seats}人</p>
                <p><strong>排気量:</strong> {vehicle.specifications.cc}cc</p>
                <p><strong>ステータス:</strong> 
                  <span className={`status ${vehicle.available ? 'available' : 'unavailable'}`}>
                    {vehicle.available ? '利用可能' : '利用不可'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;