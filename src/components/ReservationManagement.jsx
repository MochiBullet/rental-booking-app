import React, { useState, useEffect } from 'react';
import { reservationAPI, vehicleAPI, memberAPI } from '../services/api';

const ReservationManagement = ({ onReservationUpdate }) => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'pending', label: '保留中' },
    { value: 'confirmed', label: '確定' },
    { value: 'active', label: '利用中' },
    { value: 'completed', label: '完了' },
    { value: 'cancelled', label: 'キャンセル' }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reservationsData, vehiclesData, membersData] = await Promise.all([
        reservationAPI.getAll(),
        vehicleAPI.getAll(),
        memberAPI.getAll()
      ]);
      
      setReservations(reservationsData);
      setVehicles(vehiclesData);
      setMembers(membersData);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError('データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    // ステータスフィルター
    if (filterStatus !== 'all' && reservation.status !== filterStatus) return false;
    
    // 検索クエリフィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchFields = [
        reservation.customerName,
        reservation.customerEmail,
        reservation.customerPhone,
        reservation.reservationId?.toString(),
        reservation.vehicleName
      ].filter(field => field);
      
      return searchFields.some(field => 
        field.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleStatusChange = async (reservationId, newStatus) => {
    if (window.confirm(`予約ステータスを「${getStatusLabel(newStatus)}」に変更しますか？`)) {
      try {
        await reservationAPI.update(reservationId, { status: newStatus });
        
        // ローカル状態を更新
        setReservations(prev => 
          prev.map(r => 
            r.reservationId === reservationId 
              ? { ...r, status: newStatus, updatedAt: new Date().toISOString() }
              : r
          )
        );
        
        if (onReservationUpdate) {
          onReservationUpdate({
            id: reservationId,
            status: newStatus,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('ステータス更新エラー:', error);
        alert('ステータスの更新に失敗しました。');
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: '保留中',
      confirmed: '確定',
      active: '利用中', 
      completed: '完了',
      cancelled: 'キャンセル'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#ffc107',
      confirmed: '#28a745',
      active: '#007bff',
      completed: '#6c757d',
      cancelled: '#dc3545'
    };
    return colorMap[status] || '#ff9a9e';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="reservation-management">
        <div className="loading-container">
          <div className="car-wheel-spinner"></div>
          <p>少々お待ちください</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-management">
        <div className="error-container">
          <div className="error-message">
            <h3>エラーが発生しました</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={fetchAllData}
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-management">
      <div className="management-header">
        <h2>📅 予約管理</h2>
        <div className="reservation-stats">
          <span className="stat">総予約数: {reservations.length}</span>
          <span className="stat">确定予約: {reservations.filter(r => r.status === 'confirmed').length}</span>
        </div>
      </div>

      <div className="reservation-filters">
        <div className="filter-group">
          <label>検索:</label>
          <input
            type="text"
            placeholder="予約ID、名前、メール、電話番号、車両名で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>ステータス絞り込み:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="reservations-list">
        {filteredReservations.length === 0 ? (
          <div className="no-reservations">
            <p>該当する予約がありません</p>
          </div>
        ) : (
          <div className="reservations-grid">
            {filteredReservations.map(reservation => (
              <div key={reservation.reservationId} className="reservation-admin-card">
                <div className="reservation-header">
                  <div className="reservation-id">予約ID: {reservation.reservationId}</div>
                  <div 
                    className="reservation-status"
                    style={{ backgroundColor: getStatusColor(reservation.status) }}
                  >
                    {getStatusLabel(reservation.status)}
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="customer-info">
                    <h4>👤 お客様情報</h4>
                    <p><strong>名前:</strong> {reservation.customerName || 'N/A'}</p>
                    <p><strong>メール:</strong> 
                      <a href={`mailto:${reservation.memberEmail || reservation.customerEmail}`}>
                        {reservation.memberEmail || reservation.customerEmail}
                      </a>
                    </p>
                    <p><strong>電話:</strong> 
                      {reservation.customerPhone ? (
                        <a href={`tel:${reservation.customerPhone}`}>
                          {reservation.customerPhone}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>

                  <div className="vehicle-info">
                    <h4>🚗 車両情報</h4>
                    <p><strong>車両:</strong> {reservation.vehicleName}</p>
                    <p><strong>期間:</strong> {formatDateOnly(reservation.startDate)} ～ {formatDateOnly(reservation.endDate)}</p>
                    <p><strong>日数:</strong> {calculateDays(reservation.startDate, reservation.endDate)}日</p>
                    <p><strong>レンタル種別:</strong> {reservation.rentalType === 'daily' ? '日毎' : '時間毎'}</p>
                    <p><strong>保険:</strong> {reservation.includeInsurance ? '加入' : '未加入'}</p>
                  </div>

                  <div className="payment-info">
                    <h4>💰 料金情報</h4>
                    <p><strong>合計金額:</strong> {formatPrice(reservation.totalPrice)}</p>
                  </div>

                  {reservation.notes && (
                    <div className="reservation-notes">
                      <h4>📝 備考</h4>
                      <p>{reservation.notes}</p>
                    </div>
                  )}

                  <div className="reservation-dates">
                    <p><strong>予約日時:</strong> {formatDate(reservation.createdAt)}</p>
                    {reservation.updatedAt && (
                      <p><strong>更新日時:</strong> {formatDate(reservation.updatedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="reservation-actions">
                  <button
                    onClick={() => setSelectedReservation(
                      selectedReservation === reservation.reservationId ? null : reservation.reservationId
                    )}
                    className="details-button"
                  >
                    {selectedReservation === reservation.reservationId ? '詳細を閉じる' : '詳細を見る'}
                  </button>
                  
                  {reservation.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(reservation.reservationId, 'confirmed')}
                      className="confirm-button"
                    >
                      確定する
                    </button>
                  )}
                  
                  {reservation.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(reservation.reservationId, 'active')}
                        className="active-button"
                      >
                        利用開始
                      </button>
                      <button
                        onClick={() => handleStatusChange(reservation.reservationId, 'cancelled')}
                        className="cancel-button"
                      >
                        キャンセル
                      </button>
                    </>
                  )}
                  
                  {reservation.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(reservation.reservationId, 'completed')}
                      className="complete-button"
                    >
                      完了にする
                    </button>
                  )}
                  
                  {reservation.status === 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(reservation.reservationId, 'confirmed')}
                      className="restore-button"
                    >
                      確定に戻す
                    </button>
                  )}
                </div>

                {selectedReservation === reservation.reservationId && (
                  <div className="reservation-extended-details">
                    <h4>📋 詳細情報</h4>
                    <div className="details-grid">
                      <div className="detail-section">
                        <h5>メンバー詳細</h5>
                        <p>メンバーID: {reservation.memberId}</p>
                        <p>メール: {reservation.memberEmail}</p>
                      </div>
                      
                      <div className="detail-section">
                        <h5>予約詳細</h5>
                        <p>車両ID: {reservation.vehicleId}</p>
                        <p>予約作成: {formatDate(reservation.createdAt)}</p>
                        {reservation.updatedAt && reservation.updatedAt !== reservation.createdAt && (
                          <p>最終更新: {formatDate(reservation.updatedAt)}</p>
                        )}
                      </div>
                      
                      <div className="detail-section">
                        <h5>料金詳細</h5>
                        <p><strong>合計金額: {formatPrice(reservation.totalPrice)}</strong></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement;