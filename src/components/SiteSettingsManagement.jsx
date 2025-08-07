import React, { useState, useEffect } from 'react';
import { siteSettingsManager, initialSiteSettings } from '../data/siteSettings';

const SiteSettingsManagement = ({ onSettingsUpdate }) => {
  const [settings, setSettings] = useState(initialSiteSettings);
  const [activeSection, setActiveSection] = useState('branding');

  useEffect(() => {
    setSettings(siteSettingsManager.getSettings());
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
  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（最大2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('ファイルサイズは2MB以下にしてください。');
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
      updateBrandingSettings('siteIcon', base64Data);
      updateBrandingSettings('siteIconType', 'custom');
      
      // リアルタイム更新の実行
      if (onSettingsUpdate) {
        const updatedSettings = {
          ...settings,
          branding: {
            ...settings.branding,
            siteIcon: base64Data,
            siteIconType: 'custom'
          }
        };
        onSettingsUpdate(updatedSettings);
      }
    };
    reader.readAsDataURL(file);
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
                    • 最大サイズ: 2MB
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