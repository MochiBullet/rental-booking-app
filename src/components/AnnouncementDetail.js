import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { announcementsAPI } from '../services/announcementsAPI';
import './AnnouncementDetail.css';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        console.log('📋 お知らせ詳細ページ - ID:', id);
        
        // ローカル環境判定
        const isLocal = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
        
        let announcements = [];
        
        if (isLocal) {
          console.log('📋 ローカル環境: localStorageから読み込み');
          const localAnnouncements = localStorage.getItem('announcements');
          if (localAnnouncements) {
            announcements = JSON.parse(localAnnouncements);
            console.log('📋 ローカルお知らせ:', announcements);
          } else {
            console.log('📋 ローカルにお知らせがありません');
            setAnnouncement(null);
            setLoading(false);
            return;
          }
        } else {
          console.log('📋 本番環境: DynamoDBから読み込み');
          const result = await announcementsAPI.getAllAnnouncements();
          console.log('📋 APIレスポンス:', result);
          
          if (result.success) {
            announcements = result.announcements;
          } else {
            console.error('📋 APIエラー:', result.error);
            setAnnouncement(null);
            setLoading(false);
            return;
          }
        }
        
        console.log('📋 取得されたお知らせ一覧:', announcements);
        
        // IDで該当するお知らせを検索（文字列と数値の両方で試す）
        let announcementData = announcements.find(
          announcement => String(announcement.id) === String(id)
        );
        
        if (!announcementData) {
          // 数値変換で検索
          announcementData = announcements.find(
            announcement => announcement.id === parseInt(id)
          );
        }
        
        console.log('📋 見つかったお知らせ:', announcementData);
        
        if (!announcementData) {
          console.warn('📋 お知らせが見つかりません - ID:', id);
          console.warn('📋 利用可能なID一覧:', announcements.map(a => `${a.id} (${typeof a.id})`));
          setAnnouncement(null);
        } else if (!announcementData.published) {
          console.warn('📋 お知らせは非公開です - ID:', id);
          setAnnouncement(null);
        } else {
          console.log('📋 お知らせを設定:', announcementData);
          setAnnouncement(announcementData);
        }
      } catch (error) {
        console.error('📋 読み込みエラー:', error);
        setAnnouncement(null);
      }
      setLoading(false);
    };

    if (id) {
      loadAnnouncement();
    } else {
      console.error('📋 IDが指定されていません');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="announcement-detail-page">
        <div className="announcement-container">
          <div className="loading-message">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="announcement-detail-page">
        <div className="announcement-container">
          <div className="not-found-message">
            <h2>お知らせが見つかりません</h2>
            <p>指定されたお知らせは存在しないか、現在公開されていません。</p>
            <button 
              className="back-button" 
              onClick={() => navigate('/')}
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="announcement-detail-page">
      <div className="announcement-container">
        <div className="announcement-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            ← ホームに戻る
          </button>
        </div>
        
        <article className="announcement-content">
          <div className="announcement-meta">
            <span className="announcement-date">{announcement.date}</span>
            <span className="announcement-category">📢 お知らせ</span>
          </div>
          
          <h1 className="announcement-title">{announcement.title}</h1>
          
          <div className="announcement-body">
            {announcement.content ? (
              announcement.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p style={{ color: '#999', fontStyle: 'italic' }}>
                内容が設定されていません。
              </p>
            )}
            
            {/* デバッグ情報 */}
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', fontSize: '12px', color: '#666' }}>
              <strong>デバッグ情報:</strong>
              <br />ID: {announcement.id}
              <br />タイトル: {announcement.title}
              <br />内容の長さ: {announcement.content ? announcement.content.length : 0}文字
              <br />公開状態: {announcement.published ? '公開' : '非公開'}
              <br />作成日: {announcement.date}
            </div>
          </div>
        </article>
        
        <div className="announcement-footer">
          <button 
            className="back-button primary" 
            onClick={() => navigate('/')}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementDetail;