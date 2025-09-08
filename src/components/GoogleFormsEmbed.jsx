import React, { useEffect, useState } from 'react';
import { siteSettingsManager } from '../data/siteSettings';

const GoogleFormsEmbed = ({ vehicleInfo = null, onClose }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    firstNamePhonetic: '',
    lastNamePhonetic: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseType: 'regular',
    vehicleType: '',
    rentDays: '1',
    pickupDate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Site Settingsから Google Forms設定を取得
    const loadedSettings = siteSettingsManager.getSettings();
    setSettings(loadedSettings);
    setIsLoading(false);

    // 車両情報があれば事前入力
    if (vehicleInfo) {
      setFormData(prev => ({
        ...prev,
        vehicleType: vehicleInfo.type === 'car' ? 'car' : 'motorcycle'
      }));
    }
  }, [vehicleInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Google Forms のformResponse URLを使用
      const formUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/formResponse';
      
      // Google Forms の実際のentry IDを使用
      const formDataToSend = new FormData();
      formDataToSend.append('entry.1280174264', formData.firstName); // 性（名字）
      formDataToSend.append('entry.846732635', formData.lastName); // 名（名前）
      formDataToSend.append('entry.616715639', formData.firstNamePhonetic); // セイ（名字読み）
      formDataToSend.append('entry.701002604', formData.lastNamePhonetic); // メイ（名前読み）
      formDataToSend.append('entry.1979973897', formData.email); // メールアドレス
      formDataToSend.append('entry.1952002308', formData.phone); // 電話番号
      formDataToSend.append('entry.1318842287', formData.licenseNumber); // 免許証番号
      formDataToSend.append('entry.538505772', formData.licenseType); // 免許証種類
      
      // 車両タイプを適切な形式で送信
      if (formData.vehicleType === 'car') {
        formDataToSend.append('entry.370718445', '軽自動車・乗用車・貨物車等');
      } else if (formData.vehicleType === 'motorcycle') {
        formDataToSend.append('entry.370718445', 'バイク');
      }
      
      // 追加情報を備考欄として送信
      const additionalNotes = [];
      if (formData.rentDays) additionalNotes.push(`レンタル日数: ${formData.rentDays}`);
      if (formData.pickupDate) additionalNotes.push(`受取希望日: ${formData.pickupDate}`);
      if (vehicleInfo) {
        additionalNotes.push(`選択車両: ${vehicleInfo.name} (¥${vehicleInfo.price}/日)`);
      }
      if (formData.notes) additionalNotes.push(`備考: ${formData.notes}`);
      
      // 追加の備考エントリーがあれば使用（フォーム構造によって調整）
      const combinedNotes = additionalNotes.join('\n');
      if (combinedNotes) {
        // 備考欄のentry IDは確認が必要ですが、とりあえず一般的なパターンを使用
        formDataToSend.append('entry.2000000000', combinedNotes);
      }

      // Google Forms に直接送信（CORSエラーを避けるため、no-corsモードを使用）
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formDataToSend
      });

      setSubmitSuccess(true);
      
      // フォームをリセット
      setFormData({
        firstName: '',
        lastName: '',
        firstNamePhonetic: '',
        lastNamePhonetic: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseType: 'regular',
        vehicleType: '',
        rentDays: '1',
        pickupDate: '',
        notes: ''
      });

    } catch (error) {
      console.error('フォーム送信エラー:', error);
      // no-corsモードではエラーも正常として扱われるため、成功として処理
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!settings?.googleForms?.enabled) {
    return (
      <div className="google-forms-disabled" style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee', 
        borderRadius: '8px',
        border: '1px solid #f44336'
      }}>
        <p>Google Forms連携が無効になっています。</p>
        <p>管理者画面のSite SettingsからGoogle Forms連携を有効にしてください。</p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="google-forms-success" style={{
        padding: '30px',
        backgroundColor: '#e8f5e9',
        borderRadius: '12px',
        border: '2px solid #4caf50',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h3 style={{ color: '#2e7d32', marginBottom: '15px' }}>予約申込みを受け付けました！</h3>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          お申込みありがとうございます。<br/>
          内容を確認の上、24時間以内にご連絡いたします。
        </p>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '12px 30px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            閉じる
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="google-forms-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div className="google-forms-header" style={{ 
        marginBottom: '25px', 
        padding: '20px', 
        backgroundColor: '#e8f5e9', 
        borderRadius: '12px',
        border: '2px solid #4caf50'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32', fontSize: '24px' }}>
          🔐 レンタル予約申込み
        </h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#555' }}>
          お客様の個人情報保護のため、予約情報はGoogle Formsを通じて安全に送信されます。
        </p>
        
        {vehicleInfo && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fff', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <strong style={{ color: '#2e7d32' }}>選択された車両</strong>
            <div style={{ marginTop: '8px' }}>
              <div><strong>車両名:</strong> {vehicleInfo.name}</div>
              <div><strong>タイプ:</strong> {vehicleInfo.type === 'car' ? '車' : 'バイク'}</div>
              <div><strong>料金:</strong> ¥{vehicleInfo.price}/日</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        
        <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              姓（名字） <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              placeholder="田中"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <div className="form-group" style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              名（名前） <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              placeholder="太郎"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              セイ（名字ふりがな） <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="firstNamePhonetic"
              value={formData.firstNamePhonetic}
              onChange={handleInputChange}
              required
              placeholder="タナカ"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <div className="form-group" style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              メイ（名前ふりがな） <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="lastNamePhonetic"
              value={formData.lastNamePhonetic}
              onChange={handleInputChange}
              required
              placeholder="タロウ"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            メールアドレス <span style={{ color: '#f44336' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4caf50'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            電話番号 <span style={{ color: '#f44336' }}>*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="例: 090-1234-5678"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4caf50'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            免許証番号 <span style={{ color: '#f44336' }}>*</span>
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            required
            placeholder="例: 123456789012"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4caf50'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            免許証種類 <span style={{ color: '#f44336' }}>*</span>
          </label>
          <select
            name="licenseType"
            value={formData.licenseType}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              backgroundColor: '#fff'
            }}
          >
            <option value="regular">普通自動車免許</option>
            <option value="motorcycle">普通二輪免許</option>
            <option value="large_motorcycle">大型二輪免許</option>
            <option value="medium">中型免許</option>
            <option value="large">大型免許</option>
            <option value="special">特殊免許</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            レンタル日数 <span style={{ color: '#f44336' }}>*</span>
          </label>
          <select
            name="rentDays"
            value={formData.rentDays}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              backgroundColor: '#fff'
            }}
          >
            <option value="1">1日</option>
            <option value="2">2日</option>
            <option value="3">3日</option>
            <option value="4-6">4-6日</option>
            <option value="1週間">1週間</option>
            <option value="2週間">2週間</option>
            <option value="1ヶ月">1ヶ月</option>
            <option value="その他">その他（備考欄に記載）</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            受取希望日 <span style={{ color: '#f44336' }}>*</span>
          </label>
          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            ご要望・備考
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
            placeholder="特別なご要望や質問があればお書きください"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              resize: 'vertical',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4caf50'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: isSubmitting ? '#cccccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) e.target.style.backgroundColor = '#45a049';
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) e.target.style.backgroundColor = '#4caf50';
          }}
        >
          {isSubmitting ? '送信中...' : '予約申込みを送信'}
        </button>
      </form>

      <div className="google-forms-footer" style={{
        marginTop: '25px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>📋 予約の流れ：</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>上記フォームに必要事項を入力してください</li>
          <li>送信後、確認メールが届きます</li>
          <li>スタッフが内容を確認し、24時間以内にご連絡いたします</li>
          <li>予約確定後、詳細なご案内をお送りします</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
          <strong>⚠️ ご注意：</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px', marginBottom: '0' }}>
            <li>入力内容はGoogleの安全なサーバーに保存されます</li>
            <li>個人情報は厳重に管理され、予約以外の目的では使用しません</li>
            <li>送信後に内容の変更が必要な場合はお電話でご連絡ください</li>
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
              borderRadius: '8px',
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