import React, { useState, useEffect } from 'react';
import { siteSettingsManager, initialSiteSettings, announcementManager } from '../data/siteSettings';

const SiteSettingsManagement = ({ onSettingsUpdate }) => {
  const [settings, setSettings] = useState(initialSiteSettings);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [activeSection, setActiveSection] = useState('branding');

  useEffect(() => {
    setSettings(siteSettingsManager.getSettings());
    setAnnouncements(announcementManager.getAllAnnouncements());
  }, []);

  const handleSave = () => {
    siteSettingsManager.saveSettings(settings);
    if (onSettingsUpdate) {
      onSettingsUpdate(settings);
    }
    alert('サイト設定が保存されました');
  };

  const handleReset = () => {
    if (window.confirm('全ての設定を初期値に戻しますか？')) {
      const resetSettings = siteSettingsManager.resetSettings();
      setSettings(resetSettings);
      if (onSettingsUpdate) {
        onSettingsUpdate(resetSettings);
      }
      alert('設定を初期値に戻しました');
    }
  };

  const updateHeroSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const updateFeature = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const updateContactSettings = (field, value) => {
    if (field === 'weekday' || field === 'weekend') {
      setSettings(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          businessHours: {
            ...prev.contact.businessHours,
            [field]: value
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    }
  };

  const updateService = (index, value) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? value : service
      )
    }));
  };

  const updateTermsSettings = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // ブランディング設定の更新
  const updateBrandingSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
  };

  // アイコンファイルのアップロード処理
  const handleIconUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📷 アイコンアップロード開始:', file.name, 'サイズ:', file.size);

    // ファイルサイズチェック（最大2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('ファイルサイズは2MB以下にしてください。');
      console.log('❌ ファイルサイズエラー:', file.size);
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      console.log('❌ ファイル形式エラー:', file.type);
      return;
    }

    try {
      // Base64データを生成
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        console.log('✅ Base64変換完了、データ長:', base64Data.length);
        
        // Base64データをそのまま保存（全ユーザー共有）
        const customIconData = base64Data;
        
        // 設定を更新（Base64データを直接保存）
        updateBrandingSettings('siteIcon', customIconData);
        updateBrandingSettings('siteIconType', 'custom');
        
        console.log('🔄 カスタムアイコンBase64データ設定完了');
        
        // リアルタイム更新の実行
        if (onSettingsUpdate) {
          const updatedSettings = {
            ...settings,
            branding: {
              ...settings.branding,
              siteIcon: customIconData,
              siteIconType: 'custom'
            }
          };
          onSettingsUpdate(updatedSettings);
        }
        
        alert('✅ アイコンがアップロードされました。\n\n⚠️ 現在はLocalStorage保存のため、同じブラウザでのみ表示されます。\n全ユーザーに反映するには、サーバー側の実装が必要です。');
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('❌ アイコン処理エラー:', error);
      alert('アイコンの処理中にエラーが発生しました。');
    }
  };


  // アイコンをデフォルトに戻す
  const resetIconToDefault = () => {
    updateBrandingSettings('siteIcon', null);
    updateBrandingSettings('siteIconType', 'default');
    
    // リアルタイム更新の実行
    if (onSettingsUpdate) {
      const updatedSettings = {
        ...settings,
        branding: {
          ...settings.branding,
          siteIcon: null,
          siteIconType: 'default'
        }
      };
      onSettingsUpdate(updatedSettings);
    }
  };

  // ヒーロー背景画像のアップロード処理
  const handleHeroImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください。');
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const currentImages = settings.hero?.backgroundImages || [];
      const newImages = [...currentImages, base64Data];
      
      updateHeroSettings('backgroundImages', newImages);
      updateHeroSettings('useDefaultImages', false);
      
      // リアルタイム更新の実行
      if (onSettingsUpdate) {
        const updatedSettings = {
          ...settings,
          hero: {
            ...settings.hero,
            backgroundImages: newImages,
            useDefaultImages: false
          }
        };
        onSettingsUpdate(updatedSettings);
      }
    };
    reader.readAsDataURL(file);
  };

  // ヒーロー背景画像を削除
  const removeHeroImage = (indexToRemove) => {
    const currentImages = settings.hero?.backgroundImages || [];
    const newImages = currentImages.filter((_, index) => index !== indexToRemove);
    
    updateHeroSettings('backgroundImages', newImages);
    
    // 画像がなくなった場合はデフォルトに戻す
    if (newImages.length === 0) {
      updateHeroSettings('useDefaultImages', true);
    }
    
    // リアルタイム更新の実行
    if (onSettingsUpdate) {
      const updatedSettings = {
        ...settings,
        hero: {
          ...settings.hero,
          backgroundImages: newImages,
          useDefaultImages: newImages.length === 0
        }
      };
      onSettingsUpdate(updatedSettings);
    }
  };

  // デフォルト画像に戻す
  const resetHeroToDefault = () => {
    updateHeroSettings('backgroundImages', []);
    updateHeroSettings('useDefaultImages', true);
    
    // リアルタイム更新の実行
    if (onSettingsUpdate) {
      const updatedSettings = {
        ...settings,
        hero: {
          ...settings.hero,
          backgroundImages: [],
          useDefaultImages: true
        }
      };
      onSettingsUpdate(updatedSettings);
    }
  };

  // タイル設定の更新
  const updateTileSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      tiles: {
        ...prev.tiles,
        [field]: value
      }
    }));
  };

  // タイル画像のアップロード処理（車用）
  const handleCarTileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（最大3MB）
    if (file.size > 3 * 1024 * 1024) {
      alert('ファイルサイズは3MB以下にしてください。');
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      updateTileSettings('carImage', base64Data);
      updateTileSettings('useDefaultImages', false);
      
      // リアルタイム更新の実行
      if (onSettingsUpdate) {
        const updatedSettings = {
          ...settings,
          tiles: {
            ...settings.tiles,
            carImage: base64Data,
            useDefaultImages: false
          }
        };
        onSettingsUpdate(updatedSettings);
      }
    };
    reader.readAsDataURL(file);
  };

  // タイル画像のアップロード処理（バイク用）
  const handleBikeTileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（最大3MB）
    if (file.size > 3 * 1024 * 1024) {
      alert('ファイルサイズは3MB以下にしてください。');
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      updateTileSettings('bikeImage', base64Data);
      updateTileSettings('useDefaultImages', false);
      
      // リアルタイム更新の実行
      if (onSettingsUpdate) {
        const updatedSettings = {
          ...settings,
          tiles: {
            ...settings.tiles,
            bikeImage: base64Data,
            useDefaultImages: false
          }
        };
        onSettingsUpdate(updatedSettings);
      }
    };
    reader.readAsDataURL(file);
  };

  // タイル画像をデフォルトに戻す
  const resetTilesToDefault = () => {
    updateTileSettings('carImage', null);
    updateTileSettings('bikeImage', null);
    updateTileSettings('useDefaultImages', true);
    
    // リアルタイム更新の実行
    if (onSettingsUpdate) {
      const updatedSettings = {
        ...settings,
        tiles: {
          carImage: null,
          bikeImage: null,
          useDefaultImages: true
        }
      };
      onSettingsUpdate(updatedSettings);
    }
  };

  // お知らせ関連の関数
  const handleCreateAnnouncement = () => {
    setEditingAnnouncement({
      id: null,
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      published: false
    });
    setShowAnnouncementForm(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  const handleSaveAnnouncement = () => {
    if (!editingAnnouncement.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    if (editingAnnouncement.id) {
      // 更新
      announcementManager.updateAnnouncement(editingAnnouncement.id, editingAnnouncement);
    } else {
      // 新規作成
      announcementManager.createAnnouncement(editingAnnouncement);
    }

    // 状態を更新
    setAnnouncements(announcementManager.getAllAnnouncements());
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);

    // リアルタイム更新
    if (onSettingsUpdate) {
      const updatedSettings = siteSettingsManager.getSettings();
      onSettingsUpdate(updatedSettings);
    }

    alert('お知らせを保存しました');
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm('このお知らせを削除しますか？')) {
      announcementManager.deleteAnnouncement(id);
      setAnnouncements(announcementManager.getAllAnnouncements());

      // リアルタイム更新
      if (onSettingsUpdate) {
        const updatedSettings = siteSettingsManager.getSettings();
        onSettingsUpdate(updatedSettings);
      }

      alert('お知らせを削除しました');
    }
  };

  const handleCancelAnnouncementEdit = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
  };

  const updateEditingAnnouncement = (field, value) => {
    setEditingAnnouncement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="site-settings-management">
      <div className="settings-header">
        <h2>📝 サイト設定管理</h2>
        <div className="settings-actions">
          <button onClick={handleSave} className="save-button">
            💾 設定を保存
          </button>
          <button onClick={handleReset} className="reset-button">
            🔄 初期値に戻す
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        {[
          { key: 'branding', label: '🎨 ブランディング' },
          { key: 'hero-images', label: '🏞️ ヒーロー画像' },
          { key: 'tile-images', label: '🚗 タイル画像' },
          { key: 'announcements', label: '📢 お知らせ管理' },
          { key: 'hero', label: 'ヒーローセクション' },
          { key: 'features', label: '特徴・機能' },
          { key: 'contact', label: 'お問い合わせ情報' },
          { key: 'services', label: 'サービス内容' },
          { key: 'terms', label: '利用規約' },
          { key: 'privacy', label: 'プライバシーポリシー' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${activeSection === tab.key ? 'active' : ''}`}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeSection === 'branding' && (
          <div className="section">
            <h3>🎨 ブランディング設定</h3>
            
            <div className="form-group">
              <label>サイト名</label>
              <input
                type="text"
                value={settings.branding?.siteName || 'RentalEasy'}
                onChange={(e) => updateBrandingSettings('siteName', e.target.value)}
                placeholder="RentalEasy"
              />
            </div>

            <div className="form-group">
              <label>サイトアイコン</label>
              <div className="icon-management">
                <div className="current-icon-preview">
                  <h4>現在のアイコン</h4>
                  <div className="icon-preview">
                    {settings.branding?.siteIconType === 'custom' && settings.branding?.siteIcon ? (
                      <img 
                        src={settings.branding.siteIcon} 
                        alt="カスタムアイコン" 
                        style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                      />
                    ) : (
                      <div 
                        className="default-icon"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          background: 'var(--green)', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}
                      >
                        MB
                      </div>
                    )}
                    <span style={{ marginLeft: '10px' }}>
                      {settings.branding?.siteIconType === 'custom' ? 'カスタムアイコン' : 'デフォルトロゴ'}
                    </span>
                  </div>
                </div>

                <div className="icon-upload-controls">
                  <input
                    type="file"
                    id="iconUpload"
                    accept="image/*"
                    onChange={handleIconUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="icon-buttons">
                    <label htmlFor="iconUpload" className="upload-button">
                      📷 アイコンをアップロード
                    </label>
                    {settings.branding?.siteIconType === 'custom' && (
                      <button 
                        type="button" 
                        onClick={resetIconToDefault}
                        className="reset-icon-button"
                      >
                        🔄 デフォルトに戻す
                      </button>
                    )}
                  </div>
                  <p className="upload-info">
                    • 推奨サイズ: 40x40px 以上<br/>
                    • 対応形式: PNG, JPG, GIF<br/>
                    • 最大サイズ: 2MB<br/>
                    <br/>
                    <strong style={{color: '#ff9800'}}>⚠️ 制限事項：</strong><br/>
                    現在はLocalStorage保存のため、同じブラウザでのみ表示されます。<br/>
                    全ユーザーに反映するには、サーバー側の実装が必要です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'hero-images' && (
          <div className="section">
            <h3>🏞️ ヒーロー背景画像管理</h3>
            
            <div className="form-group">
              <label>背景画像設定</label>
              <div className="hero-image-management">
                <div className="current-images">
                  <h4>現在の背景画像</h4>
                  <div className="image-grid">
                    {settings.hero?.backgroundImages?.map((image, index) => (
                      <div key={index} className="hero-image-item">
                        <img 
                          src={image} 
                          alt={`背景画像 ${index + 1}`}
                          style={{ 
                            width: '150px', 
                            height: '100px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => removeHeroImage(index)}
                          className="remove-image-button"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {(!settings.hero?.backgroundImages?.length || settings.hero?.useDefaultImages) && (
                    <p className="default-images-note">
                      現在はデフォルト画像を使用中（美しいレンタカー画像）
                    </p>
                  )}
                </div>

                <div className="hero-upload-controls">
                  <input
                    type="file"
                    id="heroImageUpload"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="hero-buttons">
                    <label htmlFor="heroImageUpload" className="upload-button">
                      📷 背景画像を追加
                    </label>
                    {settings.hero?.backgroundImages?.length > 0 && (
                      <button 
                        type="button" 
                        onClick={resetHeroToDefault}
                        className="reset-icon-button"
                      >
                        🔄 デフォルト画像に戻す
                      </button>
                    )}
                  </div>
                  <p className="upload-info">
                    • 推奨サイズ: 1920x1080px 以上<br/>
                    • 対応形式: PNG, JPG, WEBP<br/>
                    • 最大サイズ: 5MB<br/>
                    • 複数枚追加可能（自動でスライダー表示）
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tile-images' && (
          <div className="section">
            <h3>🚗 車・バイクタイル画像管理</h3>
            
            <div className="form-group">
              <label>タイル画像設定</label>
              <div className="tile-image-management">
                <div className="tile-previews">
                  <div className="tile-preview-section">
                    <h4>車タイル画像</h4>
                    <div className="tile-preview">
                      {!settings.tiles?.useDefaultImages && settings.tiles?.carImage ? (
                        <img 
                          src={settings.tiles.carImage} 
                          alt="カスタム車画像"
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            background: 'url(https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '8px',
                            position: 'relative'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            デフォルト画像
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tile-preview-section">
                    <h4>バイクタイル画像</h4>
                    <div className="tile-preview">
                      {!settings.tiles?.useDefaultImages && settings.tiles?.bikeImage ? (
                        <img 
                          src={settings.tiles.bikeImage} 
                          alt="カスタムバイク画像"
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            background: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '8px',
                            position: 'relative'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            デフォルト画像
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tile-upload-controls">
                  <div className="upload-section">
                    <h4>車タイル画像をアップロード</h4>
                    <input
                      type="file"
                      id="carTileUpload"
                      accept="image/*"
                      onChange={handleCarTileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="carTileUpload" className="upload-button">
                      🚗 車の画像をアップロード
                    </label>
                  </div>

                  <div className="upload-section">
                    <h4>バイクタイル画像をアップロード</h4>
                    <input
                      type="file"
                      id="bikeTileUpload"
                      accept="image/*"
                      onChange={handleBikeTileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="bikeTileUpload" className="upload-button">
                      🏍️ バイクの画像をアップロード
                    </label>
                  </div>

                  <div className="reset-section">
                    {(!settings.tiles?.useDefaultImages && (settings.tiles?.carImage || settings.tiles?.bikeImage)) && (
                      <button 
                        type="button" 
                        onClick={resetTilesToDefault}
                        className="reset-icon-button"
                      >
                        🔄 デフォルト画像に戻す
                      </button>
                    )}
                  </div>

                  <p className="upload-info">
                    • 推奨サイズ: 600x400px 以上<br/>
                    • 対応形式: PNG, JPG, WEBP<br/>
                    • 最大サイズ: 3MB<br/>
                    • 車やバイクがはっきり見える写真を推奨
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'hero' && (
          <div className="section">
            <h3>ヒーローセクション設定</h3>
            <div className="form-group">
              <label>メインタイトル</label>
              <input
                type="text"
                value={settings.hero.title}
                onChange={(e) => updateHeroSettings('title', e.target.value)}
                placeholder="車・バイクレンタル RentalEasy"
              />
            </div>
            <div className="form-group">
              <label>サブタイトル</label>
              <input
                type="text"
                value={settings.hero.subtitle}
                onChange={(e) => updateHeroSettings('subtitle', e.target.value)}
                placeholder="お手軽価格で快適な移動体験を"
              />
            </div>
            <div className="form-group">
              <label>説明文</label>
              <textarea
                value={settings.hero.description}
                onChange={(e) => updateHeroSettings('description', e.target.value)}
                placeholder="最新の車両とバイクを..."
                rows={3}
              />
            </div>
          </div>
        )}

        {activeSection === 'features' && (
          <div className="section">
            <h3>特徴・機能設定</h3>
            {settings.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <h4>特徴 {index + 1}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>タイトル（絵文字含む）</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="🚗 多彩な車両"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明</label>
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="軽自動車からSUVまで"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="section">
            <h3>お問い合わせ情報設定</h3>
            <div className="form-group">
              <label>電話番号</label>
              <input
                type="text"
                value={settings.contact.phone}
                onChange={(e) => updateContactSettings('phone', e.target.value)}
                placeholder="03-1234-5678"
              />
            </div>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => updateContactSettings('email', e.target.value)}
                placeholder="info@rentaleasy.com"
              />
            </div>
            <div className="form-group">
              <label>住所</label>
              <input
                type="text"
                value={settings.contact.address}
                onChange={(e) => updateContactSettings('address', e.target.value)}
                placeholder="東京都渋谷区xxx-xxx"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>平日営業時間</label>
                <input
                  type="text"
                  value={settings.contact.businessHours.weekday}
                  onChange={(e) => updateContactSettings('weekday', e.target.value)}
                  placeholder="平日: 9:00 - 18:00"
                />
              </div>
              <div className="form-group">
                <label>土日祝営業時間</label>
                <input
                  type="text"
                  value={settings.contact.businessHours.weekend}
                  onChange={(e) => updateContactSettings('weekend', e.target.value)}
                  placeholder="土日祝: 9:00 - 17:00"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div className="section">
            <h3>サービス内容設定</h3>
            {settings.services.map((service, index) => (
              <div key={index} className="form-group">
                <label>サービス {index + 1}</label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => updateService(index, e.target.value)}
                  placeholder="・車両レンタル"
                />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'terms' && (
          <div className="section">
            <h3>利用規約設定</h3>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={settings.terms?.title || ''}
                onChange={(e) => updateTermsSettings('terms', 'title', e.target.value)}
                placeholder="利用規約"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={settings.terms?.content || ''}
                onChange={(e) => updateTermsSettings('terms', 'content', e.target.value)}
                placeholder="利用規約の内容を入力してください..."
                rows={15}
                className="terms-textarea"
              />
            </div>
          </div>
        )}

        {activeSection === 'announcements' && (
          <div className="section">
            <h3>📢 お知らせ管理</h3>
            
            <div className="announcements-header">
              <button 
                className="create-announcement-btn" 
                onClick={handleCreateAnnouncement}
              >
                ➕ 新しいお知らせを作成
              </button>
            </div>

            {showAnnouncementForm && (
              <div className="announcement-form">
                <h4>{editingAnnouncement?.id ? 'お知らせを編集' : '新しいお知らせを作成'}</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>日付</label>
                    <input
                      type="date"
                      value={editingAnnouncement?.date || ''}
                      onChange={(e) => updateEditingAnnouncement('date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>公開状態</label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingAnnouncement?.published || false}
                        onChange={(e) => updateEditingAnnouncement('published', e.target.checked)}
                      />
                      公開する
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>タイトル</label>
                  <input
                    type="text"
                    value={editingAnnouncement?.title || ''}
                    onChange={(e) => updateEditingAnnouncement('title', e.target.value)}
                    placeholder="お知らせのタイトルを入力..."
                  />
                </div>
                
                <div className="form-group">
                  <label>内容</label>
                  <textarea
                    value={editingAnnouncement?.content || ''}
                    onChange={(e) => updateEditingAnnouncement('content', e.target.value)}
                    placeholder="お知らせの内容を入力..."
                    rows={8}
                  />
                </div>
                
                <div className="form-buttons">
                  <button className="save-button" onClick={handleSaveAnnouncement}>
                    💾 保存
                  </button>
                  <button className="cancel-button" onClick={handleCancelAnnouncementEdit}>
                    ❌ キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="announcements-list-admin">
              <h4>現在のお知らせ一覧</h4>
              
              {announcements.length === 0 ? (
                <p className="no-announcements">お知らせがありません。</p>
              ) : (
                <div className="announcements-table">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-row">
                      <div className="announcement-info">
                        <div className="announcement-header-info">
                          <span className="announcement-date">{announcement.date}</span>
                          <span className={`announcement-status ${announcement.published ? 'published' : 'draft'}`}>
                            {announcement.published ? '公開中' : '下書き'}
                          </span>
                        </div>
                        <h5 className="announcement-title">{announcement.title}</h5>
                        <p className="announcement-preview">
                          {announcement.content.length > 100 
                            ? announcement.content.substring(0, 100) + '...' 
                            : announcement.content}
                        </p>
                      </div>
                      <div className="announcement-actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          ✏️ 編集
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          🗑️ 削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="section">
            <h3>プライバシーポリシー設定</h3>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={settings.privacy?.title || ''}
                onChange={(e) => updateTermsSettings('privacy', 'title', e.target.value)}
                placeholder="プライバシーポリシー"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={settings.privacy?.content || ''}
                onChange={(e) => updateTermsSettings('privacy', 'content', e.target.value)}
                placeholder="プライバシーポリシーの内容を入力してください..."
                rows={15}
                className="terms-textarea"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSettingsManagement;