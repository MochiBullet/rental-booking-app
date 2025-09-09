import React, { useState, useEffect } from 'react';
import { siteSettingsManager, initialSiteSettings } from '../data/siteSettings';
import { siteSettingsAPI } from '../services/siteSettingsAPI';

const SiteSettingsManagement = ({ onSettingsUpdate, activeSection: propActiveSection }) => {
  // CACHE BUSTING v3.0.2 - Dashboard Overview完全削除 (2025-09-06 15:46)
  const [settings, setSettings] = useState(initialSiteSettings);
  const [activeSection, setActiveSection] = useState(propActiveSection || 'tile-edit');
  const [forceRender, setForceRender] = useState(Date.now() + 1000); // Aggressive cache clear

  useEffect(() => {
    loadSettings();
    // お知らせ管理は AdminDashboard.js に移行済み
  }, []);
  
  useEffect(() => {
    if (propActiveSection) {
      setActiveSection(propActiveSection);
    }
  }, [propActiveSection]);

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

  // 統合タイル画像アップロード処理
  const handleTileImageUpload = (event, type) => {
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
      const imageKey = `${type}Image`;
      updateTileSettings(imageKey, base64Data);
      updateTileSettings('useDefaultImages', false);
      
      // リアルタイム更新の実行
      if (onSettingsUpdate) {
        const updatedSettings = {
          ...settings,
          tiles: {
            ...settings.tiles,
            [imageKey]: base64Data,
            useDefaultImages: false
          }
        };
        onSettingsUpdate(updatedSettings);
      }
    };
    reader.readAsDataURL(file);
  };

  // 個別タイル画像リセット
  const resetTileImage = (type) => {
    const imageKey = `${type}Image`;
    updateTileSettings(imageKey, null);
    
    // 両方の画像がnullの場合のみデフォルトに戻す
    const otherImageKey = type === 'car' ? 'bikeImage' : 'carImage';
    if (!settings.tiles?.[otherImageKey]) {
      updateTileSettings('useDefaultImages', true);
    }
    
    // リアルタイム更新の実行
    if (onSettingsUpdate) {
      const updatedTiles = {
        ...settings.tiles,
        [imageKey]: null
      };
      
      // 両方の画像がnullの場合のみデフォルトフラグを設定
      if (!updatedTiles.carImage && !updatedTiles.bikeImage) {
        updatedTiles.useDefaultImages = true;
      }
      
      const updatedSettings = {
        ...settings,
        tiles: updatedTiles
      };
      onSettingsUpdate(updatedSettings);
    }
  };

  // タイルテキスト更新関数
  const updateTileText = (type, field, value) => {
    const textKey = `${type}Text`;
    const updatedSettings = {
      ...settings,
      tiles: {
        ...settings.tiles,
        [textKey]: {
          ...settings.tiles?.[textKey],
          [field]: value
        }
      }
    };
    
    setSettings(updatedSettings);
    
    // DB（siteSettingsAPI）に保存
    const saveToAPI = async () => {
      try {
        await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
        console.log(`✅ タイル${type}テキスト「${field}」をDBに保存: ${value}`);
        
        // DB保存成功後にイベントを発生
        console.log('🔄 タイル設定更新イベント発生中...', updatedSettings.tiles);
        
        // リアルタイム更新の実行
        if (onSettingsUpdate) {
          console.log('📤 onSettingsUpdate コールバック実行');
          onSettingsUpdate(updatedSettings);
        }
        
        // カスタムイベントでホームページに通知
        window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
          detail: updatedSettings
        }));
        console.log('📡 siteSettingsUpdate イベント発生完了');
        
      } catch (error) {
        console.error(`❌ タイル${type}テキスト保存エラー:`, error);
      }
    };
    
    saveToAPI();
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

      {!propActiveSection && (
        <div className="settings-tabs">
          {[
            { key: 'tile-edit', label: '🎨 タイル編集' },
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
      )}

      <div className="settings-content">




        {activeSection === 'tile-edit' && (
          <div className="section">
            <h3>🎨 タイル編集（画像・テキスト統合管理）</h3>
            
            {/* タイル画像セクション */}
            <div className="form-group">
              <label>🖼️ タイル画像設定</label>
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
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '2px dashed #ccc'
                          }}
                        >
                          デフォルト車画像
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
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '2px dashed #ccc'
                          }}
                        >
                          デフォルトバイク画像
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
                      id="carImageUpload"
                      accept="image/*"
                      onChange={(e) => handleTileImageUpload(e, 'car')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="carImageUpload" className="upload-button">
                      📷 車画像を選択
                    </label>
                    {settings.tiles?.carImage && (
                      <button 
                        type="button" 
                        onClick={() => resetTileImage('car')}
                        className="reset-icon-button"
                      >
                        🔄 車画像をリセット
                      </button>
                    )}
                  </div>

                  <div className="upload-section">
                    <h4>バイクタイル画像をアップロード</h4>
                    <input
                      type="file"
                      id="bikeImageUpload"
                      accept="image/*"
                      onChange={(e) => handleTileImageUpload(e, 'bike')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="bikeImageUpload" className="upload-button">
                      🏍️ バイク画像を選択
                    </label>
                    {settings.tiles?.bikeImage && (
                      <button 
                        type="button" 
                        onClick={() => resetTileImage('bike')}
                        className="reset-icon-button"
                      >
                        🔄 バイク画像をリセット
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

            {/* タイルテキストセクション */}
            <div className="form-group" style={{marginTop: '2rem'}}>
              <label>📝 タイルテキスト設定</label>
              <div className="tile-text-section">
                <h4>🚗 車両タイルテキスト設定</h4>
                <div className="tile-text-grid">
                  <div className="form-group">
                    <label>タイトル</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.title || ''}
                      onChange={(e) => updateTileText('car', 'title', e.target.value)}
                      placeholder="車両レンタル"
                    />
                  </div>
                  <div className="form-group">
                    <label>サブタイトル</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.subtitle || ''}
                      onChange={(e) => updateTileText('car', 'subtitle', e.target.value)}
                      placeholder="ファミリー向けから"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文1</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.description || ''}
                      onChange={(e) => updateTileText('car', 'description', e.target.value)}
                      placeholder="ビジネス用まで"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文2</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.details || ''}
                      onChange={(e) => updateTileText('car', 'details', e.target.value)}
                      placeholder="幅広いラインナップ"
                    />
                  </div>
                </div>

                <h4>🏍️ バイクタイルテキスト設定</h4>
                <div className="tile-text-grid">
                  <div className="form-group">
                    <label>タイトル</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.title || ''}
                      onChange={(e) => updateTileText('bike', 'title', e.target.value)}
                      placeholder="バイクレンタル"
                    />
                  </div>
                  <div className="form-group">
                    <label>サブタイトル</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.subtitle || ''}
                      onChange={(e) => updateTileText('bike', 'subtitle', e.target.value)}
                      placeholder="原付から大型まで"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文1</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.description || ''}
                      onChange={(e) => updateTileText('bike', 'description', e.target.value)}
                      placeholder="多様なバイクを"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文2</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.details || ''}
                      onChange={(e) => updateTileText('bike', 'details', e.target.value)}
                      placeholder="お手頃価格で提供"
                    />
                  </div>
                </div>
              </div>
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