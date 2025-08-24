import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleList from './VehicleList';
import { vehicleAPI } from '../services/api';
import { vehicleData } from '../data/vehicleData';
import './VehicleListPage.css';

const VehicleListPage = ({ user }) => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          
          // データが空でもエラーにしない（在庫なし状態として処理）
          setVehicles(apiVehicleData || []);
          
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

  const handleVehicleSelect = (vehicle) => {
    // INFO SITE MODE: 情報表示のみ（予約機能は無効）
    console.log('選択された車両:', vehicle);
    alert(`${vehicle.name}の詳細情報を表示中です。現在は情報サイトモードで運営されています。`);
  };

  const getPageTitle = () => {
    switch (type) {
      case 'car':
        return '車のレンタル';
      case 'motorcycle':
        return 'バイクのレンタル';
      default:
        return '車両レンタル';
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
          {type === 'car' 
            ? 'ファミリー向けからビジネスまで、幅広い用途に対応した車両をご用意しています。'
            : 'スクーターから大型バイクまで、あなたの目的に合ったバイクを見つけてください。'
          }
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