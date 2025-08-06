import React, { useState } from 'react';
import { membershipTypes } from '../data/memberData';

const MemberManagement = ({ members, onMemberUpdate }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filterOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'active', label: 'アクティブ' },
    { value: 'inactive', label: '無効' },
    { value: 'pending', label: '審査待ち' },
    { value: 'approved', label: '承認済み' },
    { value: 'rejected', label: '要再提出' }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.membershipInfo.memberNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterStatus) {
      case 'active':
        return member.isActive;
      case 'inactive':
        return !member.isActive;
      case 'pending':
        return member.profile.driverLicense.verificationStatus === 'pending';
      case 'approved':
        return member.profile.driverLicense.verificationStatus === 'approved';
      case 'rejected':
        return member.profile.driverLicense.verificationStatus === 'rejected';
      default:
        return true;
    }
  });

  const handleMemberStatusChange = (memberId, newStatus) => {
    if (window.confirm(`会員ステータスを変更しますか？`)) {
      onMemberUpdate({
        id: memberId,
        isActive: newStatus === 'active',
        updatedAt: new Date()
      });
    }
  };

  const handleLicenseVerification = (memberId, status) => {
    if (window.confirm(`免許証の審査ステータスを「${getLicenseStatusLabel(status)}」に変更しますか？`)) {
      const member = members.find(m => m.id === memberId);
      const updatedMember = {
        ...member,
        profile: {
          ...member.profile,
          driverLicense: {
            ...member.profile.driverLicense,
            verificationStatus: status
          }
        },
        updatedAt: new Date()
      };
      onMemberUpdate(updatedMember);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLicenseStatusColor = (status) => {
    const colorMap = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  };

  const getLicenseStatusLabel = (status) => {
    const statusMap = {
      pending: '審査中',
      approved: '承認済み',
      rejected: '要再提出'
    };
    return statusMap[status] || status;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="member-management">
      <div className="management-header">
        <h2>👥 会員管理</h2>
        <div className="member-stats">
          <span className="stat">総会員数: {members.length}</span>
          <span className="stat">アクティブ: {members.filter(m => m.isActive).length}</span>
          <span className="stat">審査待ち: {members.filter(m => m.profile.driverLicense.verificationStatus === 'pending').length}</span>
        </div>
      </div>

      <div className="member-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>検索:</label>
            <input
              type="text"
              placeholder="名前、メール、会員番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>ステータス絞り込み:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="members-list">
        {filteredMembers.length === 0 ? (
          <div className="no-members">
            <p>該当する会員がいません</p>
          </div>
        ) : (
          <div className="members-grid">
            {filteredMembers.map(member => (
              <div key={member.id} className={`member-admin-card ${!member.isActive ? 'inactive' : ''}`}>
                <div className="member-header">
                  <div className="member-info">
                    <h4>{member.profile.name}</h4>
                    <p className="member-number">{member.membershipInfo.memberNumber}</p>
                  </div>
                  <div className="member-status-actions">
                    <span 
                      className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}
                    >
                      {member.isActive ? 'アクティブ' : '無効'}
                    </span>
                    <button
                      onClick={() => handleMemberStatusChange(member.id, member.isActive ? 'inactive' : 'active')}
                      className={`status-toggle ${member.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {member.isActive ? '無効化' : '有効化'}
                    </button>
                  </div>
                </div>

                <div className="member-details">
                  <div className="detail-section">
                    <h5>基本情報</h5>
                    <p><strong>メール:</strong> <a href={`mailto:${member.email}`}>{member.email}</a></p>
                    <p><strong>電話:</strong> <a href={`tel:${member.profile.phone}`}>{member.profile.phone}</a></p>
                    <p><strong>年齢:</strong> {calculateAge(member.profile.birthDate)}歳</p>
                    <p><strong>住所:</strong> {member.profile.address.prefecture} {member.profile.address.city}</p>
                  </div>

                  <div className="detail-section">
                    <h5>会員情報</h5>
                    <p><strong>会員種別:</strong> {membershipTypes[member.membershipInfo.membershipType].name}</p>
                    <p><strong>ポイント:</strong> {member.membershipInfo.points}pt</p>
                    <p><strong>入会日:</strong> {formatDate(member.membershipInfo.joinDate)}</p>
                  </div>

                  <div className="detail-section">
                    <h5>免許証情報</h5>
                    <p><strong>免許証番号:</strong> {member.profile.driverLicense.number}</p>
                    <p><strong>有効期限:</strong> {formatDate(member.profile.driverLicense.expiryDate)}</p>
                    <p>
                      <strong>審査ステータス:</strong> 
                      <span 
                        className="license-status"
                        style={{ 
                          color: getLicenseStatusColor(member.profile.driverLicense.verificationStatus),
                          marginLeft: '0.5rem'
                        }}
                      >
                        {getLicenseStatusLabel(member.profile.driverLicense.verificationStatus)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="member-actions">
                  <button
                    onClick={() => setSelectedMember(
                      selectedMember === member.id ? null : member.id
                    )}
                    className="details-button"
                  >
                    {selectedMember === member.id ? '詳細を閉じる' : '詳細・免許証を見る'}
                  </button>

                  {member.profile.driverLicense.verificationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleLicenseVerification(member.id, 'approved')}
                        className="approve-button"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => handleLicenseVerification(member.id, 'rejected')}
                        className="reject-button"
                      >
                        要再提出
                      </button>
                    </>
                  )}

                  {member.profile.driverLicense.verificationStatus === 'rejected' && (
                    <button
                      onClick={() => handleLicenseVerification(member.id, 'approved')}
                      className="approve-button"
                    >
                      承認
                    </button>
                  )}

                  {member.profile.driverLicense.verificationStatus === 'approved' && (
                    <button
                      onClick={() => handleLicenseVerification(member.id, 'rejected')}
                      className="reject-button"
                    >
                      再審査
                    </button>
                  )}
                </div>

                {selectedMember === member.id && (
                  <div className="member-extended-details">
                    <h4>詳細情報</h4>
                    
                    <div className="details-grid">
                      <div className="detail-section">
                        <h5>緊急連絡先</h5>
                        <p>名前: {member.profile.emergencyContact.name}</p>
                        <p>電話: <a href={`tel:${member.profile.emergencyContact.phone}`}>{member.profile.emergencyContact.phone}</a></p>
                        <p>続柄: {member.profile.emergencyContact.relationship}</p>
                      </div>
                      
                      <div className="detail-section">
                        <h5>設定</h5>
                        <p>メルマガ: {member.preferences.newsletterSubscription ? '受信' : '停止'}</p>
                        <p>SMS通知: {member.preferences.smsNotification ? '受信' : '停止'}</p>
                      </div>
                    </div>

                    {(member.profile.driverLicense.frontImage || member.profile.driverLicense.backImage) && (
                      <div className="license-images">
                        <h5>免許証画像</h5>
                        <div className="license-images-grid">
                          {member.profile.driverLicense.frontImage && (
                            <div className="license-image-section">
                              <h6>表面</h6>
                              <img 
                                src={member.profile.driverLicense.frontImage} 
                                alt="免許証表面" 
                                className="license-image"
                                onClick={() => window.open(member.profile.driverLicense.frontImage, '_blank')}
                              />
                            </div>
                          )}
                          {member.profile.driverLicense.backImage && (
                            <div className="license-image-section">
                              <h6>裏面</h6>
                              <img 
                                src={member.profile.driverLicense.backImage} 
                                alt="免許証裏面" 
                                className="license-image"
                                onClick={() => window.open(member.profile.driverLicense.backImage, '_blank')}
                              />
                            </div>
                          )}
                        </div>
                        <p className="image-note">画像をクリックすると拡大表示されます</p>
                      </div>
                    )}

                    <div className="member-dates">
                      <p><strong>登録日時:</strong> {formatDate(member.createdAt)}</p>
                      <p><strong>更新日時:</strong> {formatDate(member.updatedAt)}</p>
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

export default MemberManagement;