import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import './DeletedVehiclesManagement.css';

const DeletedVehiclesManagement = () => {
  const [deletedVehicles, setDeletedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  // 削除済み車両を読み込み
  const loadDeletedVehicles = async () => {
    try {
      setLoading(true);
      console.log('🔄 削除済み車両を読み込み中...');
      
      const allVehicles = await vehicleAPI.getAll();
      const deleted = allVehicles.filter(vehicle => !vehicle.isAvailable);
      
      setDeletedVehicles(deleted);
      console.log('✅ 削除済み車両読み込み完了:', deleted.length, '件');
    } catch (error) {
      console.error('❌ 削除済み車両読み込みエラー:', error);
      setDeletedVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // 車両復元（有効化）
  const handleRestore = async (vehicleId, vehicleName) => {
    if (!window.confirm(`"${vehicleName}" を復元して稼働中リストに戻しますか？`)) {
      return;
    }

    try {
      setProcessing(vehicleId);
      console.log('🔄 車両復元中...', vehicleId);

      const vehicle = deletedVehicles.find(v => v.id === vehicleId || v.vehicleId === vehicleId);
      const updatedVehicle = { ...vehicle, available: true, isAvailable: true };

      await vehicleAPI.update(vehicleId, updatedVehicle);
      
      console.log('✅ 車両復元完了:', vehicleId);
      
      // リストを更新
      await loadDeletedVehicles();
      
      // 成功通知
      alert(`"${vehicleName}" を復元しました。稼働中リストに戻りました。`);
      
    } catch (error) {
      console.error('❌ 車両復元エラー:', error);
      alert(`車両の復元に失敗しました: ${error.message}`);
    } finally {
      setProcessing('');
    }
  };

  // 車両完全削除（確認含む）
  const handlePermanentDelete = async (vehicleId, vehicleName) => {
    if (!window.confirm(`⚠️ 警告: "${vehicleName}" を完全に削除しますか？\n\nこの操作は取り消せません。データベースから完全に削除されます。`)) {
      return;
    }

    if (!window.confirm('本当に完全削除を実行しますか？この操作は元に戻せません。')) {
      return;
    }

    try {
      setProcessing(vehicleId);
      console.log('🔄 車両完全削除中...', vehicleId);

      // 実際の削除API（今のところ無効化のみ）
      await vehicleAPI.delete(vehicleId);
      
      console.log('✅ 車両完全削除完了:', vehicleId);
      
      // リストを更新
      await loadDeletedVehicles();
      
      alert(`"${vehicleName}" を完全削除しました。`);
      
    } catch (error) {
      console.error('❌ 車両完全削除エラー:', error);
      alert(`車両の完全削除に失敗しました: ${error.message}`);
    } finally {
      setProcessing('');
    }
  };

  // 初期読み込み
  useEffect(() => {
    loadDeletedVehicles();
  }, []);

  if (loading) {
    return (
      <div className="deleted-vehicles-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>削除済み車両を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deleted-vehicles-management">
      <div className="header">
        <h2>🗑️ 削除済み車両管理</h2>
        <p className="subtitle">
          無効化された車両の管理・復元・完全削除を行います
        </p>
        <div className="stats">
          <span className="count">削除済み車両: {deletedVehicles.length}件</span>
          <button 
            onClick={loadDeletedVehicles} 
            className="refresh-btn"
            disabled={loading}
          >
            🔄 更新
          </button>
        </div>
      </div>

      {deletedVehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <h3>削除済み車両はありません</h3>
          <p>すべての車両が稼働中です</p>
        </div>
      ) : (
        <div className="deleted-vehicles-grid">
          {deletedVehicles.map((vehicle) => {
            const vehicleId = vehicle.id || vehicle.vehicleId;
            const isProcessing = processing === vehicleId;
            
            return (
              <div key={vehicleId} className="deleted-vehicle-card">
                <div className="vehicle-image">
                  {vehicle.image || (vehicle.images && vehicle.images[0]) ? (
                    <img 
                      src={vehicle.image || vehicle.images[0]} 
                      alt={vehicle.name}
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml,${encodeURIComponent(
                          `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
                            <rect width="200" height="120" fill="#f0f0f0"/>
                            <text x="100" y="60" font-family="Arial" font-size="12" fill="#999" text-anchor="middle">
                              ${vehicle.name || 'No Image'}
                            </text>
                          </svg>`
                        )}`;
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      🚗 {vehicle.name}
                    </div>
                  )}
                  <div className="deleted-badge">削除済み</div>
                </div>

                <div className="vehicle-info">
                  <h4 className="vehicle-name">{vehicle.name}</h4>
                  <div className="vehicle-details">
                    <span className="vehicle-type">
                      {vehicle.vehicleType === 'car' ? '🚗 車' : '🏍️ バイク'}
                    </span>
                    <span className="vehicle-price">
                      ¥{vehicle.pricePerDay?.toLocaleString()}/日
                    </span>
                  </div>
                  <div className="vehicle-meta">
                    <small>削除日: {new Date(vehicle.updatedAt).toLocaleDateString('ja-JP')}</small>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => handleRestore(vehicleId, vehicle.name)}
                    disabled={isProcessing}
                    className="restore-btn"
                    title="稼働中リストに復元"
                  >
                    {isProcessing ? '処理中...' : '🔄 復元'}
                  </button>
                  
                  <button
                    onClick={() => handlePermanentDelete(vehicleId, vehicle.name)}
                    disabled={isProcessing}
                    className="permanent-delete-btn"
                    title="完全削除（取り消し不可）"
                  >
                    {isProcessing ? '削除中...' : '🗑️ 完全削除'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeletedVehiclesManagement;