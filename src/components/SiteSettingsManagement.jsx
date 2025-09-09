import React, { useState, useEffect } from 'react';
import { siteSettingsManager, initialSiteSettings } from '../data/siteSettings';
import { siteSettingsAPI } from '../services/siteSettingsAPI';

const SiteSettingsManagement = ({ onSettingsUpdate }) => {
  // CACHE BUSTING v3.0.2 - Dashboard Overview完全削除 (2025-09-06 15:46)
  const [settings, setSettings] = useState(initialSiteSettings);
  const [activeSection, setActiveSection] = useState('branding');
  const [forceRender, setForceRender] = useState(Date.now() + 1000); // Aggressive cache clear

  useEffect(() => {
    loadSettings();
    // お知らせ管理は AdminDashboard.js に移行済み
  }, []);

  const loadSettings = async () => {
    try {
      console.log('🔄 Loading settings from DynamoDB...');
      const dynamoSettings = await siteSettingsAPI.getAllSettings();
      
      if (Object.keys(dynamoSettings).length > 0) {
        console.log('✅ Settings loaded from DynamoDB');
        setSettings(dynamoSettings.siteSettings || initialSiteSettings);
      } else {
        console.log('⚠️ No settings in DynamoDB, using LocalStorage');
        setSettings(siteSettingsManager.getSettings());
        // 移行実行
        await siteSettingsAPI.migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      // フォールバック: LocalStorageから読み込み
      setSettings(siteSettingsManager.getSettings());
    }
  };

  const handleSave = async () => {
    try {
      console.log('🔄 Saving settings to DynamoDB...');
      await siteSettingsAPI.saveSetting('siteSettings', settings);
      
      // LocalStorageにもバックアップ保存
      siteSettingsManager.saveSettings(settings);
      
      if (onSettingsUpdate) {
        onSettingsUpdate(settings);
      }
      
      alert('✅ サイト設定がDynamoDBに保存されました');
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      
      // フォールバック: LocalStorageにのみ保存
      siteSettingsManager.saveSettings(settings);
      if (onSettingsUpdate) {
        onSettingsUpdate(settings);
      }
      
      alert('⚠️ サイト設定がLocalStorageに保存されました (DynamoDB接続エラー)');
    }
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

  // お知らせ関連の関数は管理者ダッシュボードに移行済み

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
          { key: 'hero', label: 'ヒーローセクション' },
          { key: 'contact', label: 'お問い合わせ情報' },
          { key: 'googleforms', label: '📝 Google Forms連携' },
          { key: 'terms', label: '📋 利用規約' },
          { key: 'privacy', label: '🔒 プライバシーポリシー' },
          { key: 'rental-terms', label: '🚗 レンタカー約款' }
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
                value={settings.branding?.siteName || 'M\'s BASE Rental'}
                onChange={(e) => updateBrandingSettings('siteName', e.target.value)}
                placeholder="M's BASE Rental"
              />
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
                placeholder="車・バイクレンタル M's BASE Rental"
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

        {/* SERVICES SECTION REMOVED - SIMPLIFIED SITE SETTINGS */}
        {false && activeSection === 'services' && (
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
            <h3>📋 レンタルサービス利用規約設定</h3>
            <p className="section-description">車両・バイクレンタルに関する利用規約を管理します。法的に重要な文書のため慎重に編集してください。</p>
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
            <div className="form-group">
              <label>最終更新日</label>
              <input
                type="text"
                value={settings.terms?.lastUpdated || ''}
                onChange={(e) => updateTermsSettings('terms', 'lastUpdated', e.target.value)}
                placeholder="2024年12月1日"
              />
            </div>
          </div>
        )}

        {/* お知らせ管理は管理者ダッシュボードに完全移行済み */}

        {activeSection === 'googleforms' && (
          <div className="section">
            <h3>📝 Google Forms連携設定</h3>
            <p className="section-description">
              セキュリティ強化のため、個人情報をGoogle Formsで管理します。<br/>
              フォーム送信先: <a href="https://docs.google.com/forms/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/viewform" target="_blank" rel="noopener noreferrer">M's BASE レンタル予約フォーム</a>
            </p>
            
            <div className="form-group">
              <label>Google Forms連携を有効化</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.googleForms?.enabled || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    googleForms: {
                      ...prev.googleForms,
                      enabled: e.target.checked
                    }
                  }))}
                />
                <span className="slider round"></span>
              </label>
              <small>有効にすると、予約時に個人情報がGoogle Formsに送信されます</small>
            </div>

            <div className="form-group">
              <label>フォームURL（送信先）</label>
              <input
                type="text"
                value={settings.googleForms?.formUrl || 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/formResponse'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  googleForms: {
                    ...prev.googleForms,
                    formUrl: e.target.value
                  }
                }))}
                placeholder="https://docs.google.com/forms/u/0/d/e/.../formResponse"
              />
              <small>フォームのaction URLを入力（末尾は/formResponse）</small>
            </div>

            <div className="form-group">
              <label>埋め込みフォーム表示</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.googleForms?.showEmbedded || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    googleForms: {
                      ...prev.googleForms,
                      showEmbedded: e.target.checked
                    }
                  }))}
                />
                <span className="slider round"></span>
              </label>
              <small>予約ページにGoogle Formを埋め込み表示します</small>
            </div>

            {settings.googleForms?.showEmbedded && (
              <div className="form-group">
                <label>埋め込みフォームの高さ（px）</label>
                <input
                  type="number"
                  value={settings.googleForms?.embedHeight || 800}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    googleForms: {
                      ...prev.googleForms,
                      embedHeight: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="800"
                  min="400"
                  max="2000"
                />
              </div>
            )}

            <div className="alert-info" style={{marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px'}}>
              <strong>🔐 セキュリティ向上のポイント：</strong>
              <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                <li>個人情報はGoogleの安全なサーバーに保存されます</li>
                <li>SSL/TLS暗号化により通信が保護されます</li>
                <li>Google Formsの自動バックアップ機能</li>
                <li>管理者はGoogleスプレッドシートで一元管理可能</li>
              </ul>
            </div>

            <div className="alert-warning" style={{marginTop: '15px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '5px'}}>
              <strong>⚠️ 設定時の注意：</strong>
              <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                <li>Google Formの共有設定を「リンクを知っている全員」に設定してください</li>
                <li>フォームの編集権限は管理者のみに制限してください</li>
                <li>定期的にGoogle Formsの回答をバックアップしてください</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="section">
            <h3>🔒 レンタルサービス プライバシーポリシー設定</h3>
            <p className="section-description">個人情報の取り扱いに関するプライバシーポリシーを管理します。GDPR・個人情報保護法に準拠した内容にしてください。</p>
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
            <div className="form-group">
              <label>最終更新日</label>
              <input
                type="text"
                value={settings.privacy?.lastUpdated || ''}
                onChange={(e) => updateTermsSettings('privacy', 'lastUpdated', e.target.value)}
                placeholder="2024年12月1日"
              />
            </div>
          </div>
        )}

        {activeSection === 'rental-terms' && (
          <div className="section">
            <h3>レンタカー約款設定</h3>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={settings.rentalTerms?.title || ''}
                onChange={(e) => updateTermsSettings('rentalTerms', 'title', e.target.value)}
                placeholder="レンタカー約款"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={settings.rentalTerms?.content || ''}
                onChange={(e) => updateTermsSettings('rentalTerms', 'content', e.target.value)}
                placeholder="レンタカー約款の内容を入力してください..."
                rows={15}
                className="terms-textarea"
              />
            </div>
            <div className="form-group">
              <label>最終更新日</label>
              <input
                type="text"
                value={settings.rentalTerms?.lastUpdated || ''}
                onChange={(e) => updateTermsSettings('rentalTerms', 'lastUpdated', e.target.value)}
                placeholder="2024年12月1日"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSettingsManagement;