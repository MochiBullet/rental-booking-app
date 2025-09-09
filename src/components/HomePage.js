import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingWheel from './LoadingWheel';
import './HomePage.css';
import { siteSettingsManager } from '../data/siteSettings';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import { announcementsAPI } from '../services/announcementsAPI';

function HomePage() {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoaded, setAnnouncementsLoaded] = useState(false);
  const [homeContent, setHomeContent] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    businessHours: { weekday: '', weekend: '' }
  });

  // デフォルト背景画像（美しいレンタカー関連の画像URL）
  const defaultImages = [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80', // 美しい車の風景
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1920&q=80', // モダンな車
    'https://images.unsplash.com/photo-1517153295259-74eb0b416cee?w=1920&q=80', // 高級車（更新）
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80', // バイク
  ];

  // デフォルトタイル画像
  const defaultTileImages = {
    car: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80', // 美しい車
    bike: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' // スポーツバイク
  };

  useEffect(() => {
    // 並列読み込みで高速化
    const initializeHomePage = async () => {
      // お知らせとホームデータを並列で読み込み
      await Promise.all([
        loadAnnouncements(),
        loadHomePageData()
      ]);
    };

    initializeHomePage();

    // カスタムイベントリスナーを追加（管理者画面からの更新を受け取る）
    const handleSettingsUpdate = () => {
      loadHomePageData();
    };
    
    const handleHomeContentUpdate = () => {
      // LocalStorageから即座に読み込んで反映
      const savedContent = localStorage.getItem('homeContent');
      if (savedContent) {
        setHomeContent(JSON.parse(savedContent));
      }
    };
    
    window.addEventListener('siteSettingsUpdate', handleSettingsUpdate);
    window.addEventListener('homeContentUpdate', handleHomeContentUpdate);
    return () => {
      window.removeEventListener('siteSettingsUpdate', handleSettingsUpdate);
      window.removeEventListener('homeContentUpdate', handleHomeContentUpdate);
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      // ローカル環境では localStorage から高速読み込み
      const isLocal = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';
      
      if (isLocal) {
        console.log('📋 ローカル環境: localStorageからお知らせを読み込み');
        const localAnnouncements = localStorage.getItem('announcements');
        if (localAnnouncements) {
          const announcements = JSON.parse(localAnnouncements);
          const publishedAnnouncements = announcements
            .filter(announcement => announcement.published)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setAnnouncements(publishedAnnouncements);
          setAnnouncementsLoaded(true);
          console.log('📋 ローカルお知らせ読み込み完了:', publishedAnnouncements.length, '件');
          return;
        } else {
          console.log('📋 ローカルにお知らせがありません - デフォルトを設定');
          const defaultAnnouncements = [
            {
              id: '1',
              title: 'サービス開始のお知らせ',
              content: 'M\'s BASE レンタルサービスを開始いたしました。安心・安全な車両をご提供いたします。',
              date: new Date().toISOString().split('T')[0],
              published: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
          setAnnouncements(defaultAnnouncements);
          setAnnouncementsLoaded(true);
          return;
        }
      }

      // 本番環境: まずキャッシュから高速表示、その後APIで更新
      console.log('📋 本番環境: キャッシュとAPIの2段階読み込み');
      
      // Stage 1: キャッシュから即座に表示
      const cacheKey = 'announcements-cache';
      const cacheTimestampKey = 'announcements-cache-timestamp';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
      
      if (cachedData && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        const maxCacheAge = 5 * 60 * 1000; // 5分間
        
        if (cacheAge < maxCacheAge) {
          console.log('📋 キャッシュから即座に表示 (キャッシュ年齢:', Math.floor(cacheAge / 1000), '秒)');
          const cachedAnnouncements = JSON.parse(cachedData);
          setAnnouncements(cachedAnnouncements);
          setAnnouncementsLoaded(true);
          
          // バックグラウンドでAPIを呼び出して更新
          console.log('📋 バックグラウンドでAPI更新中...');
          loadAnnouncementsFromAPI();
          return;
        }
      }

      // Stage 2: APIから直接読み込み（キャッシュが無効の場合）
      console.log('📋 APIから直接読み込み');
      await loadAnnouncementsFromAPI();
      
    } catch (error) {
      console.error('📋 お知らせ読み込みエラー:', error);
      setAnnouncements([]);
      setAnnouncementsLoaded(true);
    }
  };

  // API から お知らせを読み込んでキャッシュも更新する関数
  const loadAnnouncementsFromAPI = async () => {
    try {
      const result = await announcementsAPI.getPublishedAnnouncements();
      if (result.success) {
        // 日付順にソート（新しい順）
        const sortedAnnouncements = result.announcements.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        setAnnouncements(sortedAnnouncements);
        setAnnouncementsLoaded(true);
        
        // キャッシュを更新
        localStorage.setItem('announcements-cache', JSON.stringify(sortedAnnouncements));
        localStorage.setItem('announcements-cache-timestamp', Date.now().toString());
        
        console.log('📋 API読み込み完了 & キャッシュ更新:', sortedAnnouncements.length, '件');
      } else {
        console.error('📋 API読み込み失敗:', result.error);
        if (!announcementsLoaded) {
          setAnnouncements([]);
          setAnnouncementsLoaded(true);
        }
      }
    } catch (error) {
      console.error('📋 API呼び出しエラー:', error);
      if (!announcementsLoaded) {
        setAnnouncements([]);
        setAnnouncementsLoaded(true);
      }
    }
  };

  const loadHomePageData = async () => {
    try {
      console.log('🔄 Loading homepage data...');
      
      // まずLocalStorageから即座に読み込み（チラつき防止）
      const savedContent = localStorage.getItem('homeContent');
      if (savedContent) {
        setHomeContent(JSON.parse(savedContent));
      } else {
        // LocalStorageにない場合はDynamoDBから設定を取得してデフォルト値を設定
        console.log('📝 LocalStorageにhomeContentがないため、DynamoDBから最新設定を取得中...');
        
        let carText, bikeText;
        
        try {
          // DynamoDBから最新の設定を取得
          const dynamoSettings = await siteSettingsAPI.getAllSettings();
          const dbSiteSettings = dynamoSettings.siteSettings || {};
          
          console.log('🗃️ DynamoDBから取得した設定:', dbSiteSettings.tiles);
          
          carText = dbSiteSettings.tiles?.carText || {
            title: "車両レンタル",
            subtitle: "ファミリー向けから",
            description: "ビジネス用まで", 
            details: "幅広いラインナップ"
          };
          bikeText = dbSiteSettings.tiles?.bikeText || {
            title: "バイクレンタル",
            subtitle: "原付から大型まで",
            description: "多様なバイクを",
            details: "お手頃価格で提供"
          };
          
          console.log('🚗 Car Text from DB:', carText);
          console.log('🏍️ Bike Text from DB:', bikeText);
        } catch (error) {
          console.error('⚠️ DynamoDB取得エラー、LocalStorage設定を使用:', error);
          // フォールバック: LocalStorage設定を使用
          const siteSettings = siteSettingsManager.getSettings();
          carText = siteSettings.tiles?.carText || {
            title: "車両レンタル",
            subtitle: "ファミリー向けから", 
            description: "ビジネス用まで",
            details: "幅広いラインナップ"
          };
          bikeText = siteSettings.tiles?.bikeText || {
            title: "バイクレンタル",
            subtitle: "原付から大型まで",
            description: "多様なバイクを", 
            details: "お手頃価格で提供"
          };
        }
        
        const defaultContent = {
          heroTitle: 'M\'s BASE Rental',
          heroSubtitle: '安心・安全・快適なレンタルサービス',
          carTile: {
            title: carText.title,
            description: `${carText.subtitle}\n${carText.description}\n${carText.details}`,
            features: carText.features || ['最新モデル', '保険完備', '24時間サポート']
          },
          bikeTile: {
            title: bikeText.title,
            description: `${bikeText.subtitle}\n${bikeText.description}\n${bikeText.details}`,
            features: bikeText.features || ['ヘルメット付', '整備済み', 'ロードサービス']
          }
        };
        localStorage.setItem('homeContent', JSON.stringify(defaultContent));
        setHomeContent(defaultContent);
      }
      
      // サイト設定も同様に処理
      setSiteSettings(siteSettingsManager.getSettings());
      
      // DynamoDBからの取得を試みる（バックグラウンド）
      const dynamoSettings = await siteSettingsAPI.getAllSettings();
      
      if (dynamoSettings.siteSettings) {
        console.log('✅ Site settings loaded from DynamoDB');
        setSiteSettings(dynamoSettings.siteSettings);
        
        // タイルテキスト設定をDynamoDBの最新値で更新
        if (dynamoSettings.siteSettings.tiles) {
          console.log('🔄 DynamoDBからタイル設定を更新中:', dynamoSettings.siteSettings.tiles);
          
          const dbCarText = dynamoSettings.siteSettings.tiles.carText || {};
          const dbBikeText = dynamoSettings.siteSettings.tiles.bikeText || {};
          
          setHomeContent(prevContent => {
            if (!prevContent) return prevContent;
            
            const updatedContent = {
              ...prevContent,
              carTile: {
                ...prevContent.carTile,
                title: dbCarText.title || prevContent.carTile.title,
                description: `${dbCarText.subtitle || ''}\n${dbCarText.description || ''}\n${dbCarText.details || ''}`.trim()
              },
              bikeTile: {
                ...prevContent.bikeTile,
                title: dbBikeText.title || prevContent.bikeTile.title,
                description: `${dbBikeText.subtitle || ''}\n${dbBikeText.description || ''}\n${dbBikeText.details || ''}`.trim()
              }
            };
            
            // LocalStorageに保存
            localStorage.setItem('homeContent', JSON.stringify(updatedContent));
            console.log('🔄 DynamoDBタイル設定をhomeContentに反映完了');
            
            return updatedContent;
          });
        }
        
        // 連絡先情報も設定
        if (dynamoSettings.siteSettings.contact) {
          setContactInfo(dynamoSettings.siteSettings.contact);
        }
      }
      
      // 初期設定から連絡先情報を設定
      const defaultSettings = siteSettingsManager.getSettings();
      if (!dynamoSettings.siteSettings?.contact) {
        setContactInfo(defaultSettings.contact);
      }

      if (dynamoSettings.homeContent) {
        console.log('✅ Home content loaded from DynamoDB');
        setHomeContent(dynamoSettings.homeContent);
        // DynamoDBのデータをLocalStorageにも保存
        localStorage.setItem('homeContent', JSON.stringify(dynamoSettings.homeContent));
      }
      
    } catch (error) {
      console.error('❌ Failed to load data from DynamoDB:', error);
      // エラーの場合もLocalStorageのデータを使用（既に設定済み）
    } finally {
      setContentLoaded(true);
    }
  };

  // サイト設定の変更を監視してタイルテキストを更新
  useEffect(() => {
    const handleSiteSettingsUpdate = (event) => {
      console.log('📡 HomePage: siteSettingsUpdate イベントを受信しました');
      const updatedSettings = event.detail;
      console.log('📋 受信したデータ:', updatedSettings);
      
      if (updatedSettings?.tiles) {
        console.log('🔄 タイル設定が更新されました:', updatedSettings.tiles);
        
        // タイルテキストをリアルタイム更新
        const carText = updatedSettings.tiles.carText || {};
        const bikeText = updatedSettings.tiles.bikeText || {};
        
        console.log('🚗 車タイルテキスト:', carText);
        console.log('🏍️ バイクタイルテキスト:', bikeText);
        
        setHomeContent(prevContent => {
          if (!prevContent) {
            console.log('⚠️ 既存のhomeContentが見つかりません');
            return prevContent;
          }
          
          const newContent = {
            ...prevContent,
            carTile: {
              ...prevContent.carTile,
              title: carText.title || prevContent.carTile?.title || '車両レンタル',
              description: `${carText.subtitle || ''}\n${carText.description || ''}\n${carText.details || ''}`.trim() || prevContent.carTile?.description || 'ファミリー向けから\nビジネス用まで\n幅広いラインナップ',
              features: carText.features || prevContent.carTile?.features || ['最新モデル', '保険完備', '24時間サポート']
            },
            bikeTile: {
              ...prevContent.bikeTile,
              title: bikeText.title || prevContent.bikeTile?.title || 'バイクレンタル',
              description: `${bikeText.subtitle || ''}\n${bikeText.description || ''}\n${bikeText.details || ''}`.trim() || prevContent.bikeTile?.description || '原付から大型まで\n多様なバイクを\nお手頃価格で提供',
              features: bikeText.features || prevContent.bikeTile?.features || ['ヘルメット付', '整備済み', 'ロードサービス']
            }
          };
          
          // LocalStorageにも保存してページリロード時も反映されるように
          localStorage.setItem('homeContent', JSON.stringify(newContent));
          console.log('💾 タイルテキスト更新をLocalStorageに保存しました');
          console.log('✅ 新しいhomeContent:', newContent);
          
          return newContent;
        });
      } else {
        console.log('⚠️ updatedSettings.tiles が見つかりません');
      }
      
      // 連絡先情報の更新
      if (updatedSettings?.contact) {
        console.log('🔄 連絡先情報が更新されました:', updatedSettings.contact);
        setContactInfo(updatedSettings.contact);
      }
    };

    console.log('🎧 HomePage: siteSettingsUpdate イベントリスナーを登録しました');
    window.addEventListener('siteSettingsUpdate', handleSiteSettingsUpdate);
    return () => {
      console.log('🔌 HomePage: siteSettingsUpdate イベントリスナーを削除しました');
      window.removeEventListener('siteSettingsUpdate', handleSiteSettingsUpdate);
    };
  }, []);

  const getBackgroundImages = () => {
    if (siteSettings?.hero?.backgroundImages?.length > 0 && !siteSettings.hero.useDefaultImages) {
      return siteSettings.hero.backgroundImages;
    }
    return defaultImages;
  };

  // 画像を2セット分作成（シームレスループ用）
  const getDoubledImages = () => {
    const images = getBackgroundImages();
    return [...images, ...images]; // 画像を2回繰り返す
  };

  // タイル画像を取得する関数
  const getTileImage = (type) => {
    if (siteSettings?.tiles?.useDefaultImages === false) {
      if (type === 'car' && siteSettings?.tiles?.carImage) {
        return siteSettings.tiles.carImage;
      }
      if (type === 'bike' && siteSettings?.tiles?.bikeImage) {
        return siteSettings.tiles.bikeImage;
      }
    }
    return defaultTileImages[type];
  };

  // コンテンツが読み込まれるまで何も表示しない（チラつき防止）
  if (!homeContent || !contentLoaded) {
    return (
      <div className="home-page">
        <div className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingWheel size={100} message="ホームページを読み込み中..." />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        {/* 背景画像スライダー（無限スクロール） */}
        <div className="background-slider">
          <div className="slider-track">
            {getDoubledImages().map((image, index) => (
              <div
                key={index}
                className="background-image"
                style={{
                  backgroundImage: `url(${image})`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* オーバーレイ */}
        <div className="hero-overlay" />
        
        {/* コンテンツ */}
        <div className="hero-content">
          <h2 className="hero-title">{homeContent.heroTitle}</h2>
          <p className="hero-subtitle">{homeContent.heroSubtitle}</p>
        </div>
      </div>

      <div className="selection-container">
        {/* お知らせセクション */}
        <div className="announcements-section">
          <h3 className="announcements-title">📢 お知らせ</h3>
          
          {!announcementsLoaded ? (
            // ローディング中のスケルトン表示
            <div className="announcements-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="announcement-item skeleton" style={{
                  backgroundColor: '#f0f0f0',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  cursor: 'default'
                }}>
                  <span className="announcement-date" style={{ 
                    backgroundColor: '#e0e0e0', 
                    color: 'transparent',
                    borderRadius: '4px'
                  }}>2024-01-01</span>
                  <span className="announcement-title" style={{ 
                    backgroundColor: '#e0e0e0', 
                    color: 'transparent',
                    borderRadius: '4px'
                  }}>読み込み中...</span>
                </div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            // お知らせ一覧表示
            <div className="announcements-list">
              {announcements.slice(0, 5).map((announcement) => (
                <div key={announcement.id} className="announcement-item" onClick={() => navigate(`/announcement/${announcement.id}`)}>
                  <span className="announcement-date">{announcement.date}</span>
                  <span className="announcement-title">{announcement.title}</span>
                </div>
              ))}
            </div>
          ) : (
            // お知らせがない場合
            <div className="announcements-empty" style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              fontStyle: 'italic'
            }}>
              現在お知らせはありません
            </div>
          )}
        </div>
        
        <h3 className="selection-title">レンタルする車両を選択してください</h3>
        
        <div className="vehicle-tiles">
          <div className="vehicle-tile car-tile" onClick={() => navigate('/vehicles/car')}>
            <div className="tile-image">
              <img 
                src={getTileImage('car')} 
                alt="車レンタル" 
                className="tile-img"
              />
            </div>
            <div className="tile-content">
              <h3 className="tile-title">{homeContent.carTile.title}</h3>
              <p className="tile-description">
                {homeContent.carTile.description.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < homeContent.carTile.description.split('\n').length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </p>
              <div className="tile-features">
                {homeContent.carTile.features.map((feature, i) => (
                  <span key={i} className="feature">✓ {feature}</span>
                ))}
              </div>
              <button className="tile-button">車を見る →</button>
            </div>
          </div>

          <div className="vehicle-tile bike-tile" onClick={() => navigate('/vehicles/bike')}>
            <div className="tile-image">
              <img 
                src={getTileImage('bike')} 
                alt="バイクレンタル" 
                className="tile-img"
              />
            </div>
            <div className="tile-content">
              <h3 className="tile-title">{homeContent.bikeTile.title}</h3>
              <p className="tile-description">
                {homeContent.bikeTile.description.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < homeContent.bikeTile.description.split('\n').length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </p>
              <div className="tile-features">
                {homeContent.bikeTile.features.map((feature, i) => (
                  <span key={i} className="feature">✓ {feature}</span>
                ))}
              </div>
              <button className="tile-button">バイクを見る →</button>
            </div>
          </div>
        </div>
        
        {/* 連絡先情報セクション */}
        <div className="contact-section">
          <h3 className="contact-section-title">お問い合わせ</h3>
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

    </div>
  );
}

export default HomePage;