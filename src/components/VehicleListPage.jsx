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
        
        // まずAPIからデータを取得を試行
        try {
          const apiVehicleData = await vehicleAPI.getByType(type);
          setVehicles(apiVehicleData);
          console.log('✅ APIからデータを取得しました');
        } catch (apiError) {
          console.warn('⚠️ API接続に失敗、ローカルデータを使用します:', apiError);
          // APIに失敗した場合はローカルデータを使用
          const localVehicles = vehicleData.filter(vehicle => 
            type === 'car' ? vehicle.type === 'car' : vehicle.type === 'motorcycle'
          );
          setVehicles(localVehicles);
        }
      } catch (err) {
        console.error('車両データの取得に失敗しました:', err);
        // 最終的なフォールバックとしてローカルデータを使用
        try {
          const localVehicles = vehicleData.filter(vehicle => 
            type === 'car' ? vehicle.type === 'car' : vehicle.type === 'motorcycle'
          );
          setVehicles(localVehicles);
          console.log('📦 ローカルデータにフォールバックしました');
        } catch (localError) {
          setError('車両データの読み込みに失敗しました。しばらくしてから再度お試しください。');
        }
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchVehicles();
    }
  }, [type]);

  const handleVehicleSelect = (vehicle) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // 予約画面への遷移（今後実装予定）
    console.log('選択された車両:', vehicle);
    alert(`${vehicle.name}の予約機能は準備中です。`);
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

  if (error) {
    return (
      <div className="vehicle-list-page">
        <div className="page-header">
          <h1>{getPageTitle()}</h1>
        </div>
        <div className="error-container">
          <div className="error-message">
            <h3>エラーが発生しました</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

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