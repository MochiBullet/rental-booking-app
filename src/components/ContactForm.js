import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingWheel from './LoadingWheel';
import './ContactForm.css';
import dataSyncService from '../services/dataSync';

const ContactForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 送信をシミュレート
    setTimeout(async () => {
      try {
        // お問い合わせデータを保存（実際にはAPI送信）
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const newContact = {
          id: Date.now(),
          ...formData,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };
        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));

        // Sync to cloud
        await dataSyncService.saveToCloud('contacts', contacts);

        setIsSubmitting(false);
        setIsSubmitted(true);
      } catch (error) {
        console.error('Failed to sync contact data:', error);
        setIsSubmitting(false);
        setIsSubmitted(true);
      }
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="contact-container">
        <div className="contact-success">
          <div className="success-icon">✅</div>
          <h1>お問い合わせありがとうございます</h1>
          <p>
            お問い合わせを受け付けました。<br />
            担当者より3営業日以内にご連絡いたします。
          </p>
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              ホームに戻る
            </button>
            <button 
              className="btn-secondary"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  category: 'general',
                  subject: '',
                  message: ''
                });
              }}
            >
              新しいお問い合わせ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>お問い合わせ</h1>
        <p>ご質問・ご相談がございましたら、お気軽にお問い合わせください。</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>お問い合わせ先</h2>
          <div className="info-item">
            <div className="info-icon">📞</div>
            <div className="info-details">
              <h3>お電話でのお問い合わせ</h3>
              <p>03-1234-5678</p>
              <span>受付時間: 平日 9:00-18:00</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📧</div>
            <div className="info-details">
              <h3>メールでのお問い合わせ</h3>
              <p>info@msbase-rental.com</p>
              <span>24時間受付</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div className="info-details">
              <h3>所在地</h3>
              <p>東京都渋谷区道玄坂1-2-3<br />M's BASE ビル 5階</p>
              <span>JR渋谷駅より徒歩5分</span>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>お問い合わせフォーム</h2>
          
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">お名前 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="山田太郎"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">メールアドレス *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="yamada@example.com"
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">電話番号</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="090-1234-5678"
              />
            </div>

            <div className="form-field">
              <label htmlFor="category">お問い合わせ種別 *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="general">一般的なお問い合わせ</option>
                <option value="booking">予約について</option>
                <option value="vehicle">車両について</option>
                <option value="account">アカウントについて</option>
                <option value="payment">料金・支払いについて</option>
                <option value="complaint">苦情・要望</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="subject">件名 *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="お問い合わせの件名を入力してください"
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="message">お問い合わせ内容 *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="8"
              placeholder="お問い合わせ内容を詳しく入力してください"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <LoadingWheel size={20} />
                  送信中...
                </div>
              ) : (
                '送信する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;