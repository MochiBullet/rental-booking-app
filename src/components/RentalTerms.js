import React, { useState, useEffect } from 'react';
import { siteSettingsManager } from '../data/siteSettings';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import './Terms.css';

const RentalTerms = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentalTerms();
  }, []);

  const loadRentalTerms = async () => {
    try {
      console.log('🔄 Loading rental terms from DynamoDB...');
      const dynamoSettings = await siteSettingsAPI.getAllSettings();
      
      if (Object.keys(dynamoSettings).length > 0) {
        console.log('✅ Rental terms loaded from DynamoDB');
        setSettings(dynamoSettings.siteSettings || {});
      } else {
        console.log('⚠️ No settings in DynamoDB, using LocalStorage');
        setSettings(siteSettingsManager.getSettings());
      }
    } catch (error) {
      console.error('❌ Failed to load rental terms:', error);
      // フォールバック: LocalStorageから読み込み
      setSettings(siteSettingsManager.getSettings());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="static-page loading">
        <div className="loading-spinner">読み込み中...</div>
      </div>
    );
  }

  const rentalTerms = settings.rentalTerms || {
    title: "レンタカー約款",
    content: "レンタカー約款の内容が設定されていません。管理画面から設定してください。"
  };

  return (
    <div className="static-page">
      <div className="static-container">
        <h1>{rentalTerms.title}</h1>
        <div className="content">
          {rentalTerms.content.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className="last-updated">
          最終更新日: {rentalTerms.lastUpdated || '2024年12月1日'}
        </div>
      </div>
    </div>
  );
};

export default RentalTerms;