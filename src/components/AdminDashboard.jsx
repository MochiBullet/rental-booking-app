import React, { useState } from 'react';
import VehicleManagement from './VehicleManagement';
import ReservationManagement from './ReservationManagement';
import MemberManagement from './MemberManagement';
import SiteSettingsManagement from './SiteSettingsManagement';
import AdminLogin from './AdminLogin';

const AdminDashboard = ({ vehicles, reservations, members, onVehicleUpdate, onReservationUpdate, onMemberUpdate, onSiteSettingsUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('vehicles');

  const tabs = [
    { id: 'vehicles', name: '車両管理', icon: '🚗' },
    { id: 'reservations', name: '予約管理', icon: '📅' },
    { id: 'members', name: '会員管理', icon: '👥' },
    { id: 'settings', name: 'サイト設定', icon: '⚙️' },
    { id: 'analytics', name: '分析', icon: '📊' }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🔧 管理者ダッシュボード</h1>
          <div className="admin-header-actions">
            <span className="admin-user">管理者</span>
            <button onClick={onLogout} className="logout-button">
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div className="admin-nav">
        <div className="container">
          <div className="admin-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {activeTab === 'vehicles' && (
            <VehicleManagement 
              vehicles={vehicles}
              onVehicleUpdate={onVehicleUpdate}
            />
          )}
          
          {activeTab === 'reservations' && (
            <ReservationManagement 
              reservations={reservations}
              vehicles={vehicles}
              members={members}
              onReservationUpdate={onReservationUpdate}
            />
          )}
          
          {activeTab === 'members' && (
            <MemberManagement 
              members={members}
              onMemberUpdate={onMemberUpdate}
            />
          )}
          
          {activeTab === 'settings' && (
            <SiteSettingsManagement 
              onSettingsUpdate={onSiteSettingsUpdate}
            />
          )}
          
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>📊 分析データ</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>総車両数</h3>
                  <div className="stat-number">{vehicles.length}</div>
                </div>
                <div className="stat-card">
                  <h3>利用可能車両</h3>
                  <div className="stat-number">{vehicles.filter(v => v.available).length}</div>
                </div>
                <div className="stat-card">
                  <h3>総予約数</h3>
                  <div className="stat-number">{reservations.length}</div>
                </div>
                <div className="stat-card">
                  <h3>確定予約</h3>
                  <div className="stat-number">{reservations.filter(r => r.status === 'confirmed').length}</div>
                </div>
                <div className="stat-card">
                  <h3>総会員数</h3>
                  <div className="stat-number">{members.length}</div>
                </div>
                <div className="stat-card">
                  <h3>アクティブ会員</h3>
                  <div className="stat-number">{members.filter(m => m.isActive).length}</div>
                </div>
                <div className="stat-card">
                  <h3>免許証審査待ち</h3>
                  <div className="stat-number">{members.filter(m => m.profile.driverLicense.verificationStatus === 'pending').length}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;