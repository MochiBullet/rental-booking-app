import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VehicleList from './VehicleList';
import { vehicleAPI } from '../services/api';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import './VehicleListPage.css';

const VehicleListPage = ({ user }) => {
  const { type } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageContent, setPageContent] = useState({
    carTitle: '車のレンタル',
    carDescription: '',
    bikeTitle: 'バイクのレンタル', 
    bikeDescription: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 データベースから車両データを取得中...', type);
        
        try {
          // データベースから車両データを取得
          const apiVehicleData = await vehicleAPI.getByType(type);
          console.log('✅ データベースから取得成功:', apiVehicleData?.length || 0, '件');
          console.log('🔍 詳細車両データ構造確認:', apiVehicleData);
          
          // 削除済み車両を除外（ユーザーには稼働中の車両のみ表示）
          const availableVehicles = (apiVehicleData || []).filter(vehicle => 
            vehicle.isAvailable !== false && vehicle.available !== false
          );
          console.log('🚗 ユーザーに表示する稼働中車両:', availableVehicles.length, '件');
          
          setVehicles(availableVehicles);
          
        } catch (apiError) {
          console.warn('⚠️ データベース接続エラー:', apiError.message);
          
          // データベース接続失敗時は空配列（在庫なし状態）
          setVehicles([]);
          console.log('📝 在庫なし状態として処理します');
        }
        
      } catch (err) {
        console.error('予期しないエラー:', err);
        // 予期しないエラーでも在庫なし状態として処理
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchVehicles();
    }
  }, [type]);

  // ページコンテンツをDBから読み込み
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        console.log('🔄 車両リストページコンテンツをDBから読み込み中...');
        const dynamoSettings = await siteSettingsAPI.getAllSettings();
        
        if (dynamoSettings.siteSettings?.tiles) {
          const carText = dynamoSettings.siteSettings.tiles.carText || {};
          const bikeText = dynamoSettings.siteSettings.tiles.bikeText || {};
          
          const newPageContent = {
            carTitle: carText.title || '車のレンタル',
            carDescription: carText.subtitle && carText.description ? 
              `${carText.subtitle}${carText.description}` :
              '',
            bikeTitle: bikeText.title || 'バイクのレンタル',
            bikeDescription: bikeText.subtitle && bikeText.description ?
              `${bikeText.subtitle}${bikeText.description}` :
              ''
          };
          
          setPageContent(newPageContent);
          console.log('✅ 車両リストページコンテンツ更新完了:', newPageContent);
        }
      } catch (error) {
        console.error('⚠️ 車両リストページコンテンツ読み込みエラー:', error);
        // エラー時はデフォルト値を使用（既に設定済み）
      }
    };

    loadPageContent();
  }, []);

  // リアルタイム更新を監視
  useEffect(() => {
    const handleSiteSettingsUpdate = (event) => {
      console.log('📡 VehicleListPage: siteSettingsUpdate イベントを受信');
      const updatedSettings = event.detail;
      
      if (updatedSettings?.tiles) {
        const carText = updatedSettings.tiles.carText || {};
        const bikeText = updatedSettings.tiles.bikeText || {};
        
        const newPageContent = {
          carTitle: carText.title || '車のレンタル',
          carDescription: carText.subtitle && carText.description ? 
            `${carText.subtitle}${carText.description}` :
            '',
          bikeTitle: bikeText.title || 'バイクのレンタル',
          bikeDescription: bikeText.subtitle && bikeText.description ?
            `${bikeText.subtitle}${bikeText.description}` :
            ''
        };
        
        setPageContent(newPageContent);
        console.log('✅ 車両リストページ リアルタイム更新完了');
      }
    };

    window.addEventListener('siteSettingsUpdate', handleSiteSettingsUpdate);
    return () => window.removeEventListener('siteSettingsUpdate', handleSiteSettingsUpdate);
  }, []);

  const handleVehicleSelect = (vehicle) => {
    // INFO SITE MODE: 情報表示のみ（予約機能は無効）
    console.log('選択された車両:', vehicle);
    alert(`${vehicle.name}の詳細情報を表示中です。現在は情報サイトモードで運営されています。`);
  };

  const getPageTitle = () => {
    switch (type) {
      case 'car':
        return pageContent.carTitle;
      case 'bike':
        return pageContent.bikeTitle;
      case 'motorcycle':
        return pageContent.bikeTitle;
      default:
        return '車両一覧';
    }
  };

  const getPageDescription = () => {
    switch (type) {
      case 'car':
        return pageContent.carDescription;
      case 'bike':
        return pageContent.bikeDescription;
      case 'motorcycle':
        return pageContent.bikeDescription;
      default:
        return '幅広い車両をご用意しています。';
    }
  };

  if (loading) {
    return (
      <div className="vehicle-list-page">
        <div className="page-header">
          <h1>{getPageTitle()}</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>車両情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // エラーページは表示しない（常に正常なページを表示）

  return (
    <div className="vehicle-list-page">
      <div className="page-header">
        <h1>{getPageTitle()}</h1>
        <p className="page-description">
          {getPageDescription()}
        </p>
      </div>
      
      <VehicleList 
        vehicles={vehicles}
        onVehicleSelect={handleVehicleSelect}
        initialFilter={type}
      />
    </div>
  );
};

export default VehicleListPage;