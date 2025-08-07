import React, { useState, useEffect } from 'react';
import { siteSettingsManager } from '../data/siteSettings';

const PrivacyPage = ({ onBack }) => {
  const [privacy, setPrivacy] = useState(null);

  useEffect(() => {
    const settings = siteSettingsManager.getSettings();
    setPrivacy(settings.privacy);
  }, []);

  if (!privacy) {
    return <div>Loading...</div>;
  }

  return (
    <div className="privacy-page">
      <div className="container">
        <div className="privacy-header">
          <button className="back-button" onClick={onBack}>
            ← 戻る
          </button>
          <h1>{privacy.title}</h1>
        </div>
        
        <div className="privacy-content">
          <div className="privacy-text">
            {privacy.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;