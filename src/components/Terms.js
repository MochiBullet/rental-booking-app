import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingWheel from './LoadingWheel';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();
  const [termsContent, setTermsContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTermsContent = async () => {
      try {
        // DBから約款内容を取得
        const settings = await siteSettingsAPI.getAllSettings();
        console.log('📋 約款設定取得:', settings);
        
        if (settings?.rentalTerms && settings.rentalTerms.content) {
          // DB設定から約款内容を使用
          const dbTerms = {
            title: settings.rentalTerms.title || 'M\'s BASEレンタカー貸渡約款',
            lastUpdated: settings.rentalTerms.lastUpdated || new Date().toLocaleDateString('ja-JP'),
            content: settings.rentalTerms.content
          };
          setTermsContent(dbTerms);
          console.log('✅ DB約款を使用');
        } else {
          // デフォルト約款を設定
          const defaultTerms = {
            title: 'M\'s BASEレンタカー貸渡約款',
            lastUpdated: new Date().toLocaleDateString('ja-JP'),
            content: 'レンタカー約款が設定されていません。管理画面から設定してください。'
          };
          setTermsContent(defaultTerms);
          console.log('⚠️ デフォルト約款を使用');
        }
      } catch (error) {
        console.error('❌ 約款取得エラー:', error);
        // エラー時はデフォルト約款
        const fallbackTerms = {
          title: 'M\'s BASEレンタカー貸渡約款',
          lastUpdated: new Date().toLocaleDateString('ja-JP'),
          content: 'レンタカー約款の読み込みに失敗しました。しばらく後に再度お試しください。'
        };
        setTermsContent(fallbackTerms);
      } finally {
        setLoading(false);
      }
    };

    loadTermsContent();
  }, []);

  if (loading) {
    return (
      <div className="terms-container">
        <LoadingWheel size={80} message="約款を読み込み中..." />
      </div>
    );
  }

  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>{termsContent.title}</h1>
        <p className="last-updated">
          最終更新日: {termsContent.lastUpdated}
        </p>
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← ホームに戻る
        </button>
      </div>

      <div className="terms-content">
        <div className="terms-intro">
          <p>
            M's BASE Rental をご利用いただき、誠にありがとうございます。<br />
            本サービスをご利用になる前に、以下の利用規約をご確認ください。
            本サービスをご利用いただくことで、本規約に同意いただいたものとみなします。
          </p>
        </div>

        <div className="terms-text">
          {termsContent.content.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        <div className="terms-footer">
          <div className="contact-info">
            <h3>お問い合わせ先</h3>
            <p>
              本規約に関するお問い合わせは、以下までご連絡ください。<br />
              M's BASE Rental<br />
              住所: 東京都渋谷区道玄坂1-2-3 M's BASE ビル 5階<br />
              電話: 03-1234-5678<br />
              メール: legal@msbase-rental.com
            </p>
          </div>
          
          <div className="terms-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              理解しました
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.print()}
            >
              印刷する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
