import React, { useState, useEffect } from 'react';
import { siteSettingsManager, initialSiteSettings } from '../data/siteSettings';

const SiteSettingsManagement = ({ onSettingsUpdate }) => {
  const [settings, setSettings] = useState(initialSiteSettings);
  const [activeSection, setActiveSection] = useState('hero');

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
          { key: 'hero', label: 'ヒーローセクション' },
          { key: 'features', label: '特徴・機能' },
          { key: 'contact', label: 'お問い合わせ情報' },
          { key: 'services', label: 'サービス内容' }
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
      </div>
    </div>
  );
};

export default SiteSettingsManagement;