import React, { useState } from 'react';
import { membershipTypes, memberUtils } from '../data/memberData';

const MemberMyPage = ({ member, reservations, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isReuploadingLicense, setIsReuploadingLicense] = useState(false);
  const [licenseUploadData, setLicenseUploadData] = useState({
    frontImage: null,
    backImage: null
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [editData, setEditData] = useState({
    name: member.profile?.name || '',
    nameKana: member.profile?.nameKana || '',
    phone: member.profile?.phone || '',
    zipCode: member.profile?.address?.zipCode || '',
    prefecture: member.profile?.address?.prefecture || '',
    city: member.profile?.address?.city || '',
    street: member.profile?.address?.street || '',
    emergencyName: member.profile?.emergencyContact?.name || '',
    emergencyPhone: member.profile?.emergencyContact?.phone || '',
    emergencyRelationship: member.profile?.emergencyContact?.relationship || '',
    newsletterSubscription: member.preferences?.newsletterSubscription || false,
    smsNotification: member.preferences?.smsNotification || false
  });

  const tabs = [
    { id: 'profile', name: 'プロフィール', icon: '👤' },
    { id: 'reservations', name: '予約履歴', icon: '📅' },
    { id: 'points', name: 'ポイント', icon: '🎁' },
    { id: 'license', name: '免許証', icon: '🆔' },
    { id: 'invite', name: '友達招待', icon: '💌' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...member.profile,
      name: editData.name,
      nameKana: editData.nameKana,
      phone: editData.phone,
      address: {
        zipCode: editData.zipCode,
        prefecture: editData.prefecture,
        city: editData.city,
        street: editData.street
      },
      emergencyContact: {
        name: editData.emergencyName,
        phone: editData.emergencyPhone,
        relationship: editData.emergencyRelationship
      }
    };

    const updatedPreferences = {
      newsletterSubscription: editData.newsletterSubscription,
      smsNotification: editData.smsNotification
    };

    onUpdateProfile(updatedProfile, updatedPreferences);
    setIsEditing(false);
  };

  const handleLicenseImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => ({
        ...prev,
        [imageType]: 'ファイルサイズは5MB以下にしてください'
      }));
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setUploadErrors(prev => ({
        ...prev,
        [imageType]: '画像ファイルを選択してください'
      }));
      return;
    }

    try {
      // Base64に変換
      const reader = new FileReader();
      reader.onload = (event) => {
        setLicenseUploadData(prev => ({
          ...prev,
          [imageType]: event.target.result
        }));
        setUploadErrors(prev => ({
          ...prev,
          [imageType]: ''
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadErrors(prev => ({
        ...prev,
        [imageType]: 'ファイルのアップロードに失敗しました'
      }));
    }
  };

  const handleLicenseReupload = () => {
    if (!licenseUploadData.frontImage || !licenseUploadData.backImage) {
      alert('表面と裏面の両方の画像をアップロードしてください');
      return;
    }

    const updatedProfile = {
      ...member.profile,
      driverLicense: {
        ...member.profile.driverLicense,
        frontImage: licenseUploadData.frontImage,
        backImage: licenseUploadData.backImage,
        verificationStatus: 'pending' // 再審査待ち状態にリセット
      }
    };

    onUpdateProfile(updatedProfile, member.preferences);
    setIsReuploadingLicense(false);
    setLicenseUploadData({ frontImage: null, backImage: null });
    alert('免許証画像を再アップロードしました。審査完了まで1-2営業日お待ちください。');
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
                    <div className="form-row">
                      <div className="form-group">
                        <label>氏名</label>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>フリガナ</label>
                        <input
                          type="text"
                          name="nameKana"
                          value={editData.nameKana}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>電話番号</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>氏名:</strong> {member.profile?.name || '未設定'}</p>
                    <p><strong>フリガナ:</strong> {member.profile?.nameKana || '未設定'}</p>
                    <p><strong>電話番号:</strong> {member.profile?.phone || '未設定'}</p>
                    <p><strong>生年月日:</strong> {member.profile?.birthDate ? formatDate(member.profile.birthDate) : '未設定'}</p>
                    <p><strong>メールアドレス:</strong> {member.email || '未設定'}</p>
                  </>
                )}
              </div>

              <div className="profile-section">
                <h4>住所情報</h4>
                {isEditing ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>郵便番号</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={editData.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>都道府県</label>
                        <input
                          type="text"
                          name="prefecture"
                          value={editData.prefecture}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>市区町村</label>
                      <input
                        type="text"
                        name="city"
                        value={editData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>番地・建物名</label>
                      <input
                        type="text"
                        name="street"
                        value={editData.street}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <p>
                    〒{member.profile?.address?.zipCode || '未設定'}<br />
                    {member.profile?.address?.prefecture || '未設定'} {member.profile?.address?.city || '未設定'} {member.profile?.address?.street || '未設定'}
                  </p>
                )}
              </div>

              <div className="profile-section">
                <h4>緊急連絡先</h4>
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <label>緊急連絡先名</label>
                      <input
                        type="text"
                        name="emergencyName"
                        value={editData.emergencyName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>電話番号</label>
                        <input
                          type="tel"
                          name="emergencyPhone"
                          value={editData.emergencyPhone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>続柄</label>
                        <input
                          type="text"
                          name="emergencyRelationship"
                          value={editData.emergencyRelationship}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>名前:</strong> {member.profile?.emergencyContact?.name || '未設定'}</p>
                    <p><strong>電話:</strong> {member.profile?.emergencyContact?.phone || '未設定'}</p>
                    <p><strong>続柄:</strong> {member.profile?.emergencyContact?.relationship || '未設定'}</p>
                  </>
                )}
              </div>

              <div className="profile-section">
                <h4>通知設定</h4>
                {isEditing ? (
                  <>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="newsletterSubscription"
                        checked={editData.newsletterSubscription}
                        onChange={handleInputChange}
                      />
                      メールマガジンを受け取る
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="smsNotification"
                        checked={editData.smsNotification}
                        onChange={handleInputChange}
                      />
                      SMS通知を受け取る
                    </label>
                  </>
                ) : (
                  <>
                    <p><strong>メールマガジン:</strong> {member.preferences?.newsletterSubscription ? '受信する' : '受信しない'}</p>
                    <p><strong>SMS通知:</strong> {member.preferences?.smsNotification ? '受信する' : '受信しない'}</p>
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

      case 'points':
        return (
          <div className="points-content">
            <h3>ポイント・特典</h3>
            <div className="membership-info">
              <div className="membership-card">
                <div className="membership-header">
                  <h4>{membershipTypes[member.membershipInfo?.membershipType || 'regular']?.name || 'レギュラー会員'}</h4>
                  <div className="member-number">会員番号: {member.membershipInfo?.memberNumber || '未設定'}</div>
                </div>
                <div className="points-balance">
                  <span className="points-number">{member.membershipInfo?.points || 0}</span>
                  <span className="points-label">ポイント</span>
                </div>
              </div>
            </div>

            <div className="membership-benefits">
              <h4>会員特典</h4>
              <ul>
                {membershipTypes[member.membershipInfo?.membershipType || 'regular']?.benefits?.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                )) || []}
              </ul>
            </div>

            <div className="points-history">
              <h4>ポイント履歴</h4>
              <div className="points-transactions">
                <div className="transaction-item">
                  <span className="transaction-date">{member.membershipInfo?.joinDate ? formatDate(member.membershipInfo.joinDate) : '未設定'}</span>
                  <span className="transaction-description">会員登録ボーナス</span>
                  <span className="transaction-points positive">+1000pt</span>
                </div>
                <div className="transaction-item">
                  <span className="transaction-date">2024-07-15</span>
                  <span className="transaction-description">レンタル利用</span>
                  <span className="transaction-points positive">+500pt</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'license':
        return (
          <div className="license-content">
            <h3>免許証情報</h3>
            <div className="license-info">
              <div className="license-section">
                <h4>免許証詳細</h4>
                <p><strong>免許証番号:</strong> {member.profile?.driverLicense?.number || '未設定'}</p>
                <p><strong>有効期限:</strong> {member.profile?.driverLicense?.expiryDate ? formatDate(member.profile.driverLicense.expiryDate) : '未設定'}</p>
                <p>
                  <strong>審査ステータス:</strong> 
                  <span 
                    className="license-status"
                    style={{ 
                      color: getLicenseStatusColor(member.profile?.driverLicense?.verificationStatus || 'pending'),
                      marginLeft: '0.5rem'
                    }}
                  >
                    {getLicenseStatusLabel(member.profile?.driverLicense?.verificationStatus || 'pending')}
                  </span>
                </p>
              </div>

              {member.profile?.driverLicense?.frontImage && (
                <div className="license-images">
                  <div className="license-image-section">
                    <h4>免許証表面</h4>
                    <img 
                      src={member.profile.driverLicense.frontImage} 
                      alt="免許証表面" 
                      className="license-image"
                    />
                  </div>
                  {member.profile?.driverLicense?.backImage && (
                    <div className="license-image-section">
                      <h4>免許証裏面</h4>
                      <img 
                        src={member.profile.driverLicense.backImage} 
                        alt="免許証裏面" 
                        className="license-image"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="license-status-info">
                {member.profile?.driverLicense?.verificationStatus === 'pending' && (
                  <div className="status-message warning">
                    <p>📋 免許証の審査中です</p>
                    <p>通常1-2営業日で審査が完了します。</p>
                  </div>
                )}
                {member.profile?.driverLicense?.verificationStatus === 'approved' && (
                  <div className="status-message success">
                    <p>✅ 免許証が承認されました</p>
                    <p>レンタルサービスをご利用いただけます。</p>
                  </div>
                )}
                {member.profile?.driverLicense?.verificationStatus === 'rejected' && (
                  <div className="status-message error">
                    <p>❌ 免許証の再提出が必要です</p>
                    <p>お手数ですが、明瞭な画像で再度アップロードしてください。</p>
                    <button 
                      className="reupload-button"
                      onClick={() => setIsReuploadingLicense(true)}
                    >
                      画像を再アップロード
                    </button>
                  </div>
                )}
                
                {/* 免許証有効期限切れチェック */}
                {member.profile?.driverLicense && memberUtils.isLicenseExpired(member.profile.driverLicense.expiryDate) && (
                  <div className="status-message error">
                    <p>⚠️ 免許証の有効期限が切れています</p>
                    <p>免許証を更新後、新しい画像をアップロードしてください。</p>
                    <button 
                      className="reupload-button"
                      onClick={() => setIsReuploadingLicense(true)}
                    >
                      更新した免許証をアップロード
                    </button>
                  </div>
                )}
                
                {/* 再アップロードフォーム */}
                {isReuploadingLicense && (
                  <div className="license-reupload-form">
                    <h4>免許証画像の再アップロード</h4>
                    
                    <div className="reupload-section">
                      <div className="upload-group">
                        <label>免許証表面画像 *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLicenseImageUpload(e, 'frontImage')}
                          className="file-input"
                        />
                        {licenseUploadData.frontImage && (
                          <div className="image-preview">
                            <img 
                              src={licenseUploadData.frontImage} 
                              alt="免許証表面プレビュー" 
                              className="preview-image"
                            />
                            <p>✅ アップロード完了</p>
                          </div>
                        )}
                        {uploadErrors.frontImage && (
                          <span className="error-message">{uploadErrors.frontImage}</span>
                        )}
                      </div>
                      
                      <div className="upload-group">
                        <label>免許証裏面画像 *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLicenseImageUpload(e, 'backImage')}
                          className="file-input"
                        />
                        {licenseUploadData.backImage && (
                          <div className="image-preview">
                            <img 
                              src={licenseUploadData.backImage} 
                              alt="免許証裏面プレビュー" 
                              className="preview-image"
                            />
                            <p>✅ アップロード完了</p>
                          </div>
                        )}
                        {uploadErrors.backImage && (
                          <span className="error-message">{uploadErrors.backImage}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="reupload-actions">
                      <button 
                        className="cancel-button"
                        onClick={() => {
                          setIsReuploadingLicense(false);
                          setLicenseUploadData({ frontImage: null, backImage: null });
                          setUploadErrors({});
                        }}
                      >
                        キャンセル
                      </button>
                      <button 
                        className="submit-button"
                        onClick={handleLicenseReupload}
                        disabled={!licenseUploadData.frontImage || !licenseUploadData.backImage}
                      >
                        アップロード完了
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'invite':
        return (
          <div className="tab-content">
            <h3>友達招待</h3>
            
            <div className="invite-section">
              <div className="invite-code-section">
                <h4>あなたの招待コード</h4>
                <div className="invite-code-display">
                  <div className="code-box">
                    <span className="code-label">招待コード:</span>
                    <span className="code-value">{member.membershipInfo?.inviteCode || memberUtils.generateInviteCode(member.id)}</span>
                  </div>
                  <button 
                    className="copy-button"
                    onClick={() => {
                      navigator.clipboard.writeText(member.membershipInfo?.inviteCode || '');
                      alert('招待コードをコピーしました！');
                    }}
                  >
                    📋 コピー
                  </button>
                </div>
                <p className="invite-description">
                  このコードを友達に共有して、会員登録時に入力してもらうと、
                  あなたと友達の両方に<strong>500ポイント</strong>が付与されます！
                </p>
              </div>

              <div className="invite-benefits">
                <h4>招待特典</h4>
                <div className="benefit-cards">
                  <div className="benefit-card">
                    <div className="benefit-icon">🎁</div>
                    <div className="benefit-content">
                      <h5>招待した方</h5>
                      <p>500ポイント獲得</p>
                    </div>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">🎉</div>
                    <div className="benefit-content">
                      <h5>招待された方</h5>
                      <p>500ポイント獲得</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="invite-history">
                <h4>招待履歴</h4>
                {member.membershipInfo?.invitedUsers?.length > 0 ? (
                  <div className="invited-users-list">
                    {member.membershipInfo.invitedUsers.map((invitedUser, index) => (
                      <div key={index} className="invited-user">
                        <span className="user-info">
                          👤 {invitedUser.name || `ユーザー${index + 1}`}
                        </span>
                        <span className="invite-date">
                          {new Date(invitedUser.date).toLocaleDateString('ja-JP')}
                        </span>
                        <span className="points-earned">
                          +500ポイント
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-invites">
                    まだ友達を招待していません。招待コードを共有して500ポイントをゲットしましょう！
                  </p>
                )}
              </div>

              <div className="invite-share">
                <h4>招待方法</h4>
                <ol className="invite-steps">
                  <li>上記の招待コードをコピーする</li>
                  <li>友達にコードを共有する（LINE、メール等）</li>
                  <li>友達が会員登録時にコードを入力</li>
                  <li>両方に500ポイントが自動付与されます！</li>
                </ol>
              </div>
            </div>
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
          <h2>👤 マイページ</h2>
          <p>ようこそ、{member.profile?.name || 'ゲスト'}さん</p>
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