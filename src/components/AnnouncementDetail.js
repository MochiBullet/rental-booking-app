import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { announcementManager } from '../data/siteSettings';
import './AnnouncementDetail.css';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncement = () => {
      const announcementData = announcementManager.getAnnouncementById(id);
      
      if (!announcementData || !announcementData.published) {
        // お知らせが見つからない、または非公開の場合
        setAnnouncement(null);
      } else {
        setAnnouncement(announcementData);
      }
      setLoading(false);
    };

    loadAnnouncement();
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
            {announcement.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
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