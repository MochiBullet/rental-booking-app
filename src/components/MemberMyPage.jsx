import React, { useState } from 'react';
import { membershipTypes, memberUtils } from '../data/memberData';

const MemberMyPage = ({ member, reservations, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: member.email || ''
  });

  const tabs = [
    { id: 'profile', name: 'プロフィール', icon: '👤' },
    { id: 'reservations', name: '予約履歴', icon: '📅' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = () => {
    // メールアドレスのみ更新可能
    const updatedMember = {
      ...member,
      email: editData.email
    };

    onUpdateProfile(updatedMember);
    setIsEditing(false);
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
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      confirmed: '#28a745',
      cancelled: '#dc3545',
      completed: '#6c757d'
    };
    return colorMap[status] || '#ff9a9e';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      confirmed: '確定',
      cancelled: 'キャンセル',
      completed: '完了'
    };
    return statusMap[status] || status;
  };


  const memberReservations = reservations.filter(r => r.customerEmail === member.email);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-content">
            <div className="profile-header">
              <h3>プロフィール情報</h3>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className={isEditing ? 'save-button' : 'edit-button'}
              >
                {isEditing ? '保存' : '編集'}
              </button>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="cancel-edit-button"
                >
                  キャンセル
                </button>
              )}
            </div>

            <div className="profile-sections">
              <div className="profile-section">
                <h4>基本情報</h4>
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <label>メールアドレス</label>
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>会員番号:</strong> {member.memberId || '未設定'}</p>
                    <p><strong>メールアドレス:</strong> {member.email || '未設定'}</p>
                    <p><strong>免許証番号（下4桁）:</strong> {member.licenseLastFour || '未設定'}</p>
                    <p><strong>登録日:</strong> {member.registrationDate ? formatDate(member.registrationDate) : '未設定'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'reservations':
        return (
          <div className="reservations-content">
            <h3>予約履歴</h3>
            {memberReservations.length === 0 ? (
              <div className="no-reservations">
                <p>まだ予約履歴がありません</p>
              </div>
            ) : (
              <div className="reservations-list">
                {memberReservations.map(reservation => (
                  <div key={reservation.id} className="reservation-card">
                    <div className="reservation-header">
                      <h4>{reservation.vehicleName}</h4>
                      <span 
                        className="reservation-status"
                        style={{ backgroundColor: getStatusColor(reservation.status) }}
                      >
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                    <div className="reservation-details">
                      <p><strong>期間:</strong> {formatDate(reservation.startDate)} ～ {formatDate(reservation.endDate)}</p>
                      <p><strong>料金:</strong> {formatPrice(reservation.totalPrice)}</p>
                      <p><strong>保険:</strong> {reservation.includeInsurance ? '加入' : '未加入'}</p>
                      <p><strong>予約日:</strong> {formatDate(reservation.createdAt)}</p>
                      {reservation.notes && (
                        <p><strong>備考:</strong> {reservation.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="member-mypage">
      <div className="mypage-header">
        <div className="member-welcome">
          <h2>マイページ</h2>
          <p>会員番号: {member.memberId || '未設定'}</p>
        </div>
        <div className="mypage-actions">
          <button onClick={onLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </div>

      <div className="mypage-nav">
        <div className="container">
          <div className="mypage-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`mypage-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mypage-content">
        <div className="container">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MemberMyPage;