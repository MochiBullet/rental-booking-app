import React, { useState, useEffect } from 'react';
import { siteSettingsManager } from '../data/siteSettings';

const TermsPage = ({ onBack }) => {
  const [terms, setTerms] = useState(null);

  useEffect(() => {
    const settings = siteSettingsManager.getSettings();
    setTerms(settings.terms);
  }, []);

  if (!terms) {
    return <div>Loading...</div>;
  }

  return (
    <div className="terms-page">
      <div className="container">
        <div className="terms-header">
          <button className="back-button" onClick={onBack}>
            ← 戻る
          </button>
          <h1>{terms.title}</h1>
        </div>
        
        <div className="terms-content">
          <div className="terms-text">
            {terms.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;