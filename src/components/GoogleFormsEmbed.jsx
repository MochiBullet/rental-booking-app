import React, { useEffect, useState } from 'react';
import { siteSettingsManager } from '../data/siteSettings';

const GoogleFormsEmbed = ({ vehicleInfo = null, onClose }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Site Settingsから Google Forms設定を取得
    const loadedSettings = siteSettingsManager.getSettings();
    setSettings(loadedSettings);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!settings?.googleForms?.enabled) {
    return (
      <div className="google-forms-disabled">
        <p>Google Forms連携が無効になっています。</p>
        <p>管理者画面のSite SettingsからGoogle Forms連携を有効にしてください。</p>
      </div>
    );
  }

  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/viewform?embedded=true';
  const embedHeight = settings?.googleForms?.embedHeight || 800;

  return (
    <div className="google-forms-container" style={{ width: '100%', maxWidth: '100%' }}>
      <div className="google-forms-header" style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#e8f5e9', 
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
          🔐 セキュアな予約フォーム（Google Forms）
        </h3>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
          お客様の個人情報保護のため、予約情報はGoogle Formsを通じて安全に送信されます。
        </p>
        {vehicleInfo && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#fff', 
            borderRadius: '5px',
            border: '1px solid #e0e0e0'
          }}>
            <strong>選択された車両:</strong> {vehicleInfo.name}
            <br />
            <strong>タイプ:</strong> {vehicleInfo.type === 'car' ? '車' : 'バイク'}
            <br />
            <strong>料金:</strong> ¥{vehicleInfo.price}/日
          </div>
        )}
      </div>

      <div className="google-forms-embed" style={{ 
        width: '100%',
        height: `${embedHeight}px`,
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <iframe
          src={formUrl}
          width="100%"
          height={embedHeight}
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="M's BASE レンタル予約フォーム"
          style={{ width: '100%', height: '100%' }}
        >
          読み込み中...
        </iframe>
      </div>

      <div className="google-forms-footer" style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#666'
      }}>
        <strong>📋 予約の流れ：</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>上記フォームに必要事項を入力してください</li>
          <li>送信後、確認メールが届きます</li>
          <li>スタッフが内容を確認し、24時間以内にご連絡いたします</li>
          <li>予約確定後、詳細なご案内をお送りします</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '5px' }}>
          <strong>⚠️ ご注意：</strong>
          <ul style={{ marginTop: '5px', paddingLeft: '20px', marginBottom: '0' }}>
            <li>フォーム送信後は画面を閉じても問題ありません</li>
            <li>入力内容はGoogleの安全なサーバーに保存されます</li>
            <li>個人情報は厳重に管理され、予約以外の目的では使用しません</li>
          </ul>
        </div>
      </div>

      {onClose && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 30px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleFormsEmbed;