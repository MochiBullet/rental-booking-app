import React, { useState } from 'react';

const ReservationManagement = ({ reservations, vehicles, onReservationUpdate }) => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'confirmed', label: '確定' },
    { value: 'cancelled', label: 'キャンセル' },
    { value: 'completed', label: '完了' }
  ];

  const filteredReservations = reservations.filter(reservation => {
    if (filterStatus === 'all') return true;
    return reservation.status === filterStatus;
  });

  const handleStatusChange = (reservationId, newStatus) => {
    if (window.confirm(`予約ステータスを「${getStatusLabel(newStatus)}」に変更しますか？`)) {
      onReservationUpdate({
        id: reservationId,
        status: newStatus,
        updatedAt: new Date()
      });
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      confirmed: '確定',
      cancelled: 'キャンセル',
      completed: '完了'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      confirmed: '#28a745',
      cancelled: '#dc3545',
      completed: '#6c757d'
    };
    return colorMap[status] || '#667eea';
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
              <div key={reservation.id} className="reservation-admin-card">
                <div className="reservation-header">
                  <div className="reservation-id">予約ID: {reservation.id}</div>
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
                    <p><strong>名前:</strong> {reservation.customerName}</p>
                    <p><strong>メール:</strong> 
                      <a href={`mailto:${reservation.customerEmail}`}>
                        {reservation.customerEmail}
                      </a>
                    </p>
                    <p><strong>電話:</strong> 
                      <a href={`tel:${reservation.customerPhone}`}>
                        {reservation.customerPhone}
                      </a>
                    </p>
                  </div>

                  <div className="vehicle-info">
                    <h4>🚗 車両情報</h4>
                    <p><strong>車両:</strong> {reservation.vehicleName}</p>
                    <p><strong>期間:</strong> {formatDateOnly(reservation.startDate)} ～ {formatDateOnly(reservation.endDate)}</p>
                    <p><strong>日数:</strong> {calculateDays(reservation.startDate, reservation.endDate)}日</p>
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
                      selectedReservation === reservation.id ? null : reservation.id
                    )}
                    className="details-button"
                  >
                    {selectedReservation === reservation.id ? '詳細を閉じる' : '詳細を見る'}
                  </button>
                  
                  {reservation.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'completed')}
                        className="complete-button"
                      >
                        完了にする
                      </button>
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                        className="cancel-button"
                      >
                        キャンセル
                      </button>
                    </>
                  )}
                  
                  {reservation.status === 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                      className="restore-button"
                    >
                      確定に戻す
                    </button>
                  )}
                </div>

                {selectedReservation === reservation.id && (
                  <div className="reservation-extended-details">
                    <h4>📋 詳細情報</h4>
                    <div className="details-grid">
                      <div className="detail-section">
                        <h5>車両詳細</h5>
                        {reservation.vehicle && (
                          <>
                            <p>カテゴリ: {reservation.vehicle.category}</p>
                            <p>基本料金: {formatPrice(reservation.vehicle.price)}/日</p>
                            <p>保険料: {formatPrice(reservation.vehicle.insurance.dailyRate)}/日</p>
                            <p>定員: {reservation.vehicle.specifications.seats}人</p>
                            <p>トランスミッション: {reservation.vehicle.specifications.transmission}</p>
                          </>
                        )}
                      </div>
                      
                      <div className="detail-section">
                        <h5>料金内訳</h5>
                        <p>基本料金: {formatPrice(reservation.vehicle?.price * calculateDays(reservation.startDate, reservation.endDate))}</p>
                        {reservation.includeInsurance && (
                          <p>保険料: {formatPrice(reservation.vehicle?.insurance.dailyRate * calculateDays(reservation.startDate, reservation.endDate))}</p>
                        )}
                        <p><strong>合計: {formatPrice(reservation.totalPrice)}</strong></p>
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