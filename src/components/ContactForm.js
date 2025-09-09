import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactForm.css';
import { siteSettingsManager } from '../data/siteSettings';
import { siteSettingsAPI } from '../services/siteSettingsAPI';

const ContactForm = () => {
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    businessHours: { weekday: '', weekend: '' }
  });

  useEffect(() => {
    loadContactInfo();
    
    // リアルタイム更新のリスナー追加
    const handleSiteSettingsUpdate = (event) => {
      const updatedSettings = event.detail;
      if (updatedSettings?.contact) {
        console.log('🔄 連絡先情報が更新されました:', updatedSettings.contact);
        setContactInfo(updatedSettings.contact);
      }
    };
    
    window.addEventListener('siteSettingsUpdate', handleSiteSettingsUpdate);
    return () => window.removeEventListener('siteSettingsUpdate', handleSiteSettingsUpdate);
  }, []);

  const loadContactInfo = async () => {
    try {
      const settings = await siteSettingsAPI.getAllSettings();
      if (settings?.siteSettings?.contact) {
        setContactInfo(settings.siteSettings.contact);
      } else {
        const defaultSettings = siteSettingsManager.getSettings();
        setContactInfo(defaultSettings.contact);
      }
    } catch (error) {
      console.error('連絡先情報の読み込みに失敗:', error);
      const defaultSettings = siteSettingsManager.getSettings();
      setContactInfo(defaultSettings.contact);
    }
  };


  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>お問い合わせ</h1>
        <p>ご質問・ご相談がございましたら、お気軽にお問い合わせください。</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-grid">
          <div className="info-card phone-card" onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}>
            <div className="info-icon">📞</div>
            <div className="info-details">
              <h3>お電話でのお問い合わせ</h3>
              <p className="contact-value phone-number">{contactInfo.phone}</p>
              <span className="contact-hours">{contactInfo.businessHours?.weekday}</span>
              <span className="contact-hours">{contactInfo.businessHours?.weekend}</span>
              <div className="click-hint">📱 タップして発信</div>
            </div>
          </div>
          
          <div className="info-card location-card">
            <div className="info-icon">📍</div>
            <div className="info-details">
              <h3>所在地</h3>
              <p className="contact-value address-text">{contactInfo.address}</p>
              <div className="map-actions">
                <button 
                  className="map-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const address = encodeURIComponent(contactInfo.address);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                  }}
                >
                  🗺️ 地図で見る
                </button>
                <button 
                  className="map-button route-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const address = encodeURIComponent(contactInfo.address);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                  }}
                >
                  🚗 ルート検索
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;